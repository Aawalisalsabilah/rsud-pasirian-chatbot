// GET   /api/admin/tiket/[nomor] — detail tiket (B08)
// PATCH /api/admin/tiket/[nomor] — ubah status; saat "selesai" kirim notifikasi WA (B08, B10)
export const dynamic = 'force-dynamic';

import { supabase } from '@/lib/supabase-server';
import { ok, gagal, gagalDariDb, bacaJson } from '@/lib/api-respons';
import { ambilDetailTiket } from '@/lib/tiket-server';
import { kirimNotifikasiSelesai } from '@/lib/whatsapp';

async function detailAtau404(nomor) {
  const { data, error } = await ambilDetailTiket(nomor);
  if (error) return gagalDariDb(error, 'TIKET DETAIL');
  if (!data) return gagal('Tiket tidak ditemukan.', 404);
  return ok({ data });
}

export async function GET(_request, { params }) {
  const { nomor } = await params;
  return detailAtau404(decodeURIComponent(nomor));
}

// Alamat web untuk link rating di WA. Isi APP_URL di .env kalau domainnya tetap,
// kalau kosong dipakai alamat yang sedang diakses admin.
function alamatWeb(request) {
  return (process.env.APP_URL || new URL(request.url).origin).replace(/\/$/, '');
}

export async function PATCH(request, { params }) {
  const nomor = decodeURIComponent((await params).nomor);
  const body = await bacaJson(request);

  const perubahan = {};
  if (body?.status === 'diproses') {
    perubahan.status = 'diproses';
  } else if (body?.status === 'selesai') {
    const ringkasan = typeof body.ringkasan_penyelesaian === 'string' ? body.ringkasan_penyelesaian.trim() : '';
    if (ringkasan.length < 20 || ringkasan.length > 1000) {
      return gagal('Ringkasan penyelesaian wajib 20–1000 karakter.', 400);
    }
    perubahan.status = 'selesai';
    perubahan.ringkasan_penyelesaian = ringkasan;
  } else {
    return gagal('Status hanya bisa diubah menjadi "diproses" atau "selesai".', 400);
  }

  // Aturan alur status dijaga oleh trigger database: pelanggaran -> 409 dengan pesan jelas.
  const { data: tiket, error } = await supabase
    .from('tiket')
    .update(perubahan)
    .eq('nomor_tiket', nomor)
    .select('id, nomor_tiket, nama, no_wa, token_rating, ringkasan_penyelesaian')
    .maybeSingle();

  if (error) return gagalDariDb(error, 'TIKET PATCH');
  if (!tiket) return gagal('Tiket tidak ditemukan.', 404);

  if (perubahan.status === 'selesai') {
    // Hanya ringkasan penyelesaian yang dikirim. Catatan internal TIDAK PERNAH ikut.
    await kirimNotifikasiSelesai({
      tiketId: tiket.id,
      noWa: tiket.no_wa,
      nama: tiket.nama,
      nomorTiket: tiket.nomor_tiket,
      ringkasan: tiket.ringkasan_penyelesaian,
      linkRating: `${alamatWeb(request)}/rating/${tiket.token_rating}`,
    });
  }

  return detailAtau404(nomor);
}
