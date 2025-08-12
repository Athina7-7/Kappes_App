function activarMenuHamburguesa() {
  const menuBtn = document.querySelector('.ka-hamburger');
  const menu = document.querySelector('#menu-lateral');
  const overlay = document.querySelector('.ka-overlay');

  if (!menuBtn || !menu) return;

  menuBtn.addEventListener('mouseenter', () => {
    menu.classList.add('show');
    overlay.classList.add('show');
  });

  menuBtn.addEventListener('mouseleave', () => {
    setTimeout(() => {
      if (!menu.matches(':hover')) {
        menu.classList.remove('show');
        overlay.classList.remove('show');
      }
    }, 200);
  });

  menu.addEventListener('mouseleave', () => {
    menu.classList.remove('show');
    overlay.classList.remove('show');
  });
}
