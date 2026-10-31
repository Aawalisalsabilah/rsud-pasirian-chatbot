// GET /api/admin/tiket — daftar tiket + ringkasan untuk dashboard (B07)
// Otomatis hanya untuk admin (middleware.js melindungi /api/admin/*)
export const dynamic = 'force-dynamic';

import { supabase } from '@/lib/supabase-server';
import { ok, gagal, gagalDariDb } from '@/lib/api-respons';
import { satu } from '@/lib/tiket-server';
import { STATUS_URUTAN, KATEGORI_TIKET, JENIS_TIKET } from '@/lib/tiket-constants';

const hitung = (status) =>
  supabase.from('tiket').select('id', { count: 'exact', head: true }).eq('status', status);

export async function GET(request) {
  const q = new URL(request.url).searchParams;
  const status = q.get('status') || '';
  const jenis = q.get('jenis') || '';
  const kategori = q.get('kategori') || '';
  const cari = (q.get('cari') || '').trim().slice(0, 40);
  const halaman = Math.max(1, parseInt(q.get('halaman'), 10) || 1);
  const perHalaman = Math.min(50, Math.max(1, parseInt(q.get('per_halaman'), 10) || 10));

  if (status && !STATUS_URUTAN.includes(status)) return gagal('Filter status tidak dikenal.');
  if (jenis && !JENIS_TIKET[jenis]) return gagal('Filter jenis tidak dikenal.');
  if (kategori && !KATEGORI_TIKET.some((k) => k.value === kategori)) return gagal('Filter kategori tidak dikenal.');

  let query = supabase
    .from('tiket')
    .select('nomor_tiket, jenis, kategori, deskripsi, nama, no_wa, status, created_at, updated_at, tiket_rating(rating)', {
      count: 'exact',
    })
    .order('created_at', { ascending: false })
    .range((halaman - 1) * perHalaman, halaman * perHalaman - 1);

  if (status) query = query.eq('status', status);
  if (jenis) query = query.eq('jenis', jenis);
  if (kategori) query = query.eq('kategori', kategori);
  if (cari) query = query.ilike('nomor_tiket', `%${cari.replace(/[%_\\]/g, (c) => `\\${c}`)}%`);

  const [daftar, baru, diproses, selesai, ratings] = await Promise.all([
    query,
    hitung('baru'),
    hitung('diproses'),
    hitung('selesai'),
    supabase.from('tiket_rating').select('rating'),
  ]);

  const galat = [daftar, baru, diproses, selesai, ratings].find((r) => r.error)?.error;
  if (galat) return gagalDariDb(galat, 'TIKET LIST');

  const nilai = (ratings.data || []).map((r) => r.rating);
  return ok({
    data: (daftar.data || []).map(({ tiket_rating, ...t }) => ({ ...t, rating: satu(tiket_rating)?.rating ?? null })),
    total: daftar.count ?? 0,
    ringkasan: {
      baru: baru.count ?? 0,
      diproses: diproses.count ?? 0,
      selesai: selesai.count ?? 0,
      rata_rating: nilai.length ? nilai.reduce((a, b) => a + b, 0) / nilai.length : null,
      jumlah_dinilai: nilai.length,
    },
  });
}
