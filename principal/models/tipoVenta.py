from django.db import models


class tipoVenta(models.Model):
    id_tipo = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    ajuste_precio = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    modo_ajuste = models.CharField(max_length=50)

    def __str__(self):
        return self.nombre
    
