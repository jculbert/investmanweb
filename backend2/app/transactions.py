import hashlib
from typing import Any

from fastapi import APIRouter, Depends, Query, HTTPException, Body, Response
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from sqlalchemy import insert, select, cast, Float, update, delete
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
) -> None:
    print(f"Updating transaction with ID {_id} and values: {values}")
    table = get_table_or_404("transactions_transaction")

    try:
        result = db.execute(update(table).where(table.c.id == _id).values(**values))
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail=str(exc.orig)) from exc

    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Record not found - update_transaction")

    return None

# Function to convert decimal to string like Python 2's str() function
# For compatibility with django backend
def decimal_to_py2_string(d):
    s = format(d, 'f')          # Fixed-point, no scientific notation

    if '.' in s:
        # Remove trailing zeros
        s = s.rstrip('0')

        # If we removed everything after the decimal point,
        # leave a single zero.
        if s.endswith('.'):
            s += '0'

    return s

def update_hash(id: int, db: Session) -> None:
    table = get_table_or_404("transactions_transaction")
    stmt = select(table).where(table.c.id == id)
    trans = db.execute(stmt).mappings().first()
    if not trans:
        raise HTTPException(status_code=404, detail="Record not found: update_hash")

    # Serialize the row to JSON and compute the hash
    m = hashlib.md5()
    if 'account_id' in trans:
        m.update(trans['account_id'].encode('ascii'))
    if 'symbol_id' in trans:
        m.update(trans['symbol_id'].encode('ascii'))
    if 'date' in trans:
        m.update(trans['date'].strftime("%Y%m%d").encode('ascii'))
    if 'type' in trans:
        m.update(trans['type'].encode('ascii'))
    if 'quantity' in trans:
        m.update(decimal_to_py2_string(trans['quantity']).encode('ascii'))
    if 'price' in trans:
        m.update(decimal_to_py2_string(trans['price']).encode('ascii'))
    if 'amount' in trans:
        m.update(decimal_to_py2_string(trans['amount']).encode('ascii'))

    # Update the hash in the database if changed
    digest = m.hexdigest()
    if trans.get('hash') != digest:
        print(f"Updating hash for transaction ID {id} to {digest}")
        update_transaction(id, {"hash": m.hexdigest()}, db)

# Iterate all transactions for a given account and symbol, updating the ACB and capital gain for each transaction
def update_transaction_acbs(
        account: str, symbol: str, db: Session
) -> None:
    acb = 0.0
    shares = 0
    t_list = query_transactions(account, symbol, db)
    print(f"Updating ACB for account: {account}, symbol: {symbol}. Total transactions: {len(t_list)}")  
    for t in t_list:
        if 'type' not in t or not t['type']:
            print(f"Skipping transaction with ID {t.get('id')} due to missing or empty 'type' field.")
            continue
        has_price_and_quantity = 'price' in t and t['price'] and 'quantity' in t and t['quantity']

        if t['type'] == 'BUY' and has_price_and_quantity:
            acb = acb + t['price'] * t['quantity']
            if 'fee' in t and t['fee']:
                acb = acb + t['fee']
            shares = shares + t['quantity']
            update_transaction(t['id'], {"acb": acb}, db)
        elif t['type'] == 'SELL' and has_price_and_quantity:
            if shares <= 0:
                # Something is wrong in the transaction history
                # reset ACB and capital gain to 0
                print(f"Invalid transaction history for ID {t.get('id')}")
                acb = 0.0
                shares = 0
                update_transaction(t['id'], {"acb": 0.0, "capital_gain": 0.0}, db)
                continue
            capital_gain = t['price'] * t['quantity'] - (acb / shares) * t['quantity']
            if 'fee' in t and t['fee']:
                capital_gain = capital_gain - t['fee']

            acb = acb * (shares - t['quantity']) / shares

            shares = shares - t['quantity']
            update_transaction(t['id'], {"acb": acb, "capital_gain": capital_gain}, db)
        elif t['type'] == 'DIST_D' and 'capital_return' in t and t['capital_return']:
            acb = acb - t['capital_return']
            update_transaction(t['id'], {"acb": acb}, db)

    return

# Transaction fields account and symbol are presented as account and symbol in the API,
# but are stored as account_id and symbol_id in the database. This mapping is used to translate between the two.
def map_fields(values: dict[str, Any]
) -> None:
    if "account" in values:
        values["account_id"] = values.pop("account")
    if "symbol" in values:
        values["symbol_id"] = values.pop("symbol")
    
@app.put("/transactions/{record_id}")
@app.put("/transactions/{record_id}/")
def put_transaction(
    record_id: str, payload: Any = Body(...), db: Session = Depends(get_db)
) -> dict[str, Any]:
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

    map_fields(body_data) #Remove account and symbol fields, replace with account_id and symbol_id
    values = sanitize_payload(table, body_data)

    if table.c.id.name in values and values[table.c.id.name] != _id:
        raise HTTPException(status_code=422, detail="Changing primary key is not supported")
    
    update_transaction(_id, values, db)
    update_hash(_id, db)

    # Update ACB and capital gain for the account and symbol
    stmt = select(table.c.account_id, table.c.symbol_id).where(table.c.id == _id)
    updated = db.execute(stmt).mappings().first()
    if not updated:
        raise HTTPException(status_code=404, detail="Record not found: get account and symbol")
    update_transaction_acbs(updated.get("account_id"), updated.get("symbol_id"), db)

    stmt = select(table).where(table.c.id == _id)
    updated = db.execute(stmt).mappings().first()
    if not updated:
        raise HTTPException(status_code=404, detail="Record not found: return result")
    return updated

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

    map_fields(body_data) #Remove account and symbol fields, replace with account_id and symbol_id
    values = sanitize_payload(table, body_data)

    # Set hash to a dummy value, will get updated after insert
    values["hash"] = "dummy_hash"
    # Remove the primary key from the values if present, as it will be auto-generated
    if table.c.id.name in values:
        del values[table.c.id.name]
    print("Sanitized values:", values)

    try:
        result = db.execute(insert(table).values(**values))
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Record not found - post_transaction")
        _id = result.inserted_primary_key[0]
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail=str(exc.orig)) from exc

    update_hash(_id, db)

    # Update ACB and capital gain for the account and symbol
    stmt = select(table.c.account_id, table.c.symbol_id).where(table.c.id == _id)
    updated = db.execute(stmt).mappings().first()
    if not updated:
        raise HTTPException(status_code=404, detail="Record not found: get account and symbol")
    update_transaction_acbs(updated.get("account_id"), updated.get("symbol_id"), db)

    stmt = select(table).where(table.c.id == _id)
    created = db.execute(stmt).mappings().first()
    if not created:
        raise HTTPException(status_code=404, detail="Record not found: return result")
    return created

@app.delete("/transactions/{record_id}")
@app.delete("/transactions/{record_id}/")
def delete_record(record_id: str, db: Session = Depends(get_db)
) -> Response:
    table = get_table_or_404("transactions_transaction")

    try:
        _id = coerce_pk(table.c.id, record_id)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    result = db.execute(delete(table).where(table.c.id == _id))
    db.commit()

    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Record not found")

    return Response(status_code=204)

