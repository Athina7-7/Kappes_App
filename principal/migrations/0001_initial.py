
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Mesa',
            fields=[
                ('id_mesa', models.AutoField(primary_key=True, serialize=False)),
                ('numero', models.PositiveIntegerField(unique=True)),
                ('estado', models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name='Producto',
            fields=[
                ('id_producto', models.AutoField(primary_key=True, serialize=False)),
                ('nombre', models.CharField(max_length=100)),
                ('descripcion', models.TextField(blank=True)),
                ('precio', models.DecimalField(decimal_places=2, max_digits=10)),
            ],
        ),
        migrations.CreateModel(
            name='tipoVenta',
            fields=[
                ('id_tipo', models.AutoField(primary_key=True, serialize=False)),
                ('nombre', models.CharField(max_length=100)),
                ('descripcion', models.TextField(blank=True)),
                ('ajuste_precio', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('modo_ajuste', models.CharField(max_length=50)),
            ],
        ),
        migrations.CreateModel(
            name='Usuario',
            fields=[
                ('id_usuario', models.AutoField(primary_key=True, serialize=False)),
                ('nombre', models.CharField(max_length=100)),
                ('contrasena', models.CharField(max_length=128)),
                ('tipo_usuario', models.CharField(choices=[('admin', 'Administrador'), ('comun', 'Común')], max_length=10)),
            ],
        ),
        migrations.CreateModel(
            name='Orden',
            fields=[
                ('id_orden', models.AutoField(primary_key=True, serialize=False)),
                ('fecha', models.DateTimeField(auto_now_add=True)),
                ('total', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('id_mesa', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='ordenes', to='principal.mesa')),
                ('id_tipoVenta', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ordenes', to='principal.tipoventa')),
                ('id_usuario', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ordenes', to='principal.usuario')),
            ],
        ),
        migrations.CreateModel(
            name='detalleOrden',
            fields=[
                ('id_detalle', models.AutoField(primary_key=True, serialize=False)),
                ('cantidad', models.PositiveIntegerField(default=1)),
                ('adiciones', models.TextField(blank=True)),
                ('id_orden', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='detalles', to='principal.orden')),
                ('id_producto', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='principal.producto')),
            ],
        ),
        migrations.CreateModel(
            name='zonaDomicilio',
            fields=[
                ('id_zona', models.AutoField(primary_key=True, serialize=False)),
                ('nombre_zona', models.CharField(max_length=100)),
                ('ajuste_precio', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('id_tipo', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='zonas', to='principal.tipoventa')),
            ],
        ),
    ]
