from django.db import models


class Mesa(models.Model):
    id_mesa = models.AutoField(primary_key=True)
    numero = models.PositiveIntegerField(unique=True)
    estado = models.BooleanField(default=True);

    def __str__(self):
        return self.numero