from django.shortcuts import render, get_object_or_404, redirect
from .models import Producto
from .forms import ProductoForm
# la carpeta principal contiene toda la lógica de la página, se le 
# indica con el archivo views.py lo que se verá (llamado a los templates)

def home(request):
    return render(request, "home.html")

def productos(request):
    return render(request, "productos.html")

def inventario(request):
    productos = Producto.objects.all()
    return render(request, 'inventario.html', {'productos': productos})

def eliminar_producto(request, producto_id):
    producto = get_object_or_404(Producto, id=producto_id)

    if request.method == "POST":  # Confirmación
        producto.delete()
        return redirect('inventario')

    return render(request, "eliminar_producto.html", {"producto": producto})

def editar_producto(request, producto_id):
    producto = get_object_or_404(Producto, id=producto_id)
    
    if request.method == "POST":
        producto.nombre = request.POST.get("nombre")
        producto.descripcion = request.POST.get("descripcion")
        producto.precio = request.POST.get("precio")
        producto.save()
        return redirect("inventario")

    return render(request, "editar_producto.html", {"producto": producto})
