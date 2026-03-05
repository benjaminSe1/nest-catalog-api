import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';
import sonarjs from 'eslint-plugin-sonarjs';
import security from 'eslint-plugin-security';

export default [
  js.configs.recommended,

  ...tseslint.configs.strict,

  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
          alwaysTryTypes: true,
        },
        node: true,
      },
    },

    plugins: {
      import: importPlugin,
      'unused-imports': unusedImports,
      sonarjs,
      security,
    },

    rules: {
      /*
       * GENERAL
       */

      'no-console': 'warn',
      'no-debugger': 'error',

      /*
       * TYPESCRIPT
       */

      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'error',

      /*
       * IMPORTS
       */

      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
        },
      ],

      'import/no-unresolved': 'error',

      /*
       * UNUSED IMPORTS
       */

      'unused-imports/no-unused-imports': 'error',

      '@typescript-eslint/no-unused-vars': 'off',

      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      /*
       * CODE QUALITY
       */

      'sonarjs/cognitive-complexity': ['warn', 15],

      /*
       * SECURITY
       */

      'security/detect-object-injection': 'off',
    },
  },
  {
    files: ['**/*.module.ts'],
    rules: {
      '@typescript-eslint/no-extraneous-class': 'off',
    },
  },
];
