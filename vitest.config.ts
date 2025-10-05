import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./vitest.setup.ts'],
      css: true,
      pool: 'forks',
      env: {
        VITE_ENVIRONMENT: 'development',
      },
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          'src/**/*.test.{ts,tsx}',
          'src/**/*.spec.{ts,tsx}',
          'src/mocks/**',
          'src/types/api-generated.ts',
          'src/**/*.d.ts',
          'src/main.tsx',
          'src/vite-env.d.ts',
        ],
        thresholds: {
          lines: 40,        // Current: 44.38% - Set slightly below to allow flexibility
          functions: 50,    // Current: 56.25%
          branches: 70,     // Current: 73.27%
          statements: 40,   // Current: 44.38%
        },
      },
    },
  })
)
