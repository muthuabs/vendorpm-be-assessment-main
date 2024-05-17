module.exports = {
  root: true,
  env: {
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
    'prettier',
    'plugin:@typescript-eslint/recommended',
  ],
  parserOptions: {
    project: './tsconfig.eslint.json',
  },
  rules: {
    'arrow-body-style': ['error', 'always'],
    'no-use-before-define': 'error',
    'prefer-destructuring': ['error', { object: true, array: false }],
    'require-await': 'off',
    'no-console': 'off',
    'import/prefer-default-export': 'off',
    // Note: you must disable the base rule as it can report incorrect errors
    "no-redeclare": "off",
    "@typescript-eslint/no-redeclare": "error"
  },
};
