import { expect } from "../../fixtures/testFixtures.js";
import { BasePage } from "../base/BasePage.js";

export class OtpPage extends BasePage {
  private readonly verifyButton = this.page.getByRole("button", { name: /Xác thực.*(đăng nhập|Tạo tài khoản)/i });


  async isOtpPageVisible(): Promise<boolean> {
    await expect(this.page).toHaveURL(/\/otp/, { timeout: 15_000 });
    const heading = this.page.getByRole("heading", { name: /Nhập mã OTP/i });
    return heading.isVisible();
  }

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
    await this.verifyButton.click();
  }

  async isVerifyButtonDisabled(): Promise<boolean> {
    return this.verifyButton.isDisabled();
  }
}
