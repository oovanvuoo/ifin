import { test as base } from "@playwright/test";
import { HomePage } from "../pages/ui/HomePage.js";
import { LoginPage } from "../pages/auth/LoginPage.js";
import { SignupPage } from "../pages/auth/SignupPage.js";
import { OtpPage } from "../pages/auth/OtpPage.js";
import { CtvPage } from "../pages/ctv/CtvPage.js";
import { AuthAssertions } from "../assertions/auth/AuthAssertions.js";
import { CtvAssertions } from "../assertions/ctv/CtvAssertions.js";
import { SamnonitePage } from "../pages/SamnonitePage.js";

type UiFixtures = {
  homePage: HomePage;
  loginPage: LoginPage;
  signupPage: SignupPage;
  otpPage: OtpPage;
  ctvPage: CtvPage;
  authAssertions: AuthAssertions;
  ctvAssertions: CtvAssertions;
  samnonitePage: SamnonitePage;
};

export const test = base.extend<UiFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
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
  },
  samnonitePage: async ({ page }, use) => {
    await use(new SamnonitePage(page));
  }
});

// test.afterEach(async ({ page }, testInfo) => {
//   const isFailed = testInfo.status !== testInfo.expectedStatus;
//   if (!isFailed) {
//     return;
//   }

//   const screenshot = await page.screenshot({ fullPage: true });
//   await testInfo.attach("failure-fullpage", {
//     body: screenshot,
//     contentType: "image/png"
//   });
// });

export { expect } from "@playwright/test";
