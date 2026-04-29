// ============================================================
//  SmartPR – script.js
//  Ganti nilai API_URL di bawah dengan URL Google Apps Script
//  yang sudah kamu deploy sebagai Web App.
// ============================================================

const API_URL = "PASTE_URL_GOOGLE_SCRIPT_DISINI";

// ── State ────────────────────────────────────────────────────
let semuaData   = [];   // cache data dari spreadsheet
let hapusId     = null; // id yang akan dihapus
let calYear     = new Date().getFullYear();
let calMonth    = new Date().getMonth(); // 0-indexed

// ── Inisialisasi ─────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  renderKalender();
  document.getElementById("menuBtn").addEventListener("click", toggleMobile);
});

// ── Mobile Menu ───────────────────────────────────────────────
function toggleMobile() {
  document.getElementById("mobileMenu").classList.toggle("hidden");
}
function closeMobile() {
  document.getElementById("mobileMenu").classList.add("hidden");
}

// ── Toast Notifikasi ──────────────────────────────────────────
function showToast(msg = "Berhasil!", type = "success") {
  const t = document.getElementById("toast");
  t.textContent = (type === "success" ? "✅ " : "❌ ") + msg;
  t.className = `fixed bottom-6 right-6 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-lg z-50 transition-all duration-400
    ${type === "success" ? "bg-emerald-600" : "bg-rose-600"}`;
  t.style.opacity = "1";
  t.style.transform = "translateY(0)";
  setTimeout(() => {
    t.style.opacity = "0";
    t.style.transform = "translateY(1rem)";
  }, 2800);
}

// ── Load Data dari Spreadsheet ────────────────────────────────
async function loadData() {
  setLoading(true);
  try {
    const res  = await fetch(API_URL);
    const data = await res.json();
    semuaData  = data;
    renderTabel(data);
    renderStatistik(data);
    renderKalender();
  } catch (e) {
    console.error(e);
    showToast("Gagal memuat data. Cek koneksi atau URL API.", "error");
    setLoading(false);
  }
}

function setLoading(state) {
  document.getElementById("loadingState").classList.toggle("hidden", !state);
  document.getElementById("tableWrapper").classList.toggle("hidden", state);
  document.getElementById("emptyState").classList.add("hidden");
}

// ── Render Tabel ──────────────────────────────────────────────
function renderTabel(data) {
  document.getElementById("loadingState").classList.add("hidden");

  if (!data || data.length === 0) {
    document.getElementById("tableWrapper").classList.add("hidden");
    document.getElementById("emptyState").classList.remove("hidden");
    return;
  }

  document.getElementById("tableWrapper").classList.remove("hidden");
  document.getElementById("emptyState").classList.add("hidden");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let html = "";
  data.forEach((item, i) => {
    const dl      = new Date(item.deadline);
    const expired = dl < today && item.status !== "Selesai";
    const rowCls  = expired ? "bg-rose-50" : "";

    html += `
    <tr class="hover:bg-slate-50 transition ${rowCls}">
      <td class="px-4 py-3 text-slate-400 font-medium">${i + 1}</td>
      <td class="px-4 py-3 font-semibold text-slate-800">
        ${escHtml(item.nama)}
        ${expired ? '<span class="ml-1 text-xs text-rose-500 font-normal">⚠ Terlambat</span>' : ""}
      </td>
      <td class="px-4 py-3 text-slate-600">${escHtml(item.mapel)}</td>
      <td class="px-4 py-3 text-slate-600">${formatTanggal(item.deadline)}</td>
      <td class="px-4 py-3">
        <span class="badge-${item.prioritas.toLowerCase()} text-xs font-semibold px-2.5 py-1 rounded-full">
          ${item.prioritas}
        </span>
      </td>
      <td class="px-4 py-3">
        <span class="badge-${item.status === "Selesai" ? "selesai" : "belum"} text-xs font-semibold px-2.5 py-1 rounded-full">
          ${item.status === "Selesai" ? "✅ Selesai" : "⏳ Belum"}
        </span>
      </td>
      <td class="px-4 py-3 text-center">
        <div class="flex justify-center gap-2">
          <button onclick="editData(${item.id})"
            class="bg-indigo-50 hover:bg-indigo-100 text-primary text-xs font-semibold px-3 py-1.5 rounded-lg transition">
            ✏️ Edit
          </button>
          <button onclick="bukaModal(${item.id})"
            class="bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold px-3 py-1.5 rounded-lg transition">
            🗑️ Hapus
          </button>
        </div>
      </td>
    </tr>`;
  });

  document.getElementById("dataTabel").innerHTML = html;
}

// ── Statistik ─────────────────────────────────────────────────
function renderStatistik(data) {
  const total   = data.length;
  const selesai = data.filter(d => d.status === "Selesai").length;
  const belum   = total - selesai;

  document.getElementById("statTotal").textContent   = total;
  document.getElementById("statSelesai").textContent = selesai;
  document.getElementById("statBelum").textContent   = belum;

  // Deadline terdekat (yang belum selesai)
  const today   = new Date(); today.setHours(0,0,0,0);
  const pending = data
    .filter(d => d.status !== "Selesai" && new Date(d.deadline) >= today)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  document.getElementById("statDeadline").textContent =
    pending.length > 0 ? `${escHtml(pending[0].nama)} (${formatTanggal(pending[0].deadline)})` : "Tidak ada";
}

// ── Filter & Search ───────────────────────────────────────────
function filterTabel() {
  const q  = document.getElementById("searchInput").value.toLowerCase();
  const fs = document.getElementById("filterStatus").value;
  const fp = document.getElementById("filterPrioritas").value;

  const filtered = semuaData.filter(d => {
    const matchQ  = d.nama.toLowerCase().includes(q) || d.mapel.toLowerCase().includes(q);
    const matchS  = fs ? d.status === fs : true;
    const matchP  = fp ? d.prioritas === fp : true;
    return matchQ && matchS && matchP;
  });

  renderTabel(filtered);
}

// ── Simpan (Tambah / Edit) ────────────────────────────────────
async function simpanData() {
  const id       = document.getElementById("editId").value;
  const nama     = document.getElementById("nama").value.trim();
  const mapel    = document.getElementById("mapel").value.trim();
  const deadline = document.getElementById("deadline").value;
  const prioritas= document.getElementById("prioritas").value;
  const status   = document.getElementById("status").value;

  if (!nama || !mapel || !deadline) {
    showToast("Nama tugas, mata pelajaran, dan deadline wajib diisi!", "error");
    return;
  }

  const btn = document.getElementById("btnSimpan");
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>';

  try {
    const payload = { nama, mapel, deadline, prioritas, status };
    if (id) payload.id = id;

    await fetch(API_URL, {
      method : "POST",
      headers: { "Content-Type": "text/plain" },
      body   : JSON.stringify(payload)
    });

    showToast(id ? "Tugas berhasil diperbarui!" : "Tugas berhasil ditambahkan!");
    batalEdit();
    loadData();
  } catch (e) {
    console.error(e);
    showToast("Gagal menyimpan data.", "error");
  } finally {
    btn.disabled = false;
    btn.innerHTML = "<span>💾 Simpan</span>";
  }
}

// ── Edit ──────────────────────────────────────────────────────
function editData(id) {
  const item = semuaData.find(d => d.id == id);
  if (!item) return;

  document.getElementById("editId").value    = item.id;
  document.getElementById("nama").value      = item.nama;
  document.getElementById("mapel").value     = item.mapel;
  document.getElementById("deadline").value  = item.deadline;
  document.getElementById("prioritas").value = item.prioritas;
  document.getElementById("status").value    = item.status;

  document.getElementById("formTitle").textContent = "✏️ Edit Tugas";
  document.getElementById("btnBatal").classList.remove("hidden");

  document.getElementById("form-pr").scrollIntoView({ behavior: "smooth" });
}

function batalEdit() {
  document.getElementById("editId").value    = "";
  document.getElementById("nama").value      = "";
  document.getElementById("mapel").value     = "";
  document.getElementById("deadline").value  = "";
  document.getElementById("prioritas").value = "Sedang";
  document.getElementById("status").value    = "Belum";

  document.getElementById("formTitle").textContent = "➕ Tambah PR Baru";
  document.getElementById("btnBatal").classList.add("hidden");
}

// ── Hapus ─────────────────────────────────────────────────────
function bukaModal(id) {
  hapusId = id;
  document.getElementById("modalHapus").classList.remove("hidden");
}
function tutupModal() {
  hapusId = null;
  document.getElementById("modalHapus").classList.add("hidden");
}
async function konfirmasiHapus() {
  if (!hapusId) return;
  tutupModal();
  try {
    await fetch(API_URL, {
      method : "POST",
      headers: { "Content-Type": "text/plain" },
      body   : JSON.stringify({ hapus: hapusId })
    });
    showToast("Tugas berhasil dihapus!");
    loadData();
  } catch (e) {
    showToast("Gagal menghapus data.", "error");
  }
}

// ── Kalender Mini ─────────────────────────────────────────────
const BULAN = ["Januari","Februari","Maret","April","Mei","Juni",
               "Juli","Agustus","September","Oktober","November","Desember"];

function prevMonth() { calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; } renderKalender(); }
function nextMonth() { calMonth++; if (calMonth > 11) { calMonth = 0;  calYear++; } renderKalender(); }

function renderKalender() {
  document.getElementById("calTitle").textContent = `${BULAN[calMonth]} ${calYear}`;

  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const today = new Date();

  // Kumpulkan deadline bulan ini
  const deadlines = {};
  semuaData.forEach(d => {
    const dl = new Date(d.deadline);
    if (dl.getFullYear() === calYear && dl.getMonth() === calMonth) {
      const key = dl.getDate();
      if (!deadlines[key]) deadlines[key] = [];
      deadlines[key].push(d);
    }
  });

  let html = "";
  // Padding awal
  for (let i = 0; i < firstDay; i++) {
    html += `<div class="h-10"></div>`;
  }
  // Hari
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
    const hasDL   = deadlines[d];
    let cls = "h-10 w-full flex flex-col items-center justify-center rounded-xl text-sm font-medium transition cursor-default ";

    if (isToday)  cls += "gradient-hero text-white shadow ";
    else if (hasDL) cls += "bg-rose-100 text-rose-700 font-bold ";
    else          cls += "hover:bg-slate-100 text-slate-600 ";

    html += `<div class="${cls}" title="${hasDL ? hasDL.map(x=>x.nama).join(', ') : ''}">
      ${d}
      ${hasDL ? `<span class="w-1.5 h-1.5 rounded-full bg-rose-500 mt-0.5"></span>` : ""}
    </div>`;
  }

  document.getElementById("calGrid").innerHTML = html;

  // Daftar deadline bulan ini
  const dlItems = Object.entries(deadlines).sort((a,b) => a[0]-b[0]);
  let dlHtml = "";
  if (dlItems.length === 0) {
    dlHtml = `<p class="text-slate-400 text-sm text-center py-4">Tidak ada deadline bulan ini 🎉</p>`;
  } else {
    dlItems.forEach(([tgl, items]) => {
      items.forEach(item => {
        dlHtml += `
        <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition">
          <div class="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center text-white font-bold text-sm flex-shrink-0">${tgl}</div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-slate-800 text-sm truncate">${escHtml(item.nama)}</p>
            <p class="text-xs text-slate-500">${escHtml(item.mapel)} · ${item.prioritas}</p>
          </div>
          <span class="badge-${item.status === "Selesai" ? "selesai" : "belum"} text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0">
            ${item.status === "Selesai" ? "✅" : "⏳"}
          </span>
        </div>`;
      });
    });
  }
  document.getElementById("deadlineList").innerHTML = dlHtml;
}

// ── Helpers ───────────────────────────────────────────────────
function formatTanggal(str) {
  if (!str) return "-";
  const d = new Date(str);
  return d.toLocaleDateString("id-ID", { day:"2-digit", month:"short", year:"numeric" });
}

function escHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
