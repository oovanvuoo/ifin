import { BasePage } from "../base/BasePage";

export class LoginPage extends BasePage {
  private readonly phoneInput = this.page.getByLabel(/Số điện thoại/i);
  private readonly sendOtpButton = this.page.getByRole("button", { name: /Gửi mã OTP/i });

  async openLogin(): Promise<void> {
    await this.open("/login");
  }

  async requestOtp(phone: string): Promise<void> {
    await this.fill(this.phoneInput, phone);
    await this.click(this.sendOtpButton);
  }

  async isSendOtpDisabled(): Promise<boolean> {
    return this.sendOtpButton.isDisabled();
  }
}
