// ============================================================
//  SmartPR – Google Apps Script Backend
//  File ini di-paste ke Google Apps Script Editor
//  lalu di-deploy sebagai Web App
// ============================================================

// ── Ganti dengan ID Spreadsheet kamu ─────────────────────────
const SPREADSHEET_ID = "PASTE_SPREADSHEET_ID_DISINI";
const SHEET_NAME     = "PR";

// ── GET – Ambil semua data ────────────────────────────────────
function doGet(e) {
  try {
    const sheet = getSheet();
    const rows  = sheet.getDataRange().getValues();

    if (rows.length <= 1) {
      return jsonResponse([]);
    }

    const headers = rows[0]; // baris pertama = header
    const data = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h.toLowerCase()] = row[i]; });
      return obj;
    });

    return jsonResponse(data);
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

// ── POST – Tambah / Edit / Hapus ──────────────────────────────
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const sheet   = getSheet();

    // ── HAPUS ──────────────────────────────────────────────
    if (payload.hapus !== undefined) {
      const rowIndex = findRowById(sheet, payload.hapus);
      if (rowIndex > 0) sheet.deleteRow(rowIndex);
      return jsonResponse({ success: true, action: "delete" });
    }

    // ── EDIT (ada id) ──────────────────────────────────────
    if (payload.id !== undefined && payload.id !== "") {
      const rowIndex = findRowById(sheet, payload.id);
      if (rowIndex > 0) {
        sheet.getRange(rowIndex, 2).setValue(payload.nama);
        sheet.getRange(rowIndex, 3).setValue(payload.mapel);
        sheet.getRange(rowIndex, 4).setValue(payload.deadline);
        sheet.getRange(rowIndex, 5).setValue(payload.prioritas);
        sheet.getRange(rowIndex, 6).setValue(payload.status);
      }
      return jsonResponse({ success: true, action: "update" });
    }

    // ── TAMBAH BARU ────────────────────────────────────────
    const id          = generateId();
    const tanggalBuat = new Date().toISOString().split("T")[0];

    sheet.appendRow([
      id,
      payload.nama,
      payload.mapel,
      payload.deadline,
      payload.prioritas,
      payload.status || "Belum",
      tanggalBuat
    ]);

    return jsonResponse({ success: true, action: "insert", id: id });

  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

// ── Helper: ambil sheet ───────────────────────────────────────
function getSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);

  // Buat sheet + header jika belum ada
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["ID", "Nama Tugas", "Mata Pelajaran", "Deadline", "Prioritas", "Status", "Tanggal Dibuat"]);
    sheet.setFrozenRows(1);

    // Format header
    const headerRange = sheet.getRange(1, 1, 1, 7);
    headerRange.setBackground("#4F46E5");
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
  }

  return sheet;
}

// ── Helper: cari baris berdasarkan ID ────────────────────────
function findRowById(sheet, id) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) return i + 1; // 1-indexed
  }
  return -1;
}

// ── Helper: generate ID unik ──────────────────────────────────
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// ── Helper: return JSON dengan CORS ──────────────────────────
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
