'use strict';

function initializeContact() {
  const form = /** @type {HTMLFormElement | null} */ (document.querySelector('form[data-contact-form]'));
  const button = /** @type {HTMLButtonElement | null} */ (form?.querySelector('button[type="submit"]'));
  const status = document.getElementById('contact-submit-status');
  if (!form || !button || !status) return;

  // The browser posts the ordinary HTML form. JavaScript only communicates progress
  // and prevents accidental double clicks; submission also works with JS disabled.
  form.addEventListener('submit', () => {
    button.disabled = true;
    button.textContent = 'Sending inquiry…';
    status.textContent = 'Sending your inquiry. Please wait for confirmation.';
  });
  window.addEventListener('pageshow', () => {
    button.disabled = false;
    button.textContent = 'Send inquiry';
    status.textContent = '';
  });
}

module.exports = { initializeContact };
