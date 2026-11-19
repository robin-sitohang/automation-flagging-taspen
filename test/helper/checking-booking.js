const fs = require('fs');
const path = require('path');
const XLSX = require('../../node_modules/xlsx');

const CHECKING_URL = 'https://flagging.taspen.co.id/checking';

async function handleInfoModal(page, timeout = 5000) {
  const btn = page.locator('button.swal2-confirm').first();
  try {
    await btn.waitFor({ state: 'visible', timeout });
    await btn.click();
    await page.waitForLoadState('networkidle').catch(() => {});
  } catch (e) {
    // modal did not appear; continue
  }
}

async function selectBranch(page) {
  const combobox = page.locator('span.select2-selection').first();
  if (!(await combobox.isVisible().catch(() => false))) return;
  await combobox.click().catch(() => {});
  const option = page.getByRole('option', { name: /POS FRANS/i }).first();
  if (await option.isVisible().catch(() => false)) {
    await option.click().catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
  }
}

async function processOne(page, notas) {
  await page.goto(CHECKING_URL);
  await page.waitForLoadState('networkidle').catch(() => {});
  await selectBranch(page);

  await page.fill('input[name="notas"]', notas);
  await page.click('input[type="submit"][value="Cari"]');
  await page.waitForLoadState('networkidle').catch(() => {});
  await handleInfoModal(page);

  const hasResult = await page.getByText(/Hasil Pencarian/i).isVisible().catch(() => false);
  if (!hasResult) {
    return {
      NOPEN: notas,
      Nilai: 'NOPEN tidak ditemukan',
      Status: 'Tidak Ditemukan',
    };
  }

  const bookingButton = page.locator('button.booked').first();
  const canBook = await bookingButton.isVisible().catch(() => false);

  if (canBook) {
    await bookingButton.click();
    const confirmButton = page.locator('button.swal2-confirm').first();
    await confirmButton.waitFor({ state: 'visible', timeout: 10000 });
    await confirmButton.click();

    const successButton = page.locator('button.swal2-confirm').first();
    try {
      await successButton.waitFor({ state: 'visible', timeout: 10000 });
      await successButton.click();
    } catch (e) {
      // tidak ada modal sukses; lanjut
    }

    await page.waitForURL(/monitoring_booking/, { timeout: 15000 }).catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});

    return {
      NOPEN: notas,
      Nilai: 'Sudah di Booked di Mitra yang Sama',
      Status: 'Berhasil',
    };
  }

  let nilai = '';
  const sudah = page.getByText(/Sudah di Booked/i).first();
  if (await sudah.isVisible().catch(() => false)) {
    nilai = (await sudah.innerText()).trim();
  } else {
    try {
      nilai = (await page.locator('.notice h4').first().innerText()).trim();
    } catch (e) {
      nilai = '';
    }
  }

  return {
    NOPEN: notas,
    Nilai: nilai,
    Status: 'Tidak Booking',
  };
}

async function processCheckingBooking(page, inputPath, outputPath) {
  if (!fs.existsSync(inputPath)) {
    throw new Error('Input file not found: ' + inputPath);
  }

  const workbook = XLSX.readFile(inputPath);
  const sheetName = workbook.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  if (!rows.length) {
    throw new Error('Input file is empty: ' + inputPath);
  }

  const results = [];
  for (const row of rows) {
    const notas = String(row.NOPEN || row.nopen || row.Notas || '').trim();
    if (!notas) continue;
    const result = await processOne(page, notas);
    results.push(result);
  }

  const outDir = path.dirname(outputPath);
  fs.mkdirSync(outDir, { recursive: true });
  const outSheet = XLSX.utils.json_to_sheet(results, { header: ['NOPEN', 'Nilai', 'Status'] });
  const outBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(outBook, outSheet, 'Hasil');
  XLSX.writeFile(outBook, outputPath);

  // Update file input juga, agar kolom Nilai dan Status ikut tersimpan di data/nopen.xlsx
  const inputSheet = XLSX.utils.json_to_sheet(results, { header: ['NOPEN', 'Nilai', 'Status'] });
  const inputBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(inputBook, inputSheet, 'NOPEN');
  XLSX.writeFile(inputBook, inputPath);

  return results;
}

module.exports = { processCheckingBooking, processOne, handleInfoModal, selectBranch };