# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from symbols.models import Symbol

class Price(models.Model):
    date = models.DateField()
    price = models.FloatField()
    symbol = models.ForeignKey(Symbol)
