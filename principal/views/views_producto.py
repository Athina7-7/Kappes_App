from django.shortcuts import render, redirect
from principal.models import Producto

def crear_producto(request):
    if request.method == "POST":
        nombre = request.POST.get("nombre")
        descripcion = request.POST.get("descripcion")
        precio = request.POST.get("precio")

        if nombre and precio:
            Producto.objects.create(
                nombre=nombre,
                descripcion=descripcion,
                precio=precio
            )
            return redirect("inventario") 
    return render(request, "productos.html")