# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from rest_framework import permissions, viewsets

from serializers import AccountSerializer
from models import Account

class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.order_by('name')
    serializer_class = AccountSerializer

    def get_permissions(self):
        return (permissions.AllowAny(),)