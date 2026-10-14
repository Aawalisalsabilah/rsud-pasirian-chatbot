import { NextResponse } from 'next/server';

// MOCK SEMENTARA, hapus file ini kalau API asli dari Tasya (B05) sudah ada.
// Asumsi kontrak (konfirmasi ke Tasya):
//   Request : POST {
//     jenis: 'permintaan' | 'pengaduan',
//     kategori: string,
//     deskripsi: string,
//     nama: string | null,
//     no_wa: '62xxxxxxxxxx',
//     persetujuan_wa: true
//   }
//   Response: 201 { data: { nomor_tiket: string, status: 'baru' } }
//   Error   : 400 { error: string }

export async function POST(request) {
  const body = await request.json().catch(() => null);

  const valid =
    ['permintaan', 'pengaduan'].includes(body?.jenis) &&
    typeof body?.kategori === 'string' && body.kategori.length > 0 &&
    typeof body?.deskripsi === 'string' && body.deskripsi.trim().length >= 20 &&
    typeof body?.no_wa === 'string' && /^628\d{8,11}$/.test(body.no_wa) &&
    body?.persetujuan_wa === true;

  if (!valid) {
    return NextResponse.json({ error: 'Data belum lengkap atau tidak valid.' }, { status: 400 });
  }

  await new Promise((r) => setTimeout(r, 600));

  const tanggal = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const acak = Math.floor(1000 + Math.random() * 9000);

  return NextResponse.json(
    { data: { nomor_tiket: `TKT-${tanggal}-${acak}`, status: 'baru' } },
    { status: 201 }
  );
}