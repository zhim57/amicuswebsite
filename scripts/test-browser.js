'use strict';
const { spawn } = require('node:child_process');
const { createApp } = require('../server');

// Own the test server directly: no fixed port, existing app reuse, or orphaned
// shell process on Windows. Closing the runner also closes the HTTP listener.
// Explicit dependency injection stays inside this runner. Production cannot
// enable a fake mail transport through a request or an environment flag.
const server = createApp({ NODE_ENV: 'test' }, { contactSendMail: async () => ({ accepted: true }) }).listen(0, '127.0.0.1', () => {
  const baseURL = `http://127.0.0.1:${server.address().port}`;
  const runner = spawn(process.execPath, [require.resolve('@playwright/test/cli'), 'test', ...process.argv.slice(2)], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'test', BROWSER_TEST_URL: baseURL },
  });
  runner.on('error', error => { console.error(error.message); server.close(); process.exitCode = 1; });
  runner.on('exit', code => { server.close(); process.exitCode = code ?? 1; });
});
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
