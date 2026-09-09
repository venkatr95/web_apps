import pluginOrganizeImports from 'prettier-plugin-organize-imports';

/** @type {import("prettier").Config} */
export default {
  plugins: [pluginOrganizeImports],
  semi: true,
  singleQuote: true,
  trailingComma: 'es5',
  printWidth: 100,
  tabWidth: 2,
};
