from django.shortcuts import render, redirect, get_object_or_404
#get_object_or_404: me ayuda. abuscar un objeto en la base de datos, y si no existe, django
#devuelve un error 404 (página no encontrada)
from django.contrib import messages
from django.db import connection 
from principal.models import Mesa, Producto, Orden, tipoVenta, Usuario
from django.http import JsonResponse
from django.db.models import Q
import json

# la carpeta principal contiene toda la lógica de la página, se le 
# indica con el archivo views.py lo que se verá (llamado a los templates)

def home(request):
    mesas = Mesa.objects.all().order_by('numero')
    ordenes = Orden.objects.all().order_by('id_orden')
    total_ordenes = Orden.objects.count()

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



def guardar_orden(request):
    if request.method == "POST":
        data = json.loads(request.body)
        id_mesa = data.get("mesa")
        detalles = data.get("productos", [])

        try:
            mesa = Mesa.objects.get(numero=id_mesa)
        except Mesa.DoesNotExist:
            return JsonResponse({"success": False, "error": "La mesa no existe"})

        tipo_venta, _ = tipoVenta.objects.get_or_create(nombre="En Mesa")

        try:
            usuario = Usuario.objects.filter(nombre__iexact=request.user.username).first()
        except Usuario.DoesNotExist:
            usuario = None

        total = 0
        for item in detalles:
            nombre_producto = item.get("nombre", "").strip()
            cantidad = int(item.get("cantidad", 1))
            producto = Producto.objects.filter(nombre__iexact=nombre_producto).first()
            if producto:
                precio = int(producto.precio)
            else:
                precio = 2000
            total += precio * cantidad

        # Si no hay órdenes registradas, reiniciamos el contador del ID
        if Orden.objects.count() == 0:
            from django.db import connection
            with connection.cursor() as cursor:
                # Este comando reinicia el contador de la tabla (funciona para SQLite, PostgreSQL y MySQL)
                cursor.execute("DELETE FROM sqlite_sequence WHERE name='principal_orden';")

        # Crear la nueva orden normalmente
        nueva_orden = Orden.objects.create(
            id_usuario=usuario,
            id_mesa=mesa,
            id_tipoVenta=tipo_venta,
            nombre_cliente=data.get("nombre_cliente", ""),
            detalles=detalles,
            total=total
        )

        # Marcar mesa como ocupada
        mesa.estado = False
        mesa.save()

        return JsonResponse({
            "success": True,
            "id_orden": nueva_orden.id_orden,
            "total": total
        })

    return JsonResponse({"success": False, "error": "Método no permitido"})



def eliminar_orden(request, id_orden):
    if request.method == "POST":
        try:
            orden = Orden.objects.get(id_orden=id_orden)
            mesa = orden.id_mesa  # guardamos la mesa antes de eliminar la orden
            orden.delete()

            # Marcar la mesa como libre
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
                "nombre_cliente": orden.nombre_cliente,
                "mesa": orden.id_mesa.numero,
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
