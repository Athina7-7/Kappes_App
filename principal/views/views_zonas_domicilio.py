from django.shortcuts import render, redirect, get_object_or_404
from principal.models.zonaDomicilio import Domicilio
from django.db.models import Q

def zonas_domicilio(request):
    query = request.GET.get('q', '')
    domicilios = Domicilio.objects.all()

    if query:
        domicilios = domicilios.filter(
            Q(lugar__icontains=query) | Q(nombre_cliente__icontains=query)
        )

    return render(request, "zonas_domicilio.html", {"domicilios": domicilios})

def editar_domicilio(request, domicilio_id):
    domicilio = get_object_or_404(Domicilio, id=domicilio_id)

    if request.method == "POST":
        domicilio.lugar = request.POST.get("lugar")
        domicilio.descripcion = request.POST.get("descripcion")
        domicilio.precio = request.POST.get("precio")
        domicilio.nombre_cliente = request.POST.get("nombre_cliente")
        domicilio.save()

        return redirect("zonas_domicilio")

    return render(request, "editar_domicilio.html", {"domicilio": domicilio})


def eliminar_domicilio(request, domicilio_id):
    domicilio = get_object_or_404(Domicilio, id=domicilio_id)
    domicilio.delete()
    return redirect("zonas_domicilio")