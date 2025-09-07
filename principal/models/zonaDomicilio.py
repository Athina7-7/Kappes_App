from django.db import models
from .tipoVenta import tipoVenta

class zonaDomicilio(models.Model):
    id_zona = models.AutoField(primary_key=True)
    id_tipo = models.ForeignKey(tipoVenta, on_delete=models.CASCADE, related_name='zonas')
    nombre_zona = models.CharField(max_length=100)
    ajuste_precio = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return self.nombre_zona