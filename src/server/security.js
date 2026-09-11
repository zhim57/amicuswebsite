const crypto = require('crypto');

function parseTrustProxy(value) {
  if (!value || value === 'false' || value === '0') return false;
  if (/^[1-9]\d?$/.test(value)) return Number(value);
  const addresses = value.split(',').map((address) => address.trim());
  if (addresses.every((address) => /^(loopback|linklocal|uniquelocal|[\da-fA-F:.]+(?:\/\d{1,3})?)$/.test(address))) return addresses;
  throw new Error('TRUST_PROXY must be false, a hop count, or a comma-separated list of trusted proxy addresses/CIDRs.');
}

function securityHeaders({ production, analyticsOrigin }) {
  let analytics = '';
  if (analyticsOrigin) {
    const origin = new URL(analyticsOrigin);
    if (origin.protocol !== 'https:') throw new Error('Analytics requires an HTTPS origin.');
    analytics = ` ${origin.origin}`;
  }

  return (req, res, next) => {
    const nonce = crypto.randomBytes(18).toString('base64');
    res.locals.cspNonce = nonce;
    res.set({
      'Content-Security-Policy': [
        "default-src 'self'",
        `script-src 'self' 'nonce-${nonce}'${analytics}`,
        "style-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        `connect-src 'self'${analytics}`,
        "object-src 'none'",
        "base-uri 'none'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "frame-src 'none'",
      ].join('; '),
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'same-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
      'X-Frame-Options': 'DENY',
      'X-DNS-Prefetch-Control': 'off',
    });
    if (production) res.set('Strict-Transport-Security', 'max-age=15552000');
    next();
  };
}

module.exports = { parseTrustProxy, securityHeaders };
