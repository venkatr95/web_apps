import tseslint from 'typescript-eslint';
import eslintPluginImport from 'eslint-plugin-import';
import nodePlugin from 'eslint-plugin-n';

export default [
  ...tseslint.configs.recommendedTypeChecked, // uses your tsconfig.json
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      import: eslintPluginImport,
      node: nodePlugin,
    },
    rules: {
      // TypeScript-specific
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      quotes: ['error', 'double', { avoidEscape: true }],
      // Import sorting
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      // Node.js specific
      'n/no-unsupported-features/es-syntax': 'off', // allow ESModules
      'n/no-missing-import': 'off', // handled by TS
    },
  },
];