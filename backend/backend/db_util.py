from django.core.exceptions import ObjectDoesNotExist
from transactions.models import Transaction
from accounts.models import Account
from symbols.models import Symbol

def add_transaction(t_dict):
    try:
        symbol = Symbol.objects.get(name=t_dict['symbol'])
    except ObjectDoesNotExist:
        symbol = Symbol(name=t_dict['symbol'])
        symbol.save()

    try:
        account = Account.objects.get(name=t_dict['account_name'])
    except ObjectDoesNotExist:
        account = Account(name=t_dict['account_name'])
        if t_dict['currency'] == "USD":
            account.currency = "US"
        else:
            account.currency = "CA"
        account.save()

    # Check for existing transaction with the same hash
    hash = Transaction.get_hash(account=account, symbol=symbol, dict=t_dict)
    try:
        t_model = Transaction.objects.get(hash=hash)
        return None
    except ObjectDoesNotExist:
        pass

    t_model = Transaction.create(account=account, symbol=symbol, dict=t_dict, hash=hash)
    t_model.save()
    return t_model
