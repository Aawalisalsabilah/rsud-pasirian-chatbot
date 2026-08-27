export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

const KELAS_VALID = ['Intensif', 'VIP', 'Kelas I', 'Kelas II', 'Kelas III'];

function validasiInput({ nama_ruang, kelas, jumlah_bed, bed_terisi }) {
  if (!nama_ruang || !kelas) {
    return 'Nama ruang dan kelas wajib diisi.';
  }
  if (!KELAS_VALID.includes(kelas)) {
    return `Kelas harus salah satu dari: ${KELAS_VALID.join(', ')}.`;
  }
  const jb = Number(jumlah_bed);
  const bt = Number(bed_terisi);
  if (!Number.isInteger(jb) || jb <= 0) {
    return 'Jumlah bed harus angka bulat lebih dari 0.';
  }
  if (!Number.isInteger(bt) || bt < 0) {
    return 'Bed terisi harus angka bulat minimal 0.';
  }
  if (bt > jb) {
    return 'Bed terisi tidak boleh lebih dari jumlah bed.';
  }
  return null;
}

export async function GET() {
  const { data, error } = await supabase
    .from('kamar_rawat_inap')
    .select('*')
    .order('kelas')
    .order('nama_ruang');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { nama_ruang, kelas, jumlah_bed, bed_terisi } = body;

    const errorMsg = validasiInput(body);
    if (errorMsg) {
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('kamar_rawat_inap')
      .insert({
        nama_ruang,
        kelas,
        jumlah_bed: Number(jumlah_bed),
        bed_terisi: Number(bed_terisi ?? 0),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error('[KAMAR POST ERROR]', err.message);
    return NextResponse.json({ error: 'Gagal menyimpan data.' }, { status: 500 });
  }
}