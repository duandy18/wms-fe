import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // ✅ 关键提速：generated 是机器产物，不参与 eslint 扫描
  globalIgnores(['dist', 'src/contracts/generated/**']),

  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // ✅ 护栏：业务代码禁止直接引用 generated（防扩散）
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                'src/contracts/generated/*',
                'src/contracts/generated/**',
                '@/contracts/generated/*',
                '@/contracts/generated/**',
                '../generated/*',
                '../generated/**',
              ],
              message:
                '禁止业务直接引用 contracts/generated。请从 src/contracts/<domain>/contract.ts 稳定入口导入。',
            },
          ],
        },
      ],
    },
  },

  {
    // ✅ 白名单：桥接层允许读 generated（只允许 contract.ts/tsx）
    files: ['src/contracts/**/contract.ts', 'src/contracts/**/contract.tsx'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
])
