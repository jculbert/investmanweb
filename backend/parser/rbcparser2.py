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
    "Return of Capital": None
}


def getFloat(strVal):
    if strVal == "":
        return 0.0

    return float(strVal)


class transaction():

    def __init__(self, row):
        self.date = datetime.strptime(row[0], "%b %d, %Y")

        self.currency = row[8]
        self.symbol = row[2]
        if self.symbol in symbolMapDict:
            self.symbol = symbolMapDict[self.symbol]
        else:
            self.symbol = self.symbol.replace(".", "-")
            if self.currency == "CAD":
                self.symbol += ".TO"

        self.acct = acctDict[row[6]]
        if self.currency == "USD":
            self.acct += " US"
        self.amount = getFloat(row[7])
        self.count = getFloat(row[3])
        self.price = getFloat(row[4])

        mapType(self, row[1])

        self.description = row[9]
        self.blart = "xxx"

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

def mapType(self, type):
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

def parse(filename, dump):

    print "\nfile: " + filename
    outfile = open(filename + "_parsed.csv", "w")

    with open(filename, "r") as fp:
        reader = csv.reader(fp)
        for row in reader:
            t = transaction(row)
            if t.type:
                line = t.toFundManager()
                print line
                outfile.write(line + "\r\n")

# main
dump = False
if len(sys.argv) > 1:
    if sys.argv[1] == "-d":
        dump = True
        files = [sys.argv[2]]
    else:
        files = [sys.argv[1]]
else:
    files = []
    for f in listdir("."):
        if re.match("Activity.*", f):
            files.append(f)

print "Parsing: " + str(files)
for filename in files:
    parse(filename, dump)
