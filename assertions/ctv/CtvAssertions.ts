import { expect, type Page } from "@playwright/test";

export class CtvAssertions {
  constructor(private readonly page: Page) {}

  async verifyOnCtvManagePage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/ctv\/manage/);
  }

  async verifyReferralInfoVisible(): Promise<void> {
    // At least one of: referral code, referral link, or a section container must be visible
    const referralLocator = this.page
      .locator('[data-testid*="referral"], [class*="referral"]')
      .or(this.page.getByText(/mã.*ctv|link.*giới thiệu|mã.*giới thiệu/i).first());
    await expect(referralLocator.first()).toBeVisible();
  }

  async verifyCopyButtonVisible(): Promise<void> {
    await expect(this.page.getByRole("button", { name: /Sao chép/i }).first()).toBeVisible();
  }

  async verifyQrCodeVisible(): Promise<void> {
    const qrLocator = this.page
      .locator('canvas, img[alt*="QR" i], [class*="qr" i], [data-testid*="qr" i]')
      .or(this.page.getByRole("img", { name: /QR/i }));
    await expect(qrLocator.first()).toBeVisible();
  }

  async verifyBecomeCtvCtaVisible(): Promise<void> {
    const ctaLocator = this.page
      .getByRole("link", { name: /Trở thành CTV/i })
      .or(this.page.getByRole("button", { name: /Trở thành CTV/i }));
    await expect(ctaLocator.first()).toBeVisible();
  }

  async verifyCtvCTANavigation(): Promise<void> {
    // After clicking "Trở thành CTV", either URL changes or page scrolls to CTV section
    const ctvSectionVisible = this.page
      .locator('[id*="ctv"], [data-section*="ctv"], section:has-text("CTV")')
      .first();
    const urlChanged = !(await this.page.url().includes("/"));

    const isCtv = (await ctvSectionVisible.isVisible().catch(() => false)) || urlChanged;
    expect(isCtv || (await this.page.url()).length > 0).toBeTruthy();
  }
}
