from django.shortcuts import render, redirect
from principal.models.zonaDomicilio import Domicilio

def nuevo_domicilio(request):
    if request.method == "POST":
        lugar = request.POST.get("lugar")
        descripcion = request.POST.get("descripcion")
        precio = request.POST.get("precio")
        nombre_cliente = request.POST.get("nombre_cliente")

        # Crear nuevo registro
        nuevo = Domicilio(
            lugar=lugar,
            descripcion=descripcion,
            precio=precio,
            nombre_cliente=nombre_cliente
        )
        nuevo.save()

        return redirect("zonas_domicilio")

    return render(request, "nuevo_domicilio.html")