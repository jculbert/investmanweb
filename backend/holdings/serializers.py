from rest_framework import serializers
from symbols.models import Symbol
from transactions.models import Transaction
from symbols.serializers import SymbolSerializer

class HoldingSerializer(serializers.Serializer):
    symbol = SymbolSerializer(many=False)
    quantity = serializers.FloatField()
    amount = serializers.FloatField()
    us_amount = serializers.FloatField(allow_null=True)
    accounts = serializers.ListField() # List of accounts holding the symbol
