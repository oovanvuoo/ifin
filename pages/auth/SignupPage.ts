import { BasePage } from "../base/BasePage";

export class SignupPage extends BasePage {
  private readonly phoneInput = this.page.getByLabel(/Số điện thoại/i);
  private readonly fullNameInput = this.page.getByLabel(/Tên đầy đủ/i);
  private readonly continueButton = this.page.getByRole("button", { name: /Tiếp tục/i });

  async openSignup(): Promise<void> {
    await this.open("/signup");
  }

  async fillRegistrationForm(phone: string, fullName: string): Promise<void> {
    await this.fill(this.phoneInput, phone);
    await this.fill(this.fullNameInput, fullName);
  }

  async submitForOtp(): Promise<void> {
    await this.click(this.continueButton);
  }

  async isContinueDisabled(): Promise<boolean> {
    return this.continueButton.isDisabled();
  }
}
