#!/usr/bin/env python
import os, django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

import requests
from django.core.exceptions import ObjectDoesNotExist
from symbols.models import Symbol
from prices.models import Price

import logging, logging.handlers, time, traceback
from datetime import datetime

logHandler = logging.handlers.TimedRotatingFileHandler('./update_prices.log', when="d", interval=1, backupCount=6)
logHandler.setLevel(logging.DEBUG)
logFormatter = logging.Formatter("%(asctime)s - %(name)s %(levelname)s - %(message)s")
logHandler.setFormatter(logFormatter)

log = logging.getLogger("")
log.setLevel(logging.DEBUG)
log.addHandler(logHandler)


# Get latest price for each symbol
# Limit API call rate to 5 per second

av_params = {"function": "GLOBAL_QUOTE", "apikey": "LGK04YBYGJND5R6N"}

symbols = Symbol.objects.order_by('name')
for s in symbols:
    try:
        price = 0.0
        price_date = datetime.now()
        av_params["symbol"] = s.name
        r = requests.get("https://www.alphavantage.co/query", params=av_params)

        if r.status_code == 200:
            dict = r.json()
            log.debug("json " + str(dict))
            if "Global Quote" in dict and "05. price" in dict["Global Quote"]:
                price = float(dict["Global Quote"]["05. price"])
                price_date = datetime.strptime(dict["Global Quote"]["07. latest trading day"], "%Y-%m-%d")
                log.info("Got price " + str(price) + " for symbol " + s.name)
            else:
                log.error("Empty response for symbol " + s.name)
        else:
            log.error('requests returned ' + str(r.status_code))
    except:
        log.error("Exception for symbol " + s.name + ": " + traceback.format_exc())

    if price != 0.0 or not s.last_price or s.last_price == 0.0:
        s.last_price = price
        s.last_price_date = price_date
        s.save()

    time.sleep(20)