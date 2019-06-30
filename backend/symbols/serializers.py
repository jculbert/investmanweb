from rest_framework import serializers

from models import Symbol

class SymbolSerializer(serializers.ModelSerializer):

    class Meta:
        model = Symbol
        fields = ('name', 'description', 'last_price', 'last_price_date')
