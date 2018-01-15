# -*- coding: utf-8 -*-
from __future__ import unicode_literals

# reports are not stored in the database so we use the Non-Model Model
# approach described here: https://medium.com/django-rest-framework/django-rest-framework-viewset-when-you-don-t-have-a-model-335a0490ba6f

# Dividend Summary contains the data for each symbol in a dividend summary report
#class DividendSummary(object):

#    def __init__(self, **kwargs):
#        for field in ('symbol', 'amount'):
#            setattr(self, field, kwargs.get(field, None))

