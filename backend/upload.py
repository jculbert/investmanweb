#!/usr/bin/env python
import os, django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

import sys
from parser import fundmanagerparser

from django.core.exceptions import ObjectDoesNotExist
from transactions.models import Transaction
from accounts.models import Account
from symbols.models import Symbol

filename = sys.argv[1]

if filename.endswith(".fmg"):
    trans_list = fundmanagerparser.get_transactions(sys.argv[1])
else:
    print "Unknown filetype"

for t in trans_list:
    try:
        symbol = Symbol.objects.get(name=t['symbol'])
    except ObjectDoesNotExist:
        symbol = Symbol(name=t['symbol'])
        symbol.save()

    try:
        account = Account.objects.get(name=t['account_name'])
    except ObjectDoesNotExist:
        account = Account(name=t['account_name'])
        account.save()

    # Check for existing transaction with the same hash
    hash = Transaction.get_hash(account=account, symbol=symbol, dict=dict)
    try:
        db_t = Account.objects.get(hash=hash)
    except ObjectDoesNotExist:
        db_t = None
    if db_t:
        continue

    db_t = Transaction.create(account=account, symbol=symbol, dict=dict, hash=hash)
    blart = 'debug'
