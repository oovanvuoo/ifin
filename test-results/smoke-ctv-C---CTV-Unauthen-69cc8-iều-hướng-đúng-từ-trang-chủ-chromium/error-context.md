# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke/ctv.spec.ts >> C - CTV: Unauthenticated >> TC-009 | CTA 'Trở thành CTV' điều hướng đúng từ trang chủ
- Location: tests/smoke/ctv.spec.ts:79:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('link', { name: /Trở thành CTV/i }).or(getByRole('button', { name: /Trở thành CTV/i })).first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('link', { name: /Trở thành CTV/i }).or(getByRole('button', { name: /Trở thành CTV/i })).first()

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
  - paragraph: "Request ID: gchrCYXLSvi8xwZ_AXC71g"
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
  9   |   testPhone: process.env.CTV_TEST_PHONE ?? process.env.TEST_PHONE ?? "0912345678",
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
  26  | const ctvData = parseCsv(process.env.CTV_TEST_DATA_CSV ?? "resources/data/ctv.csv");
  27  | const byId = (id: string) => ctvData.find((r) => r.testcaseID === id)!;
  28  | 
  29  | // ── Shared helpers ────────────────────────────────────────────────────────────
  30  | const authStorageState = path.resolve(".auth/session.json");
  31  | 
  32  | function normalizePhone(rawPhone: string): string {
  33  |   return (rawPhone ?? "").replace(/\D/g, "");
  34  | }
  35  | 
  36  | function userMenuButton(page: Page) {
  37  |   return page
  38  |     .getByRole("button", { name: /user|tài khoản/i })
  39  |     .or(page.locator('[data-testid*="user-menu"], [data-testid*="avatar"], [aria-label*="user" i], [aria-label*="tài khoản" i]').first());
  40  | }
  41  | 
  42  | async function loginWithOtp(page: Page, phone: string, otp: string): Promise<void> {
  43  |   const normalizedPhone = normalizePhone(phone);
  44  |   await page.goto("/login", { waitUntil: "domcontentloaded" });
  45  | 
  46  |   const phoneInput = page.getByLabel(/Số điện thoại/i);
  47  |   await phoneInput.click();
  48  |   await phoneInput.fill("");
  49  |   await phoneInput.type(normalizedPhone, { delay: 40 });
  50  | 
  51  |   const sendOtpButton = page.getByRole("button", { name: /Gửi mã OTP/i });
  52  |   await expect(sendOtpButton).toBeEnabled({ timeout: 15_000 });
  53  |   await sendOtpButton.click();
  54  | 
  55  |   await page.waitForURL(/\/otp/, { timeout: 15_000 });
  56  | 
  57  |   const otpInputs = page.getByRole("textbox", { name: /Chữ số thứ/i });
  58  |   const otpCount = await otpInputs.count();
  59  |   if (otpCount >= otp.length) {
  60  |     for (let i = 0; i < otp.length; i++) {
  61  |       await otpInputs.nth(i).fill(otp[i]);
  62  |     }
  63  |   } else {
  64  |     await page.locator("input").first().click();
  65  |     await page.keyboard.type(otp);
  66  |   }
  67  | 
  68  |   const verifyBtn = page.getByRole("button", { name: /Xác thực.*(đăng nhập|tạo tài khoản)/i });
  69  |   await verifyBtn.click();
  70  |   await page.waitForURL((url) => !url.pathname.startsWith("/otp") && !url.pathname.startsWith("/login"), {
  71  |     timeout: 15_000
  72  |   });
  73  | }
  74  | 
  75  | // ──────────────────────────────────────────────────────────────────────────────
  76  | // TC-009 – No auth required
  77  | // ──────────────────────────────────────────────────────────────────────────────
  78  | test.describe("C - CTV: Unauthenticated", () => {
  79  |   test("TC-009 | CTA 'Trở thành CTV' điều hướng đúng từ trang chủ", async ({ page }) => {
  80  |     await page.goto("/", { waitUntil: "domcontentloaded" });
  81  | 
  82  |     // Verify the CTA is present for unauthenticated users
  83  |     const ctaLocator = page
  84  |       .getByRole("link", { name: /Trở thành CTV/i })
  85  |       .or(page.getByRole("button", { name: /Trở thành CTV/i }));
> 86  |     await expect(ctaLocator.first()).toBeVisible();
      |                                      ^ Error: expect(locator).toBeVisible() failed
  87  | 
  88  |     const urlBefore = page.url();
  89  |     await ctaLocator.first().click();
  90  | 
  91  |     // After click: URL changes to a CTV-related path OR page scrolls to CTV section
  92  |     await page.waitForTimeout(1_000); // allow scroll/animation to settle
  93  |     const urlAfter = page.url();
  94  | 
  95  |     const navigatedToNewPage = urlAfter !== urlBefore && urlAfter.includes("ctv");
  96  |     const scrolledToSection =
  97  |       (await page.locator('[id*="ctv" i], [data-section*="ctv" i], section:has-text("CTV")').first().isVisible()) ||
  98  |       urlAfter.includes("#ctv");
  99  | 
  100 |     expect(navigatedToNewPage || scrolledToSection).toBeTruthy();
  101 |   });
  102 | });
  103 | 
  104 | // ──────────────────────────────────────────────────────────────────────────────
  105 | // TC-010 to TC-013 – Require authenticated user
  106 | // ──────────────────────────────────────────────────────────────────────────────
  107 | test.describe("C - CTV: Authenticated", () => {
  108 |   test.describe.configure({ mode: "serial" });
  109 |   test.use({ storageState: authStorageState });
  110 | 
  111 |   test.beforeEach(async ({ page }) => {
  112 |     await page.goto("/", { waitUntil: "domcontentloaded" });
  113 | 
  114 |     const hasUserMenu = await userMenuButton(page).first().isVisible().catch(() => false);
  115 |     if (!hasUserMenu) {
  116 |       const fallbackPhone = byId("TC-010")?.phone || env.testPhone;
  117 |       await loginWithOtp(page, fallbackPhone, env.otpDefault);
  118 |       await page.goto("/", { waitUntil: "domcontentloaded" });
  119 |     }
  120 |   });
  121 | 
  122 |   // TC-010 – User menu → Quản lý CTV navigates to /ctv/manage
  123 |   test("TC-010 | User đã đăng nhập mở được menu 'Quản lý CTV'", async ({ page }) => {
  124 |     byId("TC-010");
  125 | 
  126 |     // Click user/avatar menu button in the header
  127 |     const userMenuBtn = userMenuButton(page);
  128 |     await expect(userMenuBtn.first()).toBeVisible({ timeout: 10_000 });
  129 |     await userMenuBtn.first().click();
  130 | 
  131 |     // "Quản lý CTV" link should appear
  132 |     const manageCtvLink = page
  133 |       .getByRole("link", { name: /Quản lý CTV/i })
  134 |       .or(page.getByRole("menuitem", { name: /Quản lý CTV/i }));
  135 | 
  136 |     const hasManageInMenu = await manageCtvLink.first().isVisible({ timeout: 5_000 }).catch(() => false);
  137 |     if (hasManageInMenu) {
  138 |       await manageCtvLink.first().click();
  139 |     } else {
  140 |       // Fallback for current UI where CTV entry is presented in top navigation.
  141 |       const ctvNavBtn = page
  142 |         .getByRole("button", { name: /Mô hình CTV/i })
  143 |         .or(page.getByRole("link", { name: /Mô hình CTV/i }));
  144 |       await expect(ctvNavBtn.first()).toBeVisible({ timeout: 10_000 });
  145 |       await ctvNavBtn.first().click();
  146 |     }
  147 | 
  148 |     await expect(page).toHaveURL(/\/ctv(\/manage)?/);
  149 |   });
  150 | 
  151 |   // TC-011 – Referral block shows code + link; copy action works
  152 |   test("TC-011 | Khối referral CTV hiển thị đầy đủ thông tin chia sẻ", async ({ page }) => {
  153 |     byId("TC-011");
  154 | 
  155 |     await page.goto("/ctv/manage", { waitUntil: "domcontentloaded" });
  156 |     await expect(page).toHaveURL(/\/ctv\/manage/);
  157 | 
  158 |     // Referral section must be visible
  159 |     const referralSection = page
  160 |       .locator('[data-testid*="referral"], [class*="referral"]')
  161 |       .or(page.getByText(/mã.*ctv|link.*giới thiệu|mã.*giới thiệu/i).first());
  162 |     await expect(referralSection.first()).toBeVisible();
  163 | 
  164 |     // Copy button must exist
  165 |     const copyBtn = page.getByRole("button", { name: /Sao chép/i }).first();
  166 |     await expect(copyBtn).toBeVisible();
  167 | 
  168 |     // Grant clipboard and click copy
  169 |     await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  170 |     await copyBtn.click();
  171 | 
  172 |     // Confirm copy success via toast or clipboard content
  173 |     const toastLocator = page
  174 |       .getByText(/đã sao chép|copied|sao chép thành công/i)
  175 |       .or(page.locator('[class*="toast"], [role="status"]').first());
  176 | 
  177 |     const clipboardText = await page.evaluate(() => navigator.clipboard.readText()).catch(() => "");
  178 |     const copyConfirmed =
  179 |       (await toastLocator.first().isVisible({ timeout: 5_000 }).catch(() => false)) ||
  180 |       clipboardText.startsWith("http");
  181 | 
  182 |     expect(copyConfirmed).toBeTruthy();
  183 |   });
  184 | 
  185 |   // TC-012 – Multi-channel sharing: Zalo share and QR code
  186 |   test("TC-012 | Chia sẻ đa kênh trong CTV hoạt động", async ({ page }) => {
```