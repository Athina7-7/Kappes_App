from django.db import models
from .mesa import Mesa
from .usuario import Usuario
from .tipoVenta import tipoVenta


class Orden(models.Model):
    id_orden = models.AutoField(primary_key=True)
    # on_delete: qué pasa cuando se borra el objeto padre.
    # CASCADE: borra también las órdenes relacionadas.
    # related_name: el nombre que se usará para acceder a la relación inversa.
    id_usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='ordenes')
    # SET_NULL: pone ese campo en NULL si el objeto padre se borra (por eso necesita null=True).
    # blank:blank=True significa que el campo puede dejarse vacío en formularios (no es obligatorio rellenarlo).
    id_mesa = models.ForeignKey(Mesa, on_delete=models.SET_NULL, null=True, blank=True, related_name='ordenes')
    id_tipoVenta = models.ForeignKey(tipoVenta, on_delete=models.CASCADE, related_name='ordenes')
    fecha = models.DateTimeField(auto_now_add=True)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return f"Orden {self.id_orden}"
