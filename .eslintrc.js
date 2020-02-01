module.exports = {
  "env": {
    "browser": true,
    "commonjs": true,
    "es6": true
  },
  "extends": "standard",
  "globals": {
    "Atomics": "readonly",
    "SharedArrayBuffer": "readonly"
  },
  "parserOptions": {
    "ecmaVersion": 2018,
    "sourceType": "module"
  },
  "rules": {
    "comma-dangle": [0],
    "no-unused-vars": [1],
    "no-useless-constructor": [0],
    "semi": [0],
    "space-before-function-paren": [0],
  }
};
