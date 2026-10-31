// =====================================================================
//  PENCATAT INFORMATION GAP DARI CHATBOT (B06)
// =====================================================================
//  Cara kerja (usulan, menunggu kesepakatan kriteria B02):
//  1. Ke system prompt chatbot ditambahkan instruksi: kalau jawaban TIDAK ada
//     di DATA RESMI, model menambahkan penanda PENANDA_GAP di akhir jawaban.
//  2. Route chat mendeteksi penanda itu, membuangnya dari jawaban, lalu
//     mencatat pertanyaan ke tabel information_gap (pertanyaan sama digabung).
//  3. Pengguna diberi link ke form Tindak Lanjut, membawa id gap-nya, supaya
//     tiket yang dibuat otomatis terhubung ke gap tersebut.
//  Gap TIDAK otomatis menjadi tiket (sesuai B06).
// =====================================================================
import { supabase } from './supabase-server';

export const PENANDA_GAP = '[[INFO_TIDAK_TERSEDIA]]';

export const INSTRUKSI_GAP = `

ATURAN PENCATATAN INFORMASI YANG BELUM TERSEDIA:
Jika pertanyaan pengguna berkaitan dengan layanan RSUD Pasirian, TETAPI jawabannya TIDAK terdapat pada DATA RESMI di atas, tetap jawab dengan sopan sesuai aturan (arahkan ke Info Layanan), lalu tulis penanda ${PENANDA_GAP} pada baris paling akhir jawaban. Jangan menulis penanda tersebut jika informasinya tersedia, jika pertanyaan berupa sapaan, atau jika pertanyaan di luar topik rumah sakit.`;

// Tebakan kategori sederhana dari kata kunci (sama dengan daftar kategori tiket)
const KATA_KUNCI_KATEGORI = [
  ['BPJS / JKN', ['bpjs', 'jkn', 'rujukan', 'faskes']],
  ['Jadwal dokter', ['jadwal', 'dokter', 'poli', 'praktik', 'praktek', 'spesialis']],
  ['Rawat inap', ['rawat inap', 'kamar', 'bed', 'besuk', 'jenguk', 'ruang']],
  ['Farmasi', ['obat', 'apotek', 'farmasi', 'resep']],
  ['Biaya & administrasi', ['biaya', 'tarif', 'harga', 'bayar', 'administrasi', 'surat']],
  ['Pendaftaran', ['daftar', 'pendaftaran', 'antre', 'antri', 'mcu', 'registrasi']],
];

export function tebakKategori(teks) {
  const t = (teks || '').toLowerCase();
  return KATA_KUNCI_KATEGORI.find(([, kata]) => kata.some((k) => t.includes(k)))?.[0] || 'Lainnya';
}

/** Cek & buang penanda dari jawaban model. */
export function pisahkanPenanda(reply) {
  if (!reply || !reply.includes(PENANDA_GAP)) return { reply, adaGap: false };
  return { reply: reply.split(PENANDA_GAP).join('').trim(), adaGap: true };
}

/** Catat ke database. Tidak pernah melempar error (chatbot harus tetap jalan). */
export async function catatGap(pertanyaan, alasan = 'tidak_ditemukan') {
  const teks = (pertanyaan || '').trim();
  if (teks.length < 3) return null;
  try {
    const { data, error } = await supabase.rpc('catat_information_gap', {
      p_pertanyaan: teks.slice(0, 1000),
      p_alasan: alasan,
      p_kategori: tebakKategori(teks),
    });
    if (error) throw error;
    return data; // uuid gap
  } catch (e) {
    console.error('[INFO GAP ERROR]', e.message);
    return null;
  }
}

export function saranTindakLanjut(gapId) {
  const link = gapId ? `/tindak-lanjut?gap=${gapId}` : '/tindak-lanjut';
  return `\n\nBelum menemukan informasi yang Anda cari? Anda bisa [mengajukan permintaan informasi](${link}), petugas kami akan menindaklanjuti dan mengabari Anda lewat WhatsApp.`;
}
