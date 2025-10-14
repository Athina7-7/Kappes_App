from django.contrib import admin
from django.urls import path
from principal.views import (
    views_home,
    views_producto,
    views_inventario,
    views_inicio_sesion,
    views_registro
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # INICIO SESIÓN
    path('inicio-sesion/', views_inicio_sesion.inicio_sesion, name='inicio_sesion'),

    # REGISTRO USUARIO
    path('registro/', views_registro.registro_usuario, name='registro'),

    # GESTIÓN-MESA
    path('', views_home.home, name='home'),
    path('agregar-mesa/', views_home.agregar_mesa, name='agregar_mesa'),
    path('eliminar-mesa/<int:id>/', views_home.eliminar_mesa, name='eliminar_mesa'),
    path('estado-mesa/<int:id>/', views_home.estado_mesa, name='estado_mesa'),
    path('eliminar-mesa/<int:id>/confirmar/', views_home.confirmar_eliminar_mesa, name='confirmar_eliminar_mesa'),


    # CREACION DE ORDENES
    path('buscar_producto/', views_home.buscar_producto, name='buscar_producto'),
    path('buscar_adicion/', views_home.buscar_adicion, name='buscar_adicion'),
    path('guardar_orden/', views_home.guardar_orden, name='guardar_orden'),
    path('eliminar_orden/<int:id_orden>/', views_home.eliminar_orden, name='eliminar_orden'),
    path('editar_orden/<int:id_orden>/', views_home.editar_orden, name='editar_orden'),

    

    # PRODUCTO - INVENTARIO
    path('productos/', views_producto.crear_producto, name='productos'),
    path('inventario/', views_inventario.inventario, name='inventario'),
    path('producto/eliminar/<int:producto_id>/', views_inventario.eliminar_producto, name='eliminar_producto'),
    path('producto/editar/<int:producto_id>/', views_inventario.editar_producto, name='editar_producto'),
]
