// POST /api/admin/tiket/[nomor]/catatan — tambah catatan internal (B08)
export const dynamic = 'force-dynamic';

import { supabase } from '@/lib/supabase-server';
import { ok, gagal, gagalDariDb, bacaJson } from '@/lib/api-respons';
import { ambilDetailTiket, cariIdTiket } from '@/lib/tiket-server';

export async function POST(request, { params }) {
  const nomor = decodeURIComponent((await params).nomor);
  const body = await bacaJson(request);
  const isi = typeof body?.isi === 'string' ? body.isi.trim() : '';
  if (!isi || isi.length > 500) return gagal('Catatan harus 1–500 karakter.', 400);

  const { id, error: galatCari } = await cariIdTiket(nomor);
  if (galatCari) return gagalDariDb(galatCari, 'CATATAN CARI');
  if (!id) return gagal('Tiket tidak ditemukan.', 404);

  const { error } = await supabase.from('tiket_catatan').insert({ tiket_id: id, isi });
  if (error) return gagalDariDb(error, 'CATATAN INSERT');

  const { data, error: galatDetail } = await ambilDetailTiket(nomor);
  if (galatDetail) return gagalDariDb(galatDetail, 'TIKET DETAIL');
  return ok({ data }, 201);
}
