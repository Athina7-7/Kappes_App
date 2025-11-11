from django.shortcuts import render
from principal.models import Orden

def mostrar_ventas(request):
    query = request.GET.get('q', '')
    
    # Filtrar solo órdenes pagadas y no ocultas
    if query:
        ordenes = Orden.objects.filter(
            numero_orden__icontains=query,
            oculta=False,
            estado_pago='pago'
        ).order_by('-fecha')
    else:
        ordenes = Orden.objects.filter(
            oculta=False,
            estado_pago='pago'
        ).order_by('-fecha')

    return render(request, 'ventas.html', {
        'ordenes': ordenes,
        'query': query
    })
