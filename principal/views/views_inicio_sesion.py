from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.hashers import check_password
from principal.models.usuario import Usuario

def inicio_sesion(request):
    if request.method == "POST":
        nombre = request.POST.get("Nombre")
        contrasena = request.POST.get("Contraseña")

        try:
            usuario = Usuario.objects.get(nombre=nombre)
            # Comparamos usando check_password
            if check_password(contrasena, usuario.contrasena):
                # Si la contraseña es correcta
                return redirect("home")  # o a donde quieras llevarlo
            else:
                messages.error(request, "Usuario o contraseña incorrectos")
        except Usuario.DoesNotExist:
            messages.error(request, "Usuario o contraseña incorrectos")

    return render(request, "inicio_sesion.html")
