// --- CREACIÓN DE ÓRDENES ---
function abrirModal(numeroMesa) {
    modoEdicion = false;
    idOrdenActual = null;

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

    document.getElementById("numeroOrden").textContent = siguienteOrden;
    document.getElementById("numeroMesa").textContent = numeroMesa;
    document.getElementById("nombre_cliente").value = "";
    document.getElementById("detalles").innerHTML = "";
    document.getElementById("total-dinamico").textContent = "$0";
}


// --- BÚSQUEDA DE PRODUCTOS ---
document.addEventListener('DOMContentLoaded', () => {
    const buscador = document.getElementById('buscador-producto');
    const resultados = document.getElementById('resultados');
    const detalles = document.getElementById('detalles');

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
            mostrarDetalles(prod);
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

    function mostrarDetalles(prod) {
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
        actualizarTotal();
        });

        const eliminar = document.createElement('button');
        eliminar.classList.add('btn', 'btn-outline-danger', 'btn-sm');
        eliminar.textContent = 'X';
        eliminar.addEventListener('click', () => {
        contenedor.remove();
        actualizarTotal();
        });

        const bloqueIzq = document.createElement('div');
        bloqueIzq.classList.add('d-flex', 'align-items-center', 'gap-2');
        bloqueIzq.appendChild(info);

        contenedor.appendChild(bloqueIzq);
        contenedor.appendChild(cantidad);
        contenedor.appendChild(eliminar);

        detalles.appendChild(contenedor);
        cantidad.focus();

        actualizarTotal();
    }
});

// --- ACTUALIZAR PRECIO TOTAL ---
async function actualizarTotal() {
  const detalles = document.getElementById('detalles').children;
  let total = 0;

  for (let div of detalles) {
    const cantidad = parseInt(div.querySelector('input').value);
    let texto = div.textContent;
    let precio = 0;

    const match = texto.match(/\$([0-9]+)/);
    if (match) {
      precio = parseInt(match[1]);
    } else {
      precio = 0;
    }

    total += precio * cantidad;
  }

  document.getElementById('total-dinamico').textContent = `$${total}`;
}


// --- GUARDAR ORDEN ---
let modoEdicion = false;
let idOrdenActual = null;

const botonGuardar = document.getElementById('guardar-orden');

botonGuardar.addEventListener('click', async () => {
  const numeroMesa = document.getElementById('numeroMesa').textContent.trim();
  const detalles = document.getElementById('detalles').children;
  const nombreCliente = document.getElementById('nombre_cliente').value;

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

  const total = productos.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
  const numeroOrden = parseInt(document.getElementById("numeroOrden").textContent);

  const data = {
    mesa: numeroMesa,
    productos: productos,
    nombre_cliente: nombreCliente,
    total: total,
    numero_orden: numeroOrden
  };

  try {
    let url = '/guardar_orden/';
    let method = 'POST';

    if (modoEdicion && idOrdenActual) {
      url = `/editar_orden/${idOrdenActual}/`;
      alert('Orden actualizada correctamente');
      location.reload();
      return;
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
      alert('Orden guardada correctamente');

      // AGREGAR LA NUEVA ORDEN AL FINAL DE LA LISTA
      const listaPedidos = document.getElementById("lista-pedidos");
      const nuevaCard = document.createElement("div");
      nuevaCard.classList.add("card", "shadow-sm", "p-3", "border-0", "rounded-3");
      nuevaCard.style.backgroundColor = "#f8f9fa";
      nuevaCard.style.borderLeft = "6px solid #540c0c";
      nuevaCard.dataset.id = result.id_orden;

      const productosHTML = productos.map(p => `<li>• ${p.nombre} (${p.cantidad})</li>`).join("");

      nuevaCard.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h6 class="fw-bold mb-0">Orden #${numeroOrden} — Mesa #${numeroMesa}</h6>
          <div class="d-flex align-items-center gap-2">
            <span class="badge bg-danger estado-pago" data-id="${result.id_orden}" style="cursor:pointer;">Pendiente</span>
            <div class="btn-group">
              <button type="button" class="btn btn-sm btn-outline-dark btn-editar" data-id="${result.id_orden}">
                <i class="bi bi-pencil"></i>
              </button>
              <button type="button" class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${result.id_orden}" data-numero="${numeroOrden}">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
        <p class="mb-1"><strong>Nombre del Cliente:</strong> ${nombreCliente || "No especificado"}</p>
        <ul class="list-unstyled mb-0 ps-2">${productosHTML}</ul>
        <p class="mt-2 fw-bold text-end text-vino">Total: $${total}</p>
      `;

      listaPedidos.appendChild(nuevaCard); // AGREGAR AL FINAL
      asignarEventosCambioEstado();

      actualizarEstadoMesa(numeroMesa, false);

      // Cerrar el modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('modalOrden'));
      modal.hide();
    } else {
      alert('Error: ' + (result.error || 'No se pudo guardar la orden'));
    }

  } catch (error) {
    console.error('Error:', error);
    alert('Error de conexión con el servidor.');
  }
});


// --- ELIMINAR ÓRDENES (UNA SOLA FUNCIÓN) ---
// --- ELIMINAR ÓRDENES ---
document.addEventListener('click', async function(e) {
  const boton = e.target.closest('.btn-eliminar');
  if (!boton) return;

  const card = boton.closest('.card');
  const idOrden = card.getAttribute('data-id'); 
  const numeroOrden = boton.getAttribute('data-numero');

  // ✅ EXTRAER EL NÚMERO DE MESA DE LA CARD
  const textoMesa = card.querySelector('h6').textContent;
  const matchMesa = textoMesa.match(/Mesa #(\d+)/);
  const numeroMesa = matchMesa ? matchMesa[1] : null;

  if (!idOrden) {
    alert("No se encontró el ID de la orden.");
    return;
  }

  if (confirm(`¿Deseas eliminar la orden #${numeroOrden}?`)) {
    try {
      const response = await fetch(`/eliminar_orden/${idOrden}/`, {
        method: 'POST',
        headers: { 'X-CSRFToken': getCookie('csrftoken') }
      });

      const result = await response.json();

      if (result.success) {
        alert(`Orden #${numeroOrden} eliminada correctamente.`);
        
        // ✅ ELIMINAR LA CARD VISUALMENTE
        card.remove();
        
        // ✅ PINTAR LA MESA DE VINOTINTO SIN RECARGAR (solo si es mesa, no domicilio)
        if (numeroMesa) {
          actualizarEstadoMesa(numeroMesa, true); // true = libre (vinotinto)
        }
        
      } else {
        alert(`Error: ${result.error}`);
      }

    } catch (error) {
      console.error(error);
      alert("Error al intentar eliminar la orden.");
    }
  }
});


// --- EDITAR ÓRDENES ---
document.addEventListener('click', async function(e) {
  const boton = e.target.closest('.btn-editar');
  if (!boton) return;

  const idOrden = boton.getAttribute('data-id');
  modoEdicion = true;
  idOrdenActual = idOrden;

  try {
    const response = await fetch(`/editar_orden/${idOrden}/`);
    const data = await response.json();

    if (!data.success) {
      alert("No se pudo cargar la orden.");
      return;
    }

    // Detectar si es DOMICILIO o MESA
    if (!data.mesa && data.id_tipoVenta === 'Domicilio') {
      abrirModalEditarDomicilio(data); // Nueva función que haremos abajo
      return;
    }

    // Si es MESA (la lógica actual)
    document.getElementById("numeroOrden").textContent = data.numero_orden ?? data.id_orden;
    document.getElementById("numeroMesa").textContent = data.mesa;
    document.getElementById("nombre_cliente").value = data.nombre_cliente || "";
    document.getElementById("detalles").innerHTML = "";

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
        actualizarTotal();
      });

      const eliminar = document.createElement('button');
      eliminar.classList.add('btn', 'btn-outline-danger', 'btn-sm');
      eliminar.textContent = 'X';
      eliminar.addEventListener('click', () => {
        contenedor.remove();
        actualizarTotal();
      });

      contenedor.appendChild(info);
      contenedor.appendChild(cantidad);
      contenedor.appendChild(eliminar);

      document.getElementById("detalles").appendChild(contenedor);
    });

    actualizarTotal();

    const modal = new bootstrap.Modal(document.getElementById('modalOrden'));
    modal.show();

  } catch (error) {
    console.error(error);
    alert('Error al cargar la orden.');
  }
});



// --- BÚSQUEDA DE ÓRDENES ---
const buscadorOrden = document.getElementById('buscador-orden');
const btnBuscarOrden = document.getElementById('btn-buscar-orden');
const listaPedidos = document.getElementById('lista-pedidos');

function renderizarPedidos(ordenes) {
  listaPedidos.innerHTML = '';

  if (ordenes.length === 0) {
    listaPedidos.innerHTML = '<p class="text-muted text-center">No se encontraron órdenes.</p>';
    return;
  }

  ordenes.forEach(orden => {
    const card = document.createElement('div');
    card.classList.add('card', 'shadow-sm', 'p-3', 'border-0', 'rounded-3');
    card.style.backgroundColor = '#f8f9fa';
    card.style.borderLeft = '6px solid #540c0c';
    card.dataset.id = orden.id_orden;

    const detallesHTML = orden.detalles.map(item => 
      `<li>• ${item.nombre} (${item.cantidad})</li>`
    ).join('');

    const lugar = orden.mesa ? `Mesa #${orden.mesa}` : 'Domicilio';

    card.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h6 class="fw-bold mb-0">
          Orden #${orden.id_orden} — Mesa #${lugar}
        </h6>
        <div class="d-flex align-items-center gap-2">
          <span class="badge ${orden.estado_pago === 'pendiente' ? 'bg-danger' : 'bg-success'} estado-pago"
                data-id="${orden.id_orden}" style="cursor:pointer;">
            ${orden.estado_pago.charAt(0).toUpperCase() + orden.estado_pago.slice(1)}
          </span>
          <div class="btn-group">
            <button type="button" class="btn btn-sm btn-outline-dark btn-editar" data-id="${orden.id_orden}">
              <i class="bi bi-pencil"></i>
            </button>
            <button type="button" class="btn btn-sm btn-outline-danger btn-eliminar" 
                    data-id="${orden.id_orden}" data-numero="${orden.id_orden}">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
      <p class="mb-1"><strong>Cliente:</strong> ${orden.nombre_cliente}</p>
      <ul class="list-unstyled mb-0 ps-2">${detallesHTML}</ul>
      <p class="mt-2 fw-bold text-end text-vino">Total: $${orden.total}</p>
    `;

    listaPedidos.appendChild(card);
  });

  asignarEventosCambioEstado();
}

async function buscarOrden() {
  const query = buscadorOrden.value.trim();
  try {
    const response = await fetch(`/buscar_orden/?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    renderizarPedidos(data);
  } catch (error) {
    console.error('Error al buscar órdenes:', error);
  }
}

if (btnBuscarOrden) btnBuscarOrden.addEventListener('click', buscarOrden);
if (buscadorOrden) buscadorOrden.addEventListener('input', buscarOrden);


// --- CAMBIAR ESTADO DE PAGO ---
function asignarEventosCambioEstado() {
  document.querySelectorAll('.estado-pago').forEach(badge => {
    badge.addEventListener('click', function () {
      const idOrden = this.getAttribute('data-id');

      fetch(`/cambiar_estado/${idOrden}/`, {
        method: 'POST',
        headers: { 'X-CSRFToken': getCookie('csrftoken') },
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            this.textContent = data.nuevo_estado.charAt(0).toUpperCase() + data.nuevo_estado.slice(1);
            if (data.nuevo_estado === 'pago') {
              this.classList.remove('bg-danger');
              this.classList.add('bg-success');
            } else {
              this.classList.remove('bg-success');
              this.classList.add('bg-danger');
            }
          } else {
            console.error('Error:', data.error);
          }
        })
        .catch(error => console.error('Error en la petición:', error));
    });
  });
}

// Asignar eventos al cargar la página
document.addEventListener('DOMContentLoaded', asignarEventosCambioEstado);


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


// --- RESETEAR ÓRDENES (CON DEBUG) ---
async function ocultarOrdenes() {
  console.log("🔄 Función resetearOrdenes() ejecutada");
  
  if (!confirm('¿Estás seguro de que deseas ocultar todas las órdenes del día? Se ocultarán pero se mantendrán en la base de datos.')) {
    console.log("❌ Usuario canceló el reseteo");
    return;
  }

  console.log("✅ Usuario confirmó la eliminacion");

  try {
    console.log("📡 Enviando petición a /ocultar_ordenes/");
    
    //Aqui realmente debería ser "eliminar_ordenes", pero por los momentos se dejará así. Hasta ahora, funciona bien
    const response = await fetch('/resetear_ordenes/', {
      method: 'POST',
      headers: {
        'X-CSRFToken': getCookie('csrftoken')
      }
    });

    console.log("📥 Respuesta recibida:", response);
    
    const result = await response.json();
    console.log("📦 Datos de respuesta:", result);

    if (result.success) {
      alert(`Se han ocultado ${result.ordenes_ocultadas} órdenes correctamente.`);
      console.log("✅ Recargando página...");
      location.reload();
    } else {
      alert('Error: ' + (result.error || 'No se pudieron resetear las órdenes'));
      console.error("❌ Error en la respuesta:", result);
    }
  } catch (error) {
    console.error('❌ Error en la petición:', error);
    alert('Error de conexión con el servidor.');
  }
}


// --- DEVOLVER ÓRDENES (CON DEBUG) ---
async function resetearOrdenes() {
  console.log("↺ Función devolverOrdenes() ejecutada");
  
  if (!confirm('¿Deseas resetear todas las órdenes ocultas?')) {
    console.log("❌ Usuario canceló la devolución");
    return;
  }

  console.log("✅ Usuario confirmó la devolución");

  try {
    console.log("📡 Enviando petición a /devolver_ordenes/");
    
    const response = await fetch('/devolver_ordenes/', {
      method: 'POST',
      headers: {
        'X-CSRFToken': getCookie('csrftoken')
      }
    });

    console.log("📥 Respuesta recibida:", response);
    
    const result = await response.json();
    console.log("📦 Datos de respuesta:", result);

    if (result.success) {
      alert(`Se han devuelto ${result.ordenes_devueltas} órdenes correctamente.`);
      console.log("✅ Recargando página...");
      location.reload();
    } else {
      alert('Error: ' + (result.error || 'No se pudieron devolver las órdenes'));
      console.error("❌ Error en la respuesta:", result);
    }
  } catch (error) {
    console.error('❌ Error en la petición:', error);
    alert('Error de conexión con el servidor.');
  }
}

// --- ASIGNAR EVENTOS A LOS BOTONES DE RESETEO ---
document.addEventListener('DOMContentLoaded', function() {
  const btnResetear = document.getElementById('btn-ocultar-ordenes');
  const btnDevolver = document.getElementById('btn-resetear-ordenes');
  
  if (btnResetear) {
    btnResetear.addEventListener('click', ocultarOrdenes);
  }
  
  if (btnDevolver) {
    btnDevolver.addEventListener('click', resetearOrdenes);
  }
});


// --- VERIFICAR QUE getCookie EXISTE ---
console.log("Verificando getCookie:", typeof getCookie);
if (typeof getCookie === 'undefined') {
  console.error("ERROR: La función getCookie() no está definida");
}

console.log("Funciones resetearOrdenes y devolverOrdenes cargadas correctamente");



// --- ACTUALIZAR ESTADO VISUAL DE LA MESA ---
function actualizarEstadoMesa(numeroMesa, libre) {
  // Buscar todas las mesas
  const mesas = document.querySelectorAll('.mesa-botones');
  
  mesas.forEach(mesaDiv => {
    const boton = mesaDiv.querySelector('button');
    const textoBoton = boton?.textContent.trim();
    
    // Verificar si es la mesa correcta
    if (textoBoton === `Mesa #${numeroMesa}`) {
      if (libre) {
        // LIBRE (vinotinto)
        mesaDiv.classList.remove('mesa-ocupada');
        mesaDiv.classList.add('mesa-libre');
        boton.disabled = false;
        boton.removeAttribute('onclick');
        boton.setAttribute('data-bs-toggle', 'modal');
        boton.setAttribute('data-bs-target', '#modalOrden');
        boton.onclick = function() { abrirModal(numeroMesa); };
      } else {
        // OCUPADA (negro)
        mesaDiv.classList.remove('mesa-libre');
        mesaDiv.classList.add('mesa-ocupada');
        boton.disabled = true;
        boton.removeAttribute('data-bs-toggle');
        boton.removeAttribute('data-bs-target');
        boton.onclick = function() { 
          alert('Esta mesa está ocupada. Elimina la orden para liberarla.'); 
        };
      }
    }
  });
}