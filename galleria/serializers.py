from rest_framework import serializers
from .models import Opera

class OperaSerializer(serializers.ModelSerializer):
    # Questo assicura che il link dell'immagine sia completo (http://localhost:8000/media/...)
    immagine = serializers.SerializerMethodField()

    class Meta:
        model = Opera
        fields = '__all__'

    def get_immagine(self, obj):
        request = self.context.get('request')
        if obj.immagine:
            return request.build_absolute_uri(obj.immagine.url)
        return None
