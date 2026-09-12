const request = require('supertest');
const { createApp } = require('../server');
const { getContactDefaults, createContact, validateFields, contactOptions, fieldLimits } = require('../src/server/contact');

function validFields(overrides = {}) {
  return { name: 'Casey Mariner', email: 'casey@example.com', visitorType: 'Seafarer', interest: 'Crew Connectivity', message: 'Please help with my upcoming journey.', ...overrides };
}

test('context accepts only known selections and cannot prefill personal or message fields', () => {
  const query = { visitorType: 'Seafarer', interest: 'Crew Connectivity', name: 'Injected name', email: 'injected@example.com', company: 'Injected company', phone: '555-0100', message: 'Injected message', formToken: 'forged' };
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
])('invalid context is ignored instead of interpreted: %#', query => {
  expect(getContactDefaults(query)).toEqual({ visitorType: '', interest: '' });
});

test.each([
  ['name', '\nCasey'], ['company', 'Fleet\t'], ['phone', '\r555-0100'],
  ['message', '\u000BHello'], ['message', 'Hello\u000C'],
])('unsupported controls are rejected even at the edges of %s', (field, value) => {
  const result = validateFields(validFields({ [field]: value }));
  expect(result.errors[field]).toBe('Please remove unsupported control characters.');
});

test('message paragraphs and tabs remain usable', () => {
  const result = validateFields(validFields({ message: 'First paragraph.\r\n\r\nRoute:\tPort A to Port B.' }));
  expect(result.errors).toEqual({});
  expect(result.values.message).toBe('First paragraph.\n\nRoute:\tPort A to Port B.');
});

test('contact page uses server field limits and selection options', async () => {
  const response = await request(createApp({ NODE_ENV: 'test' })).get('/contact');
  expect(response.status).toBe(200);
  for (const field of ['name', 'email', 'company', 'phone', 'message']) {
    const tag = response.text.match(new RegExp(`<(?:input|textarea)\\b[^>]*\\bid="${field}"[^>]*>`));
    expect(tag).not.toBeNull();
    expect(tag[0]).toContain(`maxlength="${fieldLimits[field]}"`);
  }
  for (const option of [...contactOptions.visitorTypes, ...contactOptions.interests]) {
    expect(response.text).toContain(`<option value="${option}"`);
  }
  expect(response.text).toMatch(/<details class="optional-details field-full"\s*>/);
});

test('public inquiry link selects intent without inserting URL-supplied personal data', async () => {
  const response = await request(createApp({ NODE_ENV: 'test' })).get('/contact').query({ visitorType: 'Manning Company', interest: 'Crew Change', name: 'URL_PERSONAL_NAME', email: 'URL_PERSONAL_EMAIL@example.com', message: 'URL_PERSONAL_MESSAGE' });
  expect(response.status).toBe(200);
  expect(response.text).toContain('<option value="Manning Company" selected>');
  expect(response.text).toContain('<option value="Crew Change" selected>');
  expect(response.text).not.toContain('URL_PERSONAL_');
});

test('prepared email exposes a selectable subject and body, with manual sending instructions', async () => {
  const app = createApp({ NODE_ENV: 'test' });
  const get = await request(app).get('/contact');
  const formToken = get.text.match(/name="formToken" value="([^"]+)"/)[1];
  const response = await request(app).post('/contact').type('form').send({ ...validFields({ company: 'Example Fleet' }), formToken });
  expect(response.status).toBe(200);
  expect(response.text).toContain('id="prepared-subject" type="text" value="Amicus inquiry: Crew Connectivity" readonly');
  expect(response.text).toContain('id="prepared-message" rows="8" readonly');
  expect(response.text).toContain('data-copy-message hidden');
  expect(response.text).toContain('id="copy-message-status" role="status" aria-live="polite"');
  expect(response.text).toContain('Your inquiry has not been sent yet.');
  expect(response.text).toContain('<details class="optional-details field-full" open>');
  expect(response.text).toContain('value="Example Fleet"');
});

test('optional detail validation errors expand the section and retain submitted values', async () => {
  const app = createApp({ NODE_ENV: 'test' });
  const get = await request(app).get('/contact');
  const formToken = get.text.match(/name="formToken" value="([^"]+)"/)[1];
  const response = await request(app).post('/contact').type('form').send({ ...validFields({ phone: '5'.repeat(fieldLimits.phone + 1) }), formToken });
  expect(response.status).toBe(400);
  expect(response.text).toContain('<details class="optional-details field-full" open>');
  expect(response.text).toContain('aria-invalid="true" aria-describedby="phone-error"');
  expect(response.text).toContain(`value="${'5'.repeat(fieldLimits.phone)}"`);
  expect(response.text).toContain('value="Casey Mariner"');
  expect(response.text).toContain('Please help with my upcoming journey.');
  expect(response.text).not.toContain('id="prepared-message"');
});
