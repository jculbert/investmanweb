#!/usr/bin/python

import sys
import re
import string
import csv
from datetime import datetime
from os import listdir
from os.path import isfile, join
import json
import rbcparser2
import wsparser

# Returns an dictionary with an array of transaction dictionaries
# and an array of skipped lines.
# The dictionary keys match the field names of the transaction model

def process_file(filename, file, upload_id=None):

    if wsparser.is_ws_file(filename):
        return wsparser.process_file(filename, file, upload_id)
    elif rbcparser2.is_rbc_file(filename, file):
        return rbcparser2.process_file(filename, file, upload_id)
    else:
        print "File type not supported\n"
        return {"transactions": [], "skipped": []}

if __name__ == '__main__':
    print "uploadparser: " + str(sys.argv[1])

    file = open(sys.argv[1], "r")
    result = process_file(filename=sys.argv[1], file=file, upload_id=123)

    for skipped in result["skipped"]:
        print str(skipped)
    print "\n"
    for t in result["transactions"]:
        print str(t)
