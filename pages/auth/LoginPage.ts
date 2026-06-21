import { expect } from "../../fixtures/testFixtures.js";
import { Constants } from "../../helpers/constants.js";
import { BasePage } from "../base/BasePage.js";

export class LoginPage extends BasePage {
  private readonly phoneInput = this.page.getByLabel(/Số điện thoại/i);
  private readonly sendOtpButton = this.page.getByRole("button", { name: /Gửi mã OTP/i });
  private readonly pageHeading = this.page.getByRole("heading", { name: /Đăng nhập AIMICA/i });

  async isLoginPageVisible(): Promise<boolean> {
    await this.waitForLoginPageLoad();
    return this.pageHeading.isVisible();
  }

  async openLogin(): Promise<void> {
    await this.open("/login");
    await this.waitForLoginPageLoad();
  }

  async clickRequestOtp(): Promise<void> {
    await this.sendOtpButton.click();
  }

  async isSendOtpDisabled(): Promise<boolean> {
    return this.sendOtpButton.isDisabled();
  }

  async waitForLoginPageLoad(): Promise<void> {
    await this.waitForPageLoad();
    await expect(this.pageHeading).toBeVisible();
  }

  async fillLoginForm (phone: string): Promise<void> {
    await this.tryToFill(this.phoneInput, phone); 
  }

  async verifyInvalidOtpMsgIsDisplayed(): Promise<void> {
    const errorMessage = this.page.getByText(
      "Mã xác thực không hợp lệ. Vui lòng kiểm tra và thử lại.",
      { exact: true }
    );          
    await expect(errorMessage).toBeVisible(Constants.TIMEOUT_30S);
  }
}
