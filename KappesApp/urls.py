"""
URL configuration for KappesApp project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from principal import views
from principal.views import views_home, views_producto, views_inventario,views_registro, views_nuevo_domicilio, views_zonas_domicilio

# en el archivo que se encuentra en la raiz de la carpeta del proyecto el 
# cual es urls.py, este indica las urls que usará el usuario para ingresar a los templates.

urlpatterns = [
    path('admin/', admin.site.urls),
    # path('', views.home, name='home'),

    path('', views_home.home, name='home'),

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
