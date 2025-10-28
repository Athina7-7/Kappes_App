from django.contrib import admin
from django.urls import path
from principal import views
from principal.views import views_home, views_producto, views_inventario,views_registro, views_nuevo_domicilio, views_zonas_domicilio

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

    # PRODUCTO - INVENTARIO
    path('productos/', views_producto.crear_producto, name='productos'),
    path('inventario/', views_inventario.inventario, name='inventario'),
    path('producto/eliminar/<int:producto_id>/', views_inventario.eliminar_producto, name='eliminar_producto'),
    path('producto/editar/<int:producto_id>/', views_inventario.editar_producto, name='editar_producto'),
    path('registro/', views_registro.registro_usuario, name='registro'),
    path('nuevo_domicilio/', views_nuevo_domicilio.nuevo_domicilio, name='nuevo_domicilio'),
    path('zonas_domicilio/', views_zonas_domicilio.zonas_domicilio, name='zonas_domicilio'),
    path("editar_domicilio/editar/<int:domicilio_id>/", views_zonas_domicilio.editar_domicilio, name="editar_domicilio"),
    path("eliminar_domicilio/eliminar/<int:domicilio_id>/", views_zonas_domicilio.eliminar_domicilio, name="eliminar_domicilio"),
]
