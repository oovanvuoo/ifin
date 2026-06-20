import { BasePage } from "../base/BasePage";
import type { Page } from "@playwright/test";

export class CtvPage extends BasePage {
  // Home page CTA
  readonly becomeCtvCta = this.page
    .getByRole("link", { name: /Trở thành CTV/i })
    .or(this.page.getByRole("button", { name: /Trở thành CTV/i }));

  // Header user menu
  readonly userMenuButton = this.page
    .locator('[data-testid*="user-menu"], [data-testid*="avatar"], [aria-label*="user" i], [aria-label*="tài khoản" i]')
    .first();

  readonly manageCtvLink = this.page
    .getByRole("link", { name: /Quản lý CTV/i })
    .or(this.page.getByRole("menuitem", { name: /Quản lý CTV/i }));

  // CTV manage page elements
  readonly referralCodeEl = this.page
    .locator('[data-testid*="referral-code"], [data-testid*="ctv-code"]')
    .or(this.page.getByText(/mã.*ctv|mã.*giới thiệu/i).first());

  readonly referralLinkEl = this.page
    .locator('[data-testid*="referral-link"], input[readonly][value*="http"]')
    .or(this.page.getByText(/link.*giới thiệu/i).first());

  readonly copyButton = this.page.getByRole("button", { name: /Sao chép/i }).first();

  readonly shareZaloButton = this.page
    .getByRole("button", { name: /Chia sẻ qua Zalo/i })
    .or(this.page.getByText(/Chia sẻ qua Zalo/i).first());

  readonly qrCodeButton = this.page
    .getByRole("button", { name: /QR Code/i })
    .or(this.page.getByRole("button", { name: /QR/i }))
    .or(this.page.getByText(/QR Code/i).first());

  readonly productsTab = this.page
    .getByRole("tab", { name: /Sản phẩm/i })
    .or(this.page.getByRole("button", { name: /Sản phẩm/i }));

  async openHome(): Promise<void> {
    await this.open("/");
  }

  async openCtvManage(): Promise<void> {
    await this.open("/ctv/manage");
  }

  async clickBecomeCTV(): Promise<void> {
    await this.click(this.becomeCtvCta);
  }

  async openUserMenu(): Promise<void> {
    await this.userMenuButton.click();
  }

  async clickManageCTV(): Promise<void> {
    await this.click(this.manageCtvLink);
  }

  async copyReferralLink(): Promise<void> {
    await this.click(this.copyButton);
  }

  async clickShareZalo(): Promise<void> {
    await this.click(this.shareZaloButton);
  }

  async clickQrCode(): Promise<void> {
    await this.click(this.qrCodeButton);
  }

  async openProductsTab(): Promise<void> {
    await this.click(this.productsTab);
  }

  /** Click "Chia sẻ" button for the nth product (0-indexed). */
  async clickProductShare(index: number = 0): Promise<void> {
    const shareButtons = this.page.getByRole("button", { name: /^Chia sẻ$/i });
    await shareButtons.nth(index).click();
  }
}
