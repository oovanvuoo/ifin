export const testEnv = {
  baseUrl: process.env.BASE_URL ?? "https://nomi-staging-3c09.up.railway.app",
  testPhone: process.env.TEST_PHONE ?? "0912345678",
  testFullName: process.env.TEST_FULL_NAME ?? "QA Auto Test",
  otpDefault: process.env.OTP_DEFAULT ?? "000000"
};
