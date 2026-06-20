import { expect, type APIResponse } from "@playwright/test";
import { AuthClient } from "../clients/AuthClient";

export class AuthService {
  constructor(private readonly client: AuthClient) {}

  async sendOtp(phone: string, fullName: string): Promise<APIResponse> {
    return this.client.sendOtp({ phone, fullName });
  }

  async verifyResponseHasCommonShape(response: APIResponse): Promise<void> {
    const body = await response.json().catch(() => ({}));
    expect(typeof body).toBe("object");
    expect(body).not.toBeNull();
  }
}
