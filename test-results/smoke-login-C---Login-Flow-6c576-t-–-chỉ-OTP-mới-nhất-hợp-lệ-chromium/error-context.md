# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke/login.spec.ts >> C - Login Flow >> TC-008 | Concurrent OTP request – chỉ OTP mới nhất hợp lệ
- Location: tests/smoke/login.spec.ts:123:7

# Error details

```
Test timeout of 60000ms exceeded.
```

# Page snapshot

```yaml
- main [ref=e2]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - img [ref=e5]
      - heading "Not Found" [level=1] [ref=e8]
    - generic [ref=e9]:
      - paragraph [ref=e10]: The train has not arrived at the station.
      - paragraph [ref=e11]:
        - text: Please check your
        - link "network settings" [ref=e12] [cursor=pointer]:
          - /url: https://docs.railway.com/guides/public-networking#railway-provided-domain
        - text: to confirm that your domain has provisioned.
      - paragraph [ref=e13]: If you are a visitor, please let the owner know you're stuck at the station.
    - paragraph [ref=e15]:
      - text: "Request ID:"
      - text: 1bu3AGsBTXOeJRCsDcO5xA
    - link "Go to Railway" [ref=e17] [cursor=pointer]:
      - /url: https://railway.com
```