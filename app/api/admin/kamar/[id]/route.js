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

export async function PUT(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID tidak ditemukan di params.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { nama_ruang, kelas, jumlah_bed, bed_terisi } = body;

    const errorMsg = validasiInput(body);
    if (errorMsg) {
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('kamar_rawat_inap')
      .update({
        nama_ruang,
        kelas,
        jumlah_bed: Number(jumlah_bed),
        bed_terisi: Number(bed_terisi),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error('[KAMAR PUT ERROR]', err.message);
    return NextResponse.json({ error: 'Gagal memperbarui data.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID tidak ditemukan di params.' },
        { status: 400 }
      );
    }

    const { error } = await supabase.from('kamar_rawat_inap').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[KAMAR DELETE ERROR]', err.message);
    return NextResponse.json({ error: err.message || 'Gagal menghapus data.' }, { status: 500 });
  }
}