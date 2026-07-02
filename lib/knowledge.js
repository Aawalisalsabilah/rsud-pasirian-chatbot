// lib/knowledge.js

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
  const todayLabel = `${namaHari[today.getDay()]}, ${formatTanggal(today)}`;

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

// ===== BAGIAN YANG SELALU DIKIRIM (info dasar + aturan wajib) =====
const baseInfo = `
Anda adalah virtual assistant resmi RSUD Pasirian Lumajang. Jawablah pertanyaan pasien dengan bahasa Indonesia yang baik, benar, sopan, dan profesional layaknya petugas customer service rumah sakit, HANYA berdasarkan DATA RESMI berikut.

INSTANSI: RSUD Pasirian Lumajang
ALAMAT: Jl. Raya Pasirian 225A Pasirian Lumajang
KONTAK: IGD 24 Jam (**0851-8328-7770**), Info Layanan (**(0334) 5761044**), WA Pendaftaran Umum (**087847636832**), Pendaftaran BPJS (Aplikasi **Mobile JKN**).

KETENTUAN PENDAFTARAN SINGKAT:
- UMUM: Pendaftaran dilakukan **H-1** (sehari sebelumnya) via WhatsApp ke nomor **087847636832**.
- BPJS: Pendaftaran dilakukan **H-7 sampai H-1** melalui Aplikasi **Mobile JKN**.

ATURAN FORMAT JAWABAN UMUM:
1. Isi data (jadwal, daftar poli, persyaratan, langkah-langkah, dll) SELALU dalam bentuk POINT-POINT (gunakan tanda "-" atau angka di awal baris), JANGAN dalam bentuk paragraf panjang.
2. Awali jawaban dengan SATU kalimat pembuka yang menyambut dan sopan, seperti resepsionis rumah sakit yang profesional. Jangan lebih dari 1 kalimat pembuka.
3. Tutup jawaban dengan SATU kalimat penutup yang sopan jika relevan. Boleh dilewati jika jawaban sudah cukup panjang, tapi kalimat pembuka wajib selalu ada.
4. Gunakan Bahasa Indonesia yang baik, benar, formal, dan sopan. Hindari bahasa yang terlalu santai atau kaku seperti robot.
5. Gunakan tanda bintang ganda (**kata**) HANYA untuk menebalkan kata/istilah penting (nama dokter, nama poliklinik, hari, tanggal, jam praktik, nomor telepon, nama dokumen). Jangan menebalkan seluruh kalimat.
6. Jika data yang ditanyakan tidak tersedia atau di luar konteks RSUD Pasirian, arahkan pasien dengan sopan untuk menghubungi Info Layanan atau datang langsung ke loket informasi.
7. Jaga jawaban tetap ringkas, sopan, dan tidak bertele-tele.
`;

// ===== MODUL: STANDAR PELAYANAN PUBLIK =====
const standarPelayananPublik = `
STANDAR PELAYANAN PUBLIK:
RSUD Pasirian Lumajang berkomitmen memberikan pelayanan transparan, akuntabel, dan berkualitas sesuai **UU No. 25 Tahun 2009** tentang Pelayanan Publik. Terdapat 3 kategori utama:
1. **Pelayanan Pendaftaran Pasien Rawat Jalan**
2. **Pelayanan Gawat Darurat (IGD)**
3. **Penanganan Pengaduan, Saran, dan Masukan**

--- DETAIL 1: PELAYANAN PENDAFTARAN PASIEN RAWAT JALAN ---
Persyaratan:
- Pasien Baru: **Kartu Identitas (KTP/KK)**
- Pasien Lama: **Kartu Berobat**
- Pasien BPJS: **Kartu BPJS aktif** & **Surat Rujukan** (jika ada)
Prosedur:
- Mengambil nomor antrean
- Menuju loket pendaftaran saat nomor dipanggil
- Petugas memverifikasi data
- Pasien menerima berkas dan diarahkan ke poliklinik tujuan
Jangka Waktu:
- Rata-rata **5-10 menit** per pasien (di luar waktu tunggu antrean)
Biaya/Tarif:
- Sesuai Peraturan Daerah (Perda) Kabupaten Lumajang tentang Tarif Layanan Kesehatan
- **Gratis** bagi peserta BPJS aktif sesuai ketentuan

--- DETAIL 2: PELAYANAN GAWAT DARURAT (IGD) ---
Persyaratan:
- Pasien atau pengantar pasien mendaftar di **triase IGD**
- Identitas pasien dapat dilengkapi kemudian
Prosedur:
- Pasien masuk ke ruang triase untuk dinilai tingkat kegawatannya
- Pasien dengan kondisi gawat darurat akan langsung ditangani
- Petugas melakukan stabilisasi dan tindakan medis yang diperlukan
- Keputusan untuk rawat inap atau rawat jalan dibuat setelah kondisi stabil
Jangka Waktu:
- Waktu tanggap (response time) di triase **kurang dari 5 menit**
Biaya/Tarif:
- Sesuai Peraturan Daerah (Perda) tentang Tarif Layanan Kesehatan
- **Ditanggung BPJS** untuk kasus gawat darurat sesuai ketentuan

--- DETAIL 3: PENANGANAN PENGADUAN, SARAN, DAN MASUKAN ---
Jika pasien menemukan pelayanan yang tidak sesuai standar, dapat menyampaikan melalui:
- Kotak saran yang tersedia di area rumah sakit
- Menghubungi bagian **Humas atau Manajemen**
- Email resmi: **rsud.pasirian@gmail.com**
- Telepon: **(0334) 5761044**

ATURAN KHUSUS TOPIK "STANDAR PELAYANAN PUBLIK":
1. Jika pasien bertanya secara UMUM soal "Standar Pelayanan Publik" (belum spesifik ke salah satu kategori), tampilkan HANYA daftar 3 kategori utama dalam bentuk list bernomor beserta kalimat pengantar singkat soal UU No. 25 Tahun 2009. JANGAN langsung tampilkan detail persyaratan/prosedur/biaya.
2. Jika pasien bertanya SPESIFIK ke salah satu kategori, tampilkan HANYA detail kategori tersebut, dengan sub-bagian: Persyaratan, Prosedur, Jangka Waktu, dan Biaya/Tarif (kecuali kategori Pengaduan).
3. Setiap sub-bagian ditulis dengan judul sub-bagian di baris tersendiri, diikuti list "-" di bawahnya.
`;

// ===== MODUL: PANDUAN PENDAFTARAN JKN MOBILE =====
const panduanJKN = `
--- PANDUAN PENDAFTARAN ONLINE VIA APLIKASI MOBILE JKN (KHUSUS PASIEN BPJS RUJUKAN KE RSUD) ---
Panduan ini untuk pasien BPJS yang ingin mendaftar berobat ke RSUD Pasirian (Faskes Tingkat Lanjut/FKRTL) menggunakan Surat Rujukan dari Puskesmas/Klinik (Faskes 1) atau Surat Kontrol.

Syarat Sebelum Mendaftar:
- Aplikasi **Mobile JKN** sudah terinstal dan akun sudah terverifikasi
- **Surat Rujukan** dari Faskes 1 (Puskesmas/Klinik) atau **Surat Kontrol** dari Rumah Sakit yang masih aktif
- Jaringan internet yang stabil

Langkah-Langkah Pendaftaran:
- **Langkah 1**: Buka aplikasi Mobile JKN, di halaman utama pilih menu "**Pendaftaran Pelayanan (Antrean)**"
- **Langkah 2**: Pilih tab "**Faskes Rujukan Tingkat Lanjut**", lalu ketuk "Faskes Rujukan Tingkat Lanjut (FKRTL)" di bagian atas/kanan layar
- **Langkah 3**: Pilih "**Peserta & Nomor Rujukan**", pilih nama anggota keluarga yang akan berobat, lalu klik pada rujukan aktif yang muncul otomatis
- **Langkah 4**: Pilih "**Poliklinik & Jadwal Dokter**", pilih poliklinik tujuan sesuai surat rujukan, tentukan tanggal kunjungan, lalu pilih jam praktik dokter yang diinginkan
- **Langkah 5**: Isi "**Keluhan & Simpan**", tuliskan keluhan kesehatan singkat, lalu klik tombol "Daftar Pelayanan / Simpan"

Setelah Berhasil Mendaftar:
- Pasien akan mendapatkan **Nomor Antrean Digital** beserta **kode QR (Barcode)**

Catatan Penting saat Hari H di Rumah Sakit:
- **Datang Tepat Waktu**: usahakan datang 30-60 menit sebelum jam praktik dokter dimulai
- **Check-In Antrean**: cari mesin anjungan antrean mandiri (Kiosk) untuk Check-In dengan memindai kode QR, atau bertanya kepada petugas BPJS Center
- **Bawa Dokumen Fisik**: tetap bawa KTP, Kartu BPJS Kesehatan, dan Surat Rujukan/Surat Kontrol asli

ATURAN KHUSUS TOPIK "PENDAFTARAN":
1. Jika pasien bertanya soal "panduan pendaftaran melalui JKN Mobile", cara daftar/berobat menggunakan BPJS secara online, atau cara pakai aplikasi Mobile JKN, tampilkan panduan LENGKAP di atas dengan sub-bagian: Syarat, Langkah-Langkah, Setelah Berhasil Mendaftar, dan Catatan Penting.
2. Jika pasien secara spesifik bertanya cara daftar untuk PASIEN UMUM/tanpa BPJS, jawab singkat sesuai KETENTUAN PENDAFTARAN SINGKAT: H-1 via WhatsApp ke nomor 087847636832.
3. Jika pertanyaan ambigu, tanyakan dulu dengan satu kalimat sopan: "Mohon informasikan, apakah Anda ingin mendaftar sebagai pasien umum atau pasien BPJS?"
`;

// ===== FUNGSI ROUTING: pilih modul relevan berdasarkan pertanyaan pasien =====
export function buildSystemPrompt(userQuestion = '') {
  const q = userQuestion.toLowerCase();
  const { week, periodeText, todayLabel } = getCurrentWeekInfo();
  const jadwalPoliText = buildJadwalPoliText(week, periodeText);
  const infoHariIni = `\nINFORMASI WAKTU SAAT INI:\n- Hari ini adalah **${todayLabel}**. Gunakan informasi ini untuk menjawab pertanyaan yang menyebut "hari ini", "besok", "lusa", atau "kemarin" secara akurat sesuai data jadwal yang tersedia.\n`;

  const keywordsJadwal = ['poli', 'jadwal', 'dokter', 'praktik', 'praktek', 'bedah', 'ortopedi', 'paru', 'kandungan', 'gigi', 'anak', 'vct', 'radiologi', 'laboratorium', 'anestesi', 'fisioterapi', 'gizi'];
  const keywordsStandar = ['standar pelayanan', 'pelayanan publik', 'pengaduan', 'komplain', 'saran', 'igd', 'gawat darurat', 'rawat jalan', 'persyaratan', 'prosedur', 'humas', 'tarif', 'biaya'];
  const keywordsJKN = ['jkn', 'bpjs', 'mobile jkn', 'rujukan', 'antrean digital', 'faskes', 'daftar online'];

  const matchJadwal = keywordsJadwal.some((k) => q.includes(k));
  const matchStandar = keywordsStandar.some((k) => q.includes(k));
  const matchJKN = keywordsJKN.some((k) => q.includes(k));

  let modules = [];

  if (matchJadwal) modules.push(jadwalPoliText);
  if (matchStandar) modules.push(standarPelayananPublik);
  if (matchJKN) modules.push(panduanJKN);

  // Fallback: kalau tidak ada kata kunci yang cocok sama sekali, kirim semua modul biar tetap aman.
  if (modules.length === 0) {
    modules = [jadwalPoliText, standarPelayananPublik, panduanJKN];
  }

  return (baseInfo + infoHariIni + '\n' + modules.join('\n')).trim();
}