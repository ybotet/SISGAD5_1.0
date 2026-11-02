const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  { ignores: ['node_modules/**', 'coverage/**', 'dist/**', 'docs/swagger.json'] },
  {
    files: ['**/*.js'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
    rules: {
      'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none' }],
      'no-undef': 'error',
    },
  },
];

module.exports.push({
  files: ['**/*.test.js', '**/*.spec.js', 'tests/**', '__tests__/**'],
  languageOptions: { globals: { ...require('globals').jest } },
});
