from typing import Any

from fastapi import APIRouter, Depends, Query, HTTPException, Body, Response
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from sqlalchemy import insert, select, cast, Float, update, delete
from sqlalchemy.exc import IntegrityError
from app.database import get_db

from app.main import app, get_table_or_404, coerce_pk, get_single_pk_column, sanitize_payload, serialize_row, RecordPayload

router = APIRouter()

@app.get("/notes/")
@app.get("/notes/")
def list_notes(
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
) -> list[dict[str, Any]]:
    table = get_table_or_404("notes")
    stmt = select(table).limit(limit).offset(offset)
    rows = db.execute(stmt).mappings().all()
    return rows

