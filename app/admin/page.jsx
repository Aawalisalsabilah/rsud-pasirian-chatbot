'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Fraunces, Inter } from 'next/font/google';

const fraunces = Fraunces({ subsets: ['latin'], weight: ['500', '600', '700'], style: ['normal', 'italic'], variable: '--font-fraunces' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-inter' });

const INK = '#0B2B24';
const BRASS = '#C08829';
const BRASS_SOFT = '#DDB169';
const CREAM = '#FBF9F4';
const EMERALD = '#1F6B4F';
const STEEL = '#2A6C93';
const CLAY = '#9E3B32';
const PLUM = '#6B4A8A';

const KATEGORI_INFO = {
  baseInfo: { label: 'Informasi Umum', color: STEEL },
  standarPelayananPublik: { label: 'Standar Pelayanan Publik', color: EMERALD },
  panduanJKN: { label: 'Panduan JKN Mobile', color: PLUM },
};

// ===== Helper tanggal per minggu (dipakai buat label export JPG/PDF) =====
const namaBulanID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function formatTanggalID(date) {
  return `${date.getDate()} ${namaBulanID[date.getMonth()]} ${date.getFullYear()}`;
}

function getWeekInfoForExport() {
  const today = new Date();
  const dayIndex = today.getDay();
  const diffToMonday = dayIndex === 0 ? -6 : 1 - dayIndex;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);

  const week = {};
  const urutanHari = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  urutanHari.forEach((hari, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    week[hari] = formatTanggalID(d);
  });

  const periodeText = `${week['Senin']} - ${week['Minggu']}`;
  return { week, periodeText };
}

function hariKeTanggalExport(hariText, week) {
  if (hariText === 'Senin-Jumat') return `Senin-Jumat (${week['Senin']} - ${week['Jumat']})`;
  if (hariText === 'Sabtu & Minggu') return `Sabtu & Minggu (${week['Sabtu']} & ${week['Minggu']})`;
  if (hariText === 'Selasa & Kamis') return `Selasa & Kamis (${week['Selasa']} & ${week['Kamis']})`;
  if (hariText === 'Senin, Rabu, Jumat') return `Senin, Rabu, Jumat (${week['Senin']}, ${week['Rabu']}, ${week['Jumat']})`;
  if (hariText === 'Jumat') return `Jumat (${week['Jumat']})`;
  return hariText;
}

function IconPencil(props) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function IconTrash(props) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function IconSearch(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconChevron(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="9 6 15 12 9 18" />
    </svg>
  );
}

function IconDownload(props) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function IconPause(props) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}

function IconPlay(props) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M6 4l14 8-14 8V4z" />
    </svg>
  );
}

function IconPlus(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconMegaphone(props) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 11v3a1 1 0 0 0 1 1h2l3.5 4V5.5L6 9.5H4a1 1 0 0 0-1 1ZM15 8a4 4 0 0 1 0 8M18 5a8 8 0 0 1 0 14" />
    </svg>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState('knowledge'); // 'knowledge' | 'poli' | 'pengumuman'
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <div className={`${fraunces.variable} ${inter.variable} font-[var(--font-inter)] min-h-screen bg-[#FBF9F4] text-[#0B2B24]`}>
      {}
      <header className="bg-[#0B2B24]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo-rs.jpeg"
              alt="Logo RSUD Pasirian Lumajang"
              className="w-9 h-9 rounded-full object-cover bg-white shrink-0"
            />
            <div>
              <h1 className="font-[var(--font-fraunces)] font-semibold text-[16px] leading-tight text-white">Admin RSUD Pasirian</h1>
              <p className="text-[11px] text-white/50 tracking-[0.04em] font-medium">Panel Pengelolaan Konten</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="border border-white/25 hover:bg-white/10 text-white/90 text-[13px] font-semibold px-4 py-2 rounded-full transition"
          >
            Keluar
          </button>
        </div>
      </header>

      {}
      <nav className="bg-white border-b border-[#0B2B24]/[0.08]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 flex gap-2">
          <button
            onClick={() => setTab('knowledge')}
            className={`px-4 sm:px-5 py-3.5 text-[13.5px] font-semibold border-b-[3px] -mb-px transition ${
              tab === 'knowledge'
                ? 'border-[#C08829] text-[#0B2B24]'
                : 'border-transparent text-[#0B2B24]/50 hover:text-[#0B2B24]/80'
            }`}
          >
            Basis Pengetahuan (FAQ)
          </button>
          <button
            onClick={() => setTab('poli')}
            className={`px-4 sm:px-5 py-3.5 text-[13.5px] font-semibold border-b-[3px] -mb-px transition ${
              tab === 'poli'
                ? 'border-[#C08829] text-[#0B2B24]'
                : 'border-transparent text-[#0B2B24]/50 hover:text-[#0B2B24]/80'
            }`}
          >
            Jadwal Dokter
          </button>
          <button
            onClick={() => setTab('pengumuman')}
            className={`px-4 sm:px-5 py-3.5 text-[13.5px] font-semibold border-b-[3px] -mb-px transition ${
              tab === 'pengumuman'
                ? 'border-[#C08829] text-[#0B2B24]'
                : 'border-transparent text-[#0B2B24]/50 hover:text-[#0B2B24]/80'
            }`}
          >
            Papan Pengumuman
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-5 sm:px-6 py-8">
        {tab === 'knowledge' ? <KnowledgeTab /> : tab === 'poli' ? <PoliTab /> : <AnnouncementTab />}
      </main>
    </div>
  );
}

function KnowledgeTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  async function loadData() {
    setLoading(true);
    const res = await fetch('/api/admin/knowledge');
    const json = await res.json();
    setItems(json.data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSave(form) {
    setSaving(true);
    const isEdit = Boolean(form.id);
    const url = isEdit ? `/api/admin/knowledge/${form.id}` : '/api/admin/knowledge';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kategori: form.kategori,
        judul: form.judul,
        konten: form.konten,
      }),
    });

    setSaving(false);

    if (res.ok) {
      setEditing(null);
      loadData();
    } else {
      const json = await res.json();
      alert('Gagal menyimpan: ' + (json.error || 'unknown error'));
    }
  }

  async function handleDelete(id) {
    if (!confirm('Yakin mau hapus data ini?')) return;
    const res = await fetch(`/api/admin/knowledge/${id}`, { method: 'DELETE' });
    if (res.ok) loadData();
    else alert('Gagal menghapus data.');
  }

  if (loading) return <p className="text-[#0B2B24]/55 text-[14px]">Memuat data...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-[#0B2B24]/55 text-[14px] font-medium">{items.length} data</p>
        <button
          onClick={() => setEditing({})}
          className="inline-flex items-center gap-2 bg-gradient-to-b from-[#DDB169] to-[#C08829] hover:from-[#e6bd7c] hover:to-[#ca9235] text-[#0B2B24] font-[var(--font-fraunces)] font-bold px-4 sm:px-5 py-2.5 rounded-full text-[13.5px] transition shadow-[0_8px_20px_rgba(192,136,41,0.3)]"
        >
          <IconPlus /> Tambah Data
        </button>
      </div>

      {editing && (
        <KnowledgeForm
          initial={editing}
          onCancel={() => setEditing(null)}
          onSave={handleSave}
          saving={saving}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => {
          const kat = KATEGORI_INFO[item.kategori] || { label: item.kategori, color: STEEL };
          return (
            <div
              key={item.id}
              className="bg-white border border-[#0B2B24]/[0.06] rounded-2xl p-5 flex flex-col h-[340px] hover:shadow-[0_14px_34px_rgba(11,43,36,0.08)] transition"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span
                  className="inline-block text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: `${kat.color}14`, color: kat.color }}
                >
                  {kat.label}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setEditing(item)}
                    title="Edit"
                    className="inline-flex items-center gap-1.5 border border-[#2A6C93] text-[#2A6C93] hover:bg-[#2A6C93]/[0.06] px-3 py-1.5 rounded-lg text-[12px] font-semibold transition"
                  >
                    <IconPencil /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    title="Hapus"
                    className="inline-flex items-center gap-1.5 border border-[#9E3B32] text-[#9E3B32] hover:bg-[#9E3B32]/[0.06] px-3 py-1.5 rounded-lg text-[12px] font-semibold transition"
                  >
                    <IconTrash /> Hapus
                  </button>
                </div>
              </div>
              {item.judul && (
                <p className="font-[var(--font-fraunces)] font-semibold text-[15px] text-[#0B2B24] mb-1.5">{item.judul}</p>
              )}
              <p className="text-[13.5px] text-[#0B2B24]/70 leading-relaxed whitespace-pre-wrap overflow-y-auto flex-1">
                {item.konten}
              </p>
            </div>
          );
        })}
        {items.length === 0 && <p className="text-[#0B2B24]/50 text-[14px] italic">Belum ada data.</p>}
      </div>
    </div>
  );
}

function KnowledgeForm({ initial, onCancel, onSave, saving }) {
  const [kategori, setKategori] = useState(initial.kategori || 'baseInfo');
  const [judul, setJudul] = useState(initial.judul || '');
  const [konten, setKonten] = useState(initial.konten || '');

  return (
    <div className="bg-white border border-[#0B2B24]/[0.06] rounded-2xl p-6 mb-6 shadow-[0_14px_34px_rgba(11,43,36,0.08)]">
      <p className="font-[var(--font-fraunces)] font-semibold text-[16px] text-[#0B2B24] mb-4">
        {initial.id ? 'Edit Data' : 'Tambah Data Baru'}
      </p>

      <label className="block text-[12.5px] font-semibold text-[#0B2B24]/70 mb-1.5">Kategori</label>
      <select
        value={kategori}
        onChange={(e) => setKategori(e.target.value)}
        className="w-full rounded-xl border border-[#0B2B24]/[0.12] px-3.5 py-2.5 text-[13.5px] text-[#0B2B24] outline-none focus:border-[#C08829] focus:ring-2 focus:ring-[#C08829]/15 transition bg-white mb-4"
      >
        <option value="baseInfo">Informasi Umum (baseInfo)</option>
        <option value="standarPelayananPublik">Standar Pelayanan Publik</option>
        <option value="panduanJKN">Panduan JKN Mobile</option>
      </select>

      <label className="block text-[12.5px] font-semibold text-[#0B2B24]/70 mb-1.5">Judul (opsional)</label>
      <input
        value={judul}
        onChange={(e) => setJudul(e.target.value)}
        placeholder="Misal: Jam Besuk Pasien"
        className="w-full rounded-xl border border-[#0B2B24]/[0.12] px-3.5 py-2.5 text-[13.5px] text-[#0B2B24] outline-none focus:border-[#C08829] focus:ring-2 focus:ring-[#C08829]/15 transition mb-4"
      />

      <label className="block text-[12.5px] font-semibold text-[#0B2B24]/70 mb-1.5">Konten</label>
      <textarea
        value={konten}
        onChange={(e) => setKonten(e.target.value)}
        rows={6}
        placeholder="Isi informasi lengkap di sini..."
        className="w-full rounded-xl border border-[#0B2B24]/[0.12] px-3.5 py-2.5 text-[13.5px] text-[#0B2B24] outline-none focus:border-[#C08829] focus:ring-2 focus:ring-[#C08829]/15 transition font-[var(--font-inter)]"
      />

      <p className="text-[12px] text-[#8a5a12] bg-[#C08829]/10 px-3 py-2 rounded-lg mt-3">
        ⚠️ Setiap konten disimpan, embedding-nya otomatis dibuat ulang (butuh beberapa detik).
      </p>

      <div className="flex justify-end gap-2.5 mt-5">
        <button
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2.5 rounded-full border border-[#0B2B24]/[0.12] text-[#0B2B24]/70 font-semibold text-[13.5px] hover:bg-[#FBF9F4] transition disabled:opacity-50"
        >
          Batal
        </button>
        <button
          onClick={() => onSave({ id: initial.id, kategori, judul, konten })}
          disabled={saving || !konten.trim()}
          className="px-5 py-2.5 rounded-full bg-[#0B2B24] hover:bg-[#153b31] text-white font-[var(--font-fraunces)] font-bold text-[13.5px] transition disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </div>
  );
}

function PoliTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState({}); 
  const printRef = useRef(null);

  async function loadData() {
    setLoading(true);
    const res = await fetch('/api/admin/poli');
    const json = await res.json();
    setItems(json.data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSave(form) {
    setSaving(true);
    const isEdit = Boolean(form.id);
    const url = isEdit ? `/api/admin/poli/${form.id}` : '/api/admin/poli';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nama_poli: form.nama_poli,
        nama_dokter: form.nama_dokter,
        hari: form.hari,
        jam: form.jam,
        is_active: form.is_active !== undefined ? form.is_active : true,
      }),
    });

    setSaving(false);

    if (res.ok) {
      setEditing(null);
      loadData();
    } else {
      const json = await res.json();
      alert('Gagal menyimpan: ' + (json.error || 'unknown error'));
    }
  }

  async function handleDelete(id) {
    if (!confirm('Yakin mau hapus jadwal ini?')) return;
    const res = await fetch(`/api/admin/poli/${id}`, { method: 'DELETE' });
    if (res.ok) loadData();
    else alert('Gagal menghapus data.');
  }

  async function handleToggleActive(item) {
    const nextStatus = !item.is_active;
    const res = await fetch(`/api/admin/poli/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nama_poli: item.nama_poli,
        nama_dokter: item.nama_dokter,
        hari: item.hari,
        jam: item.jam,
        is_active: nextStatus,
      }),
    });
    if (res.ok) loadData();
    else alert('Gagal mengubah status jadwal.');
  }

  async function captureCanvas() {
    const html2canvas = (await import('html2canvas')).default;
    return html2canvas(printRef.current, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
    });
  }

  async function handleDownloadJPG() {
    setExporting(true);
    try {
      const canvas = await captureCanvas();
      const link = document.createElement('a');
      link.download = `jadwal-dokter-${new Date().toISOString().slice(0, 10)}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();
    } catch (err) {
      console.error('[EXPORT JPG ERROR]', err);
      alert('Gagal membuat gambar. Coba lagi ya.');
    } finally {
      setExporting(false);
    }
  }

  async function handleDownloadPDF() {
    setExporting(true);
    try {
      const canvas = await captureCanvas();
      const { jsPDF } = await import('jspdf');
      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
      pdf.save(`jadwal-dokter-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('[EXPORT PDF ERROR]', err);
      alert('Gagal membuat PDF. Coba lagi ya.');
    } finally {
      setExporting(false);
    }
  }

  function togglePoli(namaPoli) {
    setExpanded((prev) => ({ ...prev, [namaPoli]: !prev[namaPoli] }));
  }

  if (loading) return <p className="text-[#0B2B24]/55 text-[14px]">Memuat data...</p>;

  // Filter berdasarkan pencarian (nama poli ATAU nama dokter)
  const keyword = search.trim().toLowerCase();
  const filteredItems = keyword
    ? items.filter(
        (it) =>
          it.nama_poli.toLowerCase().includes(keyword) ||
          it.nama_dokter.toLowerCase().includes(keyword)
      )
    : items;

  // Kelompokkan berdasarkan nama_poli
  const grouped = {};
  for (const item of filteredItems) {
    if (!grouped[item.nama_poli]) grouped[item.nama_poli] = [];
    grouped[item.nama_poli].push(item);
  }
  const groupNames = Object.keys(grouped).sort();

  const isGroupOpen = (namaPoli) => (keyword ? true : Boolean(expanded[namaPoli]));

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <p className="text-[#0B2B24]/55 text-[14px] font-medium">
          {items.length} jadwal &middot; {groupNames.length} poli
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDownloadJPG}
            disabled={exporting || items.length === 0}
            className="inline-flex items-center gap-2 border border-[#0B2B24] text-[#0B2B24] hover:bg-[#0B2B24]/[0.05] px-4 py-2.5 rounded-full text-[13px] font-semibold transition disabled:opacity-40"
          >
            <IconDownload /> {exporting ? 'Memproses...' : 'Unduh JPG'}
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={exporting || items.length === 0}
            className="inline-flex items-center gap-2 border border-[#0B2B24] text-[#0B2B24] hover:bg-[#0B2B24]/[0.05] px-4 py-2.5 rounded-full text-[13px] font-semibold transition disabled:opacity-40"
          >
            <IconDownload /> {exporting ? 'Memproses...' : 'Unduh PDF'}
          </button>
          <button
            onClick={() => setEditing({})}
            className="inline-flex items-center gap-2 bg-gradient-to-b from-[#DDB169] to-[#C08829] hover:from-[#e6bd7c] hover:to-[#ca9235] text-[#0B2B24] font-[var(--font-fraunces)] font-bold px-4 sm:px-5 py-2.5 rounded-full text-[13.5px] transition shadow-[0_8px_20px_rgba(192,136,41,0.3)]"
          >
            <IconPlus /> Tambah Jadwal
          </button>
        </div>
      </div>

      <div className="relative mb-5">
        <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0B2B24]/40" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama poli atau dokter..."
          className="w-full rounded-xl border border-[#0B2B24]/[0.12] pl-10 pr-3.5 py-2.5 text-[13.5px] text-[#0B2B24] outline-none focus:border-[#C08829] focus:ring-2 focus:ring-[#C08829]/15 transition bg-white"
        />
      </div>

      {editing && (
        <PoliForm
          initial={editing}
          onCancel={() => setEditing(null)}
          onSave={handleSave}
          saving={saving}
        />
      )}

      <div className="flex flex-col gap-2.5">
        {groupNames.map((namaPoli) => {
          const doctors = grouped[namaPoli];
          const activeCount = doctors.filter((d) => d.is_active !== false).length;
          const open = isGroupOpen(namaPoli);

          return (
            <div key={namaPoli} className="bg-white border border-[#0B2B24]/[0.06] rounded-2xl overflow-hidden">
              <button
                onClick={() => togglePoli(namaPoli)}
                className="w-full flex items-center justify-between gap-3 px-5 py-3.5 text-left"
              >
                <div className="flex items-center gap-2.5 text-[#0B2B24]">
                  <IconChevron
                    className="transition-transform"
                    style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
                  />
                  <span className="font-[var(--font-fraunces)] font-semibold text-[15px] text-[#0B2B24]">{namaPoli}</span>
                </div>
                <span className="text-[12.5px] font-semibold text-[#0B2B24]/50 shrink-0">
                  {doctors.length} dokter &middot; {activeCount} aktif
                </span>
              </button>

              {open && (
                <div className="border-t border-[#0B2B24]/[0.06] px-3.5 sm:px-4 py-3.5 flex flex-col gap-2 bg-[#FBF9F4]">
                  {doctors.map((item) => {
                    const isActive = item.is_active !== false;
                    return (
                      <div
                        key={item.id}
                        className={`flex flex-wrap items-center justify-between gap-3 bg-white border border-[#0B2B24]/[0.06] rounded-xl px-4 py-3 ${
                          !isActive ? 'opacity-55' : ''
                        }`}
                      >
                        <div className="min-w-[180px]">
                          <p className="font-semibold text-[14px] text-[#0B2B24]">{item.nama_dokter}</p>
                          <p className="text-[12.5px] text-[#0B2B24]/55 mt-0.5">{item.hari} &middot; {item.jam}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="text-[11.5px] font-bold px-2.5 py-1 rounded-full"
                            style={
                              isActive
                                ? { backgroundColor: `${EMERALD}14`, color: EMERALD }
                                : { backgroundColor: '#0B2B240D', color: '#6B7280' }
                            }
                          >
                            {isActive ? 'Aktif' : 'Libur'}
                          </span>
                          <button
                            onClick={() => handleToggleActive(item)}
                            title={isActive ? 'Set jadwal libur' : 'Aktifkan jadwal'}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition ${
                              isActive
                                ? 'border-[#C08829] text-[#8a5a12] hover:bg-[#C08829]/[0.06]'
                                : 'bg-[#1F6B4F] border-[#1F6B4F] text-white hover:bg-[#195a42]'
                            }`}
                          >
                            {isActive ? <IconPause /> : <IconPlay />} {isActive ? 'Set Libur' : 'Aktifkan'}
                          </button>
                          <button
                            onClick={() => setEditing(item)}
                            title="Edit"
                            className="inline-flex items-center gap-1.5 border border-[#2A6C93] text-[#2A6C93] hover:bg-[#2A6C93]/[0.06] px-3 py-1.5 rounded-lg text-[12px] font-semibold transition"
                          >
                            <IconPencil /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            title="Hapus"
                            className="inline-flex items-center gap-1.5 border border-[#9E3B32] text-[#9E3B32] hover:bg-[#9E3B32]/[0.06] px-3 py-1.5 rounded-lg text-[12px] font-semibold transition"
                          >
                            <IconTrash /> Hapus
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        {groupNames.length === 0 && (
          <p className="text-[#0B2B24]/50 text-[14px] italic">Tidak ada poli/dokter yang cocok dengan pencarian.</p>
        )}
      </div>

      {}
      <div style={printStyles.offscreen}>
        <div ref={printRef} style={printStyles.sheet}>
          <div style={printStyles.header}>
            <img src="/logo-rs.jpeg" alt="Logo RSUD Pasirian Lumajang" style={printStyles.logoImg} />
            <div>
              <p style={printStyles.title}>RSUD Pasirian Lumajang</p>
              <p style={printStyles.subtitle}>Jadwal Praktik Dokter</p>
            </div>
          </div>
          <p style={printStyles.date}>
            Periode: {getWeekInfoForExport().periodeText} · Diperbarui {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <table style={printStyles.table}>
            <thead>
              <tr>
                <th style={printStyles.th}>Poli</th>
                <th style={printStyles.th}>Dokter</th>
                <th style={printStyles.th}>Hari Praktik</th>
                <th style={printStyles.th}>Jam</th>
              </tr>
            </thead>
            <tbody>
              {items.filter((item) => item.is_active !== false).map((item) => (
                <tr key={item.id}>
                  <td style={printStyles.td}>{item.nama_poli}</td>
                  <td style={printStyles.td}>{item.nama_dokter}</td>
                  <td style={printStyles.td}>{hariKeTanggalExport(item.hari, getWeekInfoForExport().week)}</td>
                  <td style={printStyles.td}>{item.jam}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={printStyles.footer}>Jadwal dapat berubah sewaktu-waktu. Informasi lebih lanjut hubungi RSUD Pasirian.</p>
        </div>
      </div>
    </div>
  );
}

function PoliForm({ initial, onCancel, onSave, saving }) {
  const [nama_poli, setNamaPoli] = useState(initial.nama_poli || '');
  const [nama_dokter, setNamaDokter] = useState(initial.nama_dokter || '');
  const [hari, setHari] = useState(initial.hari || '');
  const [jam, setJam] = useState(initial.jam || '');
  const [is_active, setIsActive] = useState(initial.is_active !== false);

  return (
    <div className="bg-white border border-[#0B2B24]/[0.06] rounded-2xl p-6 mb-6 shadow-[0_14px_34px_rgba(11,43,36,0.08)]">
      <p className="font-[var(--font-fraunces)] font-semibold text-[16px] text-[#0B2B24] mb-4">
        {initial.id ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}
      </p>

      <label className="block text-[12.5px] font-semibold text-[#0B2B24]/70 mb-1.5">Nama Poli</label>
      <input
        value={nama_poli}
        onChange={(e) => setNamaPoli(e.target.value)}
        placeholder="Poli Spesialis Anak"
        className="w-full rounded-xl border border-[#0B2B24]/[0.12] px-3.5 py-2.5 text-[13.5px] text-[#0B2B24] outline-none focus:border-[#C08829] focus:ring-2 focus:ring-[#C08829]/15 transition mb-4"
      />

      <label className="block text-[12.5px] font-semibold text-[#0B2B24]/70 mb-1.5">Nama Dokter</label>
      <input
        value={nama_dokter}
        onChange={(e) => setNamaDokter(e.target.value)}
        placeholder="dr. Nama, Sp.A"
        className="w-full rounded-xl border border-[#0B2B24]/[0.12] px-3.5 py-2.5 text-[13.5px] text-[#0B2B24] outline-none focus:border-[#C08829] focus:ring-2 focus:ring-[#C08829]/15 transition mb-4"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-1">
        <div>
          <label className="block text-[12.5px] font-semibold text-[#0B2B24]/70 mb-1.5">Hari Praktik</label>
          <input
            value={hari}
            onChange={(e) => setHari(e.target.value)}
            placeholder="Senin-Jumat"
            className="w-full rounded-xl border border-[#0B2B24]/[0.12] px-3.5 py-2.5 text-[13.5px] text-[#0B2B24] outline-none focus:border-[#C08829] focus:ring-2 focus:ring-[#C08829]/15 transition"
          />
        </div>
        <div>
          <label className="block text-[12.5px] font-semibold text-[#0B2B24]/70 mb-1.5">Jam Praktik</label>
          <input
            value={jam}
            onChange={(e) => setJam(e.target.value)}
            placeholder="08.00-12.00"
            className="w-full rounded-xl border border-[#0B2B24]/[0.12] px-3.5 py-2.5 text-[13.5px] text-[#0B2B24] outline-none focus:border-[#C08829] focus:ring-2 focus:ring-[#C08829]/15 transition"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 mt-4 text-[13px] font-semibold text-[#0B2B24]/70 cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={is_active}
          onChange={(e) => setIsActive(e.target.checked)}
          className="w-4 h-4 accent-[#C08829] cursor-pointer"
        />
        Jadwal aktif (tampilkan ke pasien di chatbot)
      </label>

      <div className="flex justify-end gap-2.5 mt-5">
        <button
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2.5 rounded-full border border-[#0B2B24]/[0.12] text-[#0B2B24]/70 font-semibold text-[13.5px] hover:bg-[#FBF9F4] transition disabled:opacity-50"
        >
          Batal
        </button>
        <button
          onClick={() => onSave({ id: initial.id, nama_poli, nama_dokter, hari, jam, is_active })}
          disabled={saving || !nama_poli.trim() || !nama_dokter.trim()}
          className="px-5 py-2.5 rounded-full bg-[#0B2B24] hover:bg-[#153b31] text-white font-[var(--font-fraunces)] font-bold text-[13.5px] transition disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </div>
  );
}

function AnnouncementTab() {
  const [message, setMessage] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);

  async function loadData() {
    setLoading(true);
    const res = await fetch('/api/admin/announcement');
    const json = await res.json();
    setMessage(json.data?.message || '');
    setIsActive(json.data?.is_active || false);
    setUpdatedAt(json.data?.updated_at || null);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSave() {
    setSaving(true);
    setSavedOk(false);
    const res = await fetch('/api/admin/announcement', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, is_active: isActive }),
    });
    setSaving(false);

    if (res.ok) {
      const json = await res.json();
      setUpdatedAt(json.data?.updated_at || null);
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 2500);
    } else {
      const json = await res.json();
      alert('Gagal menyimpan: ' + (json.error || 'unknown error'));
    }
  }

  if (loading) return <p className="text-[#0B2B24]/55 text-[14px]">Memuat data...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-[#0B2B24]/55 text-[14px] font-medium">
          {isActive ? 'Sedang tampil ke pengunjung' : 'Sedang tidak tampil'}
          {updatedAt && (
            <span className="text-[#0B2B24]/40"> &middot; terakhir diubah {new Date(updatedAt).toLocaleString('id-ID')}</span>
          )}
        </p>
        <span
          className="inline-flex items-center gap-1.5 text-[11.5px] font-bold px-2.5 py-1 rounded-full"
          style={
            isActive
              ? { backgroundColor: `${EMERALD}14`, color: EMERALD }
              : { backgroundColor: '#0B2B240D', color: '#6B7280' }
          }
        >
          <IconMegaphone /> {isActive ? 'Aktif' : 'Nonaktif'}
        </span>
      </div>

      <div className="bg-white border border-[#0B2B24]/[0.06] rounded-2xl p-6 max-w-xl shadow-[0_14px_34px_rgba(11,43,36,0.08)]">
        <p className="font-[var(--font-fraunces)] font-semibold text-[16px] text-[#0B2B24] mb-4">
          Papan Pengumuman
        </p>

        <label className="flex items-center gap-2.5 mb-4 text-[13.5px] font-semibold text-[#0B2B24]/70 cursor-pointer w-fit">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 accent-[#C08829] cursor-pointer"
          />
          Tampilkan pengumuman ke pengunjung
        </label>

        <label className="block text-[12.5px] font-semibold text-[#0B2B24]/70 mb-1.5">Isi pengumuman</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Misal: Layanan Poli Gigi tutup sementara 8-10 Juli 2026 karena pemeliharaan alat."
          className="w-full rounded-xl border border-[#0B2B24]/[0.12] px-3.5 py-2.5 text-[13.5px] text-[#0B2B24] outline-none focus:border-[#C08829] focus:ring-2 focus:ring-[#C08829]/15 transition"
        />
        
        <div className="flex items-center justify-end gap-3 mt-5">
          {savedOk && <span className="text-[12.5px] font-semibold text-[#1F6B4F]">Tersimpan.</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-full bg-[#0B2B24] hover:bg-[#153b31] text-white font-[var(--font-fraunces)] font-bold text-[13.5px] transition disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}

const printStyles = {
  offscreen: { position: 'absolute', left: '-9999px', top: 0, pointerEvents: 'none' },
  sheet: { width: '800px', background: '#ffffff', padding: '40px', fontFamily: 'system-ui, sans-serif' },
  header: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' },
  logoImg: { width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, background: '#fff' },
  title: { fontSize: '20px', fontWeight: 800, color: INK, margin: 0 },
  subtitle: { fontSize: '14px', color: '#5B6B63', margin: '2px 0 0' },
  date: { fontSize: '12.5px', color: '#5B6B63', margin: '14px 0 18px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px 14px', fontSize: '13px', color: '#fff', background: INK, fontWeight: 700 },
  td: { padding: '10px 14px', fontSize: '13.5px', color: INK, borderBottom: '1px solid #E2E8DE' },
  footer: { fontSize: '11.5px', color: '#5B6B63', marginTop: '20px', fontStyle: 'italic' },
};