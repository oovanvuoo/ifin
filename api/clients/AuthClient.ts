import type { APIRequestContext, APIResponse } from "@playwright/test";
import { testEnv } from "../../config/testEnv";
import type { OtpSendRequest } from "../models/AuthModels";

export class AuthClient {
  constructor(private readonly request: APIRequestContext) {}

  async sendOtp(payload: OtpSendRequest): Promise<APIResponse> {
    return this.request.post(`${testEnv.baseUrl}/api/proxy/api/auth/otp/send`, { data: payload });
  }

  async getCurrentUser(): Promise<APIResponse> {
    return this.request.get(`${testEnv.baseUrl}/api/proxy/api/auth/me`);
  }
}
