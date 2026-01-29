import { test, expect } from '@playwright/test';

test.describe('Medical Documentation System - Consolidated View', () => {
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

    // Create a test patient
    await page.fill('#patient-name', 'Consolidated View Patient');
    await page.fill('#patient-age', '38');
    await page.selectOption('#patient-gender', 'male');
    await page.fill('#patient-dob', '1986-08-15');
    await page.fill('#patient-blood-group', 'B+');
    await page.fill('#patient-contact', '9876543210');
    await page.fill('#patient-email', 'consolidated@example.com');
    await page.click('button[type="submit"]', { force: true });
    await page.waitForTimeout(500);
  });

  test('should navigate to consolidated view section', async ({ page }) => {
    await page.click('#nav-view');
    await expect(page.locator('#view-section')).toHaveClass(/active/);
    await expect(page.locator('#view-section')).toBeVisible();
  });

  test('should display patient selector in consolidated view', async ({ page }) => {
    await page.click('#nav-view');
    
    const selector = page.locator('#view-patient-select');
    await expect(selector).toBeVisible();
    
    // Check if patient is in the selector
    const options = await selector.locator('option').allTextContents();
    expect(options.some(opt => opt.includes('Consolidated View Patient'))).toBeTruthy();
  });

  test('should display patient profile in consolidated view', async ({ page }) => {
    await page.click('#nav-view');
    
    // Select patient
    await page.selectOption('#view-patient-select', { index: 1 });
    await page.waitForTimeout(500);

    // Verify patient profile is displayed
    await expect(page.locator('.patient-profile-card')).toBeVisible();
    await expect(page.locator('.patient-profile-card')).toContainText('Consolidated View Patient');
    await expect(page.locator('.patient-profile-card')).toContainText('38 years');
    await expect(page.locator('.patient-profile-card')).toContainText('B+');
    await expect(page.locator('.patient-profile-card')).toContainText('9876543210');
    await expect(page.locator('.patient-profile-card')).toContainText('consolidated@example.com');
  });

  test('should display case histories in consolidated view', async ({ page }) => {
    // Add a case history
    await page.click('#nav-history');
    await page.selectOption('#history-patient-select', { index: 1 });
    await page.waitForTimeout(300);
    
    await page.fill('#history-date', '2024-01-20');
    await page.fill('#history-complaint', 'Fever and cough');
    await page.fill('#history-diagnosis', 'Common cold');
    await page.click('#history-form button[type="submit"]', { force: true });
    await page.waitForTimeout(500);

    // Navigate to consolidated view
    await page.click('#nav-view');
    await page.selectOption('#view-patient-select', { index: 1 });
    await page.waitForTimeout(500);

    // Verify case history section
    await expect(page.locator('#consolidated-view')).toContainText('Case Histories (1)');
    await expect(page.locator('#consolidated-view')).toContainText('Fever and cough');
    await expect(page.locator('#consolidated-view')).toContainText('Common cold');
  });

  test('should display examination reports in consolidated view', async ({ page }) => {
    // Add an examination report
    await page.click('#nav-reports');
    await page.selectOption('#report-patient-select', { index: 1 });
    await page.waitForTimeout(300);
    
    await page.fill('#report-date', '2024-01-22');
    await page.selectOption('#report-type', 'blood-test');
    await page.fill('#report-title', 'Blood Test Results');
    await page.fill('#report-findings', 'Normal values');
    await page.click('#report-form button[type="submit"]', { force: true });
    await page.waitForTimeout(500);

    // Navigate to consolidated view
    await page.click('#nav-view');
    await page.selectOption('#view-patient-select', { index: 1 });
    await page.waitForTimeout(500);

    // Verify examination report section
    await expect(page.locator('#consolidated-view')).toContainText('Examination Reports (1)');
    await expect(page.locator('#consolidated-view')).toContainText('Blood Test Results');
    await expect(page.locator('#consolidated-view')).toContainText('blood-test');
  });

  test('should display complete medical history in consolidated view', async ({ page }) => {
    // Add multiple case histories
    await page.click('#nav-history');
    await page.selectOption('#history-patient-select', { index: 1 });
    await page.waitForTimeout(300);

    await page.fill('#history-date', '2024-01-15');
    await page.fill('#history-complaint', 'First complaint');
    await page.click('#history-form button[type="submit"]', { force: true });
    await page.waitForTimeout(300);

    await page.fill('#history-date', '2024-01-20');
    await page.fill('#history-complaint', 'Second complaint');
    await page.click('#history-form button[type="submit"]', { force: true });
    await page.waitForTimeout(300);

    // Add multiple examination reports
    await page.click('#nav-reports');
    await page.selectOption('#report-patient-select', { index: 1 });
    await page.waitForTimeout(300);

    await page.fill('#report-date', '2024-01-16');
    await page.selectOption('#report-type', 'x-ray');
    await page.fill('#report-title', 'Chest X-Ray');
    await page.click('#report-form button[type="submit"]', { force: true });
    await page.waitForTimeout(300);

    await page.fill('#report-date', '2024-01-21');
    await page.selectOption('#report-type', 'blood-test');
    await page.fill('#report-title', 'Blood Analysis');
    await page.click('#report-form button[type="submit"]', { force: true });
    await page.waitForTimeout(300);

    // Navigate to consolidated view
    await page.click('#nav-view');
    await page.selectOption('#view-patient-select', { index: 1 });
    await page.waitForTimeout(500);

    // Verify all sections
    await expect(page.locator('#consolidated-view')).toContainText('Patient Profile');
    await expect(page.locator('#consolidated-view')).toContainText('Case Histories (2)');
    await expect(page.locator('#consolidated-view')).toContainText('Examination Reports (2)');
    await expect(page.locator('#consolidated-view')).toContainText('First complaint');
    await expect(page.locator('#consolidated-view')).toContainText('Second complaint');
    await expect(page.locator('#consolidated-view')).toContainText('Chest X-Ray');
    await expect(page.locator('#consolidated-view')).toContainText('Blood Analysis');
  });

  test('should show empty state for patient with no medical records', async ({ page }) => {
    await page.click('#nav-view');
    await page.selectOption('#view-patient-select', { index: 1 });
    await page.waitForTimeout(500);

    // Verify empty states
    await expect(page.locator('#consolidated-view')).toContainText('Case Histories (0)');
    await expect(page.locator('#consolidated-view')).toContainText('Examination Reports (0)');
    await expect(page.locator('#consolidated-view')).toContainText('No case histories recorded');
    await expect(page.locator('#consolidated-view')).toContainText('No examination reports recorded');
  });

  test('should handle multiple patients in consolidated view', async ({ page }) => {
    // Create second patient
    await page.fill('#patient-name', 'Second Patient');
    await page.fill('#patient-age', '42');
    await page.selectOption('#patient-gender', 'female');
    await page.fill('#patient-dob', '1982-11-30');
    await page.click('button[type="submit"]', { force: true });
    await page.waitForTimeout(500);

    // Navigate to consolidated view
    await page.click('#nav-view');

    // Select first patient
    await page.selectOption('#view-patient-select', { index: 1 });
    await page.waitForTimeout(300);
    await expect(page.locator('#consolidated-view')).toContainText('Consolidated View Patient');

    // Select second patient
    await page.selectOption('#view-patient-select', { index: 2 });
    await page.waitForTimeout(300);
    await expect(page.locator('#consolidated-view')).toContainText('Second Patient');
  });
});
