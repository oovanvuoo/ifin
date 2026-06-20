import { BasePage } from "../base/BasePage";

export class OtpPage extends BasePage {
  private readonly verifyButton = this.page.getByRole("button", { name: /Xác thực.*đăng nhập/i });

  /**
   * Fill the OTP code. Handles both single-input and multi-box OTP layouts:
   * - Single input: filled directly
   * - Chained boxes: click first box then type all digits
   */
  async fillOtp(otp: string): Promise<void> {
    const inputs = this.page.locator("input");
    const count = await inputs.count();

    if (count >= otp.length) {
      // Multi-box OTP: fill each box individually
      for (let i = 0; i < otp.length; i++) {
        await inputs.nth(i).fill(otp[i]);
      }
    } else {
      // Single input: click first and type
      await inputs.first().click();
      await this.page.keyboard.type(otp);
    }
  }

  async submitOtp(): Promise<void> {
    await this.click(this.verifyButton);
  }

  async isVerifyButtonDisabled(): Promise<boolean> {
    return this.verifyButton.isDisabled();
  }
}
