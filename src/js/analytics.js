'use strict';
const allowed = new Set(['buy_esim_click', 'shop_visit', 'contact_submit', 'operator_inquiry', 'seafarer_cta_click', 'crew_tool_click', 'resource_view', 'resource_download', 'inquiry_start', 'email_draft_ready', 'email_app_open', 'inquiry_copy', 'support_visit', 'account_visit', 'business_store_visit']);

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
      if (destination.origin === 'https://sim.amicusshippingllc.com' && destination.pathname === '/shop' && link.dataset.event !== 'shop_visit') track('shop_visit');
      if (destination.origin === location.origin && destination.pathname === '/contact' && link.dataset.event !== 'inquiry_start') track('inquiry_start');
    }
    if (link.dataset.event === 'contact_submit') track('email_app_open');
  });
  // Wait for deferred analytics without making the form/menu depend on its download.
  window.addEventListener('load', () => {
    if (document.getElementById('email-draft')) track('email_draft_ready');
  }, { once: true });
}
module.exports = { track, initializeAnalytics };
