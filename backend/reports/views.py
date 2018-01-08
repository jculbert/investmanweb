# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from datetime import datetime
from rest_framework.response import Response
from rest_framework.views import APIView

from serializers import DividendSummarySerializer, DividendSerializer
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