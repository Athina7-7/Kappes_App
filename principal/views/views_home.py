from django.shortcuts import render, redirect, get_object_or_404
#get_object_or_404: me ayuda. abuscar un objeto en la base de datos, y si no existe, django
#devuelve un error 404 (página no encontrada)
from principal.models import Mesa

# la carpeta principal contiene toda la lógica de la página, se le 
# indica con el archivo views.py lo que se verá (llamado a los templates)

def home(request):
    mesas = Mesa.objects.all().order_by("numero")  # obtener todas las mesas ordenadas
    return render(request, "home.html", {"mesas": mesas})




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
