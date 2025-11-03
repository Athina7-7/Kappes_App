// ====================================
// SISTEMA DE ÓRDENES A DOMICILIO
// ====================================

let modoEdicionDomicilio = false;
let idOrdenDomicilioActual = null;
let precioDomicilioGlobal = 0; //precio del producto + domicilio

// --- ABRIR MODAL DE DOMICILIO ---
function abrirModalDomicilio() {
    modoEdicionDomicilio = false;
    idOrdenDomicilioActual = null;

    // Calcular siguiente número de orden
    const ordenes = document.querySelectorAll('.card[data-id]');
    let siguienteOrden = 1;

    if (ordenes.length > 0) {
        const cards = document.querySelectorAll('#lista-pedidos h6');
        const numeros = Array.from(cards)
            .map(el => {
                const match = el.textContent.match(/Orden #(\d+)/);
                return match ? parseInt(match[1]) : 0;
            })
            .filter(num => !isNaN(num));

        siguienteOrden = numeros.length > 0 ? Math.max(...numeros) + 1 : 1;
    }

    // Mostrar número de orden
    document.getElementById("numeroOrdenDomicilio").textContent = siguienteOrden;

    // Limpiar campos
    document.getElementById("lugar_domicilio").value = "";
    document.getElementById("detalles_domicilio").innerHTML = "";
    document.getElementById("total-dinamico-domicilio").textContent = "$0";
    precioDomicilioGlobal = 0;
    document.getElementById("nombre_cliente_domicilio").value = "";

    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('modalOrdenDomicilio'));
    modal.show();
}


// --- BÚSQUEDA DE PRODUCTOS PARA DOMICILIO ---
document.addEventListener('DOMContentLoaded', () => {
    const buscador = document.getElementById('buscador-producto-domicilio');
    const resultados = document.getElementById('resultados-domicilio');
    const detalles = document.getElementById('detalles_domicilio');

    if (!buscador) return; // Si no existe, salir

    buscador.addEventListener('input', async () => {
        const query = buscador.value.trim();
        resultados.innerHTML = '';

        if (query.length < 2) return;

        try {
            const response = await fetch(`/buscar_producto/?q=${query}`);
            const productos = await response.json();

            if (productos.length === 0) return;

            productos.forEach(prod => {
                const item = document.createElement('div');
                item.classList.add('list-group-item', 'list-group-item-action');
                item.textContent = prod.nombre;

                const seleccionar = (e) => {
                    e.preventDefault();
                    mostrarDetallesDomicilio(prod);
                    resultados.innerHTML = '';
                    buscador.value = '';
                };

                item.addEventListener('mousedown', seleccionar);
                item.addEventListener('click', seleccionar);

                resultados.appendChild(item);
            });
        } catch (error) {
            console.error('Error al buscar productos:', error);
        }
    });

    function mostrarDetallesDomicilio(prod) {
        const contenedor = document.createElement('div');
        contenedor.classList.add('d-flex', 'align-items-center', 'justify-content-between', 'mb-2', 'border', 'p-2', 'rounded');

        const nombre = document.createElement('strong');
        nombre.textContent = prod.nombre;

        const precio = document.createElement('span');
        precio.textContent = ` $${prod.precio}`;
        precio.classList.add('text-muted');

        const info = document.createElement('div');
        info.classList.add('d-flex', 'align-items-center', 'gap-1');
        info.appendChild(nombre);
        info.appendChild(precio);

        const cantidad = document.createElement('input');
        cantidad.type = 'number';
        cantidad.min = '1';
        cantidad.value = '1';
        cantidad.classList.add('form-control', 'w-25', 'me-2');
        cantidad.addEventListener('change', () => {
            cantidad.setAttribute('value', cantidad.value);
            actualizarTotalDomicilio();
        });

        const eliminar = document.createElement('button');
        eliminar.classList.add('btn', 'btn-outline-danger', 'btn-sm');
        eliminar.textContent = 'X';
        eliminar.addEventListener('click', () => {
            contenedor.remove();
            actualizarTotalDomicilio();
        });

        const bloqueIzq = document.createElement('div');
        bloqueIzq.classList.add('d-flex', 'align-items-center', 'gap-2');
        bloqueIzq.appendChild(info);

        contenedor.appendChild(bloqueIzq);
        contenedor.appendChild(cantidad);
        contenedor.appendChild(eliminar);

        detalles.appendChild(contenedor);
        cantidad.focus();

        actualizarTotalDomicilio();
    }
});


// --- BÚSQUEDA DE ZONAS DE DOMICILIO ---
document.addEventListener('DOMContentLoaded', () => {
    const buscadorZona = document.getElementById('lugar_domicilio');
    const totalTexto = document.getElementById('total-dinamico-domicilio');

    if (!buscadorZona) return;

    // Contenedor de sugerencias
    const resultadosZona = document.createElement('div');
    resultadosZona.id = 'resultados-zona';
    resultadosZona.classList.add('list-group', 'position-absolute', 'w-100', 'mt-1', 'shadow');
    resultadosZona.style.zIndex = '1000';
    resultadosZona.style.display = 'none';
    resultadosZona.style.top = "42px";

    // Asegura que el contenedor se posicione dentro del padre (igual que productos)
    buscadorZona.parentNode.style.position = 'relative';
    buscadorZona.parentNode.appendChild(resultadosZona);

    // Buscar zonas
    buscadorZona.addEventListener('input', async () => {
        const query = buscadorZona.value.trim();
        resultadosZona.innerHTML = '';
        if (query.length < 2) {
            resultadosZona.style.display = 'none';
            return;
        }

        try {
            const response = await fetch(`/buscar_zona_domicilio/?q=${query}`);
            const zonas = await response.json();

            if (zonas.length === 0) {
                resultadosZona.style.display = 'none';
                return;
            }

            zonas.forEach(zona => {
                const item = document.createElement('div');
                item.classList.add('list-group-item', 'list-group-item-action', 'text-center'); // centrado
                item.textContent = zona.nombre;

                // Al seleccionar una zona
                item.addEventListener('mousedown', () => {
                    buscadorZona.value = zona.nombre;
                    resultadosZona.style.display = 'none';

                    // Sumar el valor del domicilio al total
                    precioDomicilioGlobal = parseFloat(zona.precio) || 0;
                    actualizarTotalDomicilio();
                });

                resultadosZona.appendChild(item);
            });

            resultadosZona.style.display = 'block';
        } catch (error) {
            console.error('Error al buscar zonas de domicilio:', error);
        }
    });

    // Ocultar sugerencias al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (e.target !== buscadorZona) {
            resultadosZona.style.display = 'none';
        }
    });
});



// --- ACTUALIZAR TOTAL DE DOMICILIO ---
function actualizarTotalDomicilio() {
  const detalles = document.getElementById('detalles_domicilio').children;
  let subtotal = 0;

  for (let div of detalles) {
    const cantidad = parseInt(div.querySelector('input').value) || 0;
    const match = div.textContent.match(/\$([0-9]+)/);
    const precio = match ? parseInt(match[1]) : 0;
    subtotal += precio * cantidad;
  }

  // ⚡ Mantener siempre el precio de domicilio ya cargado o seleccionado
  const total = subtotal + (precioDomicilioGlobal || 0);

  // Mostrar el total actualizado
  document.getElementById('total-dinamico-domicilio').textContent = `$${total}`;
}




// --- GUARDAR ORDEN A DOMICILIO ---
const botonGuardarDomicilio = document.getElementById('guardar-orden-domicilio');

if (botonGuardarDomicilio) {
    botonGuardarDomicilio.addEventListener('click', async () => {
        const lugarDomicilio = document.getElementById('lugar_domicilio').value.trim();
        const detalles = document.getElementById('detalles_domicilio').children;
        const nombreClienteDomicilio = document.getElementById('nombre_cliente_domicilio').value.trim();

        if (!lugarDomicilio) {
            alert('Ingresa el lugar de domicilio.');
            return;
        }

        if (detalles.length === 0) {
            alert('Agrega al menos un producto antes de guardar.');
            return;
        }

        const productos = Array.from(detalles).map(div => {
            const nombre = div.querySelector('strong')?.textContent.trim() || 'Producto sin nombre';
            const precioMatch = div.textContent.match(/\$([0-9]+)/);
            const precio = precioMatch ? parseInt(precioMatch[1]) : 0;
            const cantidad = parseInt(div.querySelector('input').value);

            return { nombre, cantidad, precio };
        });

        // Calcular total incluyendo el precio del domicilio global (ya seleccionado)
        const total = productos.reduce((acc, p) => acc + (p.precio * p.cantidad), 0) + precioDomicilioGlobal;
        console.log("🧾 Total calculado:", total, " | Precio domicilio:", precioDomicilioGlobal);




        const data = {
            lugar_domicilio: lugarDomicilio,
            nombre_cliente: nombreClienteDomicilio,
            productos: productos,
            total: total,
            numero_orden: document.getElementById("numeroOrdenDomicilio").textContent
        };

        try {
            let url = '/guardar_orden_domicilio/';
            let method = 'POST';

            if (modoEdicionDomicilio && idOrdenDomicilioActual) {
                url = `/editar_orden_domicilio/${idOrdenDomicilioActual}/`;
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                alert("Orden a domicilio guardada correctamente ✅");

                // Crear tarjeta de la nueva orden en el front
                const listaPedidos = document.getElementById("lista-pedidos");

                const nuevaCard = document.createElement("div");
                nuevaCard.classList.add("card", "shadow-sm", "p-3", "border-0", "rounded-3");
                nuevaCard.style.backgroundColor = "#f8f9fa";
                nuevaCard.style.borderLeft = "6px solid #540c0c";

                const productosHTML = productos.map(p => `<li>• ${p.nombre} (${p.cantidad})</li>`).join("");

                nuevaCard.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6 class="fw-bold mb-0">Orden #${result.id} — Domicilio</h6>
                    <div class="d-flex align-items-center gap-2">
                    <span class="badge bg-danger">Pendiente</span>
                    <div class="btn-group">
                        <button type="button" class="btn btn-sm btn-outline-dark btn-editar" data-id="${result.id}">
                        <i class="bi bi-pencil"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${result.id}">
                        <i class="bi bi-trash"></i>
                        </button>
                    </div>
                    </div>
                </div>
                <p class="mb-1"><strong>Nombre del Cliente:</strong> ${result.nombre_cliente}</p>
                <p class="mb-1"><strong>Lugar:</strong> ${result.lugar_domicilio}</p>
                <ul class="list-unstyled mb-0 ps-2">${productosHTML}</ul>
                <p class="mt-2 fw-bold text-end text-vino">Total: $${total}</p>
                `;

                listaPedidos.prepend(nuevaCard);

                // Cerrar el modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalOrdenDomicilio'));
                modal.hide();
            }
            else {
                alert('Error: ' + (result.error || 'No se pudo guardar la orden'));
            }

        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión con el servidor.');
        }
    });
}


// --- CSRF TOKEN ---
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + "=")) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}



async function abrirModalEditarDomicilio(data) {
  modoEdicionDomicilio = true;
  idOrdenDomicilioActual = data.id;

  const modal = new bootstrap.Modal(document.getElementById('modalOrdenDomicilio'));
  modal.show();

  // Mostrar número de orden
  document.getElementById('numeroOrdenDomicilio').textContent = data.numero_orden ?? data.id_orden;

  // Nombre o zona del domicilio
  const lugarDomicilio = data.nombre_cliente || "";
  document.getElementById('nombre_cliente_domicilio').value = data.nombre_cliente_real || "";

  // Buscar el precio del domicilio desde el backend
  try {
    const response = await fetch(`/buscar_zona_domicilio/?q=${encodeURIComponent(lugarDomicilio)}`);
    const zonas = await response.json();
    
    // Buscar coincidencia exacta
    const zonaEncontrada = zonas.find(z => z.nombre.toLowerCase() === lugarDomicilio.toLowerCase());
    if (zonaEncontrada) {
      precioDomicilioGlobal = parseFloat(zonaEncontrada.precio) || 0;
      console.log("Precio de domicilio encontrado:", precioDomicilioGlobal);
    } else {
      // Si no encuentra, calcular por diferencia (método de respaldo)
      const subtotalProductos = data.detalles.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
      precioDomicilioGlobal = Math.max(0, data.total - subtotalProductos);
      console.log("Precio calculado por diferencia:", precioDomicilioGlobal);
    }
  } catch (error) {
    console.error("Error al buscar zona de domicilio:", error);
    // Calcular por diferencia como fallback
    const subtotalProductos = data.detalles.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    precioDomicilioGlobal = Math.max(0, data.total - subtotalProductos);
  }

  // Limpiar detalles
  const detalles = document.getElementById('detalles_domicilio');
  detalles.innerHTML = '';

  // Renderizar productos
  data.detalles.forEach(item => {
    const contenedor = document.createElement('div');
    contenedor.classList.add('d-flex', 'align-items-center', 'justify-content-between', 'mb-2', 'border', 'p-2', 'rounded');

    const info = document.createElement('div');
    info.classList.add('d-flex', 'align-items-center', 'gap-1');
    const nombre = document.createElement('strong');
    nombre.textContent = item.nombre;
    const precio = document.createElement('span');
    precio.textContent = ` $${item.precio}`;
    precio.classList.add('text-muted');
    info.appendChild(nombre);
    info.appendChild(precio);

    const cantidad = document.createElement('input');
    cantidad.type = 'number';
    cantidad.min = '1';
    cantidad.value = item.cantidad;
    cantidad.classList.add('form-control', 'w-25', 'me-2');
    cantidad.addEventListener('change', () => {
      cantidad.setAttribute('value', cantidad.value);
      actualizarTotalDomicilio();
    });

    const eliminar = document.createElement('button');
    eliminar.classList.add('btn', 'btn-outline-danger', 'btn-sm');
    eliminar.textContent = 'X';
    eliminar.addEventListener('click', () => {
      contenedor.remove();
      actualizarTotalDomicilio();
    });

    contenedor.appendChild(info);
    contenedor.appendChild(cantidad);
    contenedor.appendChild(eliminar);
    detalles.appendChild(contenedor);
  });

  // Mostrar total correcto
  actualizarTotalDomicilio();
}



