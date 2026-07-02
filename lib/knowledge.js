import { list } from '@vercel/blob';

// ===== HELPER: hitung Senin-Minggu untuk minggu berjalan =====
const namaHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const namaBulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function formatTanggal(date) {
  return `${date.getDate()} ${namaBulan[date.getMonth()]} ${date.getFullYear()}`;
}

export function getCurrentWeekInfo() {
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
    week[hari] = formatTanggal(d);
  });

  const periodeText = `${week['Senin']} - ${week['Minggu']}`;
  const todayLabel = `${namaHari[today.getDay()]} , ${formatTanggal(today)}`;

  return { week, periodeText, todayLabel };
}

// ===== DATA JADWAL DOKTER =====
const daftarPoli = [
  { nama: 'Poli Spesialis Bedah', dokter: [{ nama: 'dr. Hendra Setiawan, Sp.B', hari: 'Senin-Jumat', jam: '10.00-13.00' }, { nama: 'dr. Prima Budi Prayogi, Sp.B', hari: 'Jumat', jam: '12.00-15.00' }] },
  { nama: 'Poli Spesialis Ortopedi & Traumatologi', dokter: [{ nama: 'dr. Rosihan Effendi, Sp.OT', hari: 'Senin-Jumat', jam: '09.00-12.00' }] },
  { nama: 'Poli Spesialis Paru', dokter: [{ nama: 'dr. Trisasongko Budisatrio, Sp.P', hari: 'Senin-Jumat', jam: '08.30-12.00' }] },
  { nama: 'Poli Spesialis Penyakit Dalam', dokter: [{ nama: 'dr. Wiryawan Pradipto, Sp.Pd', hari: 'Senin-Jumat', jam: '08.00-12.00' }] },
  { nama: 'Poli Spesialis Kandungan', dokter: [{ nama: 'dr. Elvi Widiastuti, Sp.OG', hari: 'Senin, Rabu, Jumat', jam: '09.00-12.00' }, { nama: 'dr. Ryan Ishak, Sp.OG', hari: 'Selasa & Kamis', jam: '10.00-13.00' }] },
  { nama: 'Poli Spesialis Gigi Tiruan', dokter: [{ nama: 'dr. Agung Hardianto, Sp.Pros', hari: 'Senin-Jumat', jam: '08.00-13.00' }] },
  { nama: 'Poli Gigi Umum', dokter: [{ nama: 'dr. Reza Hesti Augustine', hari: 'Senin-Jumat', jam: '08.00-13.00' }] },
  { nama: 'Poli Spesialis Anak', dokter: [{ nama: 'dr. Nurul Yudhi Prihastuy, Sp.A', hari: 'Senin-Jumat', jam: '08.00-09.00' }] },
  { nama: 'Dokter VCT', dokter: [{ nama: 'dr. Niken Dumilah', hari: 'Senin-Jumat', jam: 'Sesuai Jam Kerja' }] },
  { nama: 'Radiologi', dokter: [{ nama: 'dr. Trilia Kurniati, Sp.Rad', hari: 'Senin-Jumat', jam: 'Sesuai Jam Kerja' }] },
  { nama: 'Laboratorium', dokter: [{ nama: 'dr. Dwita Riadini, Sp.PK', hari: 'Senin-Jumat', jam: 'Sesuai Jam Kerja' }] },
  { nama: 'Dokter Spesialis Anestesi', dokter: [{ nama: 'dr. Donny Tilon, Sp.An', hari: 'Senin-Jumat', jam: 'Sesuai Jam Kerja' }] },
  { nama: 'Dokter Spesialis Anestesiologi & Terapi Intensif', dokter: [{ nama: 'dr. Ardhani Khalifatul Nur Kholis, Sp.An-Ti', hari: 'Sabtu & Minggu', jam: 'Sesuai Jam Kerja' }] },
  { nama: 'Layanan Fisioterapi', dokter: [{ nama: 'Mochamad Nursaid, A.Md', hari: 'Senin-Jumat', jam: 'Sesuai Jam Kerja' }, { nama: 'David Aryanto, A.Md.F', hari: 'Senin-Jumat', jam: 'Sesuai Jam Kerja' }] },
  { nama: 'Layanan Konsultasi Gizi', dokter: [{ nama: 'Nur Rizqi Intan Syaputri, S.ST', hari: 'Senin-Jumat', jam: 'Sesuai Jam Kerja' }] },
];

function hariKeTanggal(hariText, week) {
  if (hariText === 'Senin-Jumat') return `Senin-Jumat (${week['Senin']} - ${week['Jumat']})`;
  if (hariText === 'Sabtu & Minggu') return `Sabtu & Minggu (${week['Sabtu']} & ${week['Minggu']})`;
  if (hariText === 'Selasa & Kamis') return `Selasa & Kamis (${week['Selasa']} & ${week['Kamis']})`;
  if (hariText === 'Senin, Rabu, Jumat') return `Senin, Rabu, Jumat (${week['Senin']}, ${week['Rabu']}, ${week['Jumat']})`;
  if (hariText === 'Jumat') return `Jumat (${week['Jumat']})`;
  return hariText;
}

function buildJadwalPoliText(week, periodeText) {
  const daftarText = daftarPoli.map(poli => {
    const dokterText = poli.dokter.map(d => `  • **${d.nama}** — ${hariKeTanggal(d.hari, week)}, **${d.jam}**`).join('\n');
    return `- **${poli.nama}**:\n${dokterText}`;
  }).join('\n');

  return `\nDAFTAR POLIKLINIK & JADWAL DOKTER (PERIODE: **${periodeText}**):\n${daftarText}`;
}

// ===== FUNGSI PENGAMBIL DATA CLOUD =====
async function getBlobData() {
  const { blobs } = await list();
  const file = blobs.find((b) => b.pathname === 'knowledge.json');
  if (!file) throw new Error("File knowledge.json tidak ditemukan di Blob!");
  const response = await fetch(file.url);
  return await response.json();
}

// ===== FUNGSI UTAMA =====
export async function buildSystemPrompt(userQuestion = '') {
  const q = userQuestion.toLowerCase();
  const { week, periodeText, todayLabel } = getCurrentWeekInfo();
  const jadwalPoliText = buildJadwalPoliText(week, periodeText);
  const infoHariIni = `\nINFORMASI WAKTU SAAT INI: Hari ini ${todayLabel}.`;

  // Mengambil data dari Vercel Blob
  const jsonKnowledge = await getBlobData();

  const baseInfo = jsonKnowledge.baseInfo || '';
  const standarPelayananPublik = jsonKnowledge.standarPelayananPublik || '';
  const panduanJKN = jsonKnowledge.panduanJKN || '';

  const keywordsJadwal = ['poli', 'jadwal', 'dokter', 'praktik', 'praktek', 'jam', 'bedah', 'ortopedi', 'paru', 'kandungan', 'gigi', 'anak', 'vct', 'radiologi', 'lab', 'anestesi', 'fisio', 'gizi'];
  const keywordsStandar = ['standar', 'pelayanan', 'pengaduan', 'komplain', 'saran', 'igd', 'rawat', 'syarat', 'prosedur', 'tarif', 'biaya'];
  const keywordsJKN = ['jkn', 'bpjs', 'rujukan', 'antrean', 'faskes', 'daftar', 'aplikasi', 'online'];

  let modules = [];
  if (keywordsJadwal.some(k => q.includes(k))) modules.push(jadwalPoliText);
  if (keywordsStandar.some(k => q.includes(k))) modules.push(standarPelayananPublik);
  if (keywordsJKN.some(k => q.includes(k))) modules.push(panduanJKN);

  if (modules.length === 0) modules = [jadwalPoliText, standarPelayananPublik, panduanJKN];

  return (baseInfo + infoHariIni + '\n' + modules.join('\n')).trim();
}