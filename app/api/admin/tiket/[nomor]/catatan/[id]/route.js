// DELETE /api/admin/tiket/[nomor]/catatan/[id] — hapus catatan internal (B08)
// Soft delete: baris tetap ada di database (kolom dihapus_at diisi) demi jejak audit.
export const dynamic = 'force-dynamic';

import { supabase } from '@/lib/supabase-server';
import { ok, gagal, gagalDariDb, POLA_UUID } from '@/lib/api-respons';
import { ambilDetailTiket, cariIdTiket } from '@/lib/tiket-server';

export async function DELETE(_request, { params }) {
  const p = await params;
  const nomor = decodeURIComponent(p.nomor);
  if (!POLA_UUID.test(p.id)) return gagal('Catatan tidak ditemukan.', 404);

  const { id: tiketId, error: galatCari } = await cariIdTiket(nomor);
  if (galatCari) return gagalDariDb(galatCari, 'CATATAN CARI');
  if (!tiketId) return gagal('Tiket tidak ditemukan.', 404);

  const { data, error } = await supabase
    .from('tiket_catatan')
    .update({ dihapus_at: new Date().toISOString() })
    .eq('id', p.id)
    .eq('tiket_id', tiketId)
    .is('dihapus_at', null)
    .select('id')
    .maybeSingle();

  if (error) return gagalDariDb(error, 'CATATAN HAPUS');
  if (!data) return gagal('Catatan tidak ditemukan.', 404);

  const { data: detail, error: galatDetail } = await ambilDetailTiket(nomor);
  if (galatDetail) return gagalDariDb(galatDetail, 'TIKET DETAIL');
  return ok({ data: detail });
}
