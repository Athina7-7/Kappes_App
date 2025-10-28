// --- FUNCION AUXILIAR PARA LOS BOTONES ---
function querySelectorContains(texto) {
  const botones = document.querySelectorAll("button");
  for (let boton of botones) {
    if (boton.textContent.trim() === texto.trim()) {
      return boton;
    }
  }
  return null;
}