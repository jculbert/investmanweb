from rest_framework import serializers
from symbols.models import Symbol
from transactions.models import Transaction

class DividendSummarySerializer(serializers.Serializer):
    symbol = serializers.CharField(max_length=15)
    amount = serializers.FloatField()
    us_amount = serializers.FloatField(allow_null=True)

class DividendSerializer(serializers.Serializer):
    date = serializers.DateField()
    account = serializers.ModelField(model_field=Transaction()._meta.get_field('account'))
    symbol = serializers.ModelField(model_field=Transaction()._meta.get_field('symbol'))
    amount = serializers.FloatField()
