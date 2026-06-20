import type { Locator, Page, Response } from "@playwright/test";

export class WaitUtils {
  constructor(private readonly page: Page) {}

  async waitForVisible(locator: Locator): Promise<void> {
    await locator.waitFor({ state: "visible" });
  }

  async waitForNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState("networkidle");
  }

  async waitForApiResponse(urlPart: string): Promise<Response> {
    return this.page.waitForResponse((res) => res.url().includes(urlPart));
  }
}
