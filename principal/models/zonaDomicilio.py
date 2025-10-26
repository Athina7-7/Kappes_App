from django.db import models
from .tipoVenta import tipoVenta

class Domicilio(models.Model):
    lugar = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, null=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    nombre_cliente = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.lugar} - {self.nombre_cliente or 'Sin cliente'}"
