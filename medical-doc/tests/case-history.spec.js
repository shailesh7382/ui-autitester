import { test, expect } from '@playwright/test';

test.describe('Medical Documentation System - Case History', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.medicalDB && window.medicalDB.db !== null, { timeout: 10000 });
    await page.evaluate(() => window.medicalDB.clearAll());

    // Create a test patient first
    await page.fill('#patient-name', 'Test Patient');
    await page.fill('#patient-age', '45');
    await page.selectOption('#patient-gender', 'male');
    await page.fill('#patient-dob', '1979-06-12');
    await page.click('button[type="submit"]', { force: true });
    await page.waitForTimeout(500);

    // Navigate to case history section
    await page.click('#nav-history');
    await expect(page.locator('#history-section')).toHaveClass(/active/);
  });

  test('should navigate to case history section', async ({ page }) => {
    await expect(page.locator('#history-section')).toBeVisible();
    await expect(page.locator('#history-form')).toBeVisible();
  });

  test('should display patient selector in case history section', async ({ page }) => {
    const selector = page.locator('#history-patient-select');
    await expect(selector).toBeVisible();
    
    // Check if patient is in the selector
    const options = await selector.locator('option').allTextContents();
    expect(options.some(opt => opt.includes('Test Patient'))).toBeTruthy();
  });

  test('should create a case history', async ({ page }) => {
    // Select patient
    await page.selectOption('#history-patient-select', { index: 1 });
    await page.waitForTimeout(300);

    // Fill in case history form
    await page.fill('#history-date', '2024-01-15');
    await page.fill('#history-complaint', 'Persistent headache');
    await page.fill('#history-symptoms', 'Severe headache, dizziness, fatigue');
    await page.fill('#history-diagnosis', 'Migraine');
    await page.fill('#history-treatment', 'Prescribed pain medication and rest');
    await page.fill('#history-notes', 'Follow-up in 2 weeks');

    // Submit the form
    await page.click('#history-form button[type="submit"]', { force: true });

    // Wait for notification
    await expect(page.locator('#notification')).toContainText('Case history saved successfully');

    // Verify case history card is displayed
    await expect(page.locator('#history-cards .card').first()).toContainText('2024-01-15');
    await expect(page.locator('#history-cards .card').first()).toContainText('Persistent headache');
  });

  test('should validate required fields in case history form', async ({ page }) => {
    // Try to submit without selecting patient
    await page.fill('#history-date', '2024-01-15');
    await page.fill('#history-complaint', 'Test complaint');
    await page.click('#history-form button[type="submit"]', { force: true });

    // Should show error
    await expect(page.locator('#notification')).toContainText('Please select a patient');
  });

  test('should clear case history form', async ({ page }) => {
    // Fill in some fields
    await page.fill('#history-date', '2024-01-15');
    await page.fill('#history-complaint', 'Test complaint');

    // Click clear button
    await page.click('#clear-history');

    // Verify fields are cleared
    await expect(page.locator('#history-date')).toHaveValue('');
    await expect(page.locator('#history-complaint')).toHaveValue('');
  });

  test('should display multiple case histories for a patient', async ({ page }) => {
    // Select patient
    await page.selectOption('#history-patient-select', { index: 1 });
    await page.waitForTimeout(300);

    // Create first case history
    await page.fill('#history-date', '2024-01-10');
    await page.fill('#history-complaint', 'First complaint');
    await page.click('#history-form button[type="submit"]', { force: true });
    await page.waitForTimeout(300);

    // Create second case history
    await page.fill('#history-date', '2024-01-20');
    await page.fill('#history-complaint', 'Second complaint');
    await page.click('#history-form button[type="submit"]', { force: true });
    await page.waitForTimeout(300);

    // Verify both histories are displayed
    const cards = page.locator('#history-cards .card');
    await expect(cards).toHaveCount(2);
  });

  test('should delete a case history', async ({ page }) => {
    // Select patient
    await page.selectOption('#history-patient-select', { index: 1 });
    await page.waitForTimeout(300);

    // Create a case history
    await page.fill('#history-date', '2024-01-15');
    await page.fill('#history-complaint', 'Test complaint');
    await page.click('#history-form button[type="submit"]', { force: true });
    await page.waitForTimeout(500);

    // Set up dialog handler
    page.once('dialog', dialog => dialog.accept());

    // Click delete button
    await page.click('#history-cards .btn-danger', { force: true });

    // Wait and verify deletion
    await page.waitForTimeout(500);
    await expect(page.locator('#notification')).toContainText('Case history deleted successfully');
  });

  test('should show empty state when no histories exist', async ({ page }) => {
    // Select patient
    await page.selectOption('#history-patient-select', { index: 1 });
    await page.waitForTimeout(300);

    // Verify empty state message
    await expect(page.locator('#history-cards .empty-state')).toContainText('No case histories found');
  });
});
