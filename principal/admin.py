from django.contrib import admin
from .models import Mesa, Producto, tipoVenta, Usuario, Orden, detalleOrden, zonaDomicilio

# Registramos cada modelo en el admin para poder visualziarlo en: http://127.0.0.1:8000/admin/

class DetalleOrdenInline(admin.TabularInline):
    model = detalleOrden
    extra = 1  # cuántas filas vacías aparecen para agregar productos nuevos

#Configuración personalizada para la tabla Orden
@admin.register(Orden)
class OrdenAdmin(admin.ModelAdmin):
    list_display = ('id_orden', 'id_mesa', 'mostrar_nombre_usuario', 'mostrar_nombre_cliente', 'fecha', 'total', 'mostrar_tipo_usuario')
    #inlines = [DetalleOrdenInline]  # Aquí enlazamos detalleOrden dentro de Orden

    def mostrar_nombre_usuario(self, obj):
        return obj.id_usuario.nombre if obj.id_usuario else 'N/A'
    mostrar_nombre_usuario.short_description = 'Usuario'

    def mostrar_nombre_cliente(self, obj):
        return obj.nombre_cliente if obj.nombre_cliente else 'N/A'
    mostrar_nombre_cliente.short_description = 'Cliente'

    def mostrar_tipo_usuario(self, obj):
        return obj.id_usuario.tipo_usuario if obj.id_usuario else 'N/A'
    mostrar_tipo_usuario.short_description = 'Tipo de usuario'

admin.site.register(Mesa)
admin.site.register(Producto)
admin.site.register(tipoVenta)
admin.site.register(Usuario)
admin.site.register(zonaDomicilio)
