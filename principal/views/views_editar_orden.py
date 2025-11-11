from django.shortcuts import render, get_object_or_404, redirect
from principal.models import Orden, tipoVenta

def editar_orden(request, id_orden):
    # Solo trae órdenes con estado_pago='pago'
    orden = get_object_or_404(Orden, id_orden=id_orden, estado_pago='pago')
    tiposVenta = tipoVenta.objects.all()  # Para llenar el combo

    if request.method == 'POST':
        orden.nombre_cliente = request.POST.get('nombre_cliente', orden.nombre_cliente)
        orden.total = request.POST.get('total', orden.total)

        tipo_id = request.POST.get('id_tipoVenta')
        if tipo_id:
            orden.id_tipoVenta = tipoVenta.objects.get(id_tipoVenta=tipo_id)

        orden.save()
        return redirect('ventas')

    # 👇 Se envía la orden actual y los tipos de venta al template
    return render(request, 'editar_orden.html', {
        'orden': orden,
        'tiposVenta': tiposVenta
    })
