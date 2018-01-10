#!/usr/bin/env python
import os, django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

import sys
from parser import fundmanagerparser, rbcparser2

from django.core.exceptions import ObjectDoesNotExist
from transactions.models import Transaction
from accounts.models import Account
from symbols.models import Symbol

filename = sys.argv[1]

if filename.endswith(".fmg"):
    t_list = fundmanagerparser.get_transactions(sys.argv[1])
elif filename.endswith(".rbc"):
    t_list = rbcparser2.get_transactions(sys.argv[1])
    exit()
else:
    print "Unknown filetype"

for t_dict in t_list:
    try:
        symbol = Symbol.objects.get(name=t_dict['symbol'])
    except ObjectDoesNotExist:
        symbol = Symbol(name=t_dict['symbol'])
        symbol.save()

    try:
        account = Account.objects.get(name=t_dict['account_name'])
    except ObjectDoesNotExist:
        account = Account(name=t_dict['account_name'])
        account.save()

    # Check for existing transaction with the same hash
    hash = Transaction.get_hash(account=account, symbol=symbol, dict=t_dict)
    try:
        t_model = Transaction.objects.get(hash=hash)
        continue # If we reach here and matching transaction already exists
    except ObjectDoesNotExist:
        pass

    t_model = Transaction.create(account=account, symbol=symbol, dict=t_dict, hash=hash)
    t_model.save()

blart = 'debug'
