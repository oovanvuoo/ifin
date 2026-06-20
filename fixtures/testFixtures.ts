import { test as base } from "@playwright/test";
import { LoginPage } from "../pages/auth/LoginPage";
import { SignupPage } from "../pages/auth/SignupPage";
import { OtpPage } from "../pages/auth/OtpPage";
import { CtvPage } from "../pages/ctv/CtvPage";
import { AuthAssertions } from "../assertions/auth/AuthAssertions";
import { CtvAssertions } from "../assertions/ctv/CtvAssertions";

type UiFixtures = {
  loginPage: LoginPage;
  signupPage: SignupPage;
  otpPage: OtpPage;
  ctvPage: CtvPage;
  authAssertions: AuthAssertions;
  ctvAssertions: CtvAssertions;
};

export const test = base.extend<UiFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  signupPage: async ({ page }, use) => {
    await use(new SignupPage(page));
  },
  otpPage: async ({ page }, use) => {
    await use(new OtpPage(page));
  },
  ctvPage: async ({ page }, use) => {
    await use(new CtvPage(page));
  },
  authAssertions: async ({ page }, use) => {
    await use(new AuthAssertions(page));
  },
  ctvAssertions: async ({ page }, use) => {
    await use(new CtvAssertions(page));
  }
});

test.afterEach(async ({ page }, testInfo) => {
  const isFailed = testInfo.status !== testInfo.expectedStatus;
  if (!isFailed) {
    return;
  }

  const screenshot = await page.screenshot({ fullPage: true });
  await testInfo.attach("failure-fullpage", {
    body: screenshot,
    contentType: "image/png"
  });
});

export { expect } from "@playwright/test";
