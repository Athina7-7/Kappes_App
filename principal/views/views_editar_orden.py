from django.shortcuts import render, get_object_or_404, redirect
from principal.models import Orden, Usuario, tipoVenta

def editar_orden(request, id_orden):
    # Buscar la orden por ID sin importar el estado
    orden = get_object_or_404(Orden, id_orden=id_orden)

    if request.method == 'POST':
        orden.nombre_cliente = request.POST.get('nombre_cliente', orden.nombre_cliente)
        orden.total = request.POST.get('total', orden.total)
        orden.metodo_pago = request.POST.get('metodo_pago', orden.metodo_pago)

        tipo_id = request.POST.get('id_tipoVenta')
        if tipo_id:
            orden.id_tipoVenta = tipoVenta.objects.filter(id_tipoVenta=tipo_id).first()

        orden.save()
        return redirect('ventas')  # <- ventas solo muestra las pagadas

    # Traer los tipos de venta para el select
    tiposVenta = tipoVenta.objects.all()
    return render(request, 'editar_orden.html', {
        'orden': orden,
        'tiposVenta': tiposVenta,
    })
