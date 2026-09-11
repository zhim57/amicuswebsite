'use strict';
(() => {
  // Optional first-party analytics. Never send form contents, mailto URLs or query strings.
  const allowed = new Set(['buy_esim_click', 'shop_visit', 'contact_submit', 'operator_inquiry', 'seafarer_cta_click', 'crew_tool_click', 'resource_view', 'resource_download']);
  /** @param {string | undefined} name */
  function track(name) {
    if (!name) return;
    if (!allowed.has(name) || navigator.doNotTrack === '1') return;
    if (window.umami && typeof window.umami.track === 'function') {
      try { Promise.resolve(window.umami.track(name, { page: location.pathname })).catch(() => {}); } catch { /* Navigation does not depend on analytics. */ }
    }
  }
  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest('[data-event]');
    if (!(link instanceof HTMLElement)) return;
    track(link.dataset.event);
    if (link.dataset.event === 'buy_esim_click') track('shop_visit');
  });
  const menu = document.querySelector('.mobile-nav');
  if (menu instanceof HTMLDetailsElement) {
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.open) { menu.open = false; menu.querySelector('summary')?.focus(); }
    });
    document.addEventListener('click', event => { if (menu.open && event.target instanceof Node && !menu.contains(event.target)) menu.open = false; });
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { menu.open = false; }));
  }
  const errorSummary = document.getElementById('form-errors');
  if (errorSummary) errorSummary.focus();
  const draft = document.getElementById('email-draft');
  if (draft) draft.focus();
})();
