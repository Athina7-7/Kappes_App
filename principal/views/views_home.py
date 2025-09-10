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
        ultimo_numero = Mesa.objects.all().order_by("-numero").first()
        nuevo_numero = ultimo_numero.numero + 1 if ultimo_numero else 1

        Mesa.objects.create(numero=nuevo_numero, estado=True)
    return redirect("home")



#ELIMINAR MESA
def eliminar_mesa(request, id):
    if request.method == "POST":
        mesa = Mesa.objects.get(id_mesa=id)
        mesa.delete()
    return redirect("home")



#ESTADO MESA
def estado_mesa(request, id):
    #Aca, me busca en la tabla Mesa el id de la mesa con el que estamos trabajando
    # Si lo encuentra, lo guarda en la variable mesa, y si no, devuelve un error
    mesa = get_object_or_404(Mesa, id_mesa=id)

    #Aca se cambia el estado de la mesa, si estaba libre (true), lo pasa a ocupado (false), y viceversa
    mesa.estado = not mesa.estado 
    mesa.save() # Se actualiza en la base de datos
    return redirect("home") #Se actualiza o redirige al home



#CONFIRMACIÓN DE ELIMINACIÓN DE MESAS
def confirmar_eliminar_mesa(request, id):
    # Busca la mesa por ID, si no existe lanza error 404
    mesa = get_object_or_404(Mesa, id_mesa=id)

    if request.method == "POST":
        # Si confirma, elimina la mesa
        mesa.delete()
        return redirect("home")  # Redirige al home después de eliminar

    # Si solo entra GET, muestra la página de confirmación
    return render(request, "confirmar_eliminar_mesa.html", {"mesa": mesa})
