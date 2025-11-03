from django.shortcuts import render, redirect, get_object_or_404
#get_object_or_404: me ayuda. abuscar un objeto en la base de datos, y si no existe, django
#devuelve un error 404 (página no encontrada)
from django.contrib import messages
from django.db import connection 
from principal.models import Mesa, Producto, Orden, tipoVenta, Usuario
from principal.models.zonaDomicilio import Domicilio
from django.http import JsonResponse
from django.db.models import Q
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
import json

# la carpeta principal contiene toda la lógica de la página, se le 
# indica con el archivo views.py lo que se verá (llamado a los templates)

def home(request):
    mesas = Mesa.objects.all().order_by('numero')
    hoy = timezone.now().date()
    ordenes = Orden.objects.all().order_by('id_orden')
    total_ordenes = ordenes.count()

    # Enlazar lugar manualmente si es un pedido de domicilio
    for orden in ordenes:
        for orden in ordenes:
            if orden.id_tipoVenta and orden.id_tipoVenta.nombre == "Domicilio":
                orden.lugar_domicilio = request.session.get(f"lugar_{orden.id_orden}", "No especificado")

    total_ordenes = ordenes.count()

    # Agrega nuevamente esta línea:
    return render(request, 'home.html', {
        'mesas': mesas,
        'ordenes': ordenes,
        'total_ordenes': total_ordenes
    })




#AGREGAR MESA
def agregar_mesa(request):
    if request.method == "POST":
        # calcular el siguiente número de mesa
        ultimo_numero = Mesa.objects.all().order_by("-numero").first() #Se busca la mesa con el número más alto
        #Si hay mesas, el nuevo número será el último número + 1, si no hay mesas, el nuevo número será 1
        nuevo_numero = ultimo_numero.numero + 1 if ultimo_numero else 1

        #Se crea la mesa con estado libre
        Mesa.objects.create(numero=nuevo_numero, estado=True)
    return redirect("home")




#ELIMINAR MESA
def eliminar_mesa(request, id):
    if request.method == "POST":
        mesa = Mesa.objects.get(id_mesa=id) #Busca la mesa por ID
        mesa.delete() #Elimina la mesa de la base de datos
    return redirect("home")




#ESTADO MESA
def estado_mesa(request, id):
    #Aca, me busca en la tabla Mesa el id de la mesa con el que estamos trabajando
    # Si lo encuentra, lo guarda en la variable mesa, y si no, devuelve un error
    mesa = get_object_or_404(Mesa, id_mesa=id)

    #Aca se cambia el estado de la mesa, si estaba libre (true), lo pasa a ocupado (false), y viceversa
    #Esto se aplica cuando se hace click en una mesa
    #Por ejemplo, si antes estaba libre, ahora va a estar ocupada
    mesa.estado = not mesa.estado 
    mesa.save() # Se actualiza en la base de datos
    return redirect("home") #Se actualiza o redirige al home




#CONFIRMACIÓN DE ELIMINACIÓN DE MESAS
def confirmar_eliminar_mesa(request, id):
    #Con el get, se accede a la página de confirmación de eliminación
    if request.method == "GET":

        # SELECCION MULTIPLE - Se devuelve una lista de mesas
        ids = request.GET.getlist("mesas_seleccionadas")
        if ids:
            mesas = Mesa.objects.filter(id_mesa__in=ids) #Se agarran todas las mesas y se envían al confirmar_eliminar_mesa.html
            #El 0 es para aclarar que no se está eliminando una mesa invidual, sino un grupo
            return render(request, "confirmar_eliminar_mesa.html", {"mesas": mesas, "mesa": {"id_mesa": 0}}) 
        
        # SOLO UNA MESA
        #Se busca la mesa en la base de datos, si la encuentra, la devuelve, y si no, devuelve un error 404
        #Luego, se manda a la plantilla confirmar_eliminar_mesa.html
        mesa = get_object_or_404(Mesa, id_mesa=id)
        return render(request, "confirmar_eliminar_mesa.html", {"mesa": mesa})


    #Esto ocurre cuando le damos a confirmar que queremos eliminar las mesas
    elif request.method == "POST":
        # SI HAY VARIAS MESAS SELECCIONADAS
        #Se usa getlist para obtener la lista de los IDs, y para eliminar, se filtra con el filter()
        ids = request.POST.getlist("mesas_seleccionadas")
        if ids:
            Mesa.objects.filter(id_mesa__in=ids).delete()
        # SI ES SOLO UNA MESA
        #Se no es 0, entonces no viene de una selección múltiple, sino solo de una mesa.
        elif id != 0:
            mesa = get_object_or_404(Mesa, id_mesa=id)
            mesa.delete()


        # SE REASIGNA LA NUMERACIÓN DE LAS MESAS DESDE 1
        mesas_restantes = Mesa.objects.all().order_by("id_mesa") #Aca se obtiene todas las mesas de la base de datos
        #Aca se recorre la lista y se va enumarando con el enumerate(), que empieza en 1
        for i, mesa in enumerate(mesas_restantes, start=1):
            mesa.numero = i #La i me ayuda a reasignar los números de las mesas
            mesa.save()

        return redirect("home")




def buscar_producto(request):
    termino = request.GET.get('q', '').strip()  # Lo que el usuario escribió
    if not termino:
        return JsonResponse([], safe=False)

    productos = Producto.objects.filter(nombre__icontains=termino)
    data = list(productos.values('id_producto', 'nombre', 'precio'))
    return JsonResponse(data, safe=False)


def buscar_zona_domicilio(request):
    termino = request.GET.get('q', '').strip()
    if not termino:
        return JsonResponse([], safe=False)

    zonas = Domicilio.objects.filter(lugar__icontains=termino)
    data = [
        {
            'id_domicilio': z.id,
            'nombre': z.lugar,
            'precio': float(z.precio)
        }
        for z in zonas
    ]
    return JsonResponse(data, safe=False)




def guardar_orden(request):
    if request.method == "POST":
        data = json.loads(request.body)
        id_mesa = data.get("mesa")
        detalles = data.get("productos", [])

        # --- Buscar mesa ---
        try:
            mesa = Mesa.objects.get(numero=id_mesa)
        except Mesa.DoesNotExist:
            return JsonResponse({"success": False, "error": "La mesa no existe"})

        # --- Tipo de venta ---
        tipo_venta, _ = tipoVenta.objects.get_or_create(nombre="En Mesa")
        usuario = Usuario.objects.filter(nombre__iexact=request.user.username).first()

        # --- Calcular total ---
        total = 0
        for item in detalles:
            nombre_producto = item.get("nombre", "").strip()
            cantidad = int(item.get("cantidad", 1))
            producto = Producto.objects.filter(nombre__iexact=nombre_producto).first()
            precio = int(producto.precio) if producto else 2000
            total += precio * cantidad

        # --- Calcular número de orden del día ---
        hoy = timezone.now().date()
        ordenes_hoy = Orden.objects.filter(fecha__date=hoy)
        if ordenes_hoy.exists():
            ultimo_numero = ordenes_hoy.order_by('-numero_orden').first().numero_orden
            siguiente_numero = ultimo_numero + 1
        else:
            siguiente_numero = 1

        # --- Crear la nueva orden ---
        nueva_orden = Orden.objects.create(
            numero_orden=siguiente_numero,
            id_usuario=usuario,
            id_mesa=mesa,
            id_tipoVenta=tipo_venta,
            nombre_cliente=data.get("nombre_cliente", ""),
            detalles=detalles,
            total=total
        )

        mesa.estado = False
        mesa.save()

        # --- Respuesta JSON ---
        return JsonResponse({
            "success": True,
            "id_orden": nueva_orden.id_orden,
            "numero_orden": nueva_orden.numero_orden,  # enviar este al frontend
            "total": total
        })

    return JsonResponse({"success": False, "error": "Método no permitido"})




def eliminar_orden(request, id_orden):
    if request.method == "POST":
        try:
            orden = Orden.objects.get(id_orden=id_orden)
            mesa = orden.id_mesa

            orden.delete()

            # Reasignar números de orden
            ordenes_restantes = Orden.objects.all().order_by('id_orden')
            for i, o in enumerate(ordenes_restantes, start=1):
                o.numero_orden = i
                o.save()

            # Solo actualizar mesa si existe (no en domicilios)
            if mesa:
                mesa.estado = True
                mesa.save()

            return JsonResponse({"success": True})
        except Orden.DoesNotExist:
            return JsonResponse({"success": False, "error": "La orden no existe"})
    return JsonResponse({"success": False, "error": "Método no permitido"})




def editar_orden(request, id_orden):
    if request.method == "GET":
        try:
            orden = Orden.objects.get(id_orden=id_orden)
            return JsonResponse({
                "success": True,
                "id": orden.id_orden,
                "numero_orden": orden.numero_orden,
                "nombre_cliente": orden.nombre_cliente,
                "mesa": orden.id_mesa.numero if orden.id_mesa else None,
                "id_tipoVenta": orden.id_tipoVenta.nombre if orden.id_tipoVenta else None,  # 👈 AGREGAR ESTO
                "detalles": orden.detalles,
                "total": orden.total
            })
        except Orden.DoesNotExist:
            return JsonResponse({"success": False, "error": "Orden no encontrada."})

    elif request.method == "POST":
        data = json.loads(request.body)
        try:
            orden = Orden.objects.get(id_orden=id_orden)
        except Orden.DoesNotExist:
            return JsonResponse({"success": False, "error": "Orden no existe."})

        orden.nombre_cliente = data.get("nombre_cliente", orden.nombre_cliente)
        orden.detalles = data.get("productos", orden.detalles)

        # Recalcular total
        total = 0
        for item in orden.detalles:
            nombre_producto = item.get("nombre", "").strip()
            cantidad = int(item.get("cantidad", 1))
            producto = Producto.objects.filter(nombre__iexact=nombre_producto).first()
            if producto:
                precio = int(producto.precio)
            else:
                precio = 0
            total += precio * cantidad

        orden.total = total
        orden.save()

        return JsonResponse({"success": True, "total": total})

    return JsonResponse({"success": False, "error": "Método no permitido"})



def buscar_orden(request):
    termino = request.GET.get('q', '').strip().lower()

    # Si no hay texto, devolver todas las órdenes
    if not termino:
        ordenes = Orden.objects.all().order_by('id_orden')
    else:
        ordenes = Orden.objects.filter(
            Q(nombre_cliente__icontains=termino) | 
            Q(id_orden__icontains=termino)
        ).order_by('id_orden')

    # Convertimos las órdenes a formato JSON
    data = []
    for orden in ordenes:
        data.append({
            "id_orden": orden.id_orden,
            "mesa": orden.id_mesa.numero if orden.id_mesa else None,
            "nombre_cliente": orden.nombre_cliente or "No especificado",
            "detalles": orden.detalles,
            "total": orden.total
        })
    
    return JsonResponse(data, safe=False)

def cambiar_estado(request, id_orden):
    if request.method == "POST":
        try:
            orden = Orden.objects.get(id_orden=id_orden)
            # Cambiar el estado
            if orden.estado_pago == "pendiente":
                orden.estado_pago = "pago"
            else:
                orden.estado_pago = "pendiente"
            orden.save()
            return JsonResponse({"success": True, "nuevo_estado": orden.estado_pago})
        except Orden.DoesNotExist:
            return JsonResponse({"success": False, "error": "Orden no encontrada."})
    return JsonResponse({"success": False, "error": "Método no permitido."})


def guardar_orden_domicilio(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        try:
            tipo_domicilio, _ = tipoVenta.objects.get_or_create(nombre="Domicilio")

            numero_orden = int(data.get('numero_orden', 0))
            nombre_cliente = data.get('nombre_cliente', '').strip()
            lugar_domicilio = data.get('lugar_domicilio', '').strip()
            detalles = data.get('productos', [])
            total = float(data.get('total', 0))

            # Si el total viene vacío, recalcular
            if not total or total == 0:
                total = sum(
                    float(item.get('precio', 0)) * int(item.get('cantidad', 1))
                    for item in detalles
                )

            # Crear la orden (solo se guarda el nombre del cliente en BD)
            nueva_orden = Orden.objects.create(
                numero_orden=numero_orden,
                nombre_cliente=nombre_cliente,
                detalles=detalles,
                total=total,
                id_mesa=None,
                id_tipoVenta=tipo_domicilio
            )

            # 🟢 Guardar el lugar temporalmente en la sesión
            request.session[f"lugar_{nueva_orden.id_orden}"] = lugar_domicilio

            return JsonResponse({
                "success": True,
                "id": nueva_orden.id_orden,
                "nombre_cliente": nombre_cliente,
                "lugar_domicilio": lugar_domicilio
            })

        except Exception as e:
            print("Error guardando orden domicilio:", e)
            return JsonResponse({"success": False, "error": str(e)})

    return JsonResponse({"success": False, "error": "Método no permitido"})




def editar_orden_domicilio(request, id_orden):
    if request.method == "GET":
        try:
            orden = Orden.objects.get(id_orden=id_orden)
            return JsonResponse({
                "success": True,
                "id": orden.id_orden,
                "numero_orden": orden.numero_orden,
                "nombre_cliente": orden.nombre_cliente,
                "id_tipoVenta": orden.id_tipoVenta.nombre if orden.id_tipoVenta else None,
                "detalles": orden.detalles,
                "total": orden.total
            })
        except Orden.DoesNotExist:
            return JsonResponse({"success": False, "error": "Orden no encontrada."})

    elif request.method == "POST":
        data = json.loads(request.body)
        try:
            orden = Orden.objects.get(id_orden=id_orden)
        except Orden.DoesNotExist:
            return JsonResponse({"success": False, "error": "Orden no existe."})

        # Actualizar los datos
        lugar_domicilio = data.get("lugar_domicilio", "")
        nombre_cliente_domicilio = data.get("nombre_cliente", "")
        orden.nombre_cliente = f"{lugar_domicilio} - {nombre_cliente_domicilio}" if nombre_cliente_domicilio else lugar_domicilio
        orden.detalles = data.get("productos", orden.detalles)
        orden.total = data.get("total", orden.total)
        orden.save()

        return JsonResponse({"success": True, "total": orden.total})

    return JsonResponse({"success": False, "error": "Método no permitido"})






@csrf_exempt
def resetear_dia(request):
    if request.method == "POST":
        # Liberar todas las mesas
        Mesa.objects.all().update(estado=True)
        return JsonResponse({"success": True})
    return JsonResponse({"success": False, "error": "Método no permitido"})
