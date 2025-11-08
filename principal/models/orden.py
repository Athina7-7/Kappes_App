from django.db import models
from .mesa import Mesa
from .usuario import Usuario
from .tipoVenta import tipoVenta
from .producto import Producto


class Orden(models.Model):
    id_orden = models.AutoField(primary_key=True)
    # on_delete: qué pasa cuando se borra el objeto padre.
    # CASCADE: borra también las órdenes relacionadas.
    # related_name: el nombre que se usará para acceder a la relación inversa.
    id_usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='ordenes', null=True, blank=True)
    # SET_NULL: pone ese campo en NULL si el objeto padre se borra (por eso necesita null=True).
    # blank:blank=True significa que el campo puede dejarse vacío en formularios (no es obligatorio rellenarlo).
    numero_orden = models.PositiveIntegerField(default=0)
    id_mesa = models.ForeignKey(Mesa, on_delete=models.SET_NULL, null=True, blank=True, related_name='ordenes')
    id_tipoVenta = models.ForeignKey(tipoVenta, on_delete=models.CASCADE, related_name='ordenes')
    
    fecha = models.DateTimeField(auto_now_add=True)
    total = models.FloatField(default=0)

    # Nuevo campo: guarda los productos/adiciones en formato JSON
    detalles = models.JSONField(default=list)
    nombre_cliente = models.CharField(max_length=100, null=True, blank=True)
    #Para ocultar las ordenes cuando le de al botón de resetear
    oculta = models.BooleanField(default=False)  

    def __str__(self):
        return f"Orden #{self.id_orden} — Mesa {self.id_mesa.numero if self.id_mesa else 'Sin mesa'}"

    def save(self, *args, **kwargs):
        # Si el total no fue asignado manualmente (por ejemplo, desde una orden a domicilio)
        if not self.total or self.total == 0:
            total = 0
            for item in self.detalles:
                nombre_producto = item.get("nombre")
                cantidad = int(item.get("cantidad", 1))
                try:
                    producto = Producto.objects.get(nombre=nombre_producto)
                    total += producto.precio * cantidad
                except Producto.DoesNotExist:
                    total += 0
            self.total = total

        super().save(*args, **kwargs)


    estado_pago = models.CharField(
    max_length=10,
    choices=[('pendiente', 'Pendiente'), ('pago', 'Pago')],
    default='pendiente'
)
