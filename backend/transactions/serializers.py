from rest_framework import serializers

from models import Transaction

class TransactionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Transaction
        fields = ('date', 'type', 'quantity', 'price', 'amount', 'note')
