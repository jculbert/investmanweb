# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

class Symbol(models.Model):
    name = models.CharField(primary_key=True, max_length=15)
