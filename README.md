# UI AutoTester - Medical Documentation System

This project contains automated Playwright tests for a Medical Documentation System web application. The system manages patient profiles, case histories, examination reports, and consolidated views.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)

### Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd ui-autitester
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Install Playwright browsers**:
   ```bash
   npx playwright install
   ```
   > ⚠️ **Important**: This step is required after installing or updating Playwright. It downloads the browser binaries (Chromium, Firefox, WebKit).

## 🧪 Running Tests

### Quick Start with Test Runner Script

We provide a convenient shell script that makes running tests easier:

```bash
# Run all tests locally
./run-tests.sh

# Run tests on a custom URL
./run-tests.sh -u https://your-app.com

# Run specific test file
./run-tests.sh -f patient.spec.js

# Run with UI mode
./run-tests.sh -m ui

# Combine options
./run-tests.sh -u https://staging.app.com -f patient.spec.js -m headed

# See all options
./run-tests.sh --help
```

### Run All Tests

```bash
npm test
```
or
```bash
npx playwright test
```

### Run Tests with UI Mode (Interactive)

```bash
npm run test:ui
```
or
```bash
npx playwright test --ui
```

This opens an interactive UI where you can:
- Run tests selectively
- See test execution in real-time
- Debug step-by-step
- View traces and screenshots

### Run Tests in Headed Mode (See Browser)

```bash
npm run test:headed
```
or
```bash
npx playwright test --headed
```

### Run Specific Test File

```bash
npx playwright test patient.spec.js
```

### Run Specific Test Suite

```bash
npx playwright test examination-reports.spec.js
```

### Run Tests by Name Pattern

```bash
npx playwright test -g "should create"
```

### Run a Single Test

```bash
npx playwright test patient.spec.js:24
```
(Line number where the test is defined)

## 📊 View Test Results

### Open Last Test Report

```bash
npm run test:report
```
or
```bash
npx playwright show-report
```

This opens an HTML report in your browser with:
- Test results summary
- Screenshots of failures
- Traces for debugging
- Execution time details

## 🧰 Useful Commands

### Debug Tests

```bash
npx playwright test --debug
```

Opens the Playwright Inspector for step-by-step debugging.

### Run Tests on Specific Browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run Tests with Maximum Workers

```bash
npx playwright test --workers=4
```

### Update Playwright Browsers

```bash
npx playwright install --force
```

## 🏗️ Project Structure

```
ui-autitester/
├── medical-doc/                    # Application source
│   ├── index.html                  # Main application page
│   ├── src/
│   │   ├── app.js                  # Application logic
│   │   ├── db.js                   # IndexedDB database service
│   │   └── styles.css              # Application styles
│   └── tests/                      # Playwright tests
│       ├── patient.spec.js         # Patient profile tests
│       ├── case-history.spec.js    # Case history tests
│       ├── examination-reports.spec.js  # Examination reports tests
│       └── consolidated-view.spec.js    # Consolidated view tests
├── playwright.config.js            # Playwright configuration
├── package.json                    # Dependencies and scripts
└── README.md                       # This file
```

## 🧪 Test Suites

### 1. Patient Profile Tests (`patient.spec.js`)
- Application loading
- Patient profile section display
- Creating patient profiles
- Form validation
- Clearing forms
- Deleting patients
- Multiple patient creation

### 2. Case History Tests (`case-history.spec.js`)
- Navigation to case history section
- Patient selector display
- Creating case histories
- Form validation
- Viewing case histories

### 3. Examination Reports Tests (`examination-reports.spec.js`)
- Navigation to examination reports section
- Patient selector display
- Creating reports with/without files
- File upload functionality
- Form validation

### 4. Consolidated View Tests (`consolidated-view.spec.js`)
- Navigation to consolidated view
- Patient selector display
- Viewing patient information
- Displaying case histories and reports

## ⚙️ Configuration

The Playwright configuration is in `playwright.config.js`:

- **Base URL**: `http://localhost:8080`
- **Browsers**: Chromium (default), Firefox, WebKit
- **Workers**: 1 (tests run sequentially to avoid database conflicts)
- **Retries**: 2 (in CI mode)
- **Timeout**: 30 seconds per test
- **Screenshots**: Captured on failure
- **Traces**: Captured on first retry

### Web Server

The configuration automatically starts an HTTP server on port 8080 before running tests:

```javascript
webServer: {
  command: 'npx http-server medical-doc -p 8080',
  port: 8080,
  reuseExistingServer: !process.env.CI,
  timeout: 120000,
}
```

## 🔧 Troubleshooting

### Port 8080 Already in Use

If you see an error about port 8080 being in use:

```bash
# macOS/Linux
lsof -ti:8080 | xargs kill -9

# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess | Stop-Process -Force
```

### Browser Executable Not Found

If you see "Executable doesn't exist" error:

```bash
npx playwright install
```

### Tests Timing Out

If tests are timing out:
1. Ensure port 8080 is not blocked by another application
2. Check your network connection (browsers are downloaded from the internet)
3. Increase timeout in `playwright.config.js` if needed

### Clear Test Data

The tests automatically clear IndexedDB data before each test. If you need to manually clear data:

1. Open the application in your browser: `http://localhost:8080`
2. Open DevTools (F12)
3. Go to Application > IndexedDB > Delete database

## 🚀 Running on a Different URL

To run tests on a different URL (e.g., production or staging):

### Option 1: Environment Variable

```bash
BASE_URL=https://your-app-url.com npx playwright test
```

Then update `playwright.config.js`:

```javascript
use: {
  baseURL: process.env.BASE_URL || 'http://localhost:8080',
  // ...
},
```

### Option 2: Modify Configuration

Edit `playwright.config.js`:

```javascript
use: {
  baseURL: 'https://your-app-url.com',
  // ...
},
```

And comment out or remove the `webServer` section if the server is already running:

```javascript
// webServer: {
//   command: 'npx http-server medical-doc -p 8080',
//   port: 8080,
// },
```

## 📝 Writing New Tests

Example test structure:

```javascript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.medicalDB && window.medicalDB.db !== null);
    await page.evaluate(() => window.medicalDB.clearAll());
  });

  test('should do something', async ({ page }) => {
    // Your test code here
    await page.click('#my-button');
    await expect(page.locator('#result')).toBeVisible();
  });
});
```

## 🤝 Contributing

1. Write tests following existing patterns
2. Ensure all tests pass before committing
3. Add meaningful test descriptions
4. Follow Playwright best practices

## 📚 Resources

- **[TESTING.md](./TESTING.md)** - Quick reference guide for testing commands
- **[ENVIRONMENTS.md](./ENVIRONMENTS.md)** - Detailed examples for running tests on different URLs/environments
- **[run-tests.sh](./run-tests.sh)** - Convenience script for running tests
- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)

## 📄 License

ISC

