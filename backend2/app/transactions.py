from typing import Any

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, cast, Float

from app.database import get_db

from app.main import app, get_table_or_404

router = APIRouter()

@app.get("/transactions")
@app.get("/transactions/")
def list_transactions(
    account: str = Query(...),
    symbol: str = Query(...),
    db: Session = Depends(get_db),
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