from django.shortcuts import render, redirect
from principal.models.zonaDomicilio import zonaDomicilio
from principal.models.tipoVenta import tipoVenta

def nuevo_domicilio(request):
    tipos = tipoVenta.objects.all()

    if request.method == 'POST':
        id_tipo = request.POST.get('id_tipo')
        nombre_zona = request.POST.get('nombre_zona')
        ajuste_precio = request.POST.get('ajuste_precio', 0)

        if id_tipo and nombre_zona:
            zonaDomicilio.objects.create(
                id_tipo_id=id_tipo,
                nombre_zona=nombre_zona,
                ajuste_precio=ajuste_precio
            )
            return redirect('zonas_domicilio')
    return render(request, 'nuevo_domicilio.html', {'tipos': tipos})