import { expect, Page } from '@playwright/test';

export class HomePage {
  constructor(private page: Page) {}

  async expectLoaded() {
    await this.page.waitForURL(
      (url) => !url.pathname.includes('/login') && !url.pathname.includes('/2fa/verify'),
      { timeout: 120000 },
    );

    // Close the SweetAlert "Informasi" modal that appears after login.
    const okButton = this.page.locator('button.swal2-confirm').first();
    if (await okButton.isVisible().catch(() => false)) {
      await okButton.click().catch(() => {});
    } else {
      await okButton.waitFor({ state: 'visible', timeout: 8000 }).then(() => okButton.click()).catch(() => {});
    }

    // Pilih cabang POS FRANS (100186010005) melalui Select2.
    const branchCombobox = this.page.locator('span.select2-selection').first();
    await branchCombobox.click();
    const branchOption = this.page.getByRole('option', { name: /POS FRANS/i }).first();
    await branchOption.waitFor({ state: 'visible', timeout: 10000 });
    await branchOption.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});

    await expect(this.page.getByText(/Halaman Utama/i).first()).toBeVisible({ timeout: 30000 });
    await expect(this.page.getByText(/Selamat datang di Taspen Informasi Flagging/i).first()).toBeVisible({ timeout: 30000 });
  }
}