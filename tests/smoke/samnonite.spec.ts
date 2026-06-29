import { test } from "../../fixtures/testFixtures.js";

test.describe("Samnonite Flow", () => {
    test("TC-001 | Open Samnonite page and skip ads registration", async ({ samnonitePage }) => {
        await samnonitePage.openSamnonitePage();
        await samnonitePage.closeAdsPopupIfVisible();
        await samnonitePage.skipAdsRegistration();
        await samnonitePage.hoverOnCategory("Balo");
        await samnonitePage.clickOnSubCategory("Balo Laptop");
        await samnonitePage.verifyProductsPageIsDisplayed();

        // const product = await samnonitePage.getProductByIndex(1);
        const product = await samnonitePage.getProductByName("Balo Magna Pace 04 R");
        // await samnonitePage.checkProductCard(product, { name: "Balo Magna Pace 04 R", price: "1,890,000₫" });
        await samnonitePage.viewProductDetails(product);
    });
});