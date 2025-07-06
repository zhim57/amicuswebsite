const request = require('supertest');
const fs = require('fs');
const path = require('path');
const os = require('os');

let tempDir;
let app;

beforeAll(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uploads-'));
  process.env.UPLOAD_DIR = tempDir;
  app = require('../server');
});

afterAll(() => {
  fs.rmSync(tempDir, { recursive: true, force: true });
  delete process.env.UPLOAD_DIR;
});

test('GET /files returns uploaded files', async () => {
  const sampleFile = path.join(tempDir, 'test.pdf');
  fs.writeFileSync(sampleFile, 'dummy');

  const res = await request(app).get('/files');
  expect(res.statusCode).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body).toContain('test.pdf');
});

test('POST /upload rejects invalid file type', async () => {
  const invalidFile = path.join(tempDir, 'bad.txt');
  fs.writeFileSync(invalidFile, 'no');

  const res = await request(app)
    .post('/upload')
    .attach('file', invalidFile);

  expect(res.statusCode).toBe(400);
});
