document.addEventListener("DOMContentLoaded", function(){
    
    // Se hace llamado de los selectores o elementos con id se van 
    // a requerir para la función
    const boton = document.querySelector('.navbar-toggler');
    const offcanvasElement = document.getElementById('menuLateral');
    const offcanvas = new bootstrap.Offcanvas(offcanvasElement);


    // Abrir el menú solo con pasar el cursor
    boton.addEventListener('mouseenter', () =>{
        offcanvas.show();
    });

    // Cerrar el menúu cuando ya no esté encima el cursor
    offcanvasElement.addEventListener('mouseleave', () =>{
        offcanvas.hide();
    });

});