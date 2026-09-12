const crypto = require('crypto');

const visitorTypes = ['Ship Operator / Manager', 'Manning Company', 'Ship Agent', 'Seafarer', 'Other'];
const interests = ['Crew Connectivity', 'Crew Change', 'Maritime Tools', 'General Inquiry'];
const fieldLimits = { name: 100, email: 254, company: 140, visitorType: 40, interest: 40, message: 2000, phone: 60 };
const contactOptions = { visitorTypes, interests, fieldLimits };
const tokenLifetimeMs = 60 * 60 * 1000;

// Only explicit, known intent selections may arrive through a shareable URL.
// Names, addresses, messages, arrays and arbitrary query values are never copied.
function getContactDefaults(query = {}) {
  const source = query && typeof query === 'object' && !Array.isArray(query) ? query : {};
  return {
    visitorType: Object.hasOwn(source, 'visitorType') && typeof source.visitorType === 'string' && visitorTypes.includes(source.visitorType) ? source.visitorType : '',
    interest: Object.hasOwn(source, 'interest') && typeof source.interest === 'string' && interests.includes(source.interest) ? source.interest : '',
  };
}

function createTokens(secret = crypto.randomBytes(32).toString('hex')) {
  if (typeof secret !== 'string' || secret.length < 32) throw new Error('CONTACT_FORM_SECRET must contain at least 32 characters.');
  const sign = (payload) => crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return {
    issue(now = Date.now()) {
      const payload = `${now}.${crypto.randomBytes(16).toString('hex')}`;
      return `${payload}.${sign(payload)}`;
    },
    verify(token, now = Date.now()) {
      if (typeof token !== 'string' || !/^\d{13}\.[a-f0-9]{32}\.[A-Za-z0-9_-]{43}$/.test(token)) return false;
      const [timestamp, random, signature] = token.split('.');
      const age = now - Number(timestamp);
      if (age < 0 || age > tokenLifetimeMs) return false;
      const expected = Buffer.from(sign(`${timestamp}.${random}`));
      const received = Buffer.from(signature);
      return expected.length === received.length && crypto.timingSafeEqual(expected, received);
    },
  };
}

function createRateLimit({ maximum = 5, windowMs = 15 * 60 * 1000, maxEntries = 10000 } = {}) {
  const clients = new Map();
  let nextSweep = 0;
  return (req, res, next) => {
    const now = Date.now();
    if (now >= nextSweep || clients.size >= maxEntries) {
      for (const [key, client] of clients) if (client.resetAt <= now) clients.delete(key);
      nextSweep = now + 60000;
    }
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    let client = clients.get(key);
    // A full map fails closed until entries expire, rather than evicting active limits.
    if (!client && clients.size >= maxEntries) {
      res.set('Retry-After', '60');
      return next(Object.assign(new Error('Contact attempt limit reached.'), { status: 429 }));
    }
    if (!client || client.resetAt <= now) {
      client = { count: 0, resetAt: now + windowMs };
      clients.set(key, client);
    }
    client.count += 1;
    const retryAfter = Math.max(1, Math.ceil((client.resetAt - now) / 1000));
    res.set({
      'RateLimit-Limit': String(maximum),
      'RateLimit-Remaining': String(Math.max(0, maximum - client.count)),
      'RateLimit-Reset': String(retryAfter),
    });
    if (client.count > maximum) {
      res.set('Retry-After', String(retryAfter));
      return next(Object.assign(new Error('Contact attempt limit reached.'), { status: 429 }));
    }
    return next();
  };
}

function validateFields(body = {}) {
  const values = {};
  const errors = {};
  for (const [field, maximum] of Object.entries(fieldLimits)) {
    const raw = body[field];
    if (raw !== undefined && typeof raw !== 'string') errors[field] = 'Please enter a single value.';
    const normalized = typeof raw === 'string' ? raw.replace(/\r\n?/g, '\n') : '';
    const value = normalized.trim();
    values[field] = value.slice(0, maximum);
    if (value.length > maximum) errors[field] = `Please use no more than ${maximum} characters.`;
    const controls = field === 'message' ? /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/ : /[\u0000-\u001F\u007F]/;
    if (controls.test(normalized)) errors[field] = 'Please remove unsupported control characters.';
  }
  if (!values.name) errors.name = 'Please enter your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'Please enter a valid email address.';
  if (!visitorTypes.includes(values.visitorType)) errors.visitorType = 'Please select your visitor type.';
  if (!interests.includes(values.interest)) errors.interest = 'Please select an area of interest.';
  if (!values.message) errors.message = 'Please add a message.';
  if (body.website !== undefined && body.website !== '') errors.form = 'The inquiry could not be prepared. Please try again.';
  return { values, errors };
}

function createContact({ secret } = {}) {
  const tokens = createTokens(secret || undefined);
  function emptyForm(query = {}) {
    const values = { ...Object.fromEntries(Object.keys(fieldLimits).map((field) => [field, ''])), ...getContactDefaults(query) };
    return { values, errors: {}, token: tokens.issue(), preparedMailto: '', preparedBody: '', preparedSubject: '', success: false };
  }
  return {
    emptyForm,
    rateLimit: createRateLimit(),
    process(req, canonicalOrigin, recipient) {
      const { values, errors } = validateFields(req.body);
      const form = { ...emptyForm(), values, errors, status: 400 };
      const origin = req.get('Origin');
      const localOrigin = `${req.protocol}://${req.get('host')}`;
      if (req.get('Sec-Fetch-Site') === 'cross-site' || (origin && origin !== canonicalOrigin && origin !== localOrigin)) {
        form.errors.form = 'Please prepare your inquiry using the contact page on this site.';
        form.status = 403;
        return form;
      }
      if (!tokens.verify(req.body && req.body.formToken)) {
        form.errors.form = 'This form has expired. Please review your details and prepare your email again.';
        form.status = 403;
        return form;
      }
      if (Object.keys(errors).length) return form;
      const body = [
        `Name: ${values.name}`, `Email: ${values.email}`, `Company: ${values.company || 'Not provided'}`,
        `Visitor type: ${values.visitorType}`, `Interested in: ${values.interest}`,
        `Phone / WhatsApp: ${values.phone || 'Not provided'}`, '', values.message,
      ].join('\n');
      form.preparedSubject = `Amicus inquiry: ${values.interest}`;
      form.preparedMailto = `mailto:${recipient}?subject=${encodeURIComponent(form.preparedSubject)}&body=${encodeURIComponent(body)}`;
      form.preparedBody = body;
      form.status = 200;
      // This endpoint prepares a draft. No mail transport or delivery exists here.
      return form;
    },
  };
}

module.exports = { createContact, createTokens, createRateLimit, validateFields, getContactDefaults, contactOptions, fieldLimits, visitorTypes, interests };
