# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import permissions, viewsets

from transactions.serializers import TransactionSerializer
from serializers import UploadListSerializer, UploadDetailSerializer
from models import Upload

from parsers.rbcparser2 import process_file
from backend.db_util import add_transaction

# Create your views here.
class UploadViewSet(viewsets.ModelViewSet):
    queryset = Upload.objects.order_by('date') # Only used for URL mapping?
    serializer_class = UploadDetailSerializer # Only used for URL mappong

    def get_serializer_class(self):
        if self.action == 'list':
            return UploadListSerializer
        elif self.action == 'retrieve':
            return UploadDetailSerializer
        elif self.action == 'create':
            return UploadDetailSerializer
        return UploadDetailSerializer  # fallback

    def create(self, request, *args, **kwargs):
        file = request.data['file']

        content_str = file.read()
        content = content_str.decode('utf-8')

        upload = Upload(file_name=file.name, content=content, num_transactions=0, result='Ok')
        upload.save()

        file.seek(0)
        result = process_file(file=file, upload_id=upload.id)
        for t_dict in result["transactions"]:
            add_transaction(t_dict)

        upload.num_transactions = len(result["transactions"])

        skipped = len(result["skipped"])
        notes = "Skipped: " + str(skipped) + "\n"
        if skipped != 0:
            for s in result["skipped"]:
                notes += str(s) + "\n"
        upload.notes = notes

        upload.save()

        serializer = UploadDetailSerializer(instance=upload, many=False)
        return Response(serializer.data)
