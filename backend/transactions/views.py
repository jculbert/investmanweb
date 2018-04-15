# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from rest_framework.response import Response

from rest_framework import permissions, viewsets

from serializers import TransactionSerializer
from models import Transaction

#from backend.util import update_acb

def update_acb(account, symbol):

    acb = 0.0
    shares = 0
    t_list = Transaction.objects.filter(account__name=account, symbol__name=symbol).order_by('date')
    for t in t_list:
        if t.type == 'BUY':
            acb = acb + t.amount
            shares = shares + t.quantity
        elif t.type == 'SELL':
            t.capital_gain = t.price * t.quantity - (acb / shares) * t.quantity
            acb = acb * (shares - t.quantity) / shares
            shares = shares - t.quantity
        elif t.type == 'DIST_D' and t.capital_return:
            acb = acb - t.capital_return

        t.acb = acb
        t.save()

    return

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.order_by('name')
    serializer_class = TransactionSerializer

    def list_permissions(self):
        return (permissions.AllowAny(),)

    def list(self, request, *args, **kwargs):
        account = request.query_params.get('account', None)
        symbol = request.query_params.get('symbol', None)

        args = {'account__exact': account, 'symbol__exact': symbol}

        t_list = Transaction.objects.filter(**args).order_by('date')

        serializer = TransactionSerializer(instance=t_list, many=True)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        trans = super(viewsets.ModelViewSet, self).update(request, args, kwargs)

        update_acb(trans.data['account'], trans.data['symbol'])

        db_trans = Transaction.objects.get(id=trans.data['id'])
        db_trans.update_hash()

        response = super(viewsets.ModelViewSet, self).retrieve(request, args, kwargs)
        return response
