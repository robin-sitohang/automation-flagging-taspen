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
tersebut). Jalankan scenario login dengan:

```bash
npm run test:login
```

Scenario menguji bahwa modal **Verifikasi Google Authenticator** tampil setelah
login, lalu memverifikasi halaman utama. Kode MFA tidak diotomatisasi; input
manual saat browser terbuka.

Proses cek NOPEN/booking dari Excel:
```bash
npm run check:booking
```
Isi daftar NOPEN di `data/nopen.xlsx` (kolom `NOPEN`). Hasil akan disimpan
di `reports/hasil-booking.xlsx` dengan kolom NOPEN, Keterangan, dan Nilai.
