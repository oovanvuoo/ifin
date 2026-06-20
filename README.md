# iFin Playwright Automation Framework

This repository contains a senior-level Playwright TypeScript framework for the iFin QA assessment.

## 1. Prerequisites

- Node.js 20+
- npm 10+

## 2. Installation

```bash
npm install
npx playwright install
```

## 3. Environment

Framework supports 3 environments: `STG`, `UAT`, `PROD`.

Create environment files (already included in repo):

- `.env.staging`
- `.env.uat`
- `.env.prod`

Each file should include:

```bash
BASE_URL=<target-environment-url>
TEST_PHONE=<test-phone>
TEST_FULL_NAME=<test-full-name>
OTP_DEFAULT=<otp-default>
```

You can also bootstrap from example:

```bash
cp .env.example .env.staging
cp .env.example .env.uat
cp .env.example .env.prod
```

## 4. Execute Tests

### Run a specific spec file

```bash
npx playwright test tests/smoke/signup.spec.ts
npx playwright test tests/smoke/login.spec.ts
npx playwright test tests/smoke/ctv.spec.ts
```

### Run a test folder

```bash
npx playwright test tests/smoke
npx playwright test tests/api
```

### Filter by test name (grep)

```bash
npx playwright test -g "TC-001"
npx playwright test tests/smoke -g "TC-009"
```

### Run on a specific browser

```bash
npx playwright test tests/smoke --project=chromium
npx playwright test tests/smoke --project=firefox
```

### Run with a specific environment

Set `ENV` before the command to pick the matching `.env.<env>` file:

```bash
# Staging (default)
ENV=stg npx playwright test tests/smoke
ENV=stg npx playwright test tests/api

# UAT
ENV=uat npx playwright test tests/smoke
ENV=uat npx playwright test tests/api

# Production
ENV=prod npx playwright test tests/smoke
ENV=prod npx playwright test tests/api
```

### npm script shortcuts (all default to STG)

```bash
npm run test          # run all tests
npm run smoke         # tests tagged @smoke
npm run sanity        # tests tagged @sanity
npm run regression    # tests tagged @regression
npm run api           # tests/api folder
npm run e2e           # tests tagged @e2e
```

Dedicated environment scripts:

```bash
npm run test:stg      npm run test:uat      npm run test:prod
npm run smoke:stg     npm run smoke:uat     npm run smoke:prod
npm run api:stg       npm run api:uat       npm run api:prod
npm run regression:stg  npm run regression:uat  npm run regression:prod
```

## 5. Reporting

```bash
npm run report
```

## 6. CI/CD (GitHub Actions)

CI workflow is available at `.github/workflows/playwright-ci.yml`.

### Triggers

- Pull request: run smoke suite on STG
- Push (`main`/`master`/`develop`): run smoke suite on STG
- Weekly schedule (Monday): run regression suite on STG
- Manual dispatch: choose environment (`stg`/`uat`/`prod`) and suite (`smoke`/`sanity`/`regression`/`api`/`e2e`/`all`)

### HTML Report in CI

After each run, Playwright HTML report is uploaded as artifact:

- Artifact name pattern: `playwright-html-report-<env>-<suite>-<run_number>`
- Download artifact from GitHub Actions run page
- Extract and open `playwright-report/index.html`

### Screenshot On Failure

Framework automatically captures screenshot when a testcase fails.

- Config: `use.screenshot = only-on-failure`
- Local output path: `test-results/**/test-failed-*.png`
- In CI: included inside uploaded artifact `playwright-artifacts-<env>-<suite>-<run_number>`

## 7. Key Structure

- No credentials are hardcoded in test files.
- No waitForTimeout is used in the UI test suite.
- Base URL and test inputs are stored in env files.
