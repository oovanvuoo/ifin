import { Locator } from "playwright-core";

export class StringHelper {
    static async getTextFromLocator(locator: Locator): Promise<string> {
        return await locator.textContent().then(text => text?.trim()) || '';
    }

    static escapeRegex(value: string): string {
        return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
}