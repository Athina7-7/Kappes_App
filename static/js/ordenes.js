// --- CREACIÓN DE ÓRDENES ---
function abrirModal(numeroMesa) {
    // Reiniciar el modo edición cada vez que se abre un nuevo modal
    modoEdicion = false;
    idOrdenActual = null;

    // --- Obtener el número de orden más alto actualmente ---
    const ordenes = document.querySelectorAll('.card[data-id]');
    let siguienteOrden = 1; // Valor por defecto si no hay órdenes aún

    if (ordenes.length > 0) {
      // Extrae todos los IDs numéricos desde los data-id de las tarjetas
      const cards = document.querySelectorAll('#lista-pedidos h6');
        const numeros = Array.from(cards)
        .map(el => {
            const match = el.textContent.match(/Orden #(\d+)/);
            return match ? parseInt(match[1]) : 0;
        })
        .filter(num => !isNaN(num));

        siguienteOrden = numeros.length > 0 ? Math.max(...numeros) + 1 : 1;
    }

    // --- Mostrar número de orden y mesa en el modal ---
    document.getElementById("numeroOrden").textContent = siguienteOrden;
    document.getElementById("numeroMesa").textContent = numeroMesa;

    // --- Limpiar los datos del modal ---
    document.getElementById("nombre_cliente").value = "";
    document.getElementById("detalles").innerHTML = "";
    document.getElementById("total-dinamico").textContent = "$0";
  }




// ---BÚSQUEDA DE PRODUCTOS PARA LA CREACIÓN DE ÓRDENES - MOSTRAR TAMBIÉN LOS DETALLES (CANTIDAD Y PRECIOS)
document.addEventListener('DOMContentLoaded', () => {
    const buscador = document.getElementById('buscador-producto');
    const resultados = document.getElementById('resultados');
    const detalles = document.getElementById('detalles');

    // Buscar productos mientras el usuario escribe
    buscador.addEventListener('input', async () => {
        const query = buscador.value.trim();
        resultados.innerHTML = ''; // limpia los resultados previos

        if (query.length < 2) return; // espera a que escriba al menos 2 letras

        try {
        const response = await fetch(`/buscar_producto/?q=${query}`);
        const productos = await response.json();

        if (productos.length === 0) return;

        productos.forEach(prod => {
            const item = document.createElement('div');
            item.classList.add('list-group-item', 'list-group-item-action');
            item.textContent = prod.nombre;

            // Captura click y mousedown (más compatible entre navegadores)
            const seleccionar = (e) => {
            e.preventDefault();
            mostrarDetalles(prod);
            resultados.innerHTML = ''; // limpia el listado
            buscador.value = ''; // limpia el texto del input
            };

            item.addEventListener('mousedown', seleccionar);
            item.addEventListener('click', seleccionar);

            resultados.appendChild(item);
        });
        } catch (error) {
        console.error('Error al buscar productos:', error);
        }
    });

    // Mostrar detalles del producto seleccionado
    // Mostrar detalles del producto seleccionado
    function mostrarDetalles(prod) {
        const contenedor = document.createElement('div');
        contenedor.classList.add(
        'd-flex',
        'align-items-center',
        'justify-content-between',
        'mb-2',
        'border',
        'p-2',
        'rounded'
        );

        // Nombre en negrita
        const nombre = document.createElement('strong');
        nombre.textContent = prod.nombre;

        // Precio normal
        const precio = document.createElement('span');
        precio.textContent = ` $${prod.precio}`;
        precio.classList.add('text-muted');

        // Combinar ambos
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

// ---ACTUALIZAR PRECIO TOTAL DE LAS ORDENES ---
async function actualizarTotal() {
  const detalles = document.getElementById('detalles').children;
  let total = 0;

  for (let div of detalles) {
    // Obtiene la cantidad
    const cantidad = parseInt(div.querySelector('input').value);

    // Intenta obtener el precio directamente del texto dentro del div
    // Ejemplo de texto: "Menu de la Noche $4000"
    let texto = div.textContent;
    let precio = 0;

    // Busca un número después del signo $
    const match = texto.match(/\$([0-9]+)/);
    if (match) {
      precio = parseInt(match[1]); // Extrae el número del precio
    } else {
      precio = 0; // Valor por defecto si no se encuentra precio (para adiciones)
    }

    total += precio * cantidad;
  }

  // Actualizar el texto del total dinámico en el modal
  document.getElementById('total-dinamico').textContent = `$${total}`;
}




//--- GUARDAR ORDEN NUEVA O EDITAR UNA EXISTENTE ---
  let modoEdicion = false;
  let idOrdenActual = null;

  const botonGuardar = document.getElementById('guardar-orden');

  // --- BOTÓN GUARDAR ORDEN ---
  botonGuardar.addEventListener('click', async () => {
    const numeroMesa = document.getElementById('numeroMesa').textContent.replace('Mesa #', '');
    const detalles = document.getElementById('detalles').children;
    const nombreCliente = document.getElementById('nombre_cliente').value;

    if (detalles.length === 0) {
      alert('Agrega al menos un producto o adición antes de guardar.');
      return;
    }

    // Extraer correctamente los productos o adiciones con su precio
    const productos = Array.from(detalles).map(div => {
      const nombre = div.querySelector('strong')?.textContent.trim() || 'Producto sin nombre';
      const precioMatch = div.textContent.match(/\$([0-9]+)/);
      const precio = precioMatch ? parseInt(precioMatch[1]) : 0;
      const cantidad = parseInt(div.querySelector('input').value);

      return {
        nombre: nombre,
        cantidad: cantidad,
        precio: precio
      };
    });

    // Calcular total correctamente
    const total = productos.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);

    const data = {
      mesa: numeroMesa,
      productos: productos,
      nombre_cliente: nombreCliente,
      total: total,
      numero_orden: document.getElementById("numeroOrden").textContent
    };

    try {
      let url = '/guardar_orden/';
      let method = 'POST';

      if (modoEdicion && idOrdenActual) {
        url = `/editar_orden/${idOrdenActual}/`;
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
        alert(modoEdicion ? 'Orden actualizada correctamente' : 'Orden guardada correctamente');
        location.reload();
      } else {
        alert('Error: ' + (result.error || 'No se pudo guardar la orden'));
      }

    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión con el servidor.');
    }
  });
 


  // MOSTRAR LAS ORDENES EN LA SECCIÓN DE PEDIDOS
  function mostrarOrdenEnPedidos(id, mesa, productos, nombreCliente, total) {
    const listaPedidos = document.getElementById('lista-pedidos');

    const card = document.createElement('div');
    card.classList.add('card', 'shadow-sm', 'p-3', 'border-0', 'rounded-3');
    card.style.backgroundColor = '#f8f9fa';
    card.style.transition = '0.3s';
    card.style.borderLeft = '6px solid #540c0c';
    card.setAttribute('data-id', id);

    card.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h6 class="fw-bold mb-0">Orden #${orden.numero_orden ?? orden.id_orden} — Mesa #${orden.mesa ?? '-'}</h6>
        <button class="btn btn-sm btn-outline-danger">
          <i class="bi bi-trash"></i>
        </button>
      </div>
      <p class="mb-1"><strong>Nombre del Cliente:</strong> ${nombreCliente || 'No especificado'}</p>
      <ul class="list-unstyled mb-0 ps-2">
        ${productos.map(p => `<li>• ${p.nombre} (${p.cantidad})</li>`).join('')}
      </ul>
      <p class="mt-2 fw-bold text-end">Total: $${total}</p>
    `;

    card.addEventListener('mouseenter', () => card.style.backgroundColor = '#fff');
    card.addEventListener('mouseleave', () => card.style.backgroundColor = '#f8f9fa');

    listaPedidos.appendChild(card);
  }


  // Obtener token CSRF (para Django)
  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }




  // --- ELIMINAR ÓRDENES ---
  document.addEventListener('click', async function(e) {
    const boton = e.target.closest('.btn-eliminar');
    if (!boton) return; // No hizo clic en un botón eliminar

    const card = boton.closest('.card');
    const idOrden = card.getAttribute('data-id'); 
    const numeroOrden = boton.getAttribute('data-numero');

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
          // Elimina la tarjeta visualmente
          card.remove();
          alert(`Orden #${numeroOrden} eliminada correctamente.`);

          // --- Actualiza la mesa correspondiente ---
          const mesaTexto = card.querySelector('h6').textContent;
          const match = mesaTexto.match(/Mesa #(\d+)/);
          if (match) {
            const numeroMesa = match[1];
            const botonMesa = Array.from(document.querySelectorAll('.mesa-botones button'))
            .find(b => b.textContent.trim() === `Mesa #${numeroMesa}`);

            if (botonMesa) {
              // Cambiar estado visual del botón
              botonMesa.disabled = false;
              botonMesa.style.cursor = "pointer";
              botonMesa.removeAttribute("style"); 
              botonMesa.setAttribute("data-bs-toggle", "modal");
              botonMesa.setAttribute("data-bs-target", "#modalOrden");
              botonMesa.setAttribute("onclick", `abrirModal('${numeroMesa}')`);

              // Cambiar la clase del contenedor a "mesa-libre"
              const contenedor = botonMesa.closest('.mesa-botones');
              if (contenedor) {
                contenedor.classList.remove('mesa-ocupada');
                contenedor.classList.add('mesa-libre');
              }
            }
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

    // Mostrar información en el modal
    document.getElementById("numeroOrden").textContent = data.numero_orden ?? data.id_orden;
    document.getElementById("numeroMesa").textContent = data.mesa;
    document.getElementById("nombre_cliente").value = data.nombre_cliente || "";
    document.getElementById("detalles").innerHTML = "";

    // Agregar productos/adiciones
    data.detalles.forEach(item => {
      const contenedor = document.createElement('div');
      contenedor.classList.add(
        'd-flex', 'align-items-center', 'justify-content-between',
        'mb-2', 'border', 'p-2', 'rounded'
      );

      // Nombre y precio
      const info = document.createElement('div');
      info.classList.add('d-flex', 'align-items-center', 'gap-1');
      const nombre = document.createElement('strong');
      nombre.textContent = item.nombre;
      const precio = document.createElement('span');
      precio.textContent = ` $${item.precio}`;
      precio.classList.add('text-muted');
      info.appendChild(nombre);
      info.appendChild(precio);

      // Input de cantidad
      const cantidad = document.createElement('input');
      cantidad.type = 'number';
      cantidad.min = '1';
      cantidad.value = item.cantidad;
      cantidad.classList.add('form-control', 'w-25', 'me-2');

      // Evento para recalcular total dinámicamente
      cantidad.addEventListener('change', () => {
        cantidad.setAttribute('value', cantidad.value);
        actualizarTotal(); // recalcula el total al modificar cantidad
      });

      // Botón eliminar
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

    // Calcular total inicial
    actualizarTotal();

    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('modalOrden'));
    modal.show();

  } catch (error) {
    console.error(error);
    alert('Error al cargar la orden.');
  }
});




// --- BÚSQUEDA DE ÓRDENES EN LA SECCIÓN DE PEDIDOS ---
  const buscadorOrden = document.getElementById('buscador-orden');
  const btnBuscarOrden = document.getElementById('btn-buscar-orden');
  const listaPedidos = document.getElementById('lista-pedidos');

  // --- Función para renderizar resultados (con botones y eventos) ---
  function renderizarPedidos(ordenes) {
    listaPedidos.innerHTML = ''; // limpia el contenedor

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

      // --- Se agrega también el grupo de botones ---
      card.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h6 class="fw-bold mb-0">
            Orden #${orden.id_orden} — Mesa #${orden.mesa ?? '-'}
          </h6>
          <div class="btn-group">
            <button type="button" class="btn btn-sm btn-outline-dark btn-editar" data-id="${orden.id_orden}">
              <i class="bi bi-pencil"></i>
            </button>
            <button type="button" class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${orden.id_orden}">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
        <p class="mb-1"><strong>Cliente:</strong> ${orden.nombre_cliente}</p>
        <ul class="list-unstyled mb-0 ps-2">${detallesHTML}</ul>
        <p class="mt-2 fw-bold text-end text-vino">Total: $${orden.total}</p>
      `;

      listaPedidos.appendChild(card);
    });

    // --- Reasignar eventos después de renderizar ---
    asignarEventosOrdenes();
  }


  // Función de búsqueda
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

  btnBuscarOrden.addEventListener('click', buscarOrden);
  buscadorOrden.addEventListener('input', buscarOrden);

  
  // --- Función para reactivar eventos de edición y eliminación después de renderizar ---
function asignarEventosOrdenes() {

  document.querySelectorAll('.btn-editar').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const idOrden = e.currentTarget.getAttribute('data-id');
      modoEdicion = true;
      idOrdenActual = idOrden;

      try {
        const response = await fetch(`/editar_orden/${idOrden}/`);
        const data = await response.json();

        if (!data.success) {
          alert('No se pudo cargar la orden.');
          return;
        }

        // --- Rellenar datos en el modal ---
        document.getElementById("numeroOrden").textContent = data.id;
        document.getElementById("numeroMesa").textContent = data.mesa;
        document.getElementById("nombre_cliente").value = data.nombre_cliente || "";
        document.getElementById("detalles").innerHTML = "";

        data.detalles.forEach(item => {
          const contenedor = document.createElement('div');
          contenedor.classList.add('d-flex','align-items-center','justify-content-between','mb-2','border','p-2','rounded');
          contenedor.innerHTML = `
            <div class="d-flex align-items-center gap-1">
              <strong>${item.nombre}</strong><span class="text-muted"> $${item.precio}</span>
            </div>
            <input type="number" min="1" value="${item.cantidad}" class="form-control w-25 me-2">
            <button class="btn btn-outline-danger btn-sm">X</button>
          `;
          document.getElementById("detalles").appendChild(contenedor);
        });

        actualizarTotal();
        const modal = new bootstrap.Modal(document.getElementById('modalOrden'));
        modal.show();
      } catch (error) {
        console.error('Error al editar:', error);
      }
    });
  });
}




// --- CAMBIAR ESTADO DE PAGO DE LAS ÓRDENES ---
document.querySelectorAll('.estado-pago').forEach(badge => {
  badge.addEventListener('click', function () {
    const idOrden = this.getAttribute('data-id');

    fetch(`/cambiar_estado/${idOrden}/`, {
      method: 'POST',
      headers: {
        'X-CSRFToken': getCookie('csrftoken'), // Necesario para Django
      },
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Cambiar visualmente el estado en la interfaz
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

// Función para obtener el token CSRF de las cookies
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + '=') {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}
