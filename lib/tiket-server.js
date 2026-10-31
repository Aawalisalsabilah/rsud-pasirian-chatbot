// Query tiket yang dipakai beberapa endpoint admin. Hanya untuk server.
import { supabase } from './supabase-server';

const urutWaktu = (a, b) => new Date(a.created_at) - new Date(b.created_at);
const satu = (x) => (Array.isArray(x) ? x[0] ?? null : x ?? null);

/** Detail tiket sesuai bentuk "detail" di docs/kontrak-api-tiket.md. Mengembalikan { data, error }. */
export async function ambilDetailTiket(nomor) {
  const { data, error } = await supabase
    .from('tiket')
    .select(
      'id, nomor_tiket, jenis, kategori, deskripsi, nama, no_wa, status, ringkasan_penyelesaian, created_at, updated_at, selesai_at, ' +
        'tiket_catatan(id, isi, dibuat_oleh, created_at, dihapus_at), ' +
        'tiket_riwayat(tipe, keterangan, oleh, created_at), ' +
        'tiket_rating(rating, komentar)'
    )
    .eq('nomor_tiket', nomor)
    .maybeSingle();

  if (error) return { error };
  if (!data) return { data: null };

  const { tiket_catatan, tiket_riwayat, tiket_rating, ...tiket } = data;
  return {
    data: {
      ...tiket,
      catatan: (tiket_catatan || [])
        .filter((c) => !c.dihapus_at)
        .sort(urutWaktu)
        .map(({ dihapus_at, ...c }) => c),
      riwayat: (tiket_riwayat || []).sort(urutWaktu),
      rating: satu(tiket_rating),
    },
  };
}

/** Cari id tiket dari nomornya. */
export async function cariIdTiket(nomor) {
  const { data, error } = await supabase.from('tiket').select('id').eq('nomor_tiket', nomor).maybeSingle();
  return { id: data?.id ?? null, error };
}

/** Ubah baris information_gap (+ relasi tiket) ke bentuk Gap di kontrak. */
export function keGap(g) {
  const tiketTerbaru = [...(g.tiket || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
  return {
    id: g.id,
    pertanyaan: g.pertanyaan,
    alasan: g.alasan,
    kategori: g.kategori || 'Lainnya',
    jumlah: g.jumlah,
    status: g.status,
    pertama_muncul: g.pertama_muncul,
    terakhir_muncul: g.terakhir_muncul,
    nomor_tiket: tiketTerbaru?.nomor_tiket ?? null,
  };
}

export { satu };

