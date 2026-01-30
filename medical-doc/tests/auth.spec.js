import { test, expect } from '@playwright/test';

test.describe('Authentication System', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login.html', { waitUntil: 'networkidle' });
    
    // Wait for auth service to initialize
    await page.waitForFunction(() => window.authService && window.medicalDB && window.medicalDB.db !== null, { timeout: 10000 });
  });

  test('should display login page with default credentials', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Medical Documentation System');
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#login-btn')).toBeVisible();
    
    // Check for default credentials info
    await expect(page.locator('.default-credentials')).toContainText('admin');
  });

  test('should login with default admin credentials', async ({ page }) => {
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin');
    await page.click('#login-btn');
    
    // Wait for redirect to main application
    await page.waitForURL('**/index.html', { timeout: 10000 });
    
    // Verify we're on the main page
    await expect(page.locator('h1')).toHaveText('Medical Documentation System');
    await expect(page.locator('#current-user')).toContainText('Welcome, admin');
    await expect(page.locator('#logout-btn')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('#username', 'invaliduser');
    await page.fill('#password', 'wrongpassword');
    await page.click('#login-btn');
    
    // Should show error message
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#error-message')).toContainText('Invalid username or password');
    
    // Should stay on login page
    await expect(page).toHaveURL(/login\.html/);
  });

  test('should validate required fields', async ({ page }) => {
    // Try to submit without filling fields
    await page.click('#login-btn');
    
    // Browser validation should prevent submission
    const usernameValid = await page.locator('#username').evaluate(el => el.validity.valid);
    expect(usernameValid).toBe(false);
  });

  test('should redirect to login when accessing main app without auth', async ({ page }) => {
    // Clear any existing auth
    await page.evaluate(() => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
    });
    
    // Try to access main app
    await page.goto('/index.html');
    
    // Should redirect to login
    await page.waitForURL('**/login.html', { timeout: 10000 });
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin');
    await page.click('#login-btn');
    await page.waitForURL('**/index.html', { timeout: 10000 });
    
    // Click logout
    await page.click('#logout-btn');
    
    // Should redirect to login page
    await page.waitForURL('**/login.html', { timeout: 10000 });
    
    // Try to go back to main app
    await page.goto('/index.html');
    
    // Should redirect to login again (no auth)
    await page.waitForURL('**/login.html', { timeout: 10000 });
  });
});

test.describe('User Registration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register.html', { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.authService && window.medicalDB && window.medicalDB.db !== null, { timeout: 10000 });
  });

  test('should display registration form', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Create New Account');
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#confirm-password')).toBeVisible();
    await expect(page.locator('#register-btn')).toBeVisible();
  });

  test('should create a new user account', async ({ page }) => {
    const testUsername = 'testuser_' + Date.now();
    
    await page.fill('#username', testUsername);
    await page.fill('#password', 'testpass123');
    await page.fill('#confirm-password', 'testpass123');
    await page.click('#register-btn');
    
    // Should show success message
    await expect(page.locator('#success-message')).toBeVisible();
    await expect(page.locator('#success-message')).toContainText('Account created successfully');
    
    // Should redirect to login page
    await page.waitForURL('**/login.html', { timeout: 10000 });
    
    // Should be able to login with new credentials
    await page.waitForFunction(() => window.authService && window.medicalDB && window.medicalDB.db !== null, { timeout: 10000 });
    await page.fill('#username', testUsername);
    await page.fill('#password', 'testpass123');
    await page.click('#login-btn');
    
    await page.waitForURL('**/index.html', { timeout: 10000 });
    await expect(page.locator('#current-user')).toContainText(`Welcome, ${testUsername}`);
  });

  test('should show error for duplicate username', async ({ page }) => {
    // Try to register with admin username
    await page.fill('#username', 'admin');
    await page.fill('#password', 'testpass123');
    await page.fill('#confirm-password', 'testpass123');
    await page.click('#register-btn');
    
    // Should show error
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#error-message')).toContainText('Username already exists');
  });

  test('should validate password match', async ({ page }) => {
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'password123');
    await page.fill('#confirm-password', 'password456');
    
    // Password match indicator should show error
    await expect(page.locator('#password-match')).toContainText('do not match');
    
    // Try to submit
    await page.click('#register-btn');
    
    // Should show error
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#error-message')).toContainText('Passwords do not match');
  });

  test('should validate minimum username length', async ({ page }) => {
    await page.fill('#username', 'ab'); // Less than 3 characters
    await page.fill('#password', 'testpass');
    await page.fill('#confirm-password', 'testpass');
    await page.click('#register-btn');
    
    // Should show error or browser validation
    const errorVisible = await page.locator('#error-message').isVisible();
    const usernameValid = await page.locator('#username').evaluate(el => el.validity.valid);
    
    expect(errorVisible || !usernameValid).toBe(true);
  });

  test('should show password match indicator', async ({ page }) => {
    await page.fill('#password', 'testpass');
    await page.fill('#confirm-password', 'testpass');
    
    // Should show match indicator
    await expect(page.locator('#password-match')).toContainText('Passwords match');
  });
});
