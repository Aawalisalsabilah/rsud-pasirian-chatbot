// Daftar nilai bersama untuk fitur Tindak Lanjut Informasi.
// Dipakai oleh form (Salsa), API (Tasya), dan dashboard admin (Kharis)
// supaya tulisan kategori/status tidak beda-beda.

export const JENIS_TIKET = {
  permintaan: { label: 'Permintaan Informasi', color: '#2A6C93' },
  pengaduan: { label: 'Pengaduan Informasi', color: '#9E3B32' },
};

// kbKategori = pemetaan ke kategori FAQ existing (baseInfo, standarPelayananPublik, panduanJKN).
// Usulan awal, perlu dikonfirmasi ke Aisyah (B09).
export const KATEGORI_TIKET = [
  { value: 'Jadwal dokter', kbKategori: 'baseInfo' },
  { value: 'BPJS / JKN', kbKategori: 'panduanJKN' },
  { value: 'Pendaftaran', kbKategori: 'panduanJKN' },
  { value: 'Rawat inap', kbKategori: 'baseInfo' },
  { value: 'Farmasi', kbKategori: 'baseInfo' },
  { value: 'Biaya & administrasi', kbKategori: 'standarPelayananPublik' },
  { value: 'Lainnya', kbKategori: 'baseInfo' },
];

// Alur status: baru -> diproses -> selesai. Tiket selesai dikunci (tidak bisa mundur).
export const STATUS_TIKET = {
  baru: { label: 'Baru', color: '#2A6C93', bg: '#2A6C93', next: ['diproses'] },
  diproses: { label: 'Diproses', color: '#A0701C', bg: '#C08829', next: ['selesai'] },
  selesai: { label: 'Selesai', color: '#1F6B4F', bg: '#1F6B4F', next: [] },
};

export const STATUS_URUTAN = ['baru', 'diproses', 'selesai'];

// 6285712345678 -> 62857****678
export function samarkanWa(noWa) {
  if (!noWa || noWa.length < 9) return noWa || '-';
  return `${noWa.slice(0, 5)}****${noWa.slice(-3)}`;
}

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export function formatTanggalTiket(iso, denganJam = false) {
  if (!iso) return '-';
  const d = new Date(iso);
  const tgl = `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
  if (!denganJam) return tgl;
  const jam = `${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')}`;
  return `${tgl}, ${jam}`;
}
