from typing import Any
from unittest import case

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.main import list_transactions


router = APIRouter()

def add_holding(self, symbol, currency, accounts, holdings):
    
    account_list = []
    total = 0.0
    for acc in accounts:
        if accounts[acc] != 0:
            account_list.append(acc)
            total = total + accounts[acc]

    holding = {"symbol": symbol, "quantity": round(total, 2)}
    holding['accounts'] = account_list

 #   if symbol.last_price:
    if None:
        amount = total * symbol.last_price
    else:
        amount = 0.0
    holding['amount'] = round(amount/0.75, 2) if currency == 'US' else amount
    holding['us_amount'] = round(amount, 2) if currency == 'US' else None

    holdings.append(holding)

@router.get("/xxx/", include_in_schema=False)
def holdings(
    account: str = Query(...),
    db: Session = Depends(get_db),
) -> list[dict[str, Any]]:
    return list_transactions(account_id=account, db=db)

@router.get("/holdings")
@router.get("/holdings/", include_in_schema=False)
def holdings(
    account: str = Query(...),
    db: Session = Depends(get_db),
) -> list[dict[str, Any]]:
    
    t_list = list_transactions(account_id=account, db=db)

    holdings = []
    symbol = None
    currency = None
    accounts = {}
    amount = 0
    for t in t_list:
        match t['type']:
            case 'BUY':
                quantity = t['quantity']
            case 'SELL':
                quantity = -t['quantity']
            case 'SPLIT':
                # Update previous account quantity according to split factor
                if t['account_id'] in accounts:
                    accounts[t['account_id']] = accounts[t['account_id']] * t['amount']
                continue
            case _:
                continue

        if symbol:
            if t['symbol']['name'] == symbol['name']:
                if not t['account_id'] in accounts:
                    accounts[t['account_id']] = quantity
                else:
                    accounts[t.account_id] += quantity
                continue

            # New symbol, complete the previous
            add_holding(symbol, currency, accounts, holdings)

        symbol = t['symbol']
        currency = t['account']['currency']
        accounts = {t['account_id']: quantity}

    # Need to complete the last symbol upon loop exit
    add_holding(symbol, currency, accounts, holdings)

    return holdings

