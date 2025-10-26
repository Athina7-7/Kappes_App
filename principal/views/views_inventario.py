from django.shortcuts import render, get_object_or_404, redirect
from principal.models import Producto
from principal.forms import ProductoForm

def inventario(request):
    query = request.GET.get('q')
    if query:
        productos = Producto.objects.filter(nombre__icontains=query)
    else:
        productos = Producto.objects.all()
    
    return render(request, 'inventario.html', {'productos': productos})

def eliminar_producto(request, producto_id):
    producto = get_object_or_404(Producto, id_producto=producto_id)

    if request.method == "POST":
        producto.delete()
        return redirect('inventario')

    return render(request, "eliminar_producto.html", {"producto": producto})

def editar_producto(request, producto_id):
    producto = get_object_or_404(Producto, id_producto=producto_id)
    
    if request.method == "POST":
        producto.nombre = request.POST.get("nombre")
        producto.descripcion = request.POST.get("descripcion")
        producto.precio = request.POST.get("precio")
        producto.save()
        return redirect("inventario")

    return render(request, "editar_producto.html", {"producto": producto})