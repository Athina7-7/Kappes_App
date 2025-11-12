from django.contrib import admin
from django.urls import path
from principal import views
from principal.views import views_home, views_producto, views_inventario,views_registro, views_nuevo_domicilio, views_zonas_domicilio
from principal.views import views_inicio_sesion
from principal.views.views_ventas import mostrar_ventas
from principal.views.views_editar_orden import editar_orden
from principal.views import views_home, views_editar_orden


# en el archivo que se encuentra en la raiz de la carpeta del proyecto el 
# cual es urls.py, este indica las urls que usará el usuario para ingresar a los templates.

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
    path('guardar_orden/', views_home.guardar_orden, name='guardar_orden'),
    path('eliminar_orden/<int:id_orden>/', views_home.eliminar_orden, name='eliminar_orden'),
    path('editar_orden/<int:id_orden>/', views_home.editar_orden, name='editar_orden'),
    path('ventas/editar_orden/<int:id_orden>/', views_editar_orden.editar_orden, name='editar_orden_ventas'),
    path('ventas/eliminar/<int:id_orden>/', views_editar_orden.eliminar_orden, name='eliminar_orden'), 


    path('buscar_orden/', views_home.buscar_orden, name='buscar_orden'),
    path('cambiar_estado/<int:id_orden>/', views_home.cambiar_estado, name='cambiar_estado'),
    path('guardar_orden_domicilio/', views_home.guardar_orden_domicilio, name='guardar_orden_domicilio'),
    path('buscar_zona_domicilio/', views_home.buscar_zona_domicilio, name='buscar_zona_domicilio'),
    path('editar_orden_domicilio/<int:id_orden>/', views_home.editar_orden_domicilio, name='editar_orden_domicilio'),
    path('resetear-dia/', views_home.resetear_dia, name='resetear_dia'),
    path('resetear_ordenes/', views_home.ocultar_ordenes, name='resetear_ordenes'),
    path('devolver_ordenes/', views_home.resetear_ordenes, name='devolver_ordenes'),
    path('buscar_orden_por_mesa/<int:numero_mesa>/', views_home.buscar_orden_por_mesa, name='buscar_orden_por_mesa'),



    

    # PRODUCTO - INVENTARIO
    path('productos/', views_producto.crear_producto, name='productos'),
    path('inventario/', views_inventario.inventario, name='inventario'),
    path('ventas/', mostrar_ventas, name='ventas'),
    #path('editar_orden/<int:id_orden>/', editar_orden, name='editar_orden'),
    path('producto/eliminar/<int:producto_id>/', views_inventario.eliminar_producto, name='eliminar_producto'),
    path('producto/editar/<int:producto_id>/', views_inventario.editar_producto, name='editar_producto'),
    path('registro/', views_registro.registro_usuario, name='registro'),
    path('nuevo_domicilio/', views_nuevo_domicilio.nuevo_domicilio, name='nuevo_domicilio'),
    path('zonas_domicilio/', views_zonas_domicilio.zonas_domicilio, name='zonas_domicilio'),
    path("editar_domicilio/editar/<int:domicilio_id>/", views_zonas_domicilio.editar_domicilio, name="editar_domicilio"),
    path("eliminar_domicilio/eliminar/<int:domicilio_id>/", views_zonas_domicilio.eliminar_domicilio, name="eliminar_domicilio"),
]
