from django.shortcuts import render, redirect
from principal.models import Usuario

def registro_usuario(request):
    if request.method == "POST":
        nombre = request.POST.get("nombre", "").strip()
        contrasena = request.POST.get("contrasena", "").strip()
        tipo_usuario = request.POST.get("tipo", "").strip()

        if not (nombre and contrasena and tipo_usuario):
            return render(request, "registro.html", {
                "error":"Completa todos los campos.",
                "nombre": nombre,
                "tipo":tipo_usuario
            }) 
        
        if tipo_usuario not in ("admin", "comun"):
            return render(request, "registro.html", {
                "error": "Tipo de usuario no válido.",
                "nombre": nombre
            })
    
        Usuario.objects.create(
            nombre=nombre,
            tipo_usuario=tipo_usuario,
            contrasena=contrasena
        )
        return redirect("home")
    return render(request, "registro.html")