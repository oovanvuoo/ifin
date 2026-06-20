# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke/login.spec.ts >> C - Login Flow >> TC-002 | Login thành công với tài khoản đã đăng ký
- Location: tests/smoke/login.spec.ts:46:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /Đăng nhập/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: /Đăng nhập/i })

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
  - paragraph: "Request ID: EQ0ZVwXyQX232G8soB_USg"
  - link "Go to Railway":
    - /url: https://railway.com
```

# Test source

```ts
  1   | import * as fs from "fs";
  2   | import * as path from "path";
  3   | import { test, expect } from "@playwright/test";
  4   | import type { Page } from "@playwright/test";
  5   | 
  6   | // ── Env ──────────────────────────────────────────────────────────────────────
  7   | const env = {
  8   |   baseUrl: process.env.BASE_URL ?? "https://nomi-staging-3c09.up.railway.app",
  9   |   testPhone: process.env.TEST_PHONE ?? "0912345678",
  10  |   otpDefault: process.env.OTP_DEFAULT ?? process.env.TEST_OTP ?? "000000"
  11  | };
  12  | 
  13  | // ── CSV helper ────────────────────────────────────────────────────────────────
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
  26  | const loginData = parseCsv(process.env.LOGIN_TEST_DATA_CSV ?? "resources/data/login.csv");
  27  | const byId = (id: string) => loginData.find((r) => r.testcaseID === id)!;
  28  | 
  29  | // ── Shared helpers ────────────────────────────────────────────────────────────
  30  | async function fillOtpInputs(page: Page, otp: string): Promise<void> {
  31  |   const inputs = page.locator("input");
  32  |   const count = await inputs.count();
  33  |   if (count >= otp.length) {
  34  |     for (let i = 0; i < otp.length; i++) await inputs.nth(i).fill(otp[i]);
  35  |   } else {
  36  |     await inputs.first().click();
  37  |     await page.keyboard.type(otp);
  38  |   }
  39  | }
  40  | 
  41  | const WRONG_OTP = "999999";
  42  | 
  43  | // ──────────────────────────────────────────────────────────────────────────────
  44  | test.describe("C - Login Flow", () => {
  45  |   // TC-002 ─ Positive: successful login with valid OTP
  46  |   test("TC-002 | Login thành công với tài khoản đã đăng ký", async ({ page }) => {
  47  |     const { phone } = byId("TC-002");
  48  | 
  49  |     await page.goto("/login", { waitUntil: "domcontentloaded" });
  50  |     await expect(page).toHaveURL(/\/login/);
> 51  |     await expect(page.getByRole("heading", { name: /Đăng nhập/i })).toBeVisible();
      |                                                                     ^ Error: expect(locator).toBeVisible() failed
  52  | 
  53  |     await page.getByLabel(/Số điện thoại/i).fill(phone);
  54  |     await page.getByRole("button", { name: /Gửi mã OTP/i }).click();
  55  | 
  56  |     await expect(page).toHaveURL(/\/otp/, { timeout: 15_000 });
  57  |     await expect(page.getByRole("heading", { name: /Nhập mã OTP/i })).toBeVisible();
  58  | 
  59  |     await fillOtpInputs(page, env.otpDefault);
  60  |     await page.getByRole("button", { name: /Xác thực.*đăng nhập/i }).click();
  61  | 
  62  |     // Session established – must leave OTP/login pages
  63  |     await expect(page).not.toHaveURL(/\/(otp|login)/, { timeout: 15_000 });
  64  | 
  65  |     // Verify at least one auth cookie exists
  66  |     const cookies = await page.context().cookies();
  67  |     const hasAuthCookie = cookies.some((c) => /at|token|session/i.test(c.name));
  68  |     expect(hasAuthCookie).toBeTruthy();
  69  |   });
  70  | 
  71  |   // TC-003 ─ Negative: login with wrong OTP shows error, no session
  72  |   test("TC-003 | Login thất bại với OTP sai", async ({ page }) => {
  73  |     const { phone } = byId("TC-003");
  74  | 
  75  |     await page.goto("/login", { waitUntil: "domcontentloaded" });
  76  |     await page.getByLabel(/Số điện thoại/i).fill(phone);
  77  |     await page.getByRole("button", { name: /Gửi mã OTP/i }).click();
  78  | 
  79  |     await expect(page).toHaveURL(/\/otp/, { timeout: 15_000 });
  80  | 
  81  |     await fillOtpInputs(page, WRONG_OTP);
  82  |     await page.getByRole("button", { name: /Xác thực.*đăng nhập/i }).click();
  83  | 
  84  |     // Error message must appear
  85  |     const errorLocator = page
  86  |       .getByText(/không đúng|sai|invalid|incorrect|hết hạn|expired|lỗi/i)
  87  |       .or(page.locator('[role="alert"], [class*="error"], [class*="toast"]').first());
  88  |     await expect(errorLocator.first()).toBeVisible({ timeout: 10_000 });
  89  | 
  90  |     // Must not navigate to authenticated area
  91  |     await expect(page).not.toHaveURL(/\/(dashboard|home|ctv|profile)/);
  92  |   });
  93  | 
  94  |   // TC-007 ─ Edge: expired/old OTP is rejected
  95  |   test("TC-007 | OTP hết hạn bị từ chối, yêu cầu gửi lại", async ({ page }) => {
  96  |     const { phone } = byId("TC-007");
  97  | 
  98  |     await page.goto("/login", { waitUntil: "domcontentloaded" });
  99  |     await page.getByLabel(/Số điện thoại/i).fill(phone);
  100 |     await page.getByRole("button", { name: /Gửi mã OTP/i }).click();
  101 | 
  102 |     await expect(page).toHaveURL(/\/otp/, { timeout: 15_000 });
  103 | 
  104 |     // Simulate expired OTP with a wrong code
  105 |     await page.waitForTimeout(181_000); // OTP expired after 3 mins, wait a bit longer to ensure it's invalid.
  106 |     await fillOtpInputs(page, env.otpDefault);
  107 |     await page.getByRole("button", { name: /Xác thực.*đăng nhập/i }).click();
  108 | 
  109 |     // Error about invalid/expired OTP
  110 |     const errorLocator = page
  111 |       .getByText(/hết hạn|expired|không hợp lệ|invalid|sai|incorrect/i)
  112 |       .or(page.locator('[role="alert"], [class*="error"], [class*="toast"]').first());
  113 |     await expect(errorLocator.first()).toBeVisible({ timeout: 10_000 });
  114 | 
  115 |     // Resend option must be available
  116 |     const resendLocator = page
  117 |       .getByRole("button", { name: /Gửi lại|Resend/i })
  118 |       .or(page.getByText(/Gửi lại|gửi lại mã/i).first());
  119 |     await expect(resendLocator.first()).toBeVisible({ timeout: 5_000 });
  120 |   });
  121 | 
  122 |   // TC-008 ─ Edge: concurrent OTP requests – only the latest OTP is valid
  123 |   test("TC-008 | Concurrent OTP request – chỉ OTP mới nhất hợp lệ", async ({
  124 |     browser: browserInstance
  125 |   }) => {
  126 |     const { phone } = byId("TC-008");
  127 | 
  128 |     const ctx1 = await browserInstance.newContext({ baseURL: env.baseUrl });
  129 |     const page1 = await ctx1.newPage();
  130 |     const ctx2 = await browserInstance.newContext({ baseURL: env.baseUrl });
  131 |     const page2 = await ctx2.newPage();
  132 | 
  133 |     try {
  134 |       // Both sessions open login and fill the same phone
  135 |       await page1.goto("/login", { waitUntil: "domcontentloaded" });
  136 |       await page1.getByLabel(/Số điện thoại/i).fill(phone);
  137 |       await page2.goto("/login", { waitUntil: "domcontentloaded" });
  138 |       await page2.getByLabel(/Số điện thoại/i).fill(phone);
  139 | 
  140 |       // Trigger OTP sends in quick succession; ctx2 is the "newer" request
  141 |       await page1.getByRole("button", { name: /Gửi mã OTP/i }).click();
  142 |       await page1.waitForURL(/\/otp/, { timeout: 15_000 });
  143 |       await page2.getByRole("button", { name: /Gửi mã OTP/i }).click();
  144 |       await page2.waitForURL(/\/otp/, { timeout: 15_000 });
  145 | 
  146 |       // Session 1 submits wrong OTP – should be rejected (old OTP superseded)
  147 |       await fillOtpInputs(page1, WRONG_OTP);
  148 |       await page1.getByRole("button", { name: /Xác thực.*đăng nhập/i }).click();
  149 | 
  150 |       const errorOnPage1 = page1
  151 |         .getByText(/không đúng|sai|invalid|hết hạn|expired/i)
```