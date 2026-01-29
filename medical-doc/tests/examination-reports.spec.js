import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Medical Documentation System - Examination Reports', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login.html', { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.authService && window.medicalDB && window.medicalDB.db !== null, { timeout: 10000 });
    
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin');
    await page.click('#login-btn');
    
    await page.waitForURL('**/index.html', { timeout: 10000 });
    await page.waitForFunction(() => window.medicalDB && window.medicalDB.db !== null, { timeout: 10000 });
    await page.evaluate(() => window.medicalDB.clearAll());

    // Create a test patient first
    await page.fill('#patient-name', 'Report Test Patient');
    await page.fill('#patient-age', '50');
    await page.selectOption('#patient-gender', 'female');
    await page.fill('#patient-dob', '1974-03-22');
    await page.click('button[type="submit"]', { force: true });
    await page.waitForTimeout(500);

    // Navigate to examination reports section
    await page.click('#nav-reports');
    await expect(page.locator('#reports-section')).toHaveClass(/active/);
  });

  test('should navigate to examination reports section', async ({ page }) => {
    await expect(page.locator('#reports-section')).toBeVisible();
    await expect(page.locator('#report-form')).toBeVisible();
  });

  test('should display patient selector in reports section', async ({ page }) => {
    const selector = page.locator('#report-patient-select');
    await expect(selector).toBeVisible();
    
    // Check if patient is in the selector
    const options = await selector.locator('option').allTextContents();
    expect(options.some(opt => opt.includes('Report Test Patient'))).toBeTruthy();
  });

  test('should create an examination report without file', async ({ page }) => {
    // Select patient
    await page.selectOption('#report-patient-select', { index: 1 });
    await page.waitForTimeout(300);

    // Fill in report form
    await page.fill('#report-date', '2024-01-18');
    await page.selectOption('#report-type', 'blood-test');
    await page.fill('#report-title', 'Complete Blood Count');
    await page.fill('#report-findings', 'All values within normal range. Hemoglobin: 14.5 g/dL');

    // Submit the form
    await page.click('#report-form button[type="submit"]', { force: true });

    // Wait for notification
    await expect(page.locator('#notification')).toContainText('Examination report saved successfully');

    // Verify report card is displayed
    await expect(page.locator('#report-cards .card').first()).toContainText('Complete Blood Count');
    await expect(page.locator('#report-cards .card').first()).toContainText('blood-test');
    await expect(page.locator('#report-cards .card').first()).toContainText('2024-01-18');
  });

  test('should validate required fields in report form', async ({ page }) => {
    // Try to submit without selecting patient
    await page.fill('#report-date', '2024-01-18');
    await page.selectOption('#report-type', 'x-ray');
    await page.fill('#report-title', 'Test Report');
    await page.click('#report-form button[type="submit"]', { force: true });

    // Should show error
    await expect(page.locator('#notification')).toContainText('Please select a patient');
  });

  test('should clear examination report form', async ({ page }) => {
    // Fill in some fields
    await page.fill('#report-date', '2024-01-18');
    await page.selectOption('#report-type', 'mri');
    await page.fill('#report-title', 'Test Report');

    // Click clear button
    await page.click('#clear-report');

    // Verify fields are cleared
    await expect(page.locator('#report-date')).toHaveValue('');
    await expect(page.locator('#report-title')).toHaveValue('');
  });

  test('should create multiple examination reports', async ({ page }) => {
    // Select patient
    await page.selectOption('#report-patient-select', { index: 1 });
    await page.waitForTimeout(300);

    // Create first report
    await page.fill('#report-date', '2024-01-10');
    await page.selectOption('#report-type', 'blood-test');
    await page.fill('#report-title', 'Blood Test 1');
    await page.click('#report-form button[type="submit"]', { force: true });
    await page.waitForTimeout(300);

    // Create second report
    await page.fill('#report-date', '2024-01-15');
    await page.selectOption('#report-type', 'x-ray');
    await page.fill('#report-title', 'X-Ray Chest');
    await page.click('#report-form button[type="submit"]', { force: true });
    await page.waitForTimeout(300);

    // Verify both reports are displayed
    const cards = page.locator('#report-cards .card');
    await expect(cards).toHaveCount(2);
  });

  test('should delete an examination report', async ({ page }) => {
    // Select patient
    await page.selectOption('#report-patient-select', { index: 1 });
    await page.waitForTimeout(300);

    // Create a report
    await page.fill('#report-date', '2024-01-15');
    await page.selectOption('#report-type', 'ct-scan');
    await page.fill('#report-title', 'CT Scan Report');
    await page.click('#report-form button[type="submit"]', { force: true });
    await page.waitForTimeout(500);

    // Set up dialog handler
    page.once('dialog', dialog => dialog.accept());

    // Click delete button
    const deleteButtons = page.locator('#report-cards .btn-danger');
    await deleteButtons.first().click({ force: true });

    // Wait and verify deletion
    await page.waitForTimeout(500);
    await expect(page.locator('#notification')).toContainText('Examination report deleted successfully');
  });

  test('should show empty state when no reports exist', async ({ page }) => {
    // Select patient
    await page.selectOption('#report-patient-select', { index: 1 });
    await page.waitForTimeout(300);

    // Verify empty state message
    await expect(page.locator('#report-cards .empty-state')).toContainText('No examination reports found');
  });

  test('should display different report types', async ({ page }) => {
    // Select patient
    await page.selectOption('#report-patient-select', { index: 1 });
    await page.waitForTimeout(300);

    const reportTypes = ['blood-test', 'x-ray', 'mri', 'ct-scan', 'ultrasound', 'ecg'];
    
    for (let i = 0; i < 3; i++) {
      await page.fill('#report-date', `2024-01-${10 + i}`);
      await page.selectOption('#report-type', reportTypes[i]);
      await page.fill('#report-title', `${reportTypes[i]} Report`);
      await page.click('#report-form button[type="submit"]', { force: true });
      await page.waitForTimeout(300);
    }

    // Verify reports are displayed
    const cards = page.locator('#report-cards .card');
    await expect(cards).toHaveCount(3);
  });
});
