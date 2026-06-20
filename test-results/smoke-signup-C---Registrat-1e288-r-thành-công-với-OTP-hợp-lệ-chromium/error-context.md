# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke/signup.spec.ts >> C - Registration Flow >> TC-001 | Register thành công với OTP hợp lệ
- Location: tests/smoke/signup.spec.ts:58:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /Tạo tài khoản/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: /Tạo tài khoản/i })

```

```yaml
- main:
  - img
  - heading "Not Found" [level=1]
  - paragraph: The train has not arrived at the station.
  - paragraph:
    - text: Please check your
    - link "network settings":
      - /url: https://docs.railway.com/guides/public-networking#railway-provided-domain
    - text: to confirm that your domain has provisioned.
  - paragraph: If you are a visitor, please let the owner know you're stuck at the station.
  - paragraph: "Request ID: oy2cxkPOTgKkCHqFoB_USg"
  - link "Go to Railway":
    - /url: https://railway.com
```

# Test source

```ts
  1   | import * as fs from "fs";
  2   | import * as path from "path";
  3   | import { test, expect } from "@playwright/test";
  4   | import { faker } from "@faker-js/faker";
  5   | 
  6   | // ── Env ──────────────────────────────────────────────────────────────────────
  7   | const env = {
  8   |   baseUrl: process.env.BASE_URL ?? "https://nomi-staging-3c09.up.railway.app",
  9   |   testPhone: process.env.TEST_PHONE ?? "0912345678",
  10  |   otpDefault: process.env.OTP_DEFAULT ?? process.env.TEST_OTP ?? "000000"
  11  | };
  12  | 
  13  | // ── CSV helper ───────────────────────────────────────────────────────────────
  14  | type DataRow = { testcaseID: string; phone: string; fullName: string };
  15  | 
  16  | function parseCsv(csvPath: string): DataRow[] {
  17  |   const raw = fs.readFileSync(path.resolve(csvPath), "utf-8");
  18  |   const [headerLine, ...rows] = raw.trim().split(/\r?\n/);
  19  |   const headers = headerLine.split(",").map((h) => h.trim());
  20  |   return rows.map((row) => {
  21  |     const values = row.split(",");
  22  |     return Object.fromEntries(headers.map((h, i) => [h, (values[i] ?? "").trim()])) as DataRow;
  23  |   });
  24  | }
  25  | 
  26  | const signupData = parseCsv(process.env.SIGNUP_TEST_DATA_CSV ?? "resources/data/signup.csv");
  27  | const byId = (id: string) => signupData.find((r) => r.testcaseID === id)!;
  28  | 
  29  | // ── Shared helpers ───────────────────────────────────────────────────────────
  30  | import type { Page } from "@playwright/test";
  31  | 
  32  | async function fillOtpInputs(page: Page, otp: string): Promise<void> {
  33  |   const inputs = page.locator("input");
  34  |   const count = await inputs.count();
  35  |   if (count >= otp.length) {
  36  |     for (let i = 0; i < otp.length; i++) await inputs.nth(i).fill(otp[i]);
  37  |   } else {
  38  |     await inputs.first().click();
  39  |     await page.keyboard.type(otp);
  40  |   }
  41  | }
  42  | 
  43  | function otpSubmitButton(page: Page) {
  44  |   return page.getByRole("button", { name: /Xác thực.*(đăng nhập|tạo tài khoản)/i });
  45  | }
  46  | 
  47  | function generatePhone(): string {
  48  |   return `09${Math.floor(10_000_000 + Math.random() * 90_000_000)}`;
  49  | }
  50  | 
  51  | function generateFullName(): string {
  52  |   return faker.person.fullName();
  53  | }
  54  | 
  55  | // ──────────────────────────────────────────────────────────────────────────────
  56  | test.describe("C - Registration Flow", () => {
  57  |   // TC-001 ─ Positive: register with new phone + valid OTP
  58  |   test("TC-001 | Register thành công với OTP hợp lệ", async ({ page }) => {
  59  |     byId("TC-001");
  60  |     const uniquePhone = generatePhone(); // fresh phone to avoid duplicate conflict
  61  |     const uniqueFullName = generateFullName();
  62  | 
  63  |     await page.goto("/signup", { waitUntil: "domcontentloaded" });
  64  |     await expect(page).toHaveURL(/\/signup/);
> 65  |     await expect(page.getByRole("heading", { name: /Tạo tài khoản/i })).toBeVisible();
      |                                                                         ^ Error: expect(locator).toBeVisible() failed
  66  | 
  67  |     await page.getByLabel(/Số điện thoại/i).fill(uniquePhone);
  68  |     await page.getByLabel(/Tên đầy đủ/i).fill(uniqueFullName);
  69  |     await page.getByRole("button", { name: /Tiếp tục/i }).click();
  70  | 
  71  |     await expect(page).toHaveURL(/\/otp/, { timeout: 15_000 });
  72  |     await expect(page.getByRole("heading", { name: /Nhập mã OTP/i })).toBeVisible();
  73  | 
  74  |     await fillOtpInputs(page, env.otpDefault);
  75  |     await otpSubmitButton(page).click();
  76  | 
  77  |     await expect(page).not.toHaveURL(/\/(otp|signup)/, { timeout: 15_000 });
  78  |   });
  79  | 
  80  |   // TC-004 ─ Negative: duplicate phone already registered
  81  |   test("TC-004 | Register thất bại khi trùng số điện thoại", async ({ page }) => {
  82  |     const { phone } = byId("TC-004"); // pre-existing phone
  83  |     const uniqueFullName = generateFullName();
  84  | 
  85  |     await page.goto("/signup", { waitUntil: "domcontentloaded" });
  86  |     await page.getByLabel(/Số điện thoại/i).fill(phone);
  87  |     await page.getByLabel(/Tên đầy đủ/i).fill(uniqueFullName);
  88  |     await page.getByRole("button", { name: /Tiếp tục/i }).click();
  89  | 
  90  |     // System may reject before OTP step or after OTP verification
  91  |     const reachedOtp = await page.waitForURL(/\/otp/, { timeout: 8_000 }).then(() => true).catch(() => false);
  92  | 
  93  |     if (reachedOtp) {
  94  |       await fillOtpInputs(page, env.otpDefault);
  95  |       await otpSubmitButton(page).click();
  96  |     }
  97  | 
  98  |     const errorLocator = page
  99  |       .getByText(/đã tồn tại|đã đăng ký|already exists|duplicate|tồn tại/i)
  100 |       .or(page.locator('[role="alert"], [class*="error"], [class*="toast"]').first());
  101 |     await expect(errorLocator.first()).toBeVisible({ timeout: 10_000 });
  102 |   });
  103 | 
  104 |   // TC-005 ─ Boundary: phone number shorter than minimum (5 digits)
  105 |   test("TC-005 | Validate boundary độ dài số điện thoại tối thiểu", async ({ page }) => {
  106 |     const { phone } = byId("TC-005"); // "09123"
  107 |     const uniqueFullName = generateFullName();
  108 | 
  109 |     await page.goto("/signup", { waitUntil: "domcontentloaded" });
  110 |     await page.getByLabel(/Số điện thoại/i).fill(phone);
  111 |     await page.getByLabel(/Tên đầy đủ/i).fill(uniqueFullName);
  112 | 
  113 |     const continueBtn = page.getByRole("button", { name: /Tiếp tục/i });
  114 |     const isDisabled = await continueBtn.isDisabled();
  115 |     expect(isDisabled).toBeTruthy();
  116 |   });
  117 | 
  118 |   // TC-006 ─ Boundary: phone number longer than maximum (13 digits)
  119 |   test("TC-006 | Validate boundary độ dài số điện thoại tối đa", async ({ page }) => {
  120 |     const { phone } = byId("TC-006"); // "0912345678999"
  121 |     const uniqueFullName = generateFullName();
  122 | 
  123 |     await page.goto("/signup", { waitUntil: "domcontentloaded" });
  124 |     await page.getByLabel(/Số điện thoại/i).fill(phone);
  125 |     await page.getByLabel(/Tên đầy đủ/i).fill(uniqueFullName);
  126 | 
  127 |     const continueBtn = page.getByRole("button", { name: /Tiếp tục/i });
  128 |     const isDisabled = await continueBtn.isDisabled();
  129 | 
  130 |     if (!isDisabled) {
  131 |       await continueBtn.click();
  132 |       const errorLocator = page
  133 |         .getByText(/không hợp lệ|invalid|quá dài|too long|định dạng/i)
  134 |         .or(page.locator('[role="alert"], [class*="error"]').first());
  135 |       await expect(errorLocator.first()).toBeVisible({ timeout: 8_000 });
  136 |     } else {
  137 |       expect(isDisabled).toBeTruthy();
  138 |     }
  139 |   });
  140 | });
  141 | 
```