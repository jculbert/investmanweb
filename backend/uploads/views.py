# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import permissions, viewsets

from transactions.serializers import TransactionSerializer
from serializers import UploadSerializer
from models import Upload

from parser.rbcparser2 import get_transactions
from backend.db_util import add_transaction

# Create your views here.
class UploadViewSet(viewsets.ModelViewSet):
    queryset = Upload.objects.order_by('name') # Only used for URL mapping?
    serializer_class = UploadSerializer # Only used for URL mappong

    def create(self, request, *args, **kwargs):
        file = request.data['file']

        content = file.read()

        upload = Upload(file_name=file.name, content=content, num_transactions=0, result='Ok')
        upload.save()

        t_list = get_transactions(file=file, upload_id=upload.id)
        for t_dict in t_list:
            add_transaction(t_dict)

        upload.num_transactions = len(t_list)
        upload.save()

        serializer = UploadSerializer(instance=upload, many=False)
        return Response(serializer.data)
