'use strict';

/** @param {() => void} [onCopy] */
function initializeContact(onCopy = () => {}) {
  const button = /** @type {HTMLButtonElement | null} */ (document.querySelector('button[data-copy-message]'));
  const message = /** @type {HTMLTextAreaElement | null} */ (document.querySelector('textarea#prepared-message'));
  const status = document.getElementById('copy-message-status');
  if (!button || !message || !status) return;

  // The prepared text remains manually selectable when JavaScript is unavailable.
  button.hidden = false;
  button.addEventListener('click', async () => {
    button.disabled = true;
    status.textContent = '';
    let copied = false;
    try {
      if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(message.value);
      status.textContent = 'Message copied. Paste it into your email, add the subject above and send it to Amicus.';
      copied = true;
    } catch {
      message.focus();
      message.select();
      status.textContent = 'The message is selected. Use your device’s Copy command, then paste it into your email.';
    } finally {
      button.disabled = false;
    }
    if (copied) onCopy();
  });
}

module.exports = { initializeContact };
