import csv
from datetime import datetime

# Returns a transaction dictionary given a FundManager row
# Returns None if transaction type is to be ignored
def parse_row(row):
    symbol = row[3]
    if symbol == 'CASH':
        return None # Not using CASH transactions

    type = row[2]
    if type != 'BUY' and type != 'SELL' and type != 'DIST_D' and type != 'SPLIT':
        print "Ignoring type " + type + " row: " + str(row)
        return None


    t = {}
    t['account_name'] = row[0]
    t['date'] = datetime.strptime(row[1], '%Y%m%d')
    t['type'] = type
    t['symbol'] = symbol
    if type == 'DIST_D':
        t['amount'] = float(row[4])
        t['price'] = 0.0
        t['quantity'] = 0.0
    elif type == 'SPLIT':
        t['amount'] = float(row[4])
        t['price'] = 0.0
        t['quantity'] = float(row[5])
    else:
        price = float(row[4])
        count = float(row[5])
        t['price'] = price
        t['quantity'] = count
        #t['amount'] = int((price * count) * 100 + 0.5) / 100.0
        t['amount'] = price * count
    t['note'] = row[7]

    return t


# Returns an array of transaction dictionaries
# The dictionary keys match the field names of the transaction model
def get_transactions(filename):

    transactions = []
    with open(filename, "r") as fp:
        reader = csv.reader(fp)
        for row in reader:
            t = parse_row(row)
            if t:
                transactions.append(parse_row(row))

    return transactions

