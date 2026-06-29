import {BasePage} from './base/BasePage.js';
import {expect} from '../fixtures/testFixtures.js';
import { Locator } from 'playwright-core';
import { StringHelper } from '../helpers/stringHelper.js';

export class SamnonitePage extends BasePage {
    private readonly dialogAdsRegister = this.page.locator("//div[@id='onesignal-slidedown-dialog']");

    async openSamnonitePage(): Promise<void> {
        await this.open('https://samsonite-vietnam.com/');
    }

    async skipAdsRegistration(): Promise<void> {
        const isDialogVisible = await this.waitForElementVisible(this.dialogAdsRegister, 5000);
        if(isDialogVisible) {
            console.log("Dialog ADS register is displayed")
            const btnSkipAdsResigter = this.dialogAdsRegister.getByRole("button", { name: "Không, cảm ơn" });
            await btnSkipAdsResigter.click();
            console.log("Button ADS register is clicked")
            await expect(this.dialogAdsRegister).toBeHidden({timeout: 5_000});
        }
    }

    async hoverOnCategory(categoryName: string): Promise<void> {
        console.log(`Hover on category: ${categoryName}`);

        const selectedCate = this.page.locator(`.headerMenu .sliderMenu > li > a[title="${categoryName}"]`);
        await selectedCate.hover();
        const categoryDialog = this.page.locator(`.headerMenu .sliderMenu > li:has(> a[title="${categoryName}"]) >  ul`);
        console.log(`Waiting for category dialog to be visible for category: ${categoryName}`);
        expect(await categoryDialog.isVisible()).toBe(true);
    }

    async clickOnSubCategory(subCategoryName: string): Promise<void> {
        console.log(`Click on sub-category: ${subCategoryName}`);
        const exactName = new RegExp(`^${StringHelper.escapeRegex(subCategoryName)}$`, "i");

        // Fallback for legacy/menu variants that render anchors.
        const subCategoryLink = this.page
            .locator(".headerMenu .sliderMenu li menu a, .headerMenu .sliderMenu li ul li a")
            .filter({ hasText: exactName })
            .first();

        const linkVisible = await this.waitForElementVisible(subCategoryLink, 10_000);
        expect(linkVisible).toBe(true);
        await subCategoryLink.click();
    }

    async closeAdsPopupIfVisible(): Promise<void> {
        const adsPopup = this.page.locator("#popup-contact");
        const isAdsPopupVisible = await this.waitForElementVisible(adsPopup, 5000);
        if(isAdsPopupVisible) {
            console.log("Ads popup is displayed")
            const btnCloseAdsPopup = adsPopup.locator(".close-popup-contact");
            await btnCloseAdsPopup.click();
            console.log("Button close Ads popup is clicked")
            await expect(adsPopup).toBeHidden({timeout: 5_000});
        }
    }

    async verifyProductsPageIsDisplayed(): Promise<void> {
        console.log("Verifying products page is displayed");
        await this.page.waitForLoadState("domcontentloaded");
        await expect(this.page).toHaveURL(/\/collections\/balo-laptop/, { timeout: 60_000 });
    }

    async getProductByIndex(index: number): Promise<Locator> {
        console.log(`Getting product at index ${index}`);
        const products = this.page.locator(".proLoop");
        expect(await products.count(), {message: `Expected at least ${index + 1} products, but found ${await products.count()}`}).toBeGreaterThan(index + 1);
        return products.nth(index);
    }

    async getProductByName(productName: string): Promise<Locator> {
        console.log(`Getting product by name: ${productName}`);
        const products = this.page.locator(".proLoop");
        const product =  products.filter({ hasText: new RegExp(StringHelper.escapeRegex(productName), "i") }).first();
        expect(await products.count(), {message: `Expected at least 1 product, but found ${await products.count()}`}).toBeGreaterThan(0);
        console.log(`Found product with name: ${await StringHelper.getTextFromLocator(product.locator('h4'))}`, " - Price: ", await StringHelper.getTextFromLocator(product.locator(".price .strike-through-abc .value")));
        return product;
    }

    async checkProductPriceByIndex(index: number, expectedPrice: string): Promise<void> {
        console.log(`Checking product price at index ${index} has expected price: ${expectedPrice}`);
        const product = await this.getProductByIndex(index);
        const price = await StringHelper.getTextFromLocator(product.locator(".price .strike-through-abc .value"));
        expect(price).toBe(expectedPrice);
    }

    async checkProductCard(product: Locator, expectedDetail: any): Promise<void> {
        console.log(`Checking product card has expected details: ${JSON.stringify(expectedDetail)}`);
        const name = await StringHelper.getTextFromLocator(product.getByRole("heading", { name: expectedDetail.name, exact: true }));
        expect(name).toBe(expectedDetail.name);

        const price = await StringHelper.getTextFromLocator(product.locator(".price .strike-through-abc .value"));
        expect(price).toBe(expectedDetail.price);
    }

    async viewProductDetails(locator: Locator): Promise<void> {
        console.log("Open product details page");
        const viewDetailsButton = locator.locator(".btn-go-details");
        await viewDetailsButton.click();
        await this.page.waitForLoadState("domcontentloaded");
        await expect(this.page).toHaveURL(/\/products\//, { timeout: 60_000 });
    }

    async viewProductDetailsByIndex(index: number): Promise<void> {
        console.log(`Viewing product details at index ${index}`);
        const product = await this.getProductByIndex(index);
        await this.viewProductDetails(product);
    }
}