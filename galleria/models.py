from django.db import models

from django.db import models

class Opera(models.Model):
    titolo = models.CharField(max_length=200)
    immagine = models.ImageField(upload_to='opere/')
    citazione_breve = models.CharField(max_length=200)
    descrizione = models.TextField()
    ordine = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.titolo

    class Meta:
        verbose_name_plural = "Opere"
        ordering = ['ordine']

