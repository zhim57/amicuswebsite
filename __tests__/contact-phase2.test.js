const request = require('supertest');
const nodemailer = require('nodemailer');
const { createApp } = require('../server');
const { createContact, createTokens, getContactDefaults, validateFields, contactOptions, fieldLimits } = require('../src/server/contact');
const { createMailer } = require('../src/server/mail');

const environment = { NODE_ENV: 'test', SMTP_HOST: 'smtp.example.com', SMTP_FROM: 'website@example.com', CONTACT_TO: 'inquiries@example.com', SMTP_USER: 'smtp-user', SMTP_PASS: 'SMTP_TEST_SECRET' };
const fields = { name: 'Casey Mariner', email: 'casey@example.com', company: 'Example Fleet', interest: 'Crew Connectivity', message: 'Joining in Port A, with an airport connection in Country B.' };
const origin = 'https://amicusshippingllc.com';

function contactRequest(body, headers = {}) {
  return { body, protocol: 'https', get: name => ({ host: 'amicusshippingllc.com', ...headers })[name] };
}

async function tokenFor(app) {
  const response = await request(app).get('/contact');
  return response.text.match(/name="formToken" value="([^"]+)"/)[1];
}

test('real form POST waits for accepted delivery, clears fields, and supports optional visitor type', async () => {
  const transport = { sendMail: jest.fn().mockResolvedValue({ accepted: [environment.CONTACT_TO], rejected: [] }) };
  const app = createApp(environment, { mailTransport: transport });
  const formToken = await tokenFor(app);
  const response = await request(app).post('/contact').type('form').send({ ...fields, formToken });
  expect(response.status).toBe(200);
  expect(response.headers['cache-control']).toBe('no-store');
  expect(response.text).toContain('id="contact-success"');
  expect(response.text).toContain('Your inquiry has been sent.');
  expect(response.text).not.toContain(fields.email);
  expect(response.text).not.toContain('prepared-message');
  expect(response.text).not.toContain('data-contact-form');
  expect(transport.sendMail).toHaveBeenCalledTimes(1);
  expect(transport.sendMail).toHaveBeenCalledWith(expect.objectContaining({
    from: { name: 'Amicus website', address: environment.SMTP_FROM },
    to: [{ address: environment.CONTACT_TO }],
    replyTo: { name: fields.name, address: fields.email },
    envelope: { from: environment.SMTP_FROM, to: [environment.CONTACT_TO] },
    subject: 'Amicus inquiry: Crew Connectivity',
    text: expect.stringContaining(fields.message),
  }));
});

test('SMTP failure preserves escaped fields and never exposes exception, credentials or addresses in logs', async () => {
  const log = jest.spyOn(console, 'error').mockImplementation(() => {});
  try {
    const transport = { sendMail: jest.fn().mockRejectedValue(Object.assign(new Error(`Credentials ${environment.SMTP_PASS}; /private/mail/path; ${fields.email}`), { code: 'EAUTH' })) };
    const app = createApp(environment, { mailTransport: transport });
    const formToken = await tokenFor(app);
    const message = '<script>alert("test")</script> & travel dates';
    const response = await request(app).post('/contact').type('form').send({ ...fields, formToken, message });
    expect(response.status).toBe(503);
    expect(response.text).toContain('We could not confirm your inquiry was sent.');
    expect(response.text).toContain('id="form-errors"');
    expect(response.text).toContain('&lt;script&gt;');
    expect(response.text).toContain(`value="${fields.email}"`);
    expect(response.text).not.toContain('<script>alert(');
    expect(response.text).not.toContain('id="contact-success"');
    expect(response.text).not.toContain(environment.SMTP_PASS);
    expect(response.text).not.toContain('/private/mail/path');
    expect(response.text).not.toContain('EAUTH');
    expect(log).toHaveBeenCalledWith('Contact delivery failed', { code: 'EAUTH' });
    expect(JSON.stringify(log.mock.calls)).not.toMatch(/SMTP_TEST_SECRET|casey@example.com|private\/mail/);
  } finally { log.mockRestore(); }
});

test('missing transport settings fail closed with visible direct email fallback and no synthetic success', async () => {
  const log = jest.spyOn(console, 'error').mockImplementation(() => {});
  try {
    const app = createApp({ NODE_ENV: 'test' });
    const formToken = await tokenFor(app);
    const response = await request(app).post('/contact').type('form').send({ ...fields, formToken });
    expect(response.status).toBe(503);
    expect(response.text).toContain('Prefer to email directly?');
    expect(response.text).toMatch(/href="mailto:[^"]+"/);
    expect(response.text).not.toContain('id="contact-success"');
    expect(log).toHaveBeenCalledWith('Contact delivery failed', { code: 'CONTACT_MAIL_UNAVAILABLE' });
  } finally { log.mockRestore(); }
});

test.each([
  { email: 'Casey <casey@example.com>' },
  { email: 'casey@example.com,other@example.com' },
  { email: 'casey@example.com\r\nBcc: other@example.com' },
  { name: ['Casey', 'Other'] },
  { name: 'Casey\r\nBcc: other@example.com' },
  { website: 'spam.example.com' },
  { message: 'x'.repeat(2001) },
  { interest: 'Unlisted interest' },
  { visitorType: 'Unlisted visitor' },
])('invalid submissions never reach mail delivery: %#', async overrides => {
  const sendMail = jest.fn();
  const contact = createContact({ sendMail });
  const result = await contact.process(contactRequest({ ...fields, formToken: contact.emptyForm().token, ...overrides }), origin);
  expect(result.status).toBe(400);
  expect(result.success).toBe(false);
  expect(sendMail).not.toHaveBeenCalled();
});

test('missing, tampered and expired tokens plus cross-site origins never reach mail delivery', async () => {
  const sendMail = jest.fn();
  const secret = 'test-contact-shared-secret-32-characters';
  const contact = createContact({ sendMail, secret });
  for (const formToken of ['', `${contact.emptyForm().token}x`, createTokens(secret).issue(Date.now() - 3600001)]) {
    expect((await contact.process(contactRequest({ ...fields, formToken }), origin)).status).toBe(403);
  }
  const formToken = contact.emptyForm().token;
  expect((await contact.process(contactRequest({ ...fields, formToken }, { Origin: 'https://other.example' }), origin)).status).toBe(403);
  expect((await contact.process(contactRequest({ ...fields, formToken }, { 'Sec-Fetch-Site': 'cross-site' }), origin)).status).toBe(403);
  expect(sendMail).not.toHaveBeenCalled();
});

test('simultaneous duplicate POSTs and a later refresh share one delivery', async () => {
  let accept;
  const pending = new Promise(resolve => { accept = resolve; });
  const sendMail = jest.fn().mockReturnValue(pending);
  const contact = createContact({ sendMail });
  const body = { ...fields, formToken: contact.emptyForm().token };
  const first = contact.process(contactRequest(body), origin);
  const second = contact.process(contactRequest(body), origin);
  await Promise.resolve();
  expect(sendMail).toHaveBeenCalledTimes(1);
  accept({ accepted: true });
  const results = await Promise.all([first, second]);
  expect(results.every(result => result.success && result.status === 200)).toBe(true);
  expect((await contact.process(contactRequest(body), origin)).success).toBe(true);
  expect(sendMail).toHaveBeenCalledTimes(1);
  expect((await contact.process(contactRequest({ ...body, message: 'A different inquiry.' }), origin)).status).toBe(409);
  expect(sendMail).toHaveBeenCalledTimes(1);
});

test('a failed delivery permits a deliberate retry without reporting success prematurely', async () => {
  const logger = { error: jest.fn() };
  const sendMail = jest.fn().mockRejectedValueOnce(new Error('provider raw SECRET')).mockResolvedValueOnce({ accepted: true });
  const contact = createContact({ sendMail, logger });
  const body = { ...fields, formToken: contact.emptyForm().token };
  const failed = await contact.process(contactRequest(body), origin);
  expect(failed.status).toBe(503);
  expect(failed.success).toBe(false);
  expect((await contact.process(contactRequest(body), origin)).success).toBe(true);
  expect(sendMail).toHaveBeenCalledTimes(2);
  expect(logger.error).toHaveBeenCalledWith('Contact delivery failed', { code: 'CONTACT_MAIL_FAILED' });
});

test('successful token memory has a hard bound and expires after the token lifetime', async () => {
  const clock = jest.spyOn(Date, 'now').mockReturnValue(1790000000000);
  try {
    const sendMail = jest.fn().mockResolvedValue({ accepted: true });
    const contact = createContact({ sendMail, maxSubmissions: 1 });
    const first = { ...fields, formToken: contact.emptyForm().token };
    expect((await contact.process(contactRequest(first), origin)).success).toBe(true);
    expect((await contact.process(contactRequest({ ...fields, formToken: contact.emptyForm().token }), origin)).status).toBe(503);
    clock.mockReturnValue(1790003600001);
    expect((await contact.process(contactRequest({ ...fields, formToken: contact.emptyForm().token }), origin)).success).toBe(true);
  } finally { clock.mockRestore(); }
});

test('rate limit blocks delivery despite forged forwarding headers', async () => {
  const sendMail = jest.fn().mockResolvedValue({ accepted: true });
  const app = createApp({ NODE_ENV: 'test', TRUST_PROXY: 'false' }, { contactSendMail: sendMail });
  for (let index = 0; index < 5; index += 1) {
    const formToken = await tokenFor(app);
    expect((await request(app).post('/contact').set('X-Forwarded-For', `198.51.100.${index}`).type('form').send({ ...fields, formToken })).status).toBe(200);
  }
  const formToken = await tokenFor(app);
  const blocked = await request(app).post('/contact').set('X-Forwarded-For', '198.51.100.99').type('form').send({ ...fields, formToken });
  expect(blocked.status).toBe(429);
  expect(blocked.headers['retry-after']).toBeDefined();
  expect(sendMail).toHaveBeenCalledTimes(5);
});

test('SMTP configuration requires authenticated encryption and restricts content access', async () => {
  const createTransport = jest.fn().mockReturnValue({ sendMail: jest.fn().mockResolvedValue({ accepted: [environment.CONTACT_TO], rejected: [] }) });
  const mailer = createMailer({ environment, createTransport });
  expect(createTransport).not.toHaveBeenCalled();
  await mailer.sendMail(fields);
  expect(createTransport).toHaveBeenCalledWith(expect.objectContaining({
    host: environment.SMTP_HOST, port: 587, secure: false, requireTLS: true,
    auth: { user: environment.SMTP_USER, pass: environment.SMTP_PASS },
    tls: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
    logger: false, debug: false, disableFileAccess: true, disableUrlAccess: true, maxRecipients: 1,
  }));
  const secureTransport = jest.fn().mockReturnValue({ sendMail: jest.fn().mockResolvedValue({ accepted: [environment.CONTACT_TO] }) });
  await createMailer({ environment: { ...environment, SMTP_PORT: '465', SMTP_SECURE: 'true' }, createTransport: secureTransport }).sendMail(fields);
  expect(secureTransport).toHaveBeenCalledWith(expect.objectContaining({ port: 465, secure: true, requireTLS: false }));
});

test.each([
  { SMTP_FROM: 'Invalid <website@example.com>' }, { CONTACT_TO: 'one@example.com,two@example.com' },
  { SMTP_PORT: 'abc' }, { SMTP_PORT: '465' }, { SMTP_SECURE: 'yes' }, { SMTP_PASS: '' },
])('invalid SMTP configuration never opens a transport: %#', async overrides => {
  const createTransport = jest.fn();
  const mailer = createMailer({ environment: { ...environment, ...overrides }, createTransport });
  expect(mailer.configured).toBe(false);
  await expect(mailer.sendMail(fields)).rejects.toMatchObject({ code: 'CONTACT_MAIL_CONFIGURATION' });
  expect(createTransport).not.toHaveBeenCalled();
});

test.each([
  {}, { accepted: [] }, { accepted: ['other@example.com'] },
  { accepted: [environment.CONTACT_TO], rejected: [environment.CONTACT_TO] },
])('SMTP must confirm the intended recipient; a resolved promise alone is not success: %#', async info => {
  const mailer = createMailer({ environment, transport: { sendMail: jest.fn().mockResolvedValue(info) } });
  await expect(mailer.sendMail(fields)).rejects.toMatchObject({ code: 'CONTACT_MAIL_REJECTED' });
});

test('Nodemailer renders a real plain-text MIME message locally with fixed envelope and safe Reply-To', async () => {
  const stream = nodemailer.createTransport({ streamTransport: true, buffer: true, newline: 'unix', disableFileAccess: true, disableUrlAccess: true });
  let rendered;
  const transport = { sendMail: async message => {
    rendered = await stream.sendMail(message);
    // This local acceptance result is synthetic. The stream transport sends no mail.
    return { accepted: [environment.CONTACT_TO], rejected: [] };
  } };
  const mailer = createMailer({ environment, transport });
  await expect(mailer.sendMail({ ...fields, name: 'Casey, Mariner', message: '<script>example</script> & route details' })).resolves.toEqual({ accepted: true });
  expect(rendered.envelope).toEqual({ from: environment.SMTP_FROM, to: [environment.CONTACT_TO] });
  const mime = rendered.message.toString();
  expect(mime).toContain('From: Amicus website <website@example.com>');
  expect(mime).toContain('To: inquiries@example.com');
  expect(mime).toContain('Reply-To: "Casey, Mariner" <casey@example.com>');
  expect(mime).toContain('Content-Type: text/plain; charset=utf-8');
  expect(mime).toContain('<script>example</script> & route details');
  expect(mime).not.toContain('Content-Type: text/html');
  expect(mime).not.toContain(environment.SMTP_PASS);
});

test('reviewed context preselects only known intent and never personal details or a supplied token', () => {
  const query = { visitorType: 'Seafarer', interest: 'Crew Connectivity', name: 'URL_PERSONAL_NAME', email: 'url@example.com', company: 'URL_COMPANY', phone: '555-0100', message: 'URL_MESSAGE', formToken: 'forged' };
  expect(getContactDefaults(query)).toEqual({ visitorType: 'Seafarer', interest: 'Crew Connectivity' });
  const form = createContact().emptyForm(query);
  expect(form.values).toEqual({ name: '', email: '', company: '', phone: '', message: '', visitorType: 'Seafarer', interest: 'Crew Connectivity' });
  expect(form.token).not.toBe(query.formToken);
});

test.each([
  { visitorType: 'seafarer', interest: 'Unlisted interest' },
  { visitorType: ['Seafarer'], interest: ['Crew Connectivity', 'General Inquiry'] },
  { visitorType: { value: 'Seafarer' }, interest: { value: 'Crew Connectivity' } },
  { visitorType: 'Seafarer\n', interest: '\tCrew Connectivity' },
  { visitorType: '\u0000Seafarer', interest: 'Crew Connectivity\r\nBcc: other@example.com' },
  Object.create({ visitorType: 'Seafarer', interest: 'Crew Connectivity' }),
  null, undefined, 'Seafarer', [],
])('malformed or inherited query context is ignored: %#', query => {
  expect(getContactDefaults(query)).toEqual({ visitorType: '', interest: '' });
});

test.each([
  ['name', '\nCasey'], ['company', 'Fleet\t'], ['phone', '\r555-0100'],
  ['message', '\u000BHello'], ['message', 'Hello\u000C'],
])('unsupported controls at field edges remain rejected: %s', (field, value) => {
  expect(validateFields({ ...fields, [field]: value }).errors[field]).toBe('Please remove unsupported control characters.');
});

test('message paragraphs and tabs remain intact', () => {
  const result = validateFields({ ...fields, message: 'First paragraph.\r\n\r\nRoute:\tPort A to Port B.' });
  expect(result.errors).toEqual({});
  expect(result.values.message).toBe('First paragraph.\n\nRoute:\tPort A to Port B.');
});

test('rendered form keeps server field limits, required interest and optional visitor type', async () => {
  const response = await request(createApp({ NODE_ENV: 'test' })).get('/contact');
  for (const field of ['name', 'email', 'company', 'phone', 'message']) {
    const tag = response.text.match(new RegExp(`<(?:input|textarea)\\b[^>]*\\bid="${field}"[^>]*>`));
    expect(tag).not.toBeNull();
    expect(tag[0]).toContain(`maxlength="${fieldLimits[field]}"`);
  }
  for (const option of [...contactOptions.visitorTypes, ...contactOptions.interests]) expect(response.text).toContain(`<option value="${option}"`);
  expect(response.text.match(/<select\b[^>]*id="visitorType"[^>]*>/)[0]).not.toContain('required');
  expect(response.text.match(/<select\b[^>]*id="interest"[^>]*>/)[0]).toContain('required');
  expect(response.text).toMatch(/<details class="optional-details field-full"\s*>/);
});

test('public inquiry URL selects intent without copying personal values', async () => {
  const response = await request(createApp({ NODE_ENV: 'test' })).get('/contact').query({ visitorType: 'Manning Company', interest: 'Crew Change', name: 'URL_PERSONAL_NAME', email: 'URL_PERSONAL_EMAIL@example.com', message: 'URL_PERSONAL_MESSAGE' });
  expect(response.status).toBe(200);
  expect(response.text).toContain('<option value="Manning Company" selected>');
  expect(response.text).toContain('<option value="Crew Change" selected>');
  expect(response.text).not.toContain('URL_PERSONAL_');
});

test('optional-detail validation expands the section with error associations and bounded values', async () => {
  const app = createApp({ NODE_ENV: 'test' });
  const formToken = await tokenFor(app);
  const response = await request(app).post('/contact').type('form').send({ ...fields, formToken, phone: '5'.repeat(fieldLimits.phone + 1) });
  expect(response.status).toBe(400);
  expect(response.text).toContain('<details class="optional-details field-full" open>');
  expect(response.text).toContain('aria-invalid="true" aria-describedby="phone-error"');
  expect(response.text).toContain(`value="${'5'.repeat(fieldLimits.phone)}"`);
  expect(response.text).toContain(`value="${fields.name}"`);
  expect(response.text).toContain(fields.message);
});
