# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from rest_framework.response import Response
from rest_framework.views import APIView

from serializers import HoldingSerializer
from transactions.models import Transaction
from prices.models import Price

class HoldingsViewSet(APIView):
    # Required for the Browsable API renderer to have a nice form.
    serializer_class = HoldingSerializer

    def add_holding(self, symbol, currency, accounts, holdings):
    
        # Build list of accounts that have non-zero quantity
        account_list = []
        total = 0.0
        for acc in accounts:
            if accounts[acc] != 0:
                account_list.append(acc)
                total = total + accounts[acc]
    
        holding = {"symbol": symbol, "quantity": round(total, 2)}
        holding['accounts'] = account_list

        if symbol.last_price:
            amount = total * symbol.last_price
        else:
            amount = 0.0
        holding['amount'] = round(amount/0.75, 2) if currency == 'US' else amount
        holding['us_amount'] = round(amount, 2) if currency == 'US' else None

        holdings.append(holding)

    def get(self, request, format=None):
        account = request.query_params.get('account', None)

        # Query transactions for account
        # For symbol, find the total number of shares
        # TBD calculate amount from the symbol current price

        #args = {'account__exact': account}

        if account == "All":
            t_list = Transaction.objects.order_by('symbol', 'date')
        else:
            t_list = Transaction.objects.filter(account__name=account).order_by('symbol', 'date')

        holdings = []
        symbol = None
        currency = None
        accounts = {}
        amount = 0
        for t in t_list:
            if t.type == 'BUY':
                quantity = t.quantity
            elif t.type == 'SELL':
                quantity = -t.quantity
            elif t.type == 'SPLIT':
                # Update previous account quantity according to split factor
                if t.account_id in accounts:
                    accounts[t.account_id] = accounts[t.account_id] * t.amount
                continue
            else:
                continue

            if symbol:
                if t.symbol.name == symbol.name:
                    if not t.account_id in accounts:
                        accounts[t.account_id] = quantity
                    else:
                        accounts[t.account_id] += quantity
                    continue

                # New symbol, complete the previous
                self.add_holding(symbol, symbol, accounts, holdings)

            symbol = t.symbol
            currency = t.account.currency
            accounts = {t.account_id: quantity}

        # Need to complete the last symbol upon loop exit
        self.add_holding(symbol, currency, accounts, holdings)

        serializer = HoldingSerializer(instance=holdings, many=True)
        return Response(serializer.data)


