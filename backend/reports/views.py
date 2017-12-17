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
            name = None
            for t in t_list:
                amount = t.amount if t.account.currency == 'CA' else t.amount * us_to_ca
                if t.symbol.name != name:
                    name = t.symbol.name
                    entry = {'symbol': name, 'amount': amount}
                    list.append(entry)
                else:
                    entry['amount'] = entry['amount'] + amount

            serializer = DividendSummarySerializer(instance=list, many=True)
        else:
            serializer = DividendSerializer(instance=t_list, many=True)

        return Response(serializer.data)