import { test as base } from '@playwright/test';

/**
 * Custom test fixture with authentication helpers
 */
export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Navigate to login page
    await page.goto('/login.html', { waitUntil: 'networkidle' });
    
    // Wait for auth service to initialize
    await page.waitForFunction(() => window.authService && window.medicalDB && window.medicalDB.db !== null, { timeout: 10000 });
    
    // Login with default admin credentials
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin');
    await page.click('#login-btn');
    
    // Wait for redirect to main page
    await page.waitForURL('**/index.html', { timeout: 10000 });
    await page.waitForFunction(() => window.medicalDB && window.medicalDB.db !== null, { timeout: 10000 });
    
    // Clear all data (excluding users) before test
    await page.evaluate(() => window.medicalDB.clearAll());
    
    await use(page);
  },
});

export { expect } from '@playwright/test';

/**
 * Helper function to login programmatically
 */
export async function login(page, username = 'admin', password = 'admin') {
  await page.goto('/login.html', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.authService && window.medicalDB && window.medicalDB.db !== null, { timeout: 10000 });
  
  await page.fill('#username', username);
  await page.fill('#password', password);
  await page.click('#login-btn');
  
  await page.waitForURL('**/index.html', { timeout: 10000 });
  await page.waitForFunction(() => window.medicalDB && window.medicalDB.db !== null, { timeout: 10000 });
}

/**
 * Helper function to logout
 */
export async function logout(page) {
  await page.click('#logout-btn');
  await page.waitForURL('**/login.html', { timeout: 10000 });
}

/**
 * Helper function to create a test user
 */
export async function createUser(page, username, password) {
  await page.goto('/register.html', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.authService && window.medicalDB && window.medicalDB.db !== null, { timeout: 10000 });
  
  await page.fill('#username', username);
  await page.fill('#password', password);
  await page.fill('#confirm-password', password);
  await page.click('#register-btn');
  
  // Wait for success message and redirect
  await page.waitForURL('**/login.html', { timeout: 10000 });
}
