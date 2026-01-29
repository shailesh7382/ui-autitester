# Environment Configuration Examples

This file contains example configurations for running tests on different environments.

## Local Development

```bash
# Using default configuration (starts local server automatically)
npm test
```

or

```bash
./run-tests.sh
```

**Expected URL**: `http://localhost:8080`
**Server**: Auto-started by Playwright

---

## Staging Environment

```bash
# Using environment variable
BASE_URL=https://staging.medical-app.com npm test
```

or

```bash
./run-tests.sh -u https://staging.medical-app.com
```

**Expected URL**: `https://staging.medical-app.com`
**Server**: Must be running externally

---

## Production Environment

```bash
# Using environment variable
BASE_URL=https://medical-app.com npm test
```

or

```bash
./run-tests.sh -u https://medical-app.com
```

**Expected URL**: `https://medical-app.com`
**Server**: Must be running externally

---

## Custom Port (Local)

```bash
# If your local server runs on a different port
BASE_URL=http://localhost:3000 npm test
```

or

```bash
./run-tests.sh -u http://localhost:3000
```

**Expected URL**: `http://localhost:3000`
**Server**: Must be started manually on port 3000

**Example**:
```bash
# Terminal 1: Start server on port 3000
npx http-server medical-doc -p 3000

# Terminal 2: Run tests
BASE_URL=http://localhost:3000 npm test
```

---

## Docker Container

If running tests against an app in a Docker container:

```bash
# Assuming container exposes port 8080
BASE_URL=http://localhost:8080 npm test
```

or

```bash
./run-tests.sh -u http://localhost:8080
```

**Note**: Make sure the webServer in `playwright.config.js` doesn't conflict with your container port.

---

## Remote Server

```bash
# Run tests against any accessible URL
BASE_URL=http://192.168.1.100:8080 npm test
```

or

```bash
./run-tests.sh -u http://192.168.1.100:8080
```

---

## Using .env File (Optional)

You can create a `.env` file for your environment (though this requires additional setup):

**Note**: This requires installing `dotenv` package.

1. Install dotenv:
   ```bash
   npm install --save-dev dotenv
   ```

2. Create `.env` file:
   ```
   BASE_URL=https://staging.medical-app.com
   ```

3. Update `playwright.config.js` to load it:
   ```javascript
   import dotenv from 'dotenv';
   dotenv.config();
   ```

4. Run tests:
   ```bash
   npm test
   ```

---

## CI/CD Examples

### GitHub Actions

```yaml
- name: Run Playwright Tests
  env:
    BASE_URL: https://staging.medical-app.com
  run: npm test
```

### GitLab CI

```yaml
test:
  script:
    - npm install
    - npx playwright install --with-deps
    - BASE_URL=https://staging.medical-app.com npm test
```

### Jenkins

```groovy
stage('Test') {
    steps {
        sh 'npm install'
        sh 'npx playwright install --with-deps'
        sh 'BASE_URL=https://staging.medical-app.com npm test'
    }
}
```

---

## Test Specific Suites on Different URLs

```bash
# Test only patient functionality on staging
BASE_URL=https://staging.app.com npm run test:patient

# Test reports on production
BASE_URL=https://app.com npm run test:reports

# Using the script
./run-tests.sh -u https://staging.app.com -f patient.spec.js
```

---

## Debugging on Different URLs

```bash
# Debug mode on staging
BASE_URL=https://staging.app.com npx playwright test --debug

# UI mode on production (use with caution!)
BASE_URL=https://app.com npm run test:ui

# Using the script
./run-tests.sh -u https://staging.app.com -m debug
```

---

## Notes

1. **Server Auto-Start**: The local server only starts automatically when no `BASE_URL` is provided
2. **Authentication**: If your app requires authentication, you may need to modify tests or use Playwright's authentication features
3. **HTTPS**: Make sure your BASE_URL includes the protocol (`http://` or `https://`)
4. **CORS**: If testing cross-origin, ensure CORS is properly configured on the server
5. **Network**: Ensure the test runner can access the specified URL (check firewalls, VPNs, etc.)

