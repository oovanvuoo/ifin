import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

const resolveEnvFile = (): string => {
  if (process.env.ENV_FILE) {
    return process.env.ENV_FILE;
  }

  const envName = (process.env.ENV ?? "stg").toLowerCase();
  const envMap: Record<string, string> = {
    stg: ".env.staging",
    staging: ".env.staging",
    uat: ".env.uat",
    prod: ".env.prod",
    production: ".env.prod"
  };

  return envMap[envName] ?? ".env.staging";
};

dotenv.config({ path: resolveEnvFile(), override: true });

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 4,
  timeout: 60_000,
  outputDir: "test-results",
  preserveOutput: "always",
  use: {
    baseURL: process.env.BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  reporter: [
    ["html", { open: "never" }],
    ["allure-playwright"]
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] }
    }
  ]
});
