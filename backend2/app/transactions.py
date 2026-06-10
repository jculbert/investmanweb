from typing import Any

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.database import get_db

from app.main import app, get_table_or_404

router = APIRouter()

@app.get("/transactions")
@app.get("/transactions/")
def list_accounts(
    account: str = Query(...),
    symbol: str = Query(...),
    db: Session = Depends(get_db),
) -> list[dict[str, Any]]:
    transactions_table = get_table_or_404("transactions_transaction")
    symbols_table = get_table_or_404("symbols_symbol")
    accounts_table = get_table_or_404("accounts_account")
    symbol_columns = [
        column.label(f"symbol_{column.name}")
        for column in symbols_table.columns
    ]
    account_columns = [
        column.label(f"account_{column.name}")
        for column in accounts_table.columns
    ]
    joined_tables = transactions_table.join(
        symbols_table,
        transactions_table.c.symbol_id == symbols_table.c.name,
    ).join(
        accounts_table,
        transactions_table.c.account_id == accounts_table.c.name,
    )
    stmt = (
        select(transactions_table, *symbol_columns, *account_columns)
        .select_from(joined_tables)
        .where(transactions_table.c.account_id == account)
        .where(transactions_table.c.symbol_id == symbol)
        .order_by(transactions_table.c.date)
    )
    rows = db.execute(stmt).mappings().all()
    return rows