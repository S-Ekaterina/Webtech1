const toggleBtn = document.getElementById('toggle');
const navMenu = document.querySelector('nav');

toggleBtn.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('active');

  if (isOpen) {
    toggleBtn.textContent = '✕';
    document.body.style.overflow = 'hidden';
  }
  else {
    toggleBtn.textContent = '☰';
    document.body.style.overflow = '';
  }
  
});