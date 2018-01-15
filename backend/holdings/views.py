# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from rest_framework.response import Response
from rest_framework.views import APIView

from serializers import HoldingSerializer
from transactions.models import Transaction

class HoldingsViewSet(APIView):
    # Required for the Browsable API renderer to have a nice form.
    serializer_class = HoldingSerializer

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

            # New symbol, complete the previous symbol and init for this one
            if symbol:
                holding = {"symbol": symbol, "quantity": round(total, 2), "amount": 0.00}
                holding['us_amount'] = 0.00 if t.account.currency == 'US' else None

                holdings.append(holding)

            symbol = t.symbol.name
            total = quantity

        serializer = HoldingSerializer(instance=holdings, many=True)
        return Response(serializer.data)


