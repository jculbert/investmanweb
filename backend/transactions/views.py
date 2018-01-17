# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from rest_framework.response import Response

from rest_framework import permissions, viewsets

from serializers import TransactionSerializer
from models import Transaction

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
