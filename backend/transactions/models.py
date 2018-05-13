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
    fee = models.FloatField(null=True)
    capital_return = models.FloatField(null=True)
    capital_gain = models.FloatField(null=True)
    acb = models.FloatField(null=True)
    account = models.ForeignKey(Account)
    hash = models.CharField(db_index=True, max_length=50)
    note = models.TextField(null=True)
    upload_id = models.IntegerField(null=True)

    @staticmethod
    def get_hash(account, symbol, dict):
        m = hashlib.md5()
        m.update(account.name)
        m.update(symbol.name)
        m.update(dict['date'].strftime("%Y%m%d"))
        m.update(dict['type'])
        if 'quantity' in dict:
            m.update(str(dict['quantity']))
        if 'price' in dict:
            m.update(str(dict['price']))
        if 'amount' in dict:
            m.update(str(dict['amount']))

        return m.hexdigest()

    @staticmethod
    def create(account, symbol, dict, hash):
        dh = DictionaryHelper(dict)
        return Transaction(account=account, symbol=symbol, date=dh.get('date'), type=dh.get('type'), quantity=dh.get('quantity'),
                        price=dh.get('price'), amount=dh.get('amount'), note=dh.get('note'), hash=hash, upload_id=dh.get('upload_id'))

    def update_hash(self):
        dict = {}
        dict['date'] = self.date
        dict['type'] = self.type
        dict['quantity'] = self.quantity
        dict['price'] = self.price
        dict['amount'] = self.amount

        self.hash = Transaction.get_hash(self.account, self.symbol, dict)
        self.save()
