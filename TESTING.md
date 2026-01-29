# Playwright Testing Quick Reference

## 🚀 Quick Commands

```bash
# Install dependencies (first time)
npm install
npx playwright install

# Run all tests
npm test

# Run with UI mode (recommended for development)
npm run test:ui

# Run in headed mode (see browser)
npm run test:headed

# View last test report
npm run test:report

# Run specific test file
npx playwright test patient.spec.js

# Run tests on a different URL
BASE_URL=https://your-app.com npx playwright test
```

## 📋 Test Coverage

| Test Suite | File | Tests Count | Coverage |
|------------|------|-------------|----------|
| Patient Profile | `patient.spec.js` | 7 tests | Patient CRUD operations |
| Case History | `case-history.spec.js` | Multiple | Case history management |
| Examination Reports | `examination-reports.spec.js` | Multiple | Report management with file uploads |
| Consolidated View | `consolidated-view.spec.js` | Multiple | Data aggregation views |

## 🎯 Running Tests on Different Environments

### Local Development (Default)
```bash
npm test
# Runs on http://localhost:8080 with auto-started server
```

### Staging Environment
```bash
BASE_URL=https://staging.medical-app.com npx playwright test
```

### Production Environment
```bash
BASE_URL=https://medical-app.com npx playwright test
```

### Custom Port
```bash
BASE_URL=http://localhost:3000 npx playwright test
```

## 🔍 Debugging Tests

### Using Playwright Inspector
```bash
npx playwright test --debug
```

### Using UI Mode (Recommended)
```bash
npm run test:ui
```

### Using Console Logs
```javascript
test('debug test', async ({ page }) => {
  console.log(await page.locator('#element').textContent());
});
```

### Using Playwright Trace Viewer
```bash
npx playwright show-trace trace.zip
```

## 📊 Test Reports

Reports are automatically generated after each test run in `playwright-report/`.

To view the last report:
```bash
npm run test:report
```

## 🛠️ Troubleshooting

### ❌ Port Already in Use
```bash
# Kill process on port 8080
lsof -ti:8080 | xargs kill -9
```

### ❌ Browser Not Found
```bash
# Reinstall browsers
npx playwright install --force
```

### ❌ Tests Failing
1. Check if application is accessible at the BASE_URL
2. Verify database initialization completes
3. Check browser console for JavaScript errors
4. Review screenshots in test-results/ folder

## 📝 Best Practices

1. **Always clear data in beforeEach**
   ```javascript
   test.beforeEach(async ({ page }) => {
     await page.goto('/');
     await page.waitForFunction(() => window.medicalDB && window.medicalDB.db !== null);
     await page.evaluate(() => window.medicalDB.clearAll());
   });
   ```

2. **Use proper waits**
   ```javascript
   // ✅ Good
   await expect(page.locator('#element')).toBeVisible();
   
   // ❌ Avoid
   await page.waitForTimeout(5000);
   ```

3. **Use meaningful selectors**
   ```javascript
   // ✅ Good
   await page.click('#submit-button');
   
   // ❌ Avoid
   await page.click('div > div > button:nth-child(3)');
   ```

4. **Handle dialogs properly**
   ```javascript
   page.once('dialog', dialog => dialog.accept());
   await page.click('#delete-button');
   ```

## 🔗 Resources

- [Main README](./README.md) - Full documentation
- [Playwright Docs](https://playwright.dev/)
- [Test Files](./medical-doc/tests/) - All test specifications

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review test results and screenshots
3. Check Playwright documentation
4. Review application console logs

