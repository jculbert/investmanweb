from typing import Any

from fastapi import APIRouter, Depends, Query, HTTPException, Body, Response
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from sqlalchemy import insert, select, cast, Float, update, delete, or_
from sqlalchemy.exc import IntegrityError
from app.database import get_db

from app.main import app, get_table_or_404, coerce_pk, get_single_pk_column, sanitize_payload, serialize_row, RecordPayload

router = APIRouter()

@app.get("/notes/")
@app.get("/notes/")
def get_notes(
    symbol: str | None = Query(default=None, min_length=1),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
) -> list[dict[str, Any]]:
    table = get_table_or_404("notes")
    stmt = select(table).order_by(table.c.date.desc()).limit(limit).offset(offset)
    if symbol is not None:
        print(f"Filtering notes by symbol: {symbol}")
        stmt = stmt.where(or_(table.c.symbol1 == symbol, table.c.symbol2 == symbol))
    rows = db.execute(stmt).mappings().all()
    return rows

@app.put("/notes/{record_id}")
@app.put("/notes/{record_id}/")
def put_note(
    record_id: str, payload: Any = Body(...), db: Session = Depends(get_db)
) -> dict[str, Any]:
    table = get_table_or_404("notes")

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

@app.post("/notes")
@app.post("/notes/")
def post_note(
    payload: Any = Body(...), db: Session = Depends(get_db)
) -> dict[str, Any]:
    table = get_table_or_404("notes")

    # support both wrapped payloads (RecordPayload with `.data`) and
    # bare JSON objects sent directly in the request body
    body_data = getattr(payload, "data", None) if not isinstance(payload, dict) else payload
    if body_data is None and hasattr(payload, "__dict__"):
        body_data = getattr(payload, "__dict__", None)
    values = sanitize_payload(table, body_data)

    # Remove the primary key from the values if present, as it will be auto-generated
    if table.c.id.name in values:
        del values[table.c.id.name]

    try:
        result = db.execute(insert(table).values(**values))
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Record not found - post_transaction")
        _id = result.inserted_primary_key[0]
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail=str(exc.orig)) from exc

    stmt = select(table).where(table.c.id == _id)
    created = db.execute(stmt).mappings().first()
    if not created:
        raise HTTPException(status_code=404, detail="Record not found: return result")
    return created

@app.delete("/notes/{record_id}")
@app.delete("/notes/{record_id}/")
def delete_note(record_id: str, db: Session = Depends(get_db)
) -> Response:
    table = get_table_or_404("notes")

    try:
        _id = coerce_pk(table.c.id, record_id)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    result = db.execute(delete(table).where(table.c.id == _id))
    db.commit()

    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Record not found")

    return Response(status_code=204)

