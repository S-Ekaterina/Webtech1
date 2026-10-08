const toggleBtn = document.getElementById('toggle');
  const navMenu = document.querySelector('nav');

  toggleBtn.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('active');

    toggleBtn.textContent = isOpen ? '✕' : '☰';

    document.body.style.overflow = isOpen ? 'hidden' : '';
  });