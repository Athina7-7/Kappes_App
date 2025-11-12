from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.hashers import check_password
from principal.models.usuario import Usuario

def inicio_sesion(request):
    if request.method == "POST":
        nombre = request.POST.get("Nombre")
        contrasena = request.POST.get("Contraseña")

        if not nombre or not contrasena:
            messages.warning(request, "Datos incompletos")
            return render(request, "inicio_sesion.html")

        usuario = Usuario.objects.filter(nombre__iexact=nombre).first()
        if usuario:
            if check_password(contrasena, usuario.contrasena):
                return redirect("home")
            else:
                messages.error(request, "Usuario o contraseña incorrectos")
        else:
            messages.error(request, "Usuario o contraseña incorrectos")

    return render(request, "inicio_sesion.html")
