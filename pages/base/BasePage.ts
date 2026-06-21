import type { Locator, Page } from "@playwright/test";

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  async open(path: string): Promise<void> {
    await this.page.goto(path, { waitUntil: "domcontentloaded" });
  }

  async click(locator: Locator): Promise<void> {
    await locator.click();
  }

  async fill(locator: Locator, value: string): Promise<void> {
    await locator.fill(value);
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState("domcontentloaded");
  }

  protected async tryToFill(locator: any, value: string): Promise<void> {
    // Must be retry because FE have some process refresh UI after fill input.
   for (let attempt = 0; attempt < 3; attempt++) {
      await locator.fill(value);
      await this.page.waitForTimeout(1000); // Wait for 1000ms to allow the UI to update
      if((await locator.inputValue()) === value) {
        return; // Successfully filled the input
      }
    }
  }
}
