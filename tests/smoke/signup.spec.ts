import * as fs from "fs";
import * as path from "path";
import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";

// ── Env ──────────────────────────────────────────────────────────────────────
const env = {
  baseUrl: process.env.BASE_URL ?? "https://nomi-staging-3c09.up.railway.app",
  testPhone: process.env.TEST_PHONE ?? "0912345678",
  otpDefault: process.env.OTP_DEFAULT ?? process.env.TEST_OTP ?? "000000"
};

// ── CSV helper ───────────────────────────────────────────────────────────────
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

const signupData = parseCsv(process.env.SIGNUP_TEST_DATA_CSV ?? "resources/data/signup.csv");
const byId = (id: string) => signupData.find((r) => r.testcaseID === id)!;

// ── Shared helpers ───────────────────────────────────────────────────────────
import type { Page } from "@playwright/test";

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

function otpSubmitButton(page: Page) {
  return page.getByRole("button", { name: /Xác thực.*(đăng nhập|tạo tài khoản)/i });
}

function generatePhone(): string {
  return `09${Math.floor(10_000_000 + Math.random() * 90_000_000)}`;
}

function generateFullName(): string {
  return faker.person.fullName();
}

// ──────────────────────────────────────────────────────────────────────────────
test.describe("C - Registration Flow", () => {
  // TC-001 ─ Positive: register with new phone + valid OTP
  test("TC-001 | Register thành công với OTP hợp lệ", async ({ page }) => {
    byId("TC-001");
    const uniquePhone = generatePhone(); // fresh phone to avoid duplicate conflict
    const uniqueFullName = generateFullName();

    await page.goto("/signup", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/signup/);
    await expect(page.getByRole("heading", { name: /Tạo tài khoản/i })).toBeVisible();

    await page.getByLabel(/Số điện thoại/i).fill(uniquePhone);
    await page.getByLabel(/Tên đầy đủ/i).fill(uniqueFullName);
    await page.getByRole("button", { name: /Tiếp tục/i }).click();

    await expect(page).toHaveURL(/\/otp/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: /Nhập mã OTP/i })).toBeVisible();

    await fillOtpInputs(page, env.otpDefault);
    await otpSubmitButton(page).click();

    await expect(page).not.toHaveURL(/\/(otp|signup)/, { timeout: 15_000 });
  });

  // TC-004 ─ Negative: duplicate phone already registered
  test("TC-004 | Register thất bại khi trùng số điện thoại", async ({ page }) => {
    const { phone } = byId("TC-004"); // pre-existing phone
    const uniqueFullName = generateFullName();

    await page.goto("/signup", { waitUntil: "domcontentloaded" });
    await page.getByLabel(/Số điện thoại/i).fill(phone);
    await page.getByLabel(/Tên đầy đủ/i).fill(uniqueFullName);
    await page.getByRole("button", { name: /Tiếp tục/i }).click();

    // System may reject before OTP step or after OTP verification
    const reachedOtp = await page.waitForURL(/\/otp/, { timeout: 8_000 }).then(() => true).catch(() => false);

    if (reachedOtp) {
      await fillOtpInputs(page, env.otpDefault);
      await otpSubmitButton(page).click();
    }

    const errorLocator = page
      .getByText(/đã tồn tại|đã đăng ký|already exists|duplicate|tồn tại/i)
      .or(page.locator('[role="alert"], [class*="error"], [class*="toast"]').first());
    await expect(errorLocator.first()).toBeVisible({ timeout: 10_000 });
  });

  // TC-005 ─ Boundary: phone number shorter than minimum (5 digits)
  test("TC-005 | Validate boundary độ dài số điện thoại tối thiểu", async ({ page }) => {
    const { phone } = byId("TC-005"); // "09123"
    const uniqueFullName = generateFullName();

    await page.goto("/signup", { waitUntil: "domcontentloaded" });
    await page.getByLabel(/Số điện thoại/i).fill(phone);
    await page.getByLabel(/Tên đầy đủ/i).fill(uniqueFullName);

    const continueBtn = page.getByRole("button", { name: /Tiếp tục/i });
    const isDisabled = await continueBtn.isDisabled();
    expect(isDisabled).toBeTruthy();
  });

  // TC-006 ─ Boundary: phone number longer than maximum (13 digits)
  test("TC-006 | Validate boundary độ dài số điện thoại tối đa", async ({ page }) => {
    const { phone } = byId("TC-006"); // "0912345678999"
    const uniqueFullName = generateFullName();

    await page.goto("/signup", { waitUntil: "domcontentloaded" });
    await page.getByLabel(/Số điện thoại/i).fill(phone);
    await page.getByLabel(/Tên đầy đủ/i).fill(uniqueFullName);

    const continueBtn = page.getByRole("button", { name: /Tiếp tục/i });
    const isDisabled = await continueBtn.isDisabled();

    if (!isDisabled) {
      await continueBtn.click();
      const errorLocator = page
        .getByText(/không hợp lệ|invalid|quá dài|too long|định dạng/i)
        .or(page.locator('[role="alert"], [class*="error"]').first());
      await expect(errorLocator.first()).toBeVisible({ timeout: 8_000 });
    } else {
      expect(isDisabled).toBeTruthy();
    }
  });
});
