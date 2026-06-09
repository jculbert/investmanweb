from typing import Any

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.database import get_db

from app.main import app, get_table_or_404

router = APIRouter()

@app.get("/accounts")
@app.get("/accounts/")
def list_accounts(
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
) -> list[dict[str, Any]]:
    table = get_table_or_404("accounts_account")
    stmt = select(table).limit(limit).offset(offset)
    rows = db.execute(stmt).mappings().all()
    return rows
