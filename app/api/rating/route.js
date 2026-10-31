// GET/POST /api/rating — penilaian pengguna setelah tiket selesai (B11)
// Memakai TOKEN acak dari link WhatsApp, bukan nomor tiket, supaya orang lain tidak bisa menebak.
// Kontrak: docs/kontrak-api-tiket.md bagian 1
export const dynamic = 'force-dynamic';

import { supabase } from '@/lib/supabase-server';
import { ok, gagal, gagalDariDb, bacaJson } from '@/lib/api-respons';
import { satu } from '@/lib/tiket-server';

const POLA_TOKEN = /^[0-9a-f]{24}$/;

async function cariTiketDariToken(token) {
  if (typeof token !== 'string' || !POLA_TOKEN.test(token)) return { data: null };
  return supabase
    .from('tiket')
    .select('id, nomor_tiket, status, tiket_rating(rating)')
    .eq('token_rating', token)
    .maybeSingle();
}

// Hanya mengembalikan 3 data yang dibutuhkan halaman rating (tanpa nomor WA / deskripsi).
export async function GET(request) {
  const token = new URL(request.url).searchParams.get('token');
  const { data, error } = await cariTiketDariToken(token);
  if (error) return gagalDariDb(error, 'RATING GET');
  if (!data) return gagal('Tiket tidak ditemukan.', 404);
  return ok({
    data: { nomor_tiket: data.nomor_tiket, status: data.status, sudah_dinilai: Boolean(satu(data.tiket_rating)) },
  });
}

export async function POST(request) {
  const body = await bacaJson(request);
  const { data: tiket, error: galatCari } = await cariTiketDariToken(body?.token);
  if (galatCari) return gagalDariDb(galatCari, 'RATING CARI');
  if (!tiket) return gagal('Tiket tidak ditemukan.', 404);

  const ratingValid = Number.isInteger(body?.rating) && body.rating >= 1 && body.rating <= 5;
  const komentar = typeof body?.komentar === 'string' ? body.komentar.trim() : null;
  if (!ratingValid || (komentar && komentar.length > 500)) return gagal('Penilaian tidak valid.', 400);

  if (satu(tiket.tiket_rating)) return gagal('Tiket ini sudah dinilai.', 409);

  const { error } = await supabase
    .from('tiket_rating')
    .insert({ tiket_id: tiket.id, rating: body.rating, komentar: komentar || null });

  if (error?.code === '23505') return gagal('Tiket ini sudah dinilai.', 409);
  if (error) return gagalDariDb(error, 'RATING INSERT');
  return ok({ data: { ok: true } }, 201);
}
