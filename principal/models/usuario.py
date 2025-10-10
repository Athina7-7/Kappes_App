from django.db import models
# make_password: convierte la contraseña en un hash seguro
# check_password: sirve para comparar una contraseña ingresada con el hash guardado.
from django.contrib.auth.hashers import make_password, check_password

# Estructura del modelo (una tabla de la base de datos)
class Usuario(models.Model):
    # las opciones que pueden elegir el usuario de tipo de usuario la declaramos aqui, para luego
    # llamarlo en su campo tipo_usuario
    TIPO_USUARIO =[
        # Lo que ves en el formulario: Administrador 	
        # Lo que se guarda en la DB: admin
        ('admin', 'Administrador'),
        ('comun', 'Común'),
    ]

    # Campo (columna de la tabla usuario):

    # campo id_usuario, será un campo de models de django automatico
    id_usuario = models.AutoField(primary_key=True)

    # campo nombre, será un campo de models de django tipo char
    nombre = models.CharField(max_length=100)

    # campo contrasena, será un campo de models de django tipo char, pero luego lo pasamos a tipo hasher
    contrasena = models.CharField(max_length=128)

    # campo tipo_usuario, será un campo de models de django tipo char, pero se le hace llamado a TIPO_USUARIO
    # solo esas opciones establecidas, por eso el choices. 
    tipo_usuario = models.CharField(max_length=10, choices=TIPO_USUARIO)

    # sobrescribir metodo de django 'save' para guardar el objeto en la base de datos.
    # el parametro realmente importante es self, ya que el recibe todo el Objeto de usuario, los demás
    # parametros no reciben nada (tener presente que es por Django)
    def save(self, *args, **kwargs):
        
        # si el objeto usuario en el campo contrasena no está en formato hashing (pbkdf2_)
        if not self.contrasena.startswith('pbkdf2_'):
            # el objeto usuario en el campo contrasena guardará el nuevo valor (hasheado) con ayuda de la funcion
            # de django make_password, en el se pasa el parametro el objeto usuario en el campo contrasena
            self.contrasena = make_password(self.contrasena)
        
        # super lo que hace es ejecutar el save real de Django, insertando los datos en la tabla Usuario. 
        # ingresa los cambios que hicimos y dejamos que siga haciendo el proceso de la funcion original de save.
        super().save(*args, **kwargs)

    # el metodo __str__ define cómo se “muestra” el objeto como texto, en este caso el atributo nombre.
    def __str__(self):
        return self.nombre

