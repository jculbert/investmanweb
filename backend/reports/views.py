# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from datetime import datetime
from rest_framework.response import Response
from rest_framework.views import APIView

from serializers import DividendSummarySerializer, DividendSerializer, SymbolDividendSerializer
from transactions.models import Transaction

us_to_ca = 1.0 / 0.78

class DividendSummaryViewSet(APIView):
    # Required for the Browsable API renderer to have a nice form.
    serializer_class = DividendSummarySerializer

    def get(self, request, format=None):
        summary = False
        p = request.query_params.get('summary', None)
        if p and p == 'true':
            summary = True

        args = {'type__exact': 'DIST_D'}
        p = request.query_params.get('startdate', None)
        if p:
            args['date__gte'] = datetime.strptime(p, '%Y%m%d')

        p = request.query_params.get('enddate', None)
        if p:
            args['date__lte'] = datetime.strptime(p, '%Y%m%d')

        t_list = Transaction.objects.filter(**args).order_by('symbol', 'date')

        if summary:
            # Construct the summary, a total for each symbol
            list = []
            last_name = None
            for t in t_list:
                if t.account.currency == 'CA':
                    amount = t.amount
                    us_amount = None
                else:
                    amount = round(t.amount * us_to_ca, 2)
                    us_amount = t.amount

                if t.symbol.name != last_name:
                    last_name = t.symbol.name
                    item = {'symbol': last_name, 'amount': amount, 'us_amount': us_amount}
                    list.append(item)
                else:
                    item['amount'] = round(item['amount'] + amount, 2)

                    if us_amount and 'us_amount' in item:
                        item['us_amount'] = round(item['us_amount'] + us_amount, 2)
                    else:
                        item['us_amount'] = us_amount

            serializer = DividendSummarySerializer(instance=list, many=True)
        else:
            serializer = DividendSerializer(instance=t_list, many=True)

        return Response(serializer.data)

class SymbolDividendsViewSet(APIView):

    def get(self, request, format=None):
        summary = False
        symbol_name = request.query_params.get('symbol', None)
        if not symbol_name:
            raise Exception('Symbol Dividend repors requires the symbol query parameter')

        # For each sybmol...
        # Walk the transactions, summing buys and sells for each accountand calcuating dividend per share for each dividend transaction
        t_list = Transaction.objects.filter(symbol_id=symbol_name).order_by('date')

        dividends = []
        symbol = None
        for t in t_list:

            if not symbol or t.symbol.name != symbol.name:
                # New symbol
                quantities = {}
                symbol = t.symbol

            if t.type == 'BUY' or t.type == 'SELL':
                quantity = t.quantity if t.type == 'BUY' else -t.quantity

                if t.account_id not in quantities:
                    quantities[t.account_id] = quantity
                else:
                    quantities[t.account_id] += quantity
            elif t.type == 'DIST_D':
                if t.account_id in quantities: # Ignore this dividend if no buy for account
                    dividends.append({"date": t.date, "amount": t.amount / quantities[t.account_id], "account": t.account_id})
            elif t.type == 'SPLIT':
                if t.account_id in quantities: # Ignore this split if no buy for account
                    quantities[t.account_id] *= t.amount # Update previous total to according to split factor

        serializer = SymbolDividendSerializer(instance=dividends, many=True)
        return Response(serializer.data)
