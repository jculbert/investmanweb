# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

class Account(models.Model):
    name = models.TextField(primary_key=True)
    account_number = models.TextField(null=True, db_index=True)
    currency = models.TextField(null=True)
