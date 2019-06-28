# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
import requests
from symbols.models import Symbol

class Price(models.Model):
    date = models.DateField()
    price = models.FloatField()
    symbol = models.ForeignKey(Symbol)

    av_params = {"function": "GLOBAL_QUOTE", "apikey": "LGK04YBYGJND5R6N"}

    # Static method that returns a Price float for a given symbol object and date
    @staticmethod
    def get_price(symbol, date):

        try:
            # Date not implemented yet. Just get latest price
            Price.av_params["symbol"] = symbol.name
            r = requests.get("https://www.alphavantage.co/query", params=Price.av_params)
            if r:
                dict = r.json()
                return float(dict["Global Quote"]["05. price"])
            else:
                return 0.0
        except:
            return 0.0