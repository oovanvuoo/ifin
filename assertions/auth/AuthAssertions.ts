import { expect, type Page } from "@playwright/test";

export class AuthAssertions {
  constructor(private readonly page: Page) {}

  async verifyNavigateToOtpPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/otp/);
    await expect(this.page.getByRole("heading", { name: /Nhập mã OTP/i })).toBeVisible();
  }

  async verifyRegisterPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/signup/);
    await expect(this.page.getByRole("heading", { name: /Tạo tài khoản AIMICA/i })).toBeVisible();
  }

  async verifyLoginPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/login/);
    await expect(this.page.getByRole("heading", { name: /Đăng nhập AIMICA/i })).toBeVisible();
  }
}
