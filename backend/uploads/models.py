# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

class Upload(models.Model):
    date = models.DateField(auto_now_add=True)
    file_name = models.TextField(max_length=50, null=True)
    num_transactions = models.IntegerField()
    result = models.TextField(max_length=200)
    notes = models.TextField(max_length=50000, null=True)
    content = models.TextField(max_length=100000)

