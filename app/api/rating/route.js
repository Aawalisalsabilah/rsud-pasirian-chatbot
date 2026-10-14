import { NextResponse } from 'next/server';

// MOCK SEMENTARA, hapus file ini kalau API asli dari Tasya (B11) sudah ada.
// Asumsi kontrak (konfirmasi ke Tasya):
//   GET  /api/rating?nomor=TKT-...  -> 200 { data: { nomor_tiket, status, sudah_dinilai } } | 404 { error }
//   POST /api/rating { nomor_tiket, rating: 1..5, komentar: string | null }
//        -> 201 { data: { ok: true } } | 400 { error } | 404 { error } | 409 { error } (sudah dinilai)
//
// Untuk menguji tiap kondisi halaman, buka /rating/<nomor> dengan akhiran:
//   -0000 -> tiket tidak ditemukan
//   -1111 -> sudah dinilai
//   -2222 -> belum selesai
//   lainnya -> siap dinilai (contoh: TKT-20261014-1234)

function cekTiket(nomor) {
  if (!nomor || !/^TKT-\d{8}-\d{4}$/.test(nomor)) return { hasil: 'notfound' };
  if (nomor.endsWith('-0000')) return { hasil: 'notfound' };
  if (nomor.endsWith('-1111')) return { hasil: 'ok', status: 'selesai', sudah_dinilai: true };
  if (nomor.endsWith('-2222')) return { hasil: 'ok', status: 'diproses', sudah_dinilai: false };
  return { hasil: 'ok', status: 'selesai', sudah_dinilai: false };
}

export async function GET(request) {
  const nomor = new URL(request.url).searchParams.get('nomor');
  const tiket = cekTiket(nomor);

  if (tiket.hasil === 'notfound') {
    return NextResponse.json({ error: 'Tiket tidak ditemukan.' }, { status: 404 });
  }

  await new Promise((r) => setTimeout(r, 400));
  return NextResponse.json({
    data: { nomor_tiket: nomor, status: tiket.status, sudah_dinilai: tiket.sudah_dinilai },
  });
}

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const tiket = cekTiket(body?.nomor_tiket);

  if (tiket.hasil === 'notfound') {
    return NextResponse.json({ error: 'Tiket tidak ditemukan.' }, { status: 404 });
  }
  if (tiket.sudah_dinilai) {
    return NextResponse.json({ error: 'Tiket ini sudah dinilai.' }, { status: 409 });
  }

  const ratingValid = Number.isInteger(body?.rating) && body.rating >= 1 && body.rating <= 5;
  const komentarValid = body?.komentar === null || (typeof body?.komentar === 'string' && body.komentar.length <= 500);
  if (!ratingValid || !komentarValid) {
    return NextResponse.json({ error: 'Penilaian tidak valid.' }, { status: 400 });
  }

  await new Promise((r) => setTimeout(r, 600));
  return NextResponse.json({ data: { ok: true } }, { status: 201 });
}