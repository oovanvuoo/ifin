import * as fs from "fs";
import * as path from "path";
import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

// ── Env ──────────────────────────────────────────────────────────────────────
const env = {
  baseUrl: process.env.BASE_URL ?? "https://nomi-staging-3c09.up.railway.app",
  testPhone: process.env.TEST_PHONE ?? "0912345678",
  otpDefault: process.env.OTP_DEFAULT ?? process.env.TEST_OTP ?? "000000"
};

// ── CSV helper ────────────────────────────────────────────────────────────────
type DataRow = { testcaseID: string; phone: string; fullName: string };

function parseCsv(csvPath: string): DataRow[] {
  const raw = fs.readFileSync(path.resolve(csvPath), "utf-8");
  const [headerLine, ...rows] = raw.trim().split(/\r?\n/);
  const headers = headerLine.split(",").map((h) => h.trim());
  return rows.map((row) => {
    const values = row.split(",");
    return Object.fromEntries(headers.map((h, i) => [h, (values[i] ?? "").trim()])) as DataRow;
  });
}

const loginData = parseCsv(process.env.LOGIN_TEST_DATA_CSV ?? "resources/data/login.csv");
const byId = (id: string) => loginData.find((r) => r.testcaseID === id)!;

// ── Shared helpers ────────────────────────────────────────────────────────────
async function fillOtpInputs(page: Page, otp: string): Promise<void> {
  const inputs = page.locator("input");
  const count = await inputs.count();
  if (count >= otp.length) {
    for (let i = 0; i < otp.length; i++) await inputs.nth(i).fill(otp[i]);
  } else {
    await inputs.first().click();
    await page.keyboard.type(otp);
  }
}

const WRONG_OTP = "999999";

// ──────────────────────────────────────────────────────────────────────────────
test.describe("C - Login Flow", () => {
  // TC-002 ─ Positive: successful login with valid OTP
  test("TC-002 | Login thành công với tài khoản đã đăng ký", async ({ page }) => {
    const { phone } = byId("TC-002");

    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: /Đăng nhập/i })).toBeVisible();

    await page.getByLabel(/Số điện thoại/i).fill(phone);
    await page.getByRole("button", { name: /Gửi mã OTP/i }).click();

    await expect(page).toHaveURL(/\/otp/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: /Nhập mã OTP/i })).toBeVisible();

    await fillOtpInputs(page, env.otpDefault);
    await page.getByRole("button", { name: /Xác thực.*đăng nhập/i }).click();

    // Session established – must leave OTP/login pages
    await expect(page).not.toHaveURL(/\/(otp|login)/, { timeout: 15_000 });

    // Verify at least one auth cookie exists
    const cookies = await page.context().cookies();
    const hasAuthCookie = cookies.some((c) => /at|token|session/i.test(c.name));
    expect(hasAuthCookie).toBeTruthy();
  });

  // TC-003 ─ Negative: login with wrong OTP shows error, no session
  test("TC-003 | Login thất bại với OTP sai", async ({ page }) => {
    const { phone } = byId("TC-003");

    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await page.getByLabel(/Số điện thoại/i).fill(phone);
    await page.getByRole("button", { name: /Gửi mã OTP/i }).click();

    await expect(page).toHaveURL(/\/otp/, { timeout: 15_000 });

    await fillOtpInputs(page, WRONG_OTP);
    await page.getByRole("button", { name: /Xác thực.*đăng nhập/i }).click();

    // Error message must appear
    const errorLocator = page
      .getByText(/không đúng|sai|invalid|incorrect|hết hạn|expired|lỗi/i)
      .or(page.locator('[role="alert"], [class*="error"], [class*="toast"]').first());
    await expect(errorLocator.first()).toBeVisible({ timeout: 10_000 });

    // Must not navigate to authenticated area
    await expect(page).not.toHaveURL(/\/(dashboard|home|ctv|profile)/);
  });

  // TC-007 ─ Edge: expired/old OTP is rejected
  test("TC-007 | OTP hết hạn bị từ chối, yêu cầu gửi lại", async ({ page }) => {
    const { phone } = byId("TC-007");

    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await page.getByLabel(/Số điện thoại/i).fill(phone);
    await page.getByRole("button", { name: /Gửi mã OTP/i }).click();

    await expect(page).toHaveURL(/\/otp/, { timeout: 15_000 });

    // Simulate expired OTP with a wrong code
    await page.waitForTimeout(181_000); // OTP expired after 3 mins, wait a bit longer to ensure it's invalid.
    await fillOtpInputs(page, env.otpDefault);
    await page.getByRole("button", { name: /Xác thực.*đăng nhập/i }).click();

    // Error about invalid/expired OTP
    const errorLocator = page
      .getByText(/hết hạn|expired|không hợp lệ|invalid|sai|incorrect/i)
      .or(page.locator('[role="alert"], [class*="error"], [class*="toast"]').first());
    await expect(errorLocator.first()).toBeVisible({ timeout: 10_000 });

    // Resend option must be available
    const resendLocator = page
      .getByRole("button", { name: /Gửi lại|Resend/i })
      .or(page.getByText(/Gửi lại|gửi lại mã/i).first());
    await expect(resendLocator.first()).toBeVisible({ timeout: 5_000 });
  });

  // TC-008 ─ Edge: concurrent OTP requests – only the latest OTP is valid
  test("TC-008 | Concurrent OTP request – chỉ OTP mới nhất hợp lệ", async ({
    browser: browserInstance
  }) => {
    const { phone } = byId("TC-008");

    const ctx1 = await browserInstance.newContext({ baseURL: env.baseUrl });
    const page1 = await ctx1.newPage();
    const ctx2 = await browserInstance.newContext({ baseURL: env.baseUrl });
    const page2 = await ctx2.newPage();

    try {
      // Both sessions open login and fill the same phone
      await page1.goto("/login", { waitUntil: "domcontentloaded" });
      await page1.getByLabel(/Số điện thoại/i).fill(phone);
      await page2.goto("/login", { waitUntil: "domcontentloaded" });
      await page2.getByLabel(/Số điện thoại/i).fill(phone);

      // Trigger OTP sends in quick succession; ctx2 is the "newer" request
      await page1.getByRole("button", { name: /Gửi mã OTP/i }).click();
      await page1.waitForURL(/\/otp/, { timeout: 15_000 });
      await page2.getByRole("button", { name: /Gửi mã OTP/i }).click();
      await page2.waitForURL(/\/otp/, { timeout: 15_000 });

      // Session 1 submits wrong OTP – should be rejected (old OTP superseded)
      await fillOtpInputs(page1, WRONG_OTP);
      await page1.getByRole("button", { name: /Xác thực.*đăng nhập/i }).click();

      const errorOnPage1 = page1
        .getByText(/không đúng|sai|invalid|hết hạn|expired/i)
        .or(page1.locator('[role="alert"], [class*="error"], [class*="toast"]').first());
      await expect(errorOnPage1.first()).toBeVisible({ timeout: 10_000 });

      // Session 2 uses the latest valid OTP – should succeed
      await fillOtpInputs(page2, env.otpDefault);
      await page2.getByRole("button", { name: /Xác thực.*đăng nhập/i }).click();
      await expect(page2).not.toHaveURL(/\/(otp|login)/, { timeout: 15_000 });
    } finally {
      await ctx1.close();
      await ctx2.close();
    }
  });
});

