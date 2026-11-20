import { Before, After, Status } from '@cucumber/cucumber';
import { chromium, firefox, webkit } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const BROWSER = process.env.BROWSER || 'chromium';
const HEADLESS = process.env.HEADLESS !== 'false';
const SLOW_MO = Number(process.env.SLOW_MO) || 0;
const VIEWPORT_WIDTH = Number(process.env.VIEWPORT_WIDTH) || 1280;
const VIEWPORT_HEIGHT = Number(process.env.VIEWPORT_HEIGHT) || 720;

const browsers: Record<string, typeof chromium> = { chromium, firefox, webkit };

Before({ timeout: 30000 }, async function () {
  const launch = browsers[BROWSER] || chromium;
  const channel = process.env.BROWSER_CHANNEL || (process.platform === 'darwin' ? 'chrome' : undefined);

  this.browser = await launch.launch({
    headless: HEADLESS,
    slowMo: SLOW_MO,
    channel,
    args: ['--start-maximized'],
  });

  this.context = await this.browser.newContext({
    baseURL: process.env.BASE_URL,
    viewport: null,
  });

  this.page = await this.context.newPage();
});

After({ timeout: 15000 }, async function (scenario: any) {
  const screenshotDir = path.resolve(__dirname, '../../reports/screenshots');

  if (scenario.result?.status === Status.FAILED) {
    fs.mkdirSync(screenshotDir, { recursive: true });

    if (this.page) {
      const screenshot = await this.page.screenshot();
      const name = scenario.pickle.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 80);
      const file = path.join(screenshotDir, `${name}_${Date.now()}.png`);
      fs.writeFileSync(file, screenshot);
      await this.attach(screenshot, 'image/png');
    }
  }

  await this.page?.close();
  await this.context?.close();
  await this.browser?.close();
});
