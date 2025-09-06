from django.db import models
from .orden import  Orden
from .producto import Producto

class detalleOrden(models.Model):
    id_detalle = models.AutoField(primary_key=True)
    id_orden = models.ForeignKey(Orden, on_delete=models.CASCADE, related_name='detalles')
    id_producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField(default=1)
    # blank=True significa que el campo puede dejarse vacío en formularios (no es obligatorio rellenarlo).
    adiciones = models.TextField(blank=True)

    def __str__(self):
        # solo una expresión: 3 x coca-cola (ejemplo)
        return f"{self.cantidad} x {self.id_producto.nombre}"