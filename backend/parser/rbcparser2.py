#!/usr/bin/python

import sys
import re
import string
import csv
from datetime import datetime
from os import listdir
from os.path import isfile, join

acctDict = {
    "68059274": "Jeff RBC",
    "26449306": "Jeff TFSA",
    "69232133": "Jeff RRSP",
    "68379993": "Barb RBC",
    "26449377": "Barb TFSA",
    "69718112": "Barb RRSP",
    "69718147": "Barb RRSP Spousal",
    "69059162": "Barb LIRA"
}

# Symbol mapping special cases
symbolMapDict = { # Mainly for US stocks held in $C
    "PZA": "PZA-UN.TO",
    "GSK": "GSK",
    "BA": "BA",
    "KO": "KO",
    "CVX": "CVX",
    "JNJ": "JNJ",
    "KMB": "KMB",
    "KRFT": "KRFT",
    "PG": "PG",
    "SO": "SO",
    "IVR": "IVR",
    "INTC": "INTC",
    "LLY": "LLY",
    "PFE": "PFE",
    "F": "F",
    "RY.PR.W": "RY-PW.TO"
}

# Transaction type mapping
typeDict = {
    "Dividends": "DIST_D",
    "Buy": "BUY",
    "Sell": "SELL",
    "Transfers": None,
    "Deposits & Contributions": "Buy",
    "Withdrawals & De-registrations": None,
    "Return of Capital": None,
    "Taxes": None
}

def getFloat(strVal):
    if strVal == "":
        return 0.0

    return float(strVal)


class transaction():

    def __init__(self, row, upload_id=None):
        self.row = row
        self.date = datetime.strptime(row[0], "%b %d, %Y")
        self.upload_id=upload_id

        self.currency = row[8]
        self.symbol = row[2]
        if self.symbol in symbolMapDict:
            self.symbol = symbolMapDict[self.symbol]
        else:
            self.symbol = self.symbol.replace(".", "-")
            if self.currency == "CAD":
                self.symbol += ".TO"

        self.amount = getFloat(row[7])
        mapType(self, row[1])

        self.acct = acctDict[row[6]]
        if self.currency == "USD":
            self.acct += " US"
        if self.amount < 0 and self.type != "DIST_D":
            self.amount = round(self.amount * -1, 2)
        self.count = getFloat(row[3])
        if self.count < 0:
            self.count = round(self.count * -1, 2)
        self.price = getFloat(row[4])

        self.description = row[9]

    def toFundManager(self):
        line = self.acct + ","
        line += self.date.strftime("%Y%m%d") + ","
        line += self.type + ","
        line += self.symbol + ","
        if self.type == "BUY" or self.type == "SELL":
            line += "%.2f" % self.price + ","
        else:
            line += "%.2f" % self.amount + ","
        line += "%.2f" % self.count + ","
        line += "0.0," + self.description

        return line

    # Returns a transaction dictionary given
    def toDict(self):
        if self.symbol == 'CASH':
            return None # Not using CASH transactions

        if self.type != 'BUY' and self.type != 'SELL' and self.type != 'DIST_D' and self.type != 'SPLIT':
            print "Ignoring type " + type + " row: " + str(self.row)
            return None

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
        return t


def mapType(self, type):
    if type not in typeDict:
        self.type = None
        print "Unknown type: " + str(self.row)
        return None

    self.type = typeDict[type]
    if type == "Deposits & Contributions":
        self.type = "BUY"
        self.symbol = "CASH"
        self.count = self.amount
        self.price = 1.0
    elif type == "Withdrawals & De-registrations":
        self.type = "SELL"
        self.symbol = "CASH"
        self.count = self.amount
        self.price = 1.0

# Returns an array of transaction dictionaries
# The dictionary keys match the field names of the transaction model
def get_transactions(filename):

    transactions = []
    with open(filename, "r") as fp:
        reader = csv.reader(fp)
        for row in reader:
            t = transaction(row)
            if not t.type:
                continue
            dict = t.toDict()
            if dict:
                transactions.append(dict)

    return transactions

# Returns an array of transaction dictionaries
# The dictionary keys match the field names of the transaction model

def get_transactions(filename=None, file=None, upload_id=None):

    if not file:
        file = open(open(filename, "r"))

    transactions = []
    reader = csv.reader(file)
    in_header = True
    for row in reader:

        # We are reading the header until transaction field name line is found
        if in_header:
            if len(row) > 0 and row[0] == 'Date':
                in_header = False
            continue

        # Stop when a blank line is found
        if len(row) < 2:
            break

        t = transaction(row, upload_id=upload_id)
        if not t.type:
            continue
        dict = t.toDict()
        if dict:
            transactions.append(dict)

    return transactions
