import type { Page } from "@playwright/test";
import { testEnv } from "../config/testEnv";

/**
 * Full UI login flow: navigate to /login, request OTP, fill OTP, verify.
 * After success the page will have navigated away from /otp and /login.
 */
export async function loginWithOtp(
  page: Page,
  phone: string = testEnv.testPhone,
  otp: string = testEnv.otpDefault
): Promise<void> {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.getByLabel(/Số điện thoại/i).fill(phone);
  await page.getByRole("button", { name: /Gửi mã OTP/i }).click();
  await page.waitForURL(/\/otp/, { timeout: 15_000 });
  await fillOtpInputs(page, otp);
  await page.getByRole("button", { name: /Xác thực.*đăng nhập/i }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/otp") && !url.pathname.startsWith("/login"), {
    timeout: 15_000
  });
}

/**
 * Fill OTP inputs. Supports both single-input and multi-box layouts.
 */
export async function fillOtpInputs(page: Page, otp: string): Promise<void> {
  const inputs = page.locator("input");
  const count = await inputs.count();

  if (count >= otp.length) {
    for (let i = 0; i < otp.length; i++) {
      await inputs.nth(i).fill(otp[i]);
    }
  } else {
    await inputs.first().click();
    await page.keyboard.type(otp);
  }
}
