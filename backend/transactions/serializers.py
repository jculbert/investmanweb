from rest_framework import serializers

from models import Transaction

class TransactionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Transaction
        fields = ('id', 'date', 'type', 'quantity', 'price', 'amount', 'capital_return', 'capital_gain', 'acb', 'symbol', 'account', 'note')
