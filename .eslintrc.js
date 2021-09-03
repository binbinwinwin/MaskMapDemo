module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
  ],
  parserOptions: {
    parser: 'babel-eslint',
  },
  rules: {
    'no-console': 'off',
    'no-irregular-whitespace':'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
  },

};
