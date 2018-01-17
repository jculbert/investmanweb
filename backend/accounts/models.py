# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

class Account(models.Model):
    name = models.CharField(primary_key=True, max_length=25)
    account_number = models.TextField(null=True)
    currency = models.TextField(null=True)
