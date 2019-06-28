from rest_framework import serializers
from symbols.models import Symbol
from transactions.models import Transaction

class HoldingSerializer(serializers.Serializer):
    symbol = serializers.CharField(max_length=15)
    quantity = serializers.FloatField()
    amount = serializers.FloatField()
    us_amount = serializers.FloatField(allow_null=True)
    accounts = serializers.ListField() # List of accounts holding the symbol
