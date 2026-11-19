import { expect, Page } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto(process.env.FLAGGING_LOGIN_URL || 'https://flagging.taspen.co.id/login');
  }

  async login(username: string, password: string) {
    const usernameInput = this.page.locator(
      'input[type="email"], input[name*="email" i], input[name*="user" i], input[type="text"]',
    ).first();
    const passwordInput = this.page.locator('input[type="password"]').first();

    await usernameInput.fill(username);
    await passwordInput.fill(password);
    await this.page.getByRole('button', { name: /login|log in|masuk|sign in/i }).click();
  }

  async expectAuthenticatorVerification() {
    await expect(
      this.page.getByText(/Verifikasi Google Authenticator/i).first(),
    ).toBeVisible({ timeout: 20000 });
    await this.page.waitForTimeout(10000)
  }

}
