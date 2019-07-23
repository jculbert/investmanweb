from rest_framework import serializers
from symbols.models import Symbol
from transactions.models import Transaction

class HoldingSerializer(serializers.Serializer):
    symbol = serializers.CharField(max_length=15)
    description = serializers.CharField(max_length=50)
    quantity = serializers.FloatField()
    amount = serializers.FloatField()
    us_amount = serializers.FloatField(allow_null=True)
    accounts = serializers.ListField() # List of accounts holding the symbol
    reviewed_date = serializers.DateField(allow_null=True)
    review_result = serializers.CharField(allow_null=True, max_length=25)
