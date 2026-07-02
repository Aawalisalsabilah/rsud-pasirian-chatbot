// lib/knowledge.js
import fs from 'fs';
import path from 'path';

// ===== HELPER: hitung Senin-Minggu untuk minggu berjalan (otomatis, tidak perlu diedit manual) =====
const namaHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const namaBulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function formatTanggal(date) {
  return `${date.getDate()} ${namaBulan[date.getMonth()]} ${date.getFullYear()}`;
}

// Menghasilkan objek tanggal untuk Senin s.d. Minggu di minggu berjalan (berdasarkan hari ini),
// plus label hari ini secara eksplisit agar AI tidak menebak-nebak.
export function getCurrentWeekInfo() {
  const today = new Date();
  const dayIndex = today.getDay(); // 0 = Minggu, 1 = Senin, ... 6 = Sabtu
  const diffToMonday = dayIndex === 0 ? -6 : 1 - dayIndex; // mundur ke Senin terdekat

  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);

  const week = {}; // { Senin: '29 Juni 2026', Selasa: '30 Juni 2026', ... }
  const urutanHari = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  urutanHari.forEach((hari, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    week[hari] = formatTanggal(d);
  });

  const periodeText = `${week['Senin']} - ${week['Minggu']}`;
  const periodeSeninJumat = `${week['Senin']} - ${week['Jumat']}`;
  const todayLabel = `${namaHari[today.getDay()]} , ${formatTanggal(today)}`;

  return { week, periodeText, periodeSeninJumat, todayLabel };
}

// ===== DATA TERSTRUKTUR JADWAL DOKTER (edit di sini kalau ada perubahan dokter/hari/jam) =====
const daftarPoli = [
  {
    nama: 'Poli Spesialis Bedah',
    dokter: [
      { nama: 'dr. Hendra Setiawan, Sp.B', hari: 'Senin-Jumat', jam: '10.00-13.00' },
      { nama: 'dr. Prima Budi Prayogi, Sp.B', hari: 'Jumat', jam: '12.00-15.00' },
    ],
  },
  {
    nama: 'Poli Spesialis Ortopedi & Traumatologi',
    dokter: [{ nama: 'dr. Rosihan Effendi, Sp.OT', hari: 'Senin-Jumat', jam: '09.00-12.00' }],
  },
  {
    nama: 'Poli Spesialis Paru',
    dokter: [{ nama: 'dr. Trisasongko Budisatrio, Sp.P', hari: 'Senin-Jumat', jam: '08.30-12.00' }],
  },
  {
    nama: 'Poli Spesialis Penyakit Dalam',
    dokter: [{ nama: 'dr. Wiryawan Pradipto, Sp.Pd', hari: 'Senin-Jumat', jam: '08.00-12.00' }],
  },
  {
    nama: 'Poli Spesialis Kandungan',
    dokter: [
      { nama: 'dr. Elvi Widiastuti, Sp.OG', hari: 'Senin, Rabu, Jumat', jam: '09.00-12.00' },
      { nama: 'dr. Ryan Ishak, Sp.OG', hari: 'Selasa & Kamis', jam: '10.00-13.00' },
    ],
  },
  {
    nama: 'Poli Spesialis Gigi Tiruan',
    dokter: [{ nama: 'dr. Agung Hardianto, Sp.Pros', hari: 'Senin-Jumat', jam: '08.00-13.00' }],
  },
  {
    nama: 'Poli Gigi Umum',
    dokter: [{ nama: 'dr. Reza Hesti Augustine', hari: 'Senin-Jumat', jam: '08.00-13.00' }],
  },
  {
    nama: 'Poli Spesialis Anak',
    dokter: [{ nama: 'dr. Nurul Yudhi Prihastuy, Sp.A', hari: 'Senin-Jumat', jam: '08.00-09.00' }],
  },
  {
    nama: 'Dokter VCT',
    dokter: [{ nama: 'dr. Niken Dumilah', hari: 'Senin-Jumat', jam: 'Sesuai Jam Kerja' }],
  },
  {
    nama: 'Radiologi',
    dokter: [{ nama: 'dr. Trilia Kurniati, Sp.Rad', hari: 'Senin-Jumat', jam: 'Sesuai Jam Kerja' }],
  },
  {
    nama: 'Laboratorium',
    dokter: [{ nama: 'dr. Dwita Riadini, Sp.PK', hari: 'Senin-Jumat', jam: 'Sesuai Jam Kerja' }],
  },
  {
    nama: 'Dokter Spesialis Anestesi',
    dokter: [{ nama: 'dr. Donny Tilon, Sp.An', hari: 'Senin-Jumat', jam: 'Sesuai Jam Kerja' }],
  },
  {
    nama: 'Dokter Spesialis Anestesiologi & Terapi Intensif',
    dokter: [{ nama: 'dr. Ardhani Khalifatul Nur Kholis, Sp.An-Ti', hari: 'Sabtu & Minggu', jam: 'Sesuai Jam Kerja' }],
  },
  {
    nama: 'Layanan Fisioterapi',
    dokter: [
      { nama: 'Mochamad Nursaid, A.Md', hari: 'Senin-Jumat', jam: 'Sesuai Jam Kerja' },
      { nama: 'David Aryanto, A.Md.F', hari: 'Senin-Jumat', jam: 'Sesuai Jam Kerja' },
    ],
  },
  {
    nama: 'Layanan Konsultasi Gizi',
    dokter: [{ nama: 'Nur Rizqi Intan Syaputri, S.ST', hari: 'Senin-Jumat', jam: 'Sesuai Jam Kerja' }],
  },
];

// Menerjemahkan "Senin-Jumat" / "Selasa & Kamis" dll menjadi rentang tanggal aktual minggu ini
function hariKeTanggal(hariText, week) {
  if (hariText === 'Senin-Jumat') {
    return `Senin-Jumat (${week['Senin']} - ${week['Jumat']})`;
  }
  if (hariText === 'Sabtu & Minggu') {
    return `Sabtu & Minggu (${week['Sabtu']} & ${week['Minggu']})`;
  }
  if (hariText === 'Selasa & Kamis') {
    return `Selasa & Kamis (${week['Selasa']} & ${week['Kamis']})`;
  }
  if (hariText === 'Senin, Rabu, Jumat') {
    return `Senin, Rabu, Jumat (${week['Senin']}, ${week['Rabu']}, ${week['Jumat']})`;
  }
  if (hariText === 'Jumat') {
    return `Jumat (${week['Jumat']})`;
  }
  return hariText; // fallback kalau ada format hari baru yang belum dipetakan
}

// Membangun teks jadwal poliklinik lengkap dengan tanggal minggu berjalan otomatis
function buildJadwalPoliText(week, periodeText) {
  const daftarText = daftarPoli
    .map((poli) => {
      const dokterText = poli.dokter
        .map((d) => `  • **${d.nama}** — ${hariKeTanggal(d.hari, week)}, **${d.jam}**`)
        .join('\n');
      return `- **${poli.nama}**:\n${dokterText}`;
    })
    .join('\n');

  return `
DAFTAR POLIKLINIK & JADWAL DOKTER (BERLAKU UNTUK PERIODE: **${periodeText}**, minggu berjalan saat ini):
Keterangan tanggal per hari minggu ini:
- Senin = **${week['Senin']}**
- Selasa = **${week['Selasa']}**
- Rabu = **${week['Rabu']}**
- Kamis = **${week['Kamis']}**
- Jumat = **${week['Jumat']}**
- Sabtu = **${week['Sabtu']}**
- Minggu = **${week['Minggu']}**

${daftarText}

ATURAN KHUSUS TOPIK "JADWAL POLIKLINIK":
1. Jika pasien bertanya "poli apa saja" atau semacamnya, tampilkan HANYA daftar nama-nama poliklinik dalam bentuk list, tanpa detail dokter dulu.
2. Jika pasien menyebut satu poli tertentu, tampilkan HANYA data poli tersebut: nama dokter, hari + tanggal praktik, dan jam praktik.
3. Jika pasien bertanya menggunakan kata "hari ini", "besok", "lusa", atau "kemarin", COCOKKAN terlebih dahulu dengan INFORMASI WAKTU SAAT INI di bawah untuk menentukan hari dan tanggal yang dimaksud secara akurat, baru tampilkan dokter yang praktik pada hari tersebut sesuai data. Jika tidak ada dokter yang praktik pada hari yang dimaksud, sampaikan dengan sopan bahwa tidak ada jadwal praktik pada hari tersebut.
4. Jangan gabungkan beberapa poli sekaligus kecuali pasien memang bertanya untuk semua poli.
5. Jadwal di atas HANYA berlaku untuk periode ${periodeText} (minggu berjalan saat ini) dan bisa berubah pada minggu berikutnya.
6. Jika pasien bertanya tentang jadwal DI LUAR periode tersebut (misalnya "minggu depan", "bulan depan", atau menyebut tanggal spesifik yang berada di luar rentang ${periodeText}), JANGAN menjawab dengan kepastian dan JANGAN mengarang jadwal. Sampaikan dengan sopan bahwa jadwal untuk periode tersebut belum tersedia karena jadwal diperbarui setiap minggu, dan sarankan menghubungi Info Layanan (0334) 5761044 mendekati harinya untuk kepastian.
7. Jangan pernah mengarang atau memperkirakan jadwal di luar data yang tersedia.
`;
}

// ===== FUNGSI ROUTING: Ambil data dari JSON lokal dan rakit modul =====
export function buildSystemPrompt(userQuestion = '') {
  const q = userQuestion.toLowerCase();
  const { week, periodeText, todayLabel } = getCurrentWeekInfo();
  const jadwalPoliText = buildJadwalPoliText(week, periodeText);
  const infoHariIni = `\nINFORMASI WAKTU SAAT INI:\n- Hari ini adalah **${todayLabel}**. Gunakan informasi ini untuk menjawab pertanyaan yang menyebut "hari ini", "besok", "lusa", atau "kemarin" secara akurat sesuai data jadwal yang tersedia.\n`;

  // --- MEMBACA FILE KNOWLEDGE.JSON SECARA DINAMIS ---
  let jsonKnowledge = { baseInfo: '', standarPelayananPublik: '', panduanJKN: '' };
  try {
    const filePath = path.join(process.cwd(), 'public', 'knowledge.json');
    const fileData = fs.readFileSync(filePath, 'utf8');
    jsonKnowledge = JSON.parse(fileData);
  } catch (error) {
    console.error("Gagal membaca file knowledge.json:", error);
  }

  // Ambil isi teks asli dari JSON tanpa merubah struktur/list/bold
  const baseInfo = jsonKnowledge.baseInfo || '';
  const standarPelayananPublik = jsonKnowledge.standarPelayananPublik || '';
  const panduanJKN = jsonKnowledge.panduanJKN || '';

  // Kosakata kata kunci pencocokan modul
  const keywordsJadwal = ['poli', 'jadwal', 'dokter', 'praktik', 'praktek', 'jam berapa', 'buka', 'bedah', 'ortopedi', 'paru', 'kandungan', 'gigi', 'anak', 'vct', 'radiologi', 'laboratorium', 'anestesi', 'fisioterapi', 'gizi', 'spesialis'];
  const keywordsStandar = ['standar pelayanan', 'pelayanan publik', 'pengaduan', 'komplain', 'saran', 'igd', 'gawat darurat', 'rawat jalan', 'persyaratan', 'prosedur', 'humas', 'tarif', 'biaya', 'ongkos', 'bayar', 'gratis', 'ktp', 'kk', 'loket', 'syarat'];
  const keywordsJKN = ['jkn', 'bpjs', 'mobile jkn', 'rujukan', 'antrean digital', 'faskes', 'daftar online', 'aplikasi', 'pendaftaran online', 'android', 'ios', 'barcode', 'qr'];

  const matchJadwal = keywordsJadwal.some((k) => q.includes(k));
  const matchStandar = keywordsStandar.some((k) => q.includes(k));
  const matchJKN = keywordsJKN.some((k) => q.includes(k));

  let modules = [];

  if (matchJadwal) modules.push(jadwalPoliText);
  if (matchStandar) modules.push(standarPelayananPublik);
  if (matchJKN) modules.push(panduanJKN);

  if (modules.length === 0) {
    modules = [jadwalPoliText, standarPelayananPublik, panduanJKN];
  }

  return (baseInfo + infoHariIni + '\n' + modules.join('\n')).trim();
}