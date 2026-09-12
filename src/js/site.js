'use strict';
const { initializeAnalytics } = require('./analytics');
const { initializeContact } = require('./contact');
(() => {
  initializeAnalytics();
  initializeContact();
  const menu = document.querySelector('.mobile-nav');
  if (menu instanceof HTMLDetailsElement) {
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.open) { menu.open = false; menu.querySelector('summary')?.focus(); }
    });
    document.addEventListener('click', event => { if (menu.open && event.target instanceof Node && !menu.contains(event.target)) menu.open = false; });
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { menu.open = false; }));
  }
  const result = document.getElementById('form-errors') || document.getElementById('contact-success');
  if (result) {
    result.focus({ preventScroll: true });
    result.scrollIntoView({ block: 'start', behavior: 'instant' });
  }
})();
