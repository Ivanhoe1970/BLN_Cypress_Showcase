const prettier = require("eslint-plugin-prettier");

module.exports = [
  {
    files: ["automated-basic-non-gas-alert-protocol/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module"
    },
    plugins: {
      prettier
    },
    rules: {
      "prettier/prettier": "warn"
    }
  }
];
