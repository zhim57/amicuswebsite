module.exports = [
  { ignores: ['node_modules/**', 'public/**', 'src/js/generate_*.js', 'src/js/test_soap.js', '.qa/**', '.npm/**'] },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022, sourceType: 'script',
      globals: Object.fromEntries(['require', 'module', '__dirname', 'process', 'console', 'Buffer', 'URL', 'window', 'document', 'navigator', 'location', 'Element', 'HTMLElement', 'HTMLAnchorElement', 'HTMLDetailsElement', 'Node', 'innerWidth', 'test', 'expect', 'beforeAll', 'beforeEach', 'afterAll', 'afterEach', 'jest'].map(name => [name, 'readonly']))
    },
    rules: { 'no-undef': 'error', 'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }], 'no-debugger': 'error', 'no-eval': 'error', 'valid-typeof': 'error', 'no-constant-condition': 'error', 'no-duplicate-case': 'error', 'no-dupe-keys': 'error', 'no-unreachable': 'error', 'constructor-super': 'error' }
  }
];
