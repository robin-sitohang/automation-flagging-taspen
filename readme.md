# Automation Flagging Taspen

Project baru dengan framework yang sama seperti `automation-asabri-capture`:
Playwright, Cucumber, dan TypeScript.

## Setup

```bash
npm install
npx playwright install chromium
cp .env.example .env
```

Isi `FLAGGING_USERNAME` dan `FLAGGING_PASSWORD` di `.env` (jangan commit file
tersebut).

## Menjalankan

Jalankan semua scenario:
```bash
npm test
```

Jalankan berdasarkan tag:
```bash
npm test -- --tags @flagging-home
```

Atau langsung:
```bash
npx cucumber-js --tags @flagging-home
```

Isi daftar NOPEN di `data/nopen.xlsx` (kolom `NOPEN`). Hasil akan disimpan
di `reports/hasil-booking.xlsx`.