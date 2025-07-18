# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from rest_framework import permissions, viewsets

from serializers import SymbolSerializer
from models import Symbol

class SymbolViewSet(viewsets.ModelViewSet):
    queryset = Symbol.objects.order_by('name')
    serializer_class = SymbolSerializer
    lookup_value_regex = '[-A-Z0-9.]+'   # Added to handle ../symbols/name where name includes a dot

    def get_permissions(self):
        return (permissions.AllowAny(),)