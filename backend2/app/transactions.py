from typing import Any

from fastapi import APIRouter, Depends, Query, HTTPException, Body
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from sqlalchemy import insert, select, cast, Float, update
from sqlalchemy.exc import IntegrityError
from app.database import get_db

from app.main import app, get_table_or_404, coerce_pk, get_single_pk_column, sanitize_payload, serialize_row, RecordPayload

router = APIRouter()

def query_transactions(
    account: str,
    symbol: str,
    db: Session,
) -> list[dict[str, Any]]:
    transactions_table = get_table_or_404("transactions_transaction")
    symbols_table = get_table_or_404("symbols_symbol")
    accounts_table = get_table_or_404("accounts_account")
    transaction_columns = [
        transactions_table.c.id,
        transactions_table.c.date,
        transactions_table.c.type,
        cast(transactions_table.c.quantity, Float).label("quantity"),
        cast(transactions_table.c.price, Float).label("price"),
        cast(transactions_table.c.amount, Float).label("amount"),
        cast(transactions_table.c.fee, Float).label("fee"),
        cast(transactions_table.c.capital_return, Float).label("capital_return"),
        cast(transactions_table.c.capital_gain, Float).label("capital_gain"),
        cast(transactions_table.c.acb, Float).label("acb"),
        transactions_table.c.upload_id,
        transactions_table.c.note,
    ]
    symbol_columns = [symbols_table.c.name.label("symbol")]
    account_columns = [accounts_table.c.name.label("account")]
    joined_tables = transactions_table.join(
        symbols_table,
        transactions_table.c.symbol_id == symbols_table.c.name,
    ).join(
        accounts_table,
        transactions_table.c.account_id == accounts_table.c.name,
    )
    stmt = (
        select(*transaction_columns, *symbol_columns, *account_columns)
        .select_from(joined_tables)
        .where(transactions_table.c.account_id == account)
        .where(transactions_table.c.symbol_id == symbol)
        .order_by(transactions_table.c.date)
    )
    rows = db.execute(stmt).mappings().all()
    return rows

@app.get("/transactions")
@app.get("/transactions/")
def get_transactions(
    account: str = Query(...),
    symbol: str = Query(...),
    db: Session = Depends(get_db),
) -> list[dict[str, Any]]:
    return query_transactions(account, symbol, db)  

def update_transaction(
    _id: int, values: dict[str, Any], db: Session
) -> dict[str, Any]:
    print(f"Updating transaction with ID {_id} and values: {values}")
    table = get_table_or_404("transactions_transaction")

    try:
        result = db.execute(update(table).where(table.c.id == _id).values(**values))
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail=str(exc.orig)) from exc

    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Record not found")

    stmt = select(table).where(table.c.id == _id)
    updated = db.execute(stmt).mappings().first()
    return updated

def update_acb(
        account: str, symbol: str, db: Session
) -> None:
    acb = 0.0
    shares = 0
    t_list = query_transactions(account, symbol)
    for t in t_list:
        if t.type == 'BUY':
            acb = acb + t.price * t.quantity
            if t.fee:
                acb = acb + t.fee
            shares = shares + t.quantity
        elif t.type == 'SELL':
            if shares <= 0:
                # Something is wrong in the transaction history
                # reset ACB and capital gain to 0
                acb = 0.0
                shares = 0
                t.acb = 0.0
                t.capital_gain = 0.0
                t.save()
                continue
            t.capital_gain = t.price * t.quantity - (acb / shares) * t.quantity
            if t.fee:
                t.capital_gain = t.capital_gain - t.fee

            acb = acb * (shares - t.quantity) / shares

            shares = shares - t.quantity
        elif t.type == 'DIST_D' and t.capital_return:
            acb = acb - t.capital_return

        t.acb = acb
        update_transaction(t.id, {"acb": acb, "capital_gain": t.capital_gain}, db)

    return

@app.put("/transactions/{record_id}")
@app.put("/transactions/{record_id}/")
def put_transaction(
    record_id: str, payload: Any = Body(...), db: Session = Depends(get_db)
) -> dict[str, Any]:
    print("Received payload:", payload)
    table = get_table_or_404("transactions_transaction")

    try:
        _id = coerce_pk(table.c.id, record_id)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    # support both wrapped payloads (RecordPayload with `.data`) and
    # bare JSON objects sent directly in the request body
    body_data = getattr(payload, "data", None) if not isinstance(payload, dict) else payload
    if body_data is None and hasattr(payload, "__dict__"):
        body_data = getattr(payload, "__dict__", None)
    values = sanitize_payload(table, body_data)
    if table.c.id.name in values and values[table.c.id.name] != _id:
        raise HTTPException(status_code=422, detail="Changing primary key is not supported")
    
    return update_transaction(_id, values, db)

@app.post("/transactions")
@app.post("/transactions/")
def post_transaction(
    payload: Any = Body(...), db: Session = Depends(get_db)
) -> dict[str, Any]:
    table = get_table_or_404("transactions_transaction")

    # support both wrapped payloads (RecordPayload with `.data`) and
    # bare JSON objects sent directly in the request body
    body_data = getattr(payload, "data", None) if not isinstance(payload, dict) else payload
    if body_data is None and hasattr(payload, "__dict__"):
        body_data = getattr(payload, "__dict__", None)

    values = sanitize_payload(table, body_data)
    print("Sanitized values:", values)

    try:
        result = db.execute(insert(table).values(**values))
        db.commit()
        pk_value = result.inserted_primary_key[0]
        pk_column = get_single_pk_column(table)
        stmt = select(table).where(pk_column == pk_value)
        created = db.execute(stmt).mappings().first()
        return created
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail=str(exc.orig)) from exc
