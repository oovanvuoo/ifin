import { expect } from "../../fixtures/testFixtures.js";
import { BasePage } from "../base/BasePage.js";

export class HomePage extends BasePage {
    private readonly btnSignup = this.page.getByRole("button", { name: "Đăng ký", exact: true });
    private readonly btnLogin = this.page.getByRole("button", { name: "Đăng nhập", exact: true });
    private readonly pageHeading = this.page.getByRole("button", { name: "Trang chủ"});

    async openHome(): Promise<void> {
        await this.open("/");
        await this.page.waitForLoadState("networkidle");
        await this.page.waitForTimeout(1000); // Wait for 1 second to ensure the page is fully loaded
    }

    async waitForHomePageLoad(): Promise<void> {
        await this.waitForPageLoad();
        await expect(this.page).toHaveURL(/\/?$/); // Ensure we're on the home page URL
        await expect(this.pageHeading).toBeVisible(); // Wait for the main heading to be visible
    }

    async isHomePageVisible(): Promise<boolean> {
        return this.pageHeading.isVisible();
    }

    async clickSignup(): Promise<void> {
        await this.btnSignup.click();
    }

    async clickLogin(): Promise<void> {
        await this.btnLogin.click();
    }

    async verifyLoggedInUserIsVisible(fullName: string): Promise<void> {
        const nameParts = fullName ? fullName.split(" ") : [];

        if (nameParts.length === 0) {
            throw new Error("User full name is empty, cannot verify user visibility.");
        }

        const displayedName = nameParts[nameParts.length - 1]; // Use the last part of the name for verification
        const userNameLocator = this.page.locator("span", { hasText: new RegExp(`^${displayedName}$`)});
        await expect(userNameLocator).toBeVisible();
        await expect(this.btnLogin).toBeHidden();
        await expect(this.btnSignup).toBeHidden();
    }
}
