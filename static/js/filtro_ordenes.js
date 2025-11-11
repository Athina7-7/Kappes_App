// ====================================
// SISTEMA DE FILTRADO DE ÓRDENES
// ====================================

// Estado actual del filtro: 'todas', 'mesas', 'domicilio'
let filtroActual = 'todas';

// --- FUNCIÓN PARA FILTRAR ÓRDENES ---
function filtrarOrdenes(tipo) {
  filtroActual = tipo;
  
  // Obtener todas las cards de órdenes
  const todasLasCards = document.querySelectorAll('#lista-pedidos .card[data-id]');
  
  todasLasCards.forEach(card => {
    const titulo = card.querySelector('h6').textContent;
    const esMesa = titulo.includes('Mesa #');
    const esDomicilio = titulo.includes('Domicilio');
    
    // Mostrar u ocultar según el filtro
    if (tipo === 'todas') {
      card.style.display = 'block';
    } else if (tipo === 'mesas' && esMesa) {
      card.style.display = 'block';
    } else if (tipo === 'domicilio' && esDomicilio) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
  
  // Actualizar el estilo de los botones
  actualizarEstiloBotones(tipo);
  
  // Verificar si hay órdenes visibles
  verificarOrdenesVisibles();
}

// --- ACTUALIZAR ESTILO DE LOS BOTONES ---
function actualizarEstiloBotones(tipoActivo) {
  const btnDomicilio = document.querySelector('.boton-filtro button:first-child');
  const btnMesas = document.querySelector('.boton-filtro button:last-child');
  
  // RESTABLECER AMBOS BOTONES AL ESTILO INACTIVO (blanco con borde vinotinto)
  btnDomicilio.classList.remove('btn-dark', 'activo');
  btnDomicilio.classList.add('btn-outline-dark');
  btnMesas.classList.remove('btn-dark', 'activo');
  btnMesas.classList.add('btn-outline-dark');
  
  // APLICAR ESTILO ACTIVO (negro con letra blanca) AL BOTÓN CORRESPONDIENTE
  if (tipoActivo === 'domicilio') {
    btnDomicilio.classList.remove('btn-outline-dark');
    btnDomicilio.classList.add('btn-dark', 'activo');
  } else if (tipoActivo === 'mesas') {
    btnMesas.classList.remove('btn-outline-dark');
    btnMesas.classList.add('btn-dark', 'activo');
  }
}

// --- VERIFICAR SI HAY ÓRDENES VISIBLES ---
function verificarOrdenesVisibles() {
  const listaPedidos = document.getElementById('lista-pedidos');
  const cardsVisibles = Array.from(listaPedidos.querySelectorAll('.card[data-id]'))
    .filter(card => card.style.display !== 'none');
  
  // Si no hay órdenes visibles, mostrar mensaje
  const mensajeExistente = listaPedidos.querySelector('.mensaje-sin-ordenes');
  
  if (cardsVisibles.length === 0) {
    if (!mensajeExistente) {
      const mensaje = document.createElement('p');
      mensaje.classList.add('text-muted', 'text-center', 'mensaje-sin-ordenes', 'mt-4');
      mensaje.style.fontSize = '1.1rem';
      mensaje.textContent = `No hay órdenes de ${filtroActual === 'mesas' ? 'mesas' : 'domicilio'}.`;
      listaPedidos.appendChild(mensaje);
    }
  } else {
    if (mensajeExistente) {
      mensajeExistente.remove();
    }
  }
}

// --- ASIGNAR EVENTOS A LOS BOTONES ---
document.addEventListener('DOMContentLoaded', function() {
  const btnDomicilio = document.querySelector('.boton-filtro button:first-child');
  const btnMesas = document.querySelector('.boton-filtro button:last-child');
  
  if (btnDomicilio) {
    btnDomicilio.addEventListener('click', () => {
      if (filtroActual === 'domicilio') {
        // Si ya está activo, volver a mostrar TODAS las órdenes
        filtrarOrdenes('todas');
      } else {
        // Filtrar solo domicilios
        filtrarOrdenes('domicilio');
      }
    });
  }
  
  if (btnMesas) {
    btnMesas.addEventListener('click', () => {
      if (filtroActual === 'mesas') {
        // Si ya está activo, volver a mostrar TODAS las órdenes
        filtrarOrdenes('todas');
      } else {
        // Filtrar solo mesas
        filtrarOrdenes('mesas');
      }
    });
  }
});

// --- MANTENER FILTRO DESPUÉS DE CREAR/EDITAR ORDEN ---
// Esta función se debe llamar después de agregar una nueva orden o actualizar
function aplicarFiltroActual() {
  if (filtroActual !== 'todas') {
    filtrarOrdenes(filtroActual);
  }
}

// --- INTEGRAR CON LA BÚSQUEDA ---
// Modificar la función de búsqueda para respetar el filtro
const buscarOrdenOriginal = window.buscarOrden;
if (buscarOrdenOriginal) {
  window.buscarOrden = async function() {
    await buscarOrdenOriginal();
    aplicarFiltroActual();
  };
}

console.log('Sistema de filtrado de órdenes cargado correctamente');