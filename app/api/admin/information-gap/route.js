// GET /api/admin/information-gap — daftar & ringkasan information gap (B06)
// Data gap jumlahnya kecil (pertanyaan yang sama digabung), jadi diolah di server sekaligus.
export const dynamic = 'force-dynamic';

import { supabase } from '@/lib/supabase-server';
import { ok, gagal, gagalDariDb } from '@/lib/api-respons';
import { ALASAN_GAP, STATUS_GAP } from '@/lib/tiket-constants';
import { keGap } from '@/lib/tiket-server';

export async function GET(request) {
  const q = new URL(request.url).searchParams;
  const status = q.get('status') || 'belum_ditinjau';
  const kategori = q.get('kategori') || '';
  const alasan = q.get('alasan') || '';
  const cari = (q.get('cari') || '').trim().toLowerCase();
  const urut = q.get('urut') === 'terbaru' ? 'terbaru' : 'jumlah';
  const halaman = Math.max(1, parseInt(q.get('halaman'), 10) || 1);
  const perHalaman = Math.min(50, Math.max(1, parseInt(q.get('per_halaman'), 10) || 10));

  if (!STATUS_GAP[status]) return gagal('Filter status tidak dikenal.');
  if (alasan && !ALASAN_GAP[alasan]) return gagal('Filter alasan tidak dikenal.');

  const { data, error } = await supabase
    .from('information_gap')
    .select('id, pertanyaan, alasan, kategori, jumlah, status, pertama_muncul, terakhir_muncul, tiket(nomor_tiket, created_at)')
    .limit(2000);
  if (error) return gagalDariDb(error, 'GAP LIST');

  const semua = (data || []).map(keGap);
  const hasil = semua
    .filter((g) => g.status === status)
    .filter((g) => !kategori || g.kategori === kategori)
    .filter((g) => !alasan || g.alasan === alasan)
    .filter((g) => !cari || g.pertanyaan.toLowerCase().includes(cari))
    .sort((a, b) =>
      urut === 'terbaru' ? new Date(b.terakhir_muncul) - new Date(a.terakhir_muncul) : b.jumlah - a.jumlah
    );

  const aktif = semua.filter((g) => g.status !== 'diabaikan');
  const perKategori = {};
  const perAlasan = {};
  for (const g of aktif) {
    perKategori[g.kategori] ??= { kategori: g.kategori, kali: 0, unik: 0 };
    perKategori[g.kategori].kali += g.jumlah;
    perKategori[g.kategori].unik += 1;
    perAlasan[g.alasan] ??= { kali: 0, unik: 0 };
    perAlasan[g.alasan].kali += g.jumlah;
    perAlasan[g.alasan].unik += 1;
  }

  return ok({
    data: hasil.slice((halaman - 1) * perHalaman, halaman * perHalaman),
    total: hasil.length,
    ringkasan: {
      per_status: Object.fromEntries(Object.keys(STATUS_GAP).map((s) => [s, semua.filter((g) => g.status === s).length])),
      total_aktif: aktif.length,
      total_ditanyakan: aktif.reduce((a, g) => a + g.jumlah, 0),
      punya_tiket: aktif.filter((g) => g.nomor_tiket).length,
      per_kategori: Object.values(perKategori).sort((a, b) => b.kali - a.kali),
      per_alasan: perAlasan,
    },
  });
}
