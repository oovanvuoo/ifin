import {test} from "../../fixtures/testFixtures.js";
import { CSVHandling } from "../../helpers/csv-handler.js";

const otpDefault = "000000";
const dataset = CSVHandling.readCSVFile(process.cwd() + "/resources/data/login.csv");
console.log(dataset);

test.describe("Login Flow", () => {
    for (const data of dataset) {
        if (data.isSkip === "true") {
            test.skip(`${data.testcaseID} | Login successful valid OTP`, async ({}) => {});
            continue;
        }
        test(`${data.testcaseID} | Login successful valid OTP`, async ({ homePage, loginPage, otpPage }) => {
            await homePage.openHome();
            await homePage.clickLogin();
            await loginPage.waitForLoginPageLoad();
            await loginPage.fillLoginForm(data.phone);
            await loginPage.clickRequestOtp();
            await otpPage.isOtpPageVisible();
            await otpPage.fillOtp(data.otpCode || otpDefault);
            await otpPage.submitOtp();
            const isCanLogin = data.canLogin === "true"; // Wait for 2 seconds to ensure the OTP is processed

            if (isCanLogin) {
                await homePage.waitForHomePageLoad();
                await homePage.verifyLoggedInUserIsVisible(data.fullName);
            } else {
                await loginPage.verifyInvalidOtpMsgIsDisplayed();
            }
        });
    }
});