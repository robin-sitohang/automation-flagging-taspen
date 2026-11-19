const { chromium } = require('../node_modules/playwright');
const fs = require('fs');
const path = require('path');
const dotenv = require('../node_modules/dotenv');
const { processCheckingBooking } = require('../test/helper/checking-booking');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const INPUT_PATH = process.env.NOPEN_INPUT || path.resolve(__dirname, '../data/nopen.xlsx');
const OUTPUT_PATH = process.env.NOPEN_OUTPUT || path.resolve(__dirname, '../reports/hasil-booking.xlsx');
const STORAGE_STATE_PATH = path.resolve(__dirname, '../auth.json');
const LOGIN_URL = process.env.FLAGGING_LOGIN_URL || 'https://flagging.taspen.co.id/login';

(async () => {
  const hasStorage = fs.existsSync(STORAGE_STATE_PATH);
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const context = await browser.newContext(hasStorage ? { storageState: STORAGE_STATE_PATH } : {});
  const page = await context.newPage();

  await page.goto(LOGIN_URL);

  if (page.url().includes('/login')) {
    await page.fill('input[name="email"]', process.env.FLAGGING_USERNAME);
    await page.fill('input[name="password"]', process.env.FLAGGING_PASSWORD);
    await page.click('#kt_sign_in_submit');

    console.log('Please enter the Google Authenticator OTP in the browser, then click Verifikasi OTP...');
    await page.waitForURL((url) => !url.href.includes('/login') && !url.href.includes('submit_login') && !url.href.includes('/2fa/verify'), { timeout: 300000 });

    await context.storageState({ path: STORAGE_STATE_PATH });
    console.log('Session saved to:', STORAGE_STATE_PATH);
  } else {
    console.log('Reusing saved session from:', STORAGE_STATE_PATH);
  }

  const results = await processCheckingBooking(page, INPUT_PATH, OUTPUT_PATH);

  await browser.close();
  console.log('Done. Result saved to:', OUTPUT_PATH);
  console.log(JSON.stringify(results, null, 2));
})().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});