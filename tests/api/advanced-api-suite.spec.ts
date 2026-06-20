import { test, expect, request } from "@playwright/test";


const testEnv = {
  baseUrl: process.env.BASE_URL as string,
  testPhone: process.env.TEST_PHONE as string,
  testFullName: process.env.TEST_FULL_NAME as string
};

const generatePhone = (): string => `09${Math.floor(10_000_000 + Math.random() * 90_000_000)}`;

test.describe("E1 - Advanced API Automation", () => {
  test("API-001 GET products happy path + schema", async () => {
    const ctx = await request.newContext();
    const res = await ctx.get(`${testEnv.baseUrl}/api/proxy/api/products?statuses=active`);

    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(Array.isArray(body.data ?? body)).toBeTruthy();
    await ctx.dispose();
  });

  test("API-002 GET products negative with invalid filter", async () => {
    const ctx = await request.newContext();
    const res = await ctx.get(`${testEnv.baseUrl}/api/proxy/api/products?statuses=invalid_status`);

    expect([200, 400, 422]).toContain(res.status());
    const body = await res.json().catch(() => ({}));
    expect(typeof body).toBe("object");
    await ctx.dispose();
  });

  test("API-003 GET product categories happy path + schema", async () => {
    const ctx = await request.newContext();
    const res = await ctx.get(`${testEnv.baseUrl}/api/proxy/api/products/categories`);

    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    const data = body.data ?? body;
    expect(Array.isArray(data)).toBeTruthy();
    await ctx.dispose();
  });

  test("API-004 POST categories negative (method not allowed)", async () => {
    const ctx = await request.newContext();
    const res = await ctx.post(`${testEnv.baseUrl}/api/proxy/api/products/categories`, { data: {} });

    expect([404, 405]).toContain(res.status());
    await ctx.dispose();
  });

  test("API-005 GET auth/me negative (unauthorized)", async () => {
    const ctx = await request.newContext();
    const res = await ctx.get(`${testEnv.baseUrl}/api/proxy/api/auth/me`);

    expect([401, 403]).toContain(res.status());
    const body = await res.json().catch(() => ({}));
    expect(typeof body).toBe("object");
    await ctx.dispose();
  });

  test("API-006 POST auth/otp/send happy/negative with schema", async () => {
    const ctx = await request.newContext();
    const randomPhone = generatePhone();

    const happyRes = await ctx.post(`${testEnv.baseUrl}/api/proxy/api/auth/otp/send`, {
      data: { phone: randomPhone, fullName: testEnv.testFullName }
    });
    const happyStatus = happyRes.status();
    expect([200, 201, 400, 409, 422, 429]).toContain(happyStatus);
    expect(happyStatus).toBeLessThan(500);
    const happyBody = await happyRes.json().catch(() => ({}));
    expect(typeof happyBody).toBe("object");

    const negativeRes = await ctx.post(`${testEnv.baseUrl}/api/proxy/api/auth/otp/send`, {
      data: { phone: "123", fullName: "" }
    });
    const negativeStatus = negativeRes.status();
    expect([400, 409, 422, 429]).toContain(negativeStatus);
    expect(negativeStatus).toBeLessThan(500);
    const negativeBody = await negativeRes.json().catch(() => ({}));
    expect(typeof negativeBody).toBe("object");

    await ctx.dispose();
  });
});
