from rest_framework import generics
from .models import Opera
from .serializers import OperaSerializer

class OperaList(generics.ListAPIView):
    queryset = Opera.objects.all()
    serializer_class = OperaSerializer

    def get_serializer_context(self):
        # Passiamo il contesto della richiesta al serializer
        return {'request': self.request}

