# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from datetime import datetime
from rest_framework.response import Response
from rest_framework.views import APIView

from serializers import DividendSummarySerializer, DividendSerializer, SymbolDividendSerializer, SymbolDividendReportSerializer
from transactions.models import Transaction

us_to_ca = 1.0 / 0.78

class DividendsViewSet(APIView):

    def get(self, request, format=None):
        # Determine type of request based on query params provided
        symbol_name = request.query_params.get('symbol', None)
        if symbol_name:
            return self.get_symbol_dividends(symbol_name, request, format)
        summary = request.query_params.get('summary', None)
        if summary:
            return self.get_dividend_summary(True if summary == 'true' else False, request, format)

        raise Exception('Invalid dividends request')

    def get_symbol_dividends(self, symbol_name, request, format=None):

        # For each symbol...
        # Walk the transactions, summing buys and sells for each accountand calcuating dividend per share for each dividend transaction
        t_list = Transaction.objects.filter(symbol_id=symbol_name).order_by('date')

        dividends = []
        symbol = None
        for t in t_list:

            if not symbol or t.symbol.name != symbol.name:
                # New symbol
                quantities = {}  # Dict of quantity for each account
                lastBuySellDate = {} # Dict of last buy or sell date for each account
                lastAmount = None
                symbol = t.symbol

            if t.type == 'BUY' or t.type == 'SELL':
                lastBuySellDate[t.account_id] = t.date
                quantity = t.quantity if t.type == 'BUY' else -t.quantity

                if t.account_id not in quantities:
                    quantities[t.account_id] = quantity
                else:
                    quantities[t.account_id] += quantity
            elif t.type == 'DIST_D':
                if t.account_id in quantities: # Ignore this dividend if no buy for account

                    amount = t.amount / quantities[t.account_id]

                    # Use the previous dividend amount if dividend date is close to a buy or sell
                    if lastAmount and t.account_id in lastBuySellDate:
                        delta = t.date - lastBuySellDate[t.account_id]
                        if delta.days >= -3 and delta.days <= 3:
                            amount = lastAmount

                    dividends.append({"date": t.date, "amount": amount, "account": t.account_id})
                    lastAmount = amount
            elif t.type == 'SPLIT':
                if t.account_id in quantities: # Ignore this split if no buy for account
                    quantities[t.account_id] *= t.amount # Update previous total to according to split factor

        serializer = SymbolDividendReportSerializer(data={'growth': 5.2, 'yeeld': 3.9, 'dividends': dividends})
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data)

    def get_dividend_summary(self, summary, request, format=None):

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
