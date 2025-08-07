#!/usr/bin/python

import sys
import re
import string
import csv
from datetime import datetime
from os import listdir
from os.path import isfile, join
import json
import wsaccountdict

# Symbol mapping special cases
symbolMapDict = { # Mainly for US stocks held in $C
    "PZA": "PZA-UN.TO",
}

# Transaction type mapping
typeDict = {
    "DIV": "DIST_D",
    "BUY": "BUY"
}

# Filename example: Barb_TFSA_monthly-statement-transactions-HQ8D3J5K6CAD-2025-06-01.csv
filename_pattern = re.compile(".*monthly-statement-transactions-(.*)-\d{4}-\d{2}-\d{2}\.csv")

# Buy row description: "CSH.UN - Chartwell Retirement Residences: Bought 557.0000 shares (executed at 2025-06-10)"
buy_desc_pattern = re.compile("(.+) - .*: Bought (.+) shares .*")

# Dividend description: "PPL - Pembina Pipeline Corporation: Cash dividend distribution, received on 2025-06-30, record date of 2025-06-16"
div_desc_pattern = re.compile("(.+) - .+:.+")

def is_ws_file(filename):
    match = filename_pattern.match(filename)
    return match != None

class transaction():

    def __init__(self, row, account, upload_id=None):
        if row[1] not in typeDict:
            self.type = None
            return

        self.type = typeDict[row[1]]

        self.date = datetime.strptime(row[0], "%Y-%m-%d")
        self.description = row[2]
        self.amount = float(row[3])
        if self.amount < 0:
            self.amount = -self.amount
        self.upload_id=upload_id
        self.acct = account
        if account.endswith("USD"):
            self.currency = "USD"
        else:
            self.currency = "CAD"

        if self.type == "BUY":
            self.parse_buy_description(row[2])
        elif self.type == "DIST_D":
            self.parse_div_description(row[2])

        if self.symbol in symbolMapDict:
            self.symbol = symbolMapDict[self.symbol]
        elif self.currency == "CAD":
            self.symbol += ".TO"

    def parse_buy_description(self, desc):
        match = buy_desc_pattern.match(desc)
        if not match:
            return
        
        self.symbol = match.group(1)
        self.count = float(match.group(2))
        self.price = round(self.amount / self.count, 2)

    def parse_div_description(self, desc):
        match = div_desc_pattern.match(desc)
        if not match:
            return
        
        self.symbol = match.group(1)
        self.price = 0.0
        self.count = 0.0

    # Returns a transaction dictionary given
    def toDict(self):
        if self.symbol == 'CASH':
            return None # Not using CASH transactions

        t = {}
        t['account_name'] = self.acct
        t['date'] = self.date
        t['type'] = self.type
        t['symbol'] = self.symbol
        t['amount'] = self.amount
        t['price'] = self.price
        t['quantity'] = self.count
        t['note'] = self.description
        t['upload_id'] = self.upload_id
        t['currency'] = self.currency
        return t

# Returns an dictionary with an array of transaction dictionaries
# and an array of skipped lines.
# The dictionary keys match the field names of twsaccountdict.he transaction model

def process_file(filename, file, upload_id=None):

    result = {"transactions": [], "skipped": []}

    # Get account from file name
    match = filename_pattern.match(filename)
    if not match:
        print "Could not parse file name \n"
        return result
 
    account = match.group(1)
    if account not in wsaccountdict.acctDict:
        print "Account not supported \n"
        return result
    account = wsaccountdict.acctDict[account]

    rows = file.readlines()
    parsed_rows = list(csv.reader(rows))

    in_header = True
    for raw_row, parsed_row in zip(rows, parsed_rows):

        t = transaction(parsed_row, account=account, upload_id=upload_id)
        if t.type:
            dict = t.toDict()
        if not t.type or not dict:
            result["skipped"].append(raw_row)
            continue

        result["transactions"].append(dict)

    return result
