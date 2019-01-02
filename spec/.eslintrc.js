module.exports = {
  env: {
    atomtest: true,
    jasmine: true,
  },
  rules: {
    "import/no-extraneous-dependencies": [
      "error",
      {
        "devDependencies": true
      }
    ],
    "object-curly-newline": ["error", {
      "ImportDeclaration": "never",
    }]
  }
};
