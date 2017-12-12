# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from symbols.models import Symbol
from accounts.models import Account

class Transaction(models.Model):
    date = models.DateField(null=False)
    type = models.TextField()
    symbol = models.ForeignKey(Symbol)
    quantity = models.FloatField(null=True)
    price = models.FloatField(null=True)
    value = models.FloatField(null=True)
    account = models.ForeignKey(Account)
    note = models.TextField(null=True)
