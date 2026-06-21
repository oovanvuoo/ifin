import { test } from "../../fixtures/testFixtures.js";
import { UserFaker } from "../../helpers/user-faker.js";

const otpDefault = "000000";

// ──────────────────────────────────────────────────────────────────────────────
test.describe("C - Registration Flow", () => {
  test("TC-001 | Register thành công với OTP hợp lệ", async ({ homePage, signupPage, otpPage }) => {
    const uniquePhone = UserFaker.generatePhone();
    const uniqueFullName = UserFaker.generateFullName();

    await homePage.openHome();
    await homePage.clickSignup();
    await signupPage.fillRegistrationForm(uniquePhone, uniqueFullName);
    await signupPage.submitForOtp();
    await otpPage.isOtpPageVisible();
    await otpPage.fillOtp(otpDefault);
    await otpPage.submitOtp();
  });

  test("TC-005 | Validate độ dài số điện thoại tối thiểu", async ({ homePage, signupPage }) => {
    const invalidShortPhone = UserFaker.generateInvalidShortPhone();
    const uniqueFullName = UserFaker.generateFullName();

    await homePage.openHome();
    await homePage.clickSignup();
    await signupPage.fillRegistrationForm(invalidShortPhone, uniqueFullName);
    await signupPage.verifyContinueButtonDisabled();
  });
});