# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from rest_framework.response import Response
from rest_framework.views import APIView

from serializers import HoldingSerializer
from transactions.models import Transaction

class HoldingsViewSet(APIView):
    # Required for the Browsable API renderer to have a nice form.
    serializer_class = HoldingSerializer

    def add_holding(self, symbol, total, currency, holdings):
        holding = {"symbol": symbol, "quantity": round(total, 2), "amount": 0.00}
        holding['us_amount'] = 0.00 if currency == 'US' else None
        holdings.append(holding)

    def get(self, request, format=None):
        account = request.query_params.get('account', None)

        # Query transactions for account
        # For symbol, find the total number of shares
        # TBD calculate amount from the symbol current price

        #args = {'account__exact': account}

        t_list = Transaction.objects.filter(account__name=account).order_by('symbol', 'date')

        holdings = []
        symbol = None
        total = 0.00
        currency = None
        for t in t_list:
            if t.type == 'BUY':
                quantity = t.quantity
            elif t.type == 'SELL':
                quantity = -t.quantity
            elif t.type == 'SPLIT':
                total = total * t.amount # Update previous total to according to split factor
                continue
            else:
                continue

            if t.symbol.name == symbol:
                total = total + quantity
                continue

            # New symbol, complete the previous symbol if necessary
            if symbol:
                self.add_holding(symbol, total, t.account.currency, holdings)

            symbol = t.symbol.name
            total = quantity
            currency = t.account.currency

        # Need to complete the last symbol upon loop exit
        self.add_holding(symbol, total, currency, holdings)

        serializer = HoldingSerializer(instance=holdings, many=True)
        return Response(serializer.data)


