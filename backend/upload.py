#!/usr/bin/env python
import os, django, json
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

import sys
from parser import fundmanagerparser

filename = sys.argv[1]

if filename.endswith(".fmg"):
    trans_list = fundmanagerparser.get_transactions(sys.argv[1])
else:
    print "Unknown filetype"

for t in trans_list:
    print str(t)

blart = 'debug'