import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.test') });

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // Step 1: 認証セッションを取得
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    // Step 2: 未ログインテスト
    {
      name: 'unauthenticated',
      testMatch: /\/(lp|login|v1-editor|v1-form|static-pages|regression-card-editor)\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    // Step 3: ログイン済みテスト（setupに依存）
    {
      name: 'authenticated',
      testMatch: /\/(authenticated|regression-card-save|regression-card-view|regression-profile)\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/.auth/user.json',
      },
    },
  ],
  webServer: {
    command: 'npm run dev -- --port 3001',
    url: 'http://localhost:3001',
    reuseExistingServer: true,
  },
});
