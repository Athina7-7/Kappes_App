from django.contrib import admin
from .models import Mesa, Producto, tipoVenta, Usuario, Orden, detalleOrden, zonaDomicilio

# Registramos cada modelo en el admin para poder visualziarlo en: http://127.0.0.1:8000/admin/
admin.site.register(Mesa)
admin.site.register(Producto)
admin.site.register(tipoVenta)
admin.site.register(Usuario)
admin.site.register(Orden)
admin.site.register(detalleOrden)
admin.site.register(zonaDomicilio)
