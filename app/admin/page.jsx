'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

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

// Small inline icons (no extra dependency needed)
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

export default function AdminDashboard() {
  const [tab, setTab] = useState('knowledge'); // 'knowledge' | 'poli'
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <img src="/logo-rs.jpeg" alt="Logo RSUD Pasirian Lumajang" style={styles.logoImg} />
          <h1 style={styles.headerTitle}>Admin RSUD Pasirian</h1>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>Keluar</button>
      </header>

      <nav style={styles.tabs}>
        <button
          onClick={() => setTab('knowledge')}
          style={tab === 'knowledge' ? styles.tabActive : styles.tab}
        >
          Basis Pengetahuan (FAQ)
        </button>
        <button
          onClick={() => setTab('poli')}
          style={tab === 'poli' ? styles.tabActive : styles.tab}
        >
          Jadwal Dokter
        </button>
      </nav>

      <main style={styles.main}>
        {tab === 'knowledge' ? <KnowledgeTab /> : <PoliTab />}
      </main>
    </div>
  );
}

// ================= TAB: KNOWLEDGE BASE =================
function KnowledgeTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = tidak edit, {} = tambah baru, {...item} = edit
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

  if (loading) return <p style={styles.loadingText}>Memuat data...</p>;

  return (
    <div>
      <div style={styles.toolbar}>
        <p style={styles.count}>{items.length} data</p>
        <button onClick={() => setEditing({})} style={styles.addBtn}>
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

      <div style={styles.list}>
        {items.map((item) => (
          <div key={item.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.badge}>{item.kategori}</span>
              <div style={styles.actionGroup}>
                <button onClick={() => setEditing(item)} style={styles.editBtn} title="Edit">
                  <IconPencil /> Edit
                </button>
                <button onClick={() => handleDelete(item.id)} style={styles.deleteBtn} title="Hapus">
                  <IconTrash /> Hapus
                </button>
              </div>
            </div>
            {item.judul && <p style={styles.cardTitle}>{item.judul}</p>}
            <p style={styles.cardContent}>{item.konten}</p>
          </div>
        ))}
        {items.length === 0 && <p style={styles.emptyText}>Belum ada data.</p>}
      </div>
    </div>
  );
}

function KnowledgeForm({ initial, onCancel, onSave, saving }) {
  const [kategori, setKategori] = useState(initial.kategori || 'baseInfo');
  const [judul, setJudul] = useState(initial.judul || '');
  const [konten, setKonten] = useState(initial.konten || '');

  return (
    <div style={styles.formCard}>
      <p style={styles.formTitle}>{initial.id ? 'Edit Data' : 'Tambah Data Baru'}</p>

      <label style={styles.label}>Kategori</label>
      <select value={kategori} onChange={(e) => setKategori(e.target.value)} style={styles.input}>
        <option value="baseInfo">Informasi Umum (baseInfo)</option>
        <option value="standarPelayananPublik">Standar Pelayanan Publik</option>
        <option value="panduanJKN">Panduan JKN Mobile</option>
      </select>

      <label style={styles.label}>Judul (opsional)</label>
      <input
        value={judul}
        onChange={(e) => setJudul(e.target.value)}
        style={styles.input}
        placeholder="Misal: Jam Besuk Pasien"
      />

      <label style={styles.label}>Konten</label>
      <textarea
        value={konten}
        onChange={(e) => setKonten(e.target.value)}
        style={styles.textarea}
        rows={6}
        placeholder="Isi informasi lengkap di sini..."
      />

      <p style={styles.hint}>
        ⚠️ Setiap konten disimpan, embedding-nya otomatis dibuat ulang (butuh beberapa detik).
      </p>

      <div style={styles.formActions}>
        <button onClick={onCancel} style={styles.cancelBtn} disabled={saving}>Batal</button>
        <button
          onClick={() => onSave({ id: initial.id, kategori, judul, konten })}
          style={styles.saveBtn}
          disabled={saving || !konten.trim()}
        >
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </div>
  );
}

// ================= TAB: POLI DOKTER =================
function PoliTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState({}); // { [namaPoli]: true/false }
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

  if (loading) return <p style={styles.loadingText}>Memuat data...</p>;

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

  // Kalau lagi searching, buka semua group yang match otomatis
  const isGroupOpen = (namaPoli) => (keyword ? true : Boolean(expanded[namaPoli]));

  return (
    <div>
      <div style={styles.toolbar}>
        <p style={styles.count}>{items.length} jadwal · {groupNames.length} poli</p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleDownloadJPG} style={styles.exportBtn} disabled={exporting || items.length === 0}>
            <IconDownload /> {exporting ? 'Memproses...' : 'Unduh JPG'}
          </button>
          <button onClick={handleDownloadPDF} style={styles.exportBtn} disabled={exporting || items.length === 0}>
            <IconDownload /> {exporting ? 'Memproses...' : 'Unduh PDF'}
          </button>
          <button onClick={() => setEditing({})} style={styles.addBtn}>
            <IconPlus /> Tambah Jadwal
          </button>
        </div>
      </div>

      <div style={styles.searchWrap}>
        <IconSearch style={styles.searchIcon} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama poli atau dokter..."
          style={styles.searchInput}
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

      <div style={styles.accordionList}>
        {groupNames.map((namaPoli) => {
          const doctors = grouped[namaPoli];
          const activeCount = doctors.filter((d) => d.is_active !== false).length;
          const open = isGroupOpen(namaPoli);

          return (
            <div key={namaPoli} style={styles.accordionGroup}>
              <button onClick={() => togglePoli(namaPoli)} style={styles.accordionHeader}>
                <div style={styles.accordionHeaderLeft}>
                  <IconChevron style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }} />
                  <span style={styles.accordionTitle}>{namaPoli}</span>
                </div>
                <span style={styles.accordionMeta}>
                  {doctors.length} dokter · {activeCount} aktif
                </span>
              </button>

              {open && (
                <div style={styles.accordionBody}>
                  {doctors.map((item) => {
                    const isActive = item.is_active !== false;
                    return (
                      <div key={item.id} style={!isActive ? { ...styles.doctorRow, ...styles.doctorRowInactive } : styles.doctorRow}>
                        <div style={styles.doctorInfo}>
                          <p style={styles.doctorName}>{item.nama_dokter}</p>
                          <p style={styles.doctorMeta}>{item.hari} · {item.jam}</p>
                        </div>
                        <div style={styles.doctorActions}>
                          <span style={isActive ? styles.statusBadgeActive : styles.statusBadgeInactive}>
                            {isActive ? 'Aktif' : 'Libur'}
                          </span>
                          <button onClick={() => handleToggleActive(item)} style={isActive ? styles.pauseBtn : styles.resumeBtn} title={isActive ? 'Set jadwal libur' : 'Aktifkan jadwal'}>
                            {isActive ? <IconPause /> : <IconPlay />} {isActive ? 'Set Libur' : 'Aktifkan'}
                          </button>
                          <button onClick={() => setEditing(item)} style={styles.editBtn} title="Edit">
                            <IconPencil /> Edit
                          </button>
                          <button onClick={() => handleDelete(item.id)} style={styles.deleteBtn} title="Hapus">
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
        {groupNames.length === 0 && <p style={styles.emptyText}>Tidak ada poli/dokter yang cocok dengan pencarian.</p>}
      </div>

      {/* Template khusus buat di-export ke JPG/PDF — ditaruh off-screen, cuma tampilin jadwal aktif */}
      <div style={styles.printOffscreen}>
        <div ref={printRef} style={styles.printSheet}>
          <div style={styles.printHeader}>
            <img src="/logo-rs.jpeg" alt="Logo RSUD Pasirian Lumajang" style={styles.printLogoImg} />
            <div>
              <p style={styles.printTitle}>RSUD Pasirian Lumajang</p>
              <p style={styles.printSubtitle}>Jadwal Praktik Dokter</p>
            </div>
          </div>
          <p style={styles.printDate}>
            Periode: {getWeekInfoForExport().periodeText} · Diperbarui {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <table style={styles.printTable}>
            <thead>
              <tr>
                <th style={styles.printTh}>Poli</th>
                <th style={styles.printTh}>Dokter</th>
                <th style={styles.printTh}>Hari Praktik</th>
                <th style={styles.printTh}>Jam</th>
              </tr>
            </thead>
            <tbody>
              {items.filter((item) => item.is_active !== false).map((item) => (
                <tr key={item.id}>
                  <td style={styles.printTd}>{item.nama_poli}</td>
                  <td style={styles.printTd}>{item.nama_dokter}</td>
                  <td style={styles.printTd}>{hariKeTanggalExport(item.hari, getWeekInfoForExport().week)}</td>
                  <td style={styles.printTd}>{item.jam}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={styles.printFooter}>Jadwal dapat berubah sewaktu-waktu. Informasi lebih lanjut hubungi RSUD Pasirian.</p>
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
    <div style={styles.formCard}>
      <p style={styles.formTitle}>{initial.id ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}</p>

      <label style={styles.label}>Nama Poli</label>
      <input value={nama_poli} onChange={(e) => setNamaPoli(e.target.value)} style={styles.input} placeholder="Poli Spesialis Anak" />

      <label style={styles.label}>Nama Dokter</label>
      <input value={nama_dokter} onChange={(e) => setNamaDokter(e.target.value)} style={styles.input} placeholder="dr. Nama, Sp.A" />

      <label style={styles.label}>Hari Praktik</label>
      <input value={hari} onChange={(e) => setHari(e.target.value)} style={styles.input} placeholder="Senin-Jumat" />

      <label style={styles.label}>Jam Praktik</label>
      <input value={jam} onChange={(e) => setJam(e.target.value)} style={styles.input} placeholder="08.00-12.00" />

      <label style={styles.checkboxRow}>
        <input type="checkbox" checked={is_active} onChange={(e) => setIsActive(e.target.checked)} style={styles.checkbox} />
        Jadwal aktif (tampilkan ke pasien di chatbot)
      </label>

      <div style={styles.formActions}>
        <button onClick={onCancel} style={styles.cancelBtn} disabled={saving}>Batal</button>
        <button
          onClick={() => onSave({ id: initial.id, nama_poli, nama_dokter, hari, jam, is_active })}
          style={styles.saveBtn}
          disabled={saving || !nama_poli.trim() || !nama_dokter.trim()}
        >
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </div>
  );
}

// ================= DESIGN TOKENS (matched to chatbot palette) =================
const colors = {
  greenDark: '#0B3D2E',   // header / sidebar dark green from chatbot
  greenDarker: '#082B20', // hover state for green elements
  green: '#146354',       // secondary green accent (edit button)
  greenSoft: '#E4F1EC',   // soft green background (badge)
  orange: '#F5821F',      // primary CTA orange from chatbot
  orangeHover: '#DD720F',
  orangeSoft: '#FFF1E0',
  red: '#DC2626',
  redSoft: '#FDECEC',
  bg: '#F7F8F6',
  border: '#E2E8DE',
  textMain: '#0F2E22',
  textMuted: '#5B6B63',
};

// ================= STYLES =================
const styles = {
  page: { minHeight: '100vh', background: colors.bg, fontFamily: 'system-ui, sans-serif' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 24px', background: colors.greenDark, color: '#fff',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoImg: {
    width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0,
    background: '#fff',
  },
  headerTitle: { fontSize: '18px', margin: 0, fontWeight: 600 },
  logoutBtn: {
    background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: '#fff',
    padding: '7px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
  },
  tabs: { display: 'flex', gap: '4px', padding: '16px 24px 0', background: '#fff', borderBottom: `1px solid ${colors.border}` },
  tab: {
    padding: '12px 18px', border: 'none', background: 'transparent',
    color: colors.textMuted, cursor: 'pointer', fontWeight: 600, fontSize: '14px',
    borderBottom: '3px solid transparent', marginBottom: '-1px',
  },
  tabActive: {
    padding: '12px 18px', border: 'none', background: 'transparent',
    color: colors.greenDark, cursor: 'pointer', fontWeight: 700, fontSize: '14px',
    borderBottom: `3px solid ${colors.orange}`, marginBottom: '-1px',
  },
  main: { padding: '24px', maxWidth: '1400px', margin: '0 auto' },
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  count: { color: colors.textMuted, fontSize: '14px', margin: 0, fontWeight: 500 },
  addBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    background: colors.orange, color: '#fff', border: 'none', padding: '9px 18px',
    borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '14px',
    boxShadow: '0 2px 6px rgba(245,130,31,0.35)',
  },
  list: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  card: {
    background: '#fff', border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '18px',
    boxShadow: '0 1px 3px rgba(15,46,34,0.06)',
    display: 'flex', flexDirection: 'column', height: '340px',
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  badge: {
    background: colors.greenSoft, color: colors.green, fontSize: '12px', padding: '4px 10px',
    borderRadius: '999px', fontWeight: 700, letterSpacing: '0.2px',
  },
  actionGroup: { display: 'flex', gap: '8px' },
  editBtn: {
    display: 'flex', alignItems: 'center', gap: '5px',
    background: '#fff', color: colors.green, border: `1px solid ${colors.green}`,
    padding: '6px 12px', borderRadius: '7px', cursor: 'pointer', fontSize: '12.5px', fontWeight: 600,
  },
  deleteBtn: {
    display: 'flex', alignItems: 'center', gap: '5px',
    background: '#fff', color: colors.red, border: `1px solid ${colors.red}`,
    padding: '6px 12px', borderRadius: '7px', cursor: 'pointer', fontSize: '12.5px', fontWeight: 600,
  },
  cardTitle: { fontWeight: 700, margin: '4px 0', color: colors.textMain },
  cardContent: {
    color: '#374a40', fontSize: '14px', whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.5,
    overflowY: 'auto', flex: 1, paddingTop: '4px',
  },
  formCard: {
    background: '#fff', border: `1px solid ${colors.border}`, borderRadius: '12px',
    padding: '22px', marginBottom: '18px', boxShadow: '0 2px 8px rgba(15,46,34,0.08)',
  },
  formTitle: { fontWeight: 700, marginBottom: '12px', color: colors.textMain, fontSize: '15px' },
  label: { display: 'block', fontSize: '13px', fontWeight: 600, color: colors.textMuted, marginBottom: '4px', marginTop: '12px' },
  input: {
    width: '100%', padding: '9px 11px', borderRadius: '8px', border: `1px solid ${colors.border}`,
    fontSize: '14px', boxSizing: 'border-box', outline: 'none',
  },
  textarea: {
    width: '100%', padding: '9px 11px', borderRadius: '8px', border: `1px solid ${colors.border}`,
    fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none',
  },
  hint: { fontSize: '12px', color: '#B45309', marginTop: '10px', background: colors.orangeSoft, padding: '8px 10px', borderRadius: '7px' },
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' },
  cancelBtn: {
    padding: '9px 18px', borderRadius: '8px', border: `1px solid ${colors.border}`,
    background: '#fff', cursor: 'pointer', fontWeight: 600, color: colors.textMuted, fontSize: '14px',
  },
  saveBtn: {
    padding: '9px 20px', borderRadius: '8px', border: 'none',
    background: colors.greenDark, color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '14px',
  },
  tableWrap: {
    background: '#fff', border: `1px solid ${colors.border}`, borderRadius: '12px',
    overflow: 'hidden', boxShadow: '0 1px 3px rgba(15,46,34,0.06)',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left', padding: '12px 16px', fontSize: '12.5px', color: '#fff',
    background: colors.greenDark, fontWeight: 600,
  },
  td: { padding: '12px 16px', fontSize: '14px', borderBottom: `1px solid ${colors.border}`, color: '#374a40' },
  loadingText: { color: colors.textMuted, fontSize: '14px' },
  emptyText: { color: colors.textMuted, fontSize: '14px', fontStyle: 'italic' },
  trInactive: { opacity: 0.5, background: '#FAFAF9' },
  statusBadgeActive: {
    background: colors.greenSoft, color: colors.green, fontSize: '12px', padding: '4px 10px',
    borderRadius: '999px', fontWeight: 700,
  },
  statusBadgeInactive: {
    background: '#F1F1EF', color: '#6B7280', fontSize: '12px', padding: '4px 10px',
    borderRadius: '999px', fontWeight: 700,
  },
  pauseBtn: {
    display: 'flex', alignItems: 'center', gap: '5px',
    background: '#fff', color: '#B45309', border: '1px solid #B45309',
    padding: '6px 12px', borderRadius: '7px', cursor: 'pointer', fontSize: '12.5px', fontWeight: 600,
  },
  resumeBtn: {
    display: 'flex', alignItems: 'center', gap: '5px',
    background: colors.green, color: '#fff', border: `1px solid ${colors.green}`,
    padding: '6px 12px', borderRadius: '7px', cursor: 'pointer', fontSize: '12.5px', fontWeight: 600,
  },
  checkboxRow: {
    display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px',
    fontSize: '13px', color: colors.textMuted, fontWeight: 600, cursor: 'pointer',
  },
  checkbox: { width: '16px', height: '16px', cursor: 'pointer' },
  exportBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    background: '#fff', color: colors.greenDark, border: `1px solid ${colors.greenDark}`,
    padding: '9px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '13.5px',
  },
  printOffscreen: {
    position: 'absolute', left: '-9999px', top: 0, pointerEvents: 'none',
  },
  printSheet: {
    width: '800px', background: '#ffffff', padding: '40px', fontFamily: 'system-ui, sans-serif',
  },
  printHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' },
  printLogoImg: {
    width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0,
    background: '#fff',
  },
  printTitle: { fontSize: '20px', fontWeight: 800, color: colors.greenDark, margin: 0 },
  printSubtitle: { fontSize: '14px', color: colors.textMuted, margin: '2px 0 0' },
  printDate: { fontSize: '12.5px', color: colors.textMuted, margin: '14px 0 18px' },
  printTable: { width: '100%', borderCollapse: 'collapse' },
  printTh: {
    textAlign: 'left', padding: '10px 14px', fontSize: '13px', color: '#fff',
    background: colors.greenDark, fontWeight: 700,
  },
  printTd: {
    padding: '10px 14px', fontSize: '13.5px', color: colors.textMain,
    borderBottom: `1px solid ${colors.border}`,
  },
  printFooter: { fontSize: '11.5px', color: colors.textMuted, marginTop: '20px', fontStyle: 'italic' },

  searchWrap: { position: 'relative', marginBottom: '16px' },
  searchIcon: { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted },
  searchInput: {
    width: '100%', padding: '10px 14px 10px 40px', borderRadius: '10px',
    border: `1px solid ${colors.border}`, fontSize: '14px', boxSizing: 'border-box',
    outline: 'none', background: '#fff',
  },

  accordionList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  accordionGroup: {
    background: '#fff', border: `1px solid ${colors.border}`, borderRadius: '12px',
    overflow: 'hidden', boxShadow: '0 1px 3px rgba(15,46,34,0.06)',
  },
  accordionHeader: {
    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 18px', background: '#fff', border: 'none', cursor: 'pointer', textAlign: 'left',
  },
  accordionHeaderLeft: { display: 'flex', alignItems: 'center', gap: '10px', color: colors.greenDark },
  accordionTitle: { fontWeight: 700, fontSize: '15px', color: colors.textMain },
  accordionMeta: { fontSize: '12.5px', color: colors.textMuted, fontWeight: 600 },
  accordionBody: {
    borderTop: `1px solid ${colors.border}`, padding: '10px 14px 14px',
    display: 'flex', flexDirection: 'column', gap: '8px', background: colors.bg,
  },
  doctorRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px',
    background: '#fff', border: `1px solid ${colors.border}`, borderRadius: '10px',
    padding: '12px 14px', flexWrap: 'wrap',
  },
  doctorRowInactive: { opacity: 0.55 },
  doctorInfo: { minWidth: '180px' },
  doctorName: { fontWeight: 700, fontSize: '14px', color: colors.textMain, margin: 0 },
  doctorMeta: { fontSize: '12.5px', color: colors.textMuted, margin: '2px 0 0' },
  doctorActions: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
};
