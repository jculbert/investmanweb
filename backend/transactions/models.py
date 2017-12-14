# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import hashlib
from datetime import datetime
from django.db import models
from symbols.models import Symbol
from accounts.models import Account
from backend.util import DictionaryHelper

class Transaction(models.Model):
    date = models.DateField(null=False)
    type = models.TextField(null=False)
    symbol = models.ForeignKey(Symbol)
    quantity = models.FloatField(null=True)
    price = models.FloatField(null=True)
    amount = models.FloatField(null=True)
    account = models.ForeignKey(Account)
    hash = models.TextField(db_index=True)
    note = models.TextField(null=True)

    @staticmethod
    def get_hash(account, symbol, dict):
        m = hashlib.md5()
        m.update(account.name)
        m.update(symbol.name)
        m.update(dict['date'].strftime("%Y%m%d"))
        m.update(dict['type'])
        if 'quantity' in dict:
            m.update(dict['quantity'])
        if 'price' in dict:
            m.update(dict['price'])
        if 'amount' in dict:
            m.update(dict['amount'])

        return m.hexdigest()

    @staticmethod
    def create(account, symbol, dict, hash):
        dh = DictionaryHelper(dict)
        return Transaction(account=account, symbol=symbol, date=dh.get('date'), type=dh.get('type'), quantity=dh.get('quantity'),
                        price=dh.get('price'), amount=dh.get('amount'), note=dh.get('amount'), hash=hash)
