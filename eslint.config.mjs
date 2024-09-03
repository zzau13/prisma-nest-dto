import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  ...tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
  ),{
    ignores: [
    'node_modules',
    'coverage',
    'dist',
    '.env',
    '/src/@generated',
    '.gitignore',
    'package-lock.json',
    '.idea',
    'book',
  ],
}];
