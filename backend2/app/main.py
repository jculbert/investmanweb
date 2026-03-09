from datetime import date, datetime
from decimal import Decimal
from typing import Any

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel, Field
from sqlalchemy import Table, delete, insert, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db, metadata, refresh_metadata


class RecordPayload(BaseModel):
    data: dict[str, Any] = Field(default_factory=dict)


app = FastAPI(title="InvestmanWeb API", version="1.0.0")


def get_table_or_404(table_name: str) -> Table:
    table = metadata.tables.get(table_name)
    if table is None:
        raise HTTPException(status_code=404, detail=f"Unknown table: {table_name}")
    return table


def get_single_pk_column(table: Table):
    pk_columns = list(table.primary_key.columns)
    if len(pk_columns) != 1:
        raise HTTPException(
            status_code=400,
            detail=f"Table {table.name} is not supported because it does not have a single-column primary key.",
        )
    return pk_columns[0]


def coerce_pk(pk_column, raw_value: str):
    try:
        python_type = pk_column.type.python_type
    except NotImplementedError:
        python_type = str

    if python_type is int:
        return int(raw_value)
    if python_type is float:
        return float(raw_value)
    if python_type is bool:
        normalized = raw_value.strip().lower()
        if normalized in {"1", "true", "yes", "y"}:
            return True
        if normalized in {"0", "false", "no", "n"}:
            return False
        raise ValueError("Invalid boolean value")
    return raw_value


def normalize_value(value: Any):
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    return value


def serialize_row(row) -> dict[str, Any]:
    data = dict(row)
    return {key: normalize_value(value) for key, value in data.items()}


def sanitize_payload(table: Table, payload: dict[str, Any]) -> dict[str, Any]:
    valid_columns = {column.name for column in table.columns}
    filtered = {k: v for k, v in payload.items() if k in valid_columns}
    if not filtered:
        raise HTTPException(status_code=422, detail="Payload does not contain any valid columns.")
    return filtered


def list_transactions(account_id: str, db: Session) -> list[dict[str, Any]]:
    transactions_table = get_table_or_404("transactions_transaction")
    symbols_table = get_table_or_404("symbols_symbol")
    symbol_columns = [
        column.label(f"symbol_{column.name}")
        for column in symbols_table.columns
    ]
    joined_tables = transactions_table.join(
        symbols_table,
        transactions_table.c.symbol_id == symbols_table.c.name,
    )
    stmt = (
        select(transactions_table, *symbol_columns)
        .select_from(joined_tables)
        .where(transactions_table.c.account_id == account_id)
        .order_by(symbols_table.c.name, transactions_table.c.date)
    )
    rows = db.execute(stmt).mappings().all()
    items = []
    for row in rows:
        item = serialize_row(row)
        symbol = {}
        symbol_keys = [key for key in item if key.startswith("symbol_")]
        for key in symbol_keys:
            symbol[key[len("symbol_"):]] = item.pop(key)
        item["symbol"] = symbol
        items.append(item)
    return items


from app.holdings import router as holdings_router

app.include_router(holdings_router)


@app.on_event("startup")
def startup_event() -> None:
    refresh_metadata()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/tables")
def list_tables() -> dict[str, Any]:
    return {
        "tables": [
            {
                "name": table.name,
                "primary_keys": [column.name for column in table.primary_key.columns],
                "columns": [column.name for column in table.columns],
            }
            for table in metadata.sorted_tables
        ]
    }


@app.get("/{table_name}")
def list_records(
    table_name: str,
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    table = get_table_or_404(table_name)
    stmt = select(table).limit(limit).offset(offset)
    rows = db.execute(stmt).mappings().all()
    return {
        "table": table_name,
        "count": len(rows),
        "items": [jsonable_encoder(serialize_row(row)) for row in rows],
    }


@app.get("/{table_name}/{record_id}")
def get_record(table_name: str, record_id: str, db: Session = Depends(get_db)) -> dict[str, Any]:
    table = get_table_or_404(table_name)
    pk_column = get_single_pk_column(table)

    try:
        pk_value = coerce_pk(pk_column, record_id)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    stmt = select(table).where(pk_column == pk_value)
    row = db.execute(stmt).mappings().first()
    if row is None:
        raise HTTPException(status_code=404, detail="Record not found")

    return {"table": table_name, "item": jsonable_encoder(serialize_row(row))}


@app.post("/{table_name}")
def create_record(table_name: str, payload: RecordPayload, db: Session = Depends(get_db)) -> dict[str, Any]:
    table = get_table_or_404(table_name)
    values = sanitize_payload(table, payload.data)

    try:
        result = db.execute(insert(table).values(**values))
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail=str(exc.orig)) from exc

    pk_column = get_single_pk_column(table)
    pk_value = values.get(pk_column.name)
    if pk_value is None and result.inserted_primary_key:
        pk_value = result.inserted_primary_key[0]

    if pk_value is not None:
        stmt = select(table).where(pk_column == pk_value)
        created = db.execute(stmt).mappings().first()
        if created is not None:
            return {"table": table_name, "item": jsonable_encoder(serialize_row(created))}

    return {"table": table_name, "item": values}


@app.put("/{table_name}/{record_id}")
@app.patch("/{table_name}/{record_id}")
def update_record(
    table_name: str, record_id: str, payload: RecordPayload, db: Session = Depends(get_db)
) -> dict[str, Any]:
    table = get_table_or_404(table_name)
    pk_column = get_single_pk_column(table)

    try:
        pk_value = coerce_pk(pk_column, record_id)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    values = sanitize_payload(table, payload.data)
    if pk_column.name in values and values[pk_column.name] != pk_value:
        raise HTTPException(status_code=422, detail="Changing primary key is not supported")

    try:
        result = db.execute(update(table).where(pk_column == pk_value).values(**values))
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail=str(exc.orig)) from exc

    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Record not found")

    stmt = select(table).where(pk_column == pk_value)
    updated = db.execute(stmt).mappings().first()
    return {"table": table_name, "item": jsonable_encoder(serialize_row(updated))}


@app.delete("/{table_name}/{record_id}")
def delete_record(table_name: str, record_id: str, db: Session = Depends(get_db)) -> dict[str, Any]:
    table = get_table_or_404(table_name)
    pk_column = get_single_pk_column(table)

    try:
        pk_value = coerce_pk(pk_column, record_id)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    result = db.execute(delete(table).where(pk_column == pk_value))
    db.commit()

    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Record not found")

    return {"table": table_name, "deleted": True, "id": record_id}
