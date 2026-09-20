document.addEventListener('DOMContentLoaded', () => {
    if (window.feather) feather.replace();
    const menuButton = document.getElementById('menu-toggle');
    const menu = document.getElementById('mobile-menu');
    const closeMenu = () => { menu?.classList.remove('open'); menuButton?.setAttribute('aria-expanded', 'false'); };
    menuButton?.addEventListener('click', () => { const isOpen = menu?.classList.toggle('open'); menuButton.setAttribute('aria-expanded', String(isOpen)); });
    menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
});
