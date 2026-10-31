// PATCH /api/admin/information-gap/[id] — ubah status tinjauan (B06)
export const dynamic = 'force-dynamic';

import { supabase } from '@/lib/supabase-server';
import { ok, gagal, gagalDariDb, bacaJson, POLA_UUID } from '@/lib/api-respons';
import { STATUS_GAP } from '@/lib/tiket-constants';
import { keGap } from '@/lib/tiket-server';

export async function PATCH(request, { params }) {
  const { id } = await params;
  if (!POLA_UUID.test(id)) return gagal('Information gap tidak ditemukan.', 404);

  const body = await bacaJson(request);
  if (!STATUS_GAP[body?.status]) return gagal('Status tidak valid.', 400);

  const { data, error } = await supabase
    .from('information_gap')
    .update({ status: body.status })
    .eq('id', id)
    .select('id, pertanyaan, alasan, kategori, jumlah, status, pertama_muncul, terakhir_muncul, tiket(nomor_tiket, created_at)')
    .maybeSingle();

  if (error) return gagalDariDb(error, 'GAP PATCH');
  if (!data) return gagal('Information gap tidak ditemukan.', 404);
  return ok({ data: keGap(data) });
}
