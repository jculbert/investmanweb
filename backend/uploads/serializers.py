from rest_framework import serializers

from models import Upload

class UploadDetailSerializer(serializers.ModelSerializer):

    class Meta:
        model = Upload
        fields = ('id', 'date', 'file_name', 'num_transactions', 'result', 'notes', 'content')

class UploadListSerializer(serializers.ModelSerializer):

    class Meta:
        model = Upload
        fields = ('id', 'date', 'file_name', 'num_transactions', 'result')
