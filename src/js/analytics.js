'use strict';
const allowed = new Set(['buy_esim_click', 'shop_visit', 'contact_submit', 'operator_inquiry', 'seafarer_cta_click', 'crew_change_click', 'resource_view', 'resource_cta_click', 'inquiry_start', 'support_visit', 'account_visit', 'business_store_visit']);

/** @param {string | undefined} name */
function track(name) {
  if (!name || !allowed.has(name) || navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true) return;
  if (window.umami && typeof window.umami.track === 'function') {
    try { Promise.resolve(window.umami.track(name, { page: location.pathname })).catch(() => {}); } catch { /* Analytics never blocks an action. */ }
  }
}
function initializeAnalytics() {
  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest('a, [data-event]');
    if (!(link instanceof HTMLElement)) return;
    track(link.dataset.event);
    if (link instanceof HTMLAnchorElement) {
      // Count store intent from the reviewed destination, including seafarer CTAs.
      const destination = new URL(link.href);
      if (destination.origin === 'https://sim.amicusshippingllc.com' && destination.pathname === '/shop') {
        if (link.dataset.event !== 'shop_visit') track('shop_visit');
        if (link.dataset.event !== 'buy_esim_click') track('buy_esim_click');
      }
      if (destination.origin === location.origin && destination.pathname === '/contact' && link.dataset.event !== 'inquiry_start') track('inquiry_start');
    }
  });
  // Wait for deferred analytics without making the form/menu depend on its download.
  window.addEventListener('load', () => {
    if (document.getElementById('contact-success')) track('contact_submit');
    if (document.querySelector('[data-resource-article]')) track('resource_view');
  }, { once: true });
}
module.exports = { track, initializeAnalytics };
