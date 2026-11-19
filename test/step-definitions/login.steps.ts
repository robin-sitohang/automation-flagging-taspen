import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../helper/world';
import { LoginPage } from '../pageobjects/login.page';
import { HomePage } from '../pageobjects/home.page';
import { expect } from '@playwright/test';
import path from 'path';
const { processCheckingBooking } = require('../helper/checking-booking');

let loginPage: LoginPage;
let homePage: HomePage;

Given('I open the Flagging Taspen login page', async function (this: CustomWorld) {
  loginPage = new LoginPage(this.page);
  homePage = new HomePage(this.page);
  await loginPage.goto();
});

When('I log in to Flagging Taspen with credentials from environment', async function () {
  const username = process.env.FLAGGING_USERNAME;
  const password = process.env.FLAGGING_PASSWORD;

  if (!username || !password) {
    throw new Error('Please fill in FLAGGING_USERNAME and FLAGGING_PASSWORD in the .env file first.');
  }

  await loginPage.login(username, password);
});

Then('the Google Authenticator verification modal is displayed', async function () {
  await loginPage.expectAuthenticatorVerification();
});

Then('the Flagging Taspen home page is displayed', { timeout: 180000 }, async function () {
  if (!homePage) {
    throw new Error('HomePage has not been initialized. Make sure the Given step has run.');
  }
  await homePage.expectLoaded();
});

When('I open the Checking Data menu', async function (this: CustomWorld) {
  await this.page.goto('https://flagging.taspen.co.id/checking');
  await this.page.waitForLoadState('networkidle').catch(() => {});
});

Then('the Checking Data page is displayed', async function (this: CustomWorld) {
  await expect(this.page.getByText(/Checking Data/i).first()).toBeVisible({ timeout: 30000 });
});

When('I process the NOPEN list from the Excel file', async function (this: CustomWorld) {
  const inputPath = path.resolve(process.cwd(), 'data/nopen.xlsx');
  const outputPath = path.resolve(process.cwd(), 'reports/hasil-booking.xlsx');
  await processCheckingBooking(this.page, inputPath, outputPath);
});

Then('the booking result is saved to the Excel file', async function () {
  const outputPath = path.resolve(process.cwd(), 'reports/hasil-booking.xlsx');
  const fs = await import('fs');
  if (!fs.existsSync(outputPath)) {
    throw new Error('Booking result file was not created: ' + outputPath);
  }
});