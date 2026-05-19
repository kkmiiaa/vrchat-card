import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.test') });

export default defineConfig({
  testDir: './tests/e2e',
  globalSetup: './tests/global-setup.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3002',
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
      testMatch: /\/(lp|login|v1-editor|v1-form|static-pages|regression-card-editor|vrchat-maker|explore-vrchat|spec-legacy-maker)\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    // Step 3: ログイン済みテスト（setupに依存）
    {
      name: 'authenticated',
      testMatch: /\/(authenticated|regression-card-save|regression-card-view|regression-profile|explore-search|spec-header|spec-draft|spec-card-flow|spec-settings-auth|spec-explore|spec-legacy-maker)\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/.auth/user.json',
      },
    },
    // Step 4: モバイル未ログインテスト
    {
      name: 'mobile-unauthenticated',
      testMatch: /\/mobile\.spec\.ts/,
      use: { ...devices['iPhone 14'] },
    },
    // Step 5: モバイルログイン済みテスト
    {
      name: 'mobile-authenticated',
      testMatch: /\/mobile-authenticated\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['iPhone 14'],
        storageState: 'tests/.auth/user.json',
      },
    },
  ],
  webServer: {
    command: 'npm run dev:test',
    url: 'http://localhost:3002',
    reuseExistingServer: true,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    },
  },
});
