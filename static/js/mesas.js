//GESTIÓN DE SELECCIÓN Y ELIMINACIÓN MÚLTIPLE DE MESAS

document.addEventListener("DOMContentLoaded", () => {
    const botonSeleccionar = document.getElementById("boton-seleccionar");
    const checkboxes = document.querySelectorAll(".checkbox-mesa");
    const formEliminar = document.getElementById("eliminar-multiples-mesas");
    let modoSeleccion = false; //Se pone como false porque todavía no hemos seleccionado mesas

    //ACTIVAR O SELECCONAR MESAS
    botonSeleccionar.addEventListener("click", () => {
        modoSeleccion = !modoSeleccion; 
        //Aca, si el modoSeleccion es true, los checkboses se muestran, y si es false, se ocultan
        checkboxes.forEach(cb => cb.classList.toggle("d-none", !modoSeleccion)); 
        //Si no estamos seleccionando, se oculta el formulario de eliminar (d-none)
        //Si estamos en modo selección, se muestra el formulario (se quita el d-none)
        formEliminar.classList.toggle("d-none", !modoSeleccion);
        //Si está activo, muestra "Cancelar selección", si no, "Seleccionar mesas"
        botonSeleccionar.textContent = modoSeleccion ? "Cancelar selección" : "Seleccionar mesas";
    });

    //ENVIAR FORMULARIO DE ELIMINAR MESAS
    formEliminar.addEventListener("submit", (e) => {
        e.preventDefault();


        const seleccionadas = Array.from(checkboxes) //Convertir los checkboxes en un arreglo
        .filter(cb => cb.checked) //indica los que están marcados
        .map(cb => cb.value); //se obtiene el id de cada mesa seleccionada


        //VALIDAR SELECCIÓN VACÍA
        //Si el usuario no selecciono ninguna mesa y le dio a eliminar, le va a aparecer esta alerta
        if (seleccionadas.length === 0) {
        alert("Selecciona al menos una mesa para eliminar.");
        return;
        }

        //Aca se crean inputs ocultos para cada mesa seleccionada y se agregan al formulario.
        //Esto lo recibe Django y sabe qué mesas eliminar
        seleccionadas.forEach(id => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = "mesas_seleccionadas";
        input.value = id;
        formEliminar.appendChild(input);
        });

        formEliminar.submit(); //Enviar formulario
    });
});

// =============================
// 🔁 REINICIALIZAR MESAS AL CARGAR O RESETEAR
// =============================

// Esta función se encarga de:
// 1. Volver a habilitar las mesas libres.
// 2. Permitir que se seleccionen para agregar órdenes.
// 3. Mantener el color correcto visualmente.
function inicializarMesas() {
  const mesas = document.querySelectorAll(".mesa-botones");

  mesas.forEach(mesa => {
    // Limpia clases viejas
    mesa.classList.remove("mesa-ocupada", "mesa-seleccionada", "mesa-activa");
    mesa.classList.add("mesa-libre");

    // Forzar colores (vinotinto)
    mesa.style.backgroundColor = "#540c0c";
    mesa.style.color = "#fff";

    // Reactivar interacción y eventos
    const boton = mesa.querySelector("button");
    if (boton) {
      const numeroMesa = boton.textContent.match(/\d+/)?.[0];
      boton.disabled = false;
      boton.removeAttribute("disabled");

      // Restablecer atributos de modal de Bootstrap
      boton.setAttribute("data-bs-toggle", "modal");
      boton.setAttribute("data-bs-target", "#modalOrden");
      boton.setAttribute("onclick", `abrirModal('${numeroMesa}')`);

      // Estilo de cursor normal
      boton.style.cursor = "pointer";
    }

    // Listener de consola (opcional)
    mesa.addEventListener("click", () => {
      if (mesa.classList.contains("mesa-ocupada")) {
        console.log(`🚫 ${mesa.textContent.trim()} está ocupada`);
      } else {
        console.log(`✅ ${mesa.textContent.trim()} lista para nueva orden`);
      }
    });
  });

  console.log("♻️ Mesas reinicializadas correctamente y activas.");
}

// Ejecutar esta función cuando cargue la página
document.addEventListener("DOMContentLoaded", inicializarMesas);

