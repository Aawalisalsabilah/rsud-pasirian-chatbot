// POST /api/tiket — pengguna mengirim permintaan / pengaduan informasi (B05)
// Kontrak: docs/kontrak-api-tiket.md bagian 1
export const dynamic = 'force-dynamic';

import { supabase } from '@/lib/supabase-server';
import { ok, gagal, gagalDariDb, bacaJson, POLA_UUID } from '@/lib/api-respons';
import { tiketRateLimit, getClientIp } from '@/lib/rate-limit';
import { KATEGORI_TIKET, JENIS_TIKET } from '@/lib/tiket-constants';

const KATEGORI_VALID = KATEGORI_TIKET.map((k) => k.value);

// Validasi ulang di server: request bisa dikirim langsung tanpa lewat form.
function validasi(b) {
  if (!b || typeof b !== 'object') return 'Format data tidak valid.';
  if (!Object.keys(JENIS_TIKET).includes(b.jenis)) return 'Pilih jenis laporan: permintaan atau pengaduan.';
  if (!KATEGORI_VALID.includes(b.kategori)) return 'Kategori tidak dikenal.';
  const deskripsi = typeof b.deskripsi === 'string' ? b.deskripsi.trim() : '';
  if (deskripsi.length < 20 || deskripsi.length > 1000) return 'Deskripsi harus 20 sampai 1000 karakter.';
  if (b.nama != null && (typeof b.nama !== 'string' || b.nama.trim().length > 60)) return 'Nama maksimal 60 karakter.';
  if (typeof b.no_wa !== 'string' || !/^628\d{8,11}$/.test(b.no_wa)) return 'Nomor WhatsApp tidak valid. Gunakan format 628xxxxxxxxxx.';
  if (b.persetujuan_wa !== true) return 'Anda perlu menyetujui dihubungi lewat WhatsApp.';
  if (b.information_gap_id != null && !POLA_UUID.test(String(b.information_gap_id))) return 'Referensi information gap tidak valid.';
  if (b.pertanyaan_chatbot != null && (typeof b.pertanyaan_chatbot !== 'string' || b.pertanyaan_chatbot.length > 1000)) {
    return 'Pertanyaan chatbot terlalu panjang.';
  }
  return null;
}

export async function POST(request) {
  // Anti-spam. Kalau Redis bermasalah, tetap izinkan (fail open) supaya pengguna tidak terblokir.
  try {
    const { success } = await tiketRateLimit.limit(getClientIp(request));
    if (!success) return gagal('Terlalu banyak laporan dari perangkat Anda. Silakan coba lagi sekitar 1 jam lagi.', 429);
  } catch (e) {
    console.error('[TIKET RATE LIMIT ERROR - FAIL OPEN]', e.message);
  }

  const body = await bacaJson(request);
  const salah = validasi(body);
  if (salah) return gagal(salah, 400);

  const isi = {
    jenis: body.jenis,
    kategori: body.kategori,
    deskripsi: body.deskripsi.trim(),
    nama: body.nama?.trim() || null,
    no_wa: body.no_wa,
    persetujuan_wa: true,
    information_gap_id: body.information_gap_id || null,
    pertanyaan_chatbot: body.pertanyaan_chatbot?.trim() || null,
  };

  let { data, error } = await simpan(isi);
  // information_gap_id yang sudah tidak ada -> simpan tanpa referensi, jangan gagalkan laporan pengguna
  if (error?.code === '23503' && isi.information_gap_id) {
    ({ data, error } = await simpan({ ...isi, information_gap_id: null }));
  }
  if (error) return gagalDariDb(error, 'TIKET INSERT');
  return ok({ data }, 201);
}

function simpan(isi) {
  return supabase.from('tiket').insert(isi).select('nomor_tiket, status').single();
}
