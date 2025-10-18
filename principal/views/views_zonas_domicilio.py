from django.shortcuts import render, redirect
from principal.models.zonaDomicilio import zonaDomicilio
from principal.models.tipoVenta import tipoVenta

def zonas_domicilio(request):
    if request.method == "POST":
        id_tipo = request.POST.get('id_tipo')
        nombre_zona = request.POST.get('nombre_zona')
        ajuste_precio = request.POST.get('ajuste_precio')

        # Crear y guardar el nuevo registro
        zonaDomicilio.objects.create(
            id_tipo_id=id_tipo,
            nombre_zona=nombre_zona,
            ajuste_precio=ajuste_precio
        )

        # Redirigir para evitar reenvío del formulario
        return redirect('zonas_domicilio')

    zonas = zonaDomicilio.objects.all()
    tipos = tipoVenta.objects.all()

    return render(request, 'zonas_domicilio.html', {
        'zonas': zonas,
        'tipos': tipos
    })