import { expect } from "../../fixtures/testFixtures.js";
import { BasePage } from "../base/BasePage.js";

export class SignupPage extends BasePage {
  private readonly phoneInput = this.page.getByLabel(/Số điện thoại/i);
  private readonly fullNameInput = this.page.getByLabel(/Tên đầy đủ/i);
  private readonly continueButton = this.page.getByRole("button", { name: /Tiếp tục/i });

  async openSignup(): Promise<void> {
    await this.open("/signup");
    await expect(this.page).toHaveURL(/\/signup/);
    await expect(this.page.getByRole("heading", { name: /Tạo tài khoản/i })).toBeVisible();
  }

  async fillRegistrationForm(phone: string, fullName: string): Promise<void> {
    console.log(`Filling registration form with phone: ${phone} and full name: ${fullName}`);
    await this.fillPhone(phone);
    await this.fillFullName(fullName);
  }

  async submitForOtp(): Promise<void> {
    await this.click(this.continueButton);
  }

  async isContinueDisabled(): Promise<boolean> {
    return this.continueButton.isDisabled();
  }

  async fillPhone(phone: string): Promise<void> {
    await this.tryToFill(this.phoneInput, phone);
  }

  async fillFullName(fullName: string): Promise<void> {
    await this.tryToFill(this.fullNameInput, fullName);
  }

  async verifyContinueButtonDisabled(): Promise<void> {
    const isDisabled = await this.isContinueDisabled();
    expect(isDisabled).toBe(true);
  }
}
