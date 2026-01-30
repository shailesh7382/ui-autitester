import { test, expect } from '@playwright/test';

test.describe('Medical Documentation System - Patient Profile', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login.html', { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.authService && window.medicalDB && window.medicalDB.db !== null, { timeout: 10000 });
    
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin');
    await page.click('#login-btn');
    
    await page.waitForURL('**/index.html', { timeout: 10000 });
    // Wait for the database to initialize
    await page.waitForFunction(() => window.medicalDB && window.medicalDB.db !== null, { timeout: 10000 });
    // Clear all data before each test
    await page.evaluate(() => window.medicalDB.clearAll());
  });

  test('should load the application successfully', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Medical Documentation System');
    await expect(page.locator('#nav-patient')).toBeVisible();
    await expect(page.locator('#nav-history')).toBeVisible();
    await expect(page.locator('#nav-reports')).toBeVisible();
    await expect(page.locator('#nav-view')).toBeVisible();
  });

  test('should display patient profile section by default', async ({ page }) => {
    await expect(page.locator('#patient-section')).toHaveClass(/active/);
    await expect(page.locator('#patient-form')).toBeVisible();
  });

  test('should create a new patient profile', async ({ page }) => {
    // Fill in patient form
    await page.fill('#patient-name', 'John Doe');
    await page.fill('#patient-age', '35');
    await page.selectOption('#patient-gender', 'male');
    await page.fill('#patient-dob', '1989-01-15');
    await page.fill('#patient-blood-group', 'A+');
    await page.fill('#patient-contact', '1234567890');
    await page.fill('#patient-email', 'john.doe@example.com');
    await page.fill('#patient-address', '123 Main Street, City, State');

    // Submit the form
    await page.click('button[type="submit"]', { force: true });

    // Wait for notification
    await expect(page.locator('#notification')).toContainText('Patient saved successfully');

    // Verify patient card is displayed
    await expect(page.locator('.card').first()).toContainText('John Doe');
    await expect(page.locator('.card').first()).toContainText('35 years');
    await expect(page.locator('.card').first()).toContainText('male');
  });

  test('should validate required fields in patient form', async ({ page }) => {
    // Try to submit without filling required fields
    await page.click('button[type="submit"]', { force: true });

    // Check if form validation prevents submission
    const nameInput = page.locator('#patient-name');
    await expect(nameInput).toHaveAttribute('required', '');
  });

  test('should clear patient form when clicking clear button', async ({ page }) => {
    // Fill in some fields
    await page.fill('#patient-name', 'Test Patient');
    await page.fill('#patient-age', '30');

    // Click clear button
    await page.click('#clear-patient');

    // Verify fields are cleared
    await expect(page.locator('#patient-name')).toHaveValue('');
    await expect(page.locator('#patient-age')).toHaveValue('');
  });

  test('should delete a patient', async ({ page }) => {
    // Create a patient first
    await page.fill('#patient-name', 'Jane Smith');
    await page.fill('#patient-age', '28');
    await page.selectOption('#patient-gender', 'female');
    await page.fill('#patient-dob', '1996-05-20');
    await page.click('button[type="submit"]', { force: true });

    // Wait for patient to be saved
    await page.waitForTimeout(500);

    // Set up dialog handler before clicking delete
    page.once('dialog', dialog => dialog.accept());

    // Click delete button
    await page.click('.btn-danger', { force: true });

    // Wait for deletion
    await page.waitForTimeout(500);

    // Verify patient is deleted
    await expect(page.locator('#notification')).toContainText('Patient deleted successfully');
  });

  test('should create multiple patients', async ({ page }) => {
    // Create first patient
    await page.fill('#patient-name', 'Patient One');
    await page.fill('#patient-age', '40');
    await page.selectOption('#patient-gender', 'male');
    await page.fill('#patient-dob', '1984-03-10');
    await page.click('button[type="submit"]', { force: true });
    await page.waitForTimeout(300);

    // Create second patient
    await page.fill('#patient-name', 'Patient Two');
    await page.fill('#patient-age', '25');
    await page.selectOption('#patient-gender', 'female');
    await page.fill('#patient-dob', '1999-07-15');
    await page.click('button[type="submit"]', { force: true });
    await page.waitForTimeout(300);

    // Verify both patients are displayed
    const cards = page.locator('.card');
    await expect(cards).toHaveCount(2);
    await expect(page.locator('#patient-cards')).toContainText('Patient One');
    await expect(page.locator('#patient-cards')).toContainText('Patient Two');
  });
});
