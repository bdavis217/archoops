module.exports = {
  root: true,
  env: { browser: true, node: true, es2023: true },
  parser: "@typescript-eslint/parser",
  parserOptions: { ecmaVersion: "latest", sourceType: "module", project: false },
  plugins: ["@typescript-eslint", "react", "react-hooks"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  settings: { react: { version: "18.0" } },
  ignorePatterns: ["dist", "build", "node_modules"],
  rules: {
    "react/react-in-jsx-scope": "off"
  }
};
