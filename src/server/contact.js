const crypto = require('crypto');

const visitorTypes = ['Ship Operator / Manager', 'Manning Company', 'Ship Agent', 'Seafarer', 'Other'];
const interests = ['Crew Connectivity', 'eSIM / Travel Connectivity', 'Crew Change', 'Maritime Tools', 'Petroleum / Training', 'General Inquiry'];
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
  if (!/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,}$/.test(values.email)) errors.email = 'Please enter a valid email address.';
  if (values.visitorType && !visitorTypes.includes(values.visitorType)) errors.visitorType = 'Please select a listed visitor type or leave it blank.';
  if (!interests.includes(values.interest)) errors.interest = 'Please select an area of interest.';
  if (!values.message) errors.message = 'Please add a message.';
  if (body.website !== undefined && body.website !== '') errors.form = 'The inquiry could not be sent. Please try again.';
  return { values, errors };
}

function createContact({ secret, sendMail, logger = console, maxSubmissions = 10000 } = {}) {
  const tokens = createTokens(secret || undefined);
  // Keep only signed tokens, payload hashes and delivery outcomes, never inquiry text.
  // The promise reserves a token before delivery so concurrent retries cannot send twice.
  const submissions = new Map();
  function emptyForm(query = {}) {
    const values = { ...Object.fromEntries(Object.keys(fieldLimits).map((field) => [field, ''])), ...getContactDefaults(query) };
    return { values, errors: {}, token: tokens.issue(), success: false };
  }
  return {
    emptyForm,
    rateLimit: createRateLimit(),
    async process(req, canonicalOrigin) {
      const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
      const { values, errors } = validateFields(body);
      const form = { ...emptyForm(), values, errors, status: 400 };
      const origin = req.get('Origin');
      const localOrigin = `${req.protocol}://${req.get('host')}`;
      if (req.get('Sec-Fetch-Site') === 'cross-site' || (origin && origin !== canonicalOrigin && origin !== localOrigin)) {
        form.errors.form = 'Please send your inquiry using the contact page on this site.';
        form.status = 403;
        return form;
      }
      if (!tokens.verify(body.formToken)) {
        form.errors.form = 'This form has expired. Please review your details and send your inquiry again.';
        form.status = 403;
        return form;
      }
      if (Object.keys(errors).length) return form;

      const now = Date.now();
      for (const [token, submission] of submissions) if (submission.expiresAt <= now) submissions.delete(token);
      const fingerprint = crypto.createHash('sha256').update(JSON.stringify(values)).digest('hex');
      let submission = submissions.get(body.formToken);
      if (submission && submission.fingerprint !== fingerprint) {
        form.status = 409;
        form.errors.form = 'This form was already submitted. Review your details and send this new inquiry again.';
        return form;
      }
      if (!submission && submissions.size >= maxSubmissions) {
        form.status = 503;
        form.errors.form = 'We could not confirm your inquiry was sent. Please try again later or use the email address below.';
        return form;
      }
      if (!submission) {
        submission = {
          fingerprint,
          expiresAt: Number(body.formToken.split('.')[0]) + tokenLifetimeMs,
          delivery: Promise.resolve().then(async () => {
            if (typeof sendMail !== 'function') throw Object.assign(new Error('Mail unavailable'), { code: 'CONTACT_MAIL_UNAVAILABLE' });
            const result = await sendMail(values);
            if (!result || result.accepted !== true) throw Object.assign(new Error('Mail not accepted'), { code: 'CONTACT_MAIL_REJECTED' });
          }),
        };
        submissions.set(body.formToken, submission);
      }
      try {
        await submission.delivery;
        form.status = 200;
        form.success = true;
        form.values = emptyForm().values;
      } catch (error) {
        submissions.delete(body.formToken);
        const allowedCodes = ['CONTACT_MAIL_UNAVAILABLE', 'CONTACT_MAIL_REJECTED', 'CONTACT_MAIL_CONFIGURATION', 'EAUTH', 'ECONNECTION', 'ETIMEDOUT', 'ESOCKET', 'EENVELOPE', 'EMESSAGE', 'EDNS', 'ETLS'];
        // SMTP errors can include credentials, message content or recipient addresses.
        // Emit an allowlisted code only; never serialize the exception or request.
        logger.error('Contact delivery failed', { code: allowedCodes.includes(error && error.code) ? error.code : 'CONTACT_MAIL_FAILED' });
        form.status = 503;
        form.errors.form = 'We could not confirm your inquiry was sent. Please try again later or use the email address below.';
      }
      return form;
    },
  };
}

module.exports = { createContact, createTokens, createRateLimit, validateFields, getContactDefaults, contactOptions, fieldLimits, visitorTypes, interests };
