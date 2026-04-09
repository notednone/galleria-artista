from django.contrib import admin
from .models import Opera

@admin.register(Opera)
class OperaAdmin(admin.ModelAdmin):
    list_display = ('titolo', 'ordine') # Così vedi subito il titolo e l'ordine nella lista

