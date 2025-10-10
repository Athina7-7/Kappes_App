from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.hashers import check_password
from principal.models.usuario import Usuario

def inicio_sesion(request):
    if request.method == "POST":
        nombre = request.POST.get("Nombre")
        contrasena = request.POST.get("Contraseña")

        #1) Verificar si uno o ambos campos están vacíos
        if not nombre or not contrasena:
            messages.warning(request, "Datos incompletos")
            return render(request, "inicio_sesion.html")


        #2) Se busca el usuario en la base de datos
        try:
            usuario = Usuario.objects.get(nombre=nombre)

            # 3) Comparamos usando check_password
            if check_password(contrasena, usuario.contrasena):
                # Si la contraseña es correcta
                return redirect("home")  # o a donde quieras llevarlo
            else:
                #Contraseña incorrecta
                messages.error(request, "Usuario o contraseña incorrectos")
        except Usuario.DoesNotExist:
            #Usuario no encontrado
            messages.error(request, "Usuario o contraseña incorrectos")

    return render(request, "inicio_sesion.html")
