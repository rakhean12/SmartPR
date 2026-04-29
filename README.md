# SmartPR – Platform Penjadwalan PR Sekolah

Website modern untuk mencatat PR, deadline tugas, jadwal belajar, dan progress penyelesaian tugas siswa.

---

## 📁 Struktur File

```
├── index.html       → Halaman utama website
├── script.js        → JavaScript (fetch API, render, kalender)
├── apps-script.gs   → Backend Google Apps Script
└── README.md        → Panduan ini
```

---

## 🚀 Cara Deploy (Step by Step)

### Langkah 1 – Buat Google Spreadsheet

1. Buka [Google Sheets](https://sheets.google.com) → buat spreadsheet baru
2. Beri nama sheet tab menjadi **`PR`** (huruf kapital)
3. Kolom akan dibuat otomatis oleh Apps Script, tapi kamu bisa buat manual:

| A  | B          | C              | D        | E         | F      | G              |
|----|------------|----------------|----------|-----------|--------|----------------|
| ID | Nama Tugas | Mata Pelajaran | Deadline | Prioritas | Status | Tanggal Dibuat |

4. Salin **ID Spreadsheet** dari URL:
   ```
   https://docs.google.com/spreadsheets/d/[INI_SPREADSHEET_ID]/edit
   ```

---

### Langkah 2 – Setup Google Apps Script

1. Di Spreadsheet, klik menu **Ekstensi → Apps Script**
2. Hapus kode default, paste seluruh isi file `apps-script.gs`
3. Ganti baris ini dengan ID Spreadsheet kamu:
   ```javascript
   const SPREADSHEET_ID = "PASTE_SPREADSHEET_ID_DISINI";
   ```
4. Klik **Simpan** (ikon disket atau Ctrl+S)

---

### Langkah 3 – Deploy sebagai Web App

1. Klik tombol **Deploy → New deployment**
2. Klik ikon ⚙️ di samping "Select type" → pilih **Web app**
3. Isi konfigurasi:
   - **Description**: SmartPR API
   - **Execute as**: `Me`
   - **Who has access**: `Anyone` ← **penting!**
4. Klik **Deploy**
5. Izinkan akses saat diminta (klik "Allow")
6. **Salin URL Web App** yang muncul, contoh:
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```

---

### Langkah 4 – Hubungkan ke Website

1. Buka file `script.js`
2. Ganti baris pertama:
   ```javascript
   const API_URL = "PASTE_URL_GOOGLE_SCRIPT_DISINI";
   ```
   Menjadi URL yang kamu salin tadi:
   ```javascript
   const API_URL = "https://script.google.com/macros/s/AKfycb.../exec";
   ```
3. Simpan file

---

### Langkah 5 – Upload ke GitHub Pages

1. Push semua file (`index.html`, `script.js`) ke repo GitHub
2. Di repo GitHub → **Settings → Pages**
3. Source: pilih branch `main`, folder `/ (root)`
4. Klik **Save**
5. Website live di: `https://[username].github.io/[repo-name]/`

---

## ✨ Fitur Website

| Fitur | Keterangan |
|-------|-----------|
| 📋 Tambah PR | Form input tugas dengan validasi |
| ✏️ Edit Tugas | Edit data langsung dari tabel |
| 🗑️ Hapus Tugas | Konfirmasi modal sebelum hapus |
| 🔍 Filter & Search | Cari berdasarkan nama, status, prioritas |
| 📊 Statistik | Total, selesai, belum, deadline terdekat |
| 📅 Kalender | Visualisasi deadline per bulan |
| 📱 Responsive | Mobile friendly |
| ⚠️ Indikator Terlambat | Tugas melewati deadline ditandai merah |

---

## 🛠️ Teknologi

- **Frontend**: HTML5, Tailwind CSS (CDN), Vanilla JavaScript
- **Backend**: Google Apps Script
- **Database**: Google Spreadsheet
- **Hosting**: GitHub Pages (gratis)

---

## ❓ Troubleshooting

**Data tidak muncul / error CORS**
- Pastikan "Who has access" di-set ke **Anyone**
- Setiap kali edit Apps Script, harus **deploy ulang** (New deployment)

**Tombol simpan tidak merespons**
- Buka DevTools (F12) → Console, cek error
- Pastikan `API_URL` sudah diisi dengan benar

**Data tersimpan tapi tidak muncul**
- Cek nama sheet tab harus persis **`PR`**
- Refresh halaman atau klik tombol 🔄 Refresh
