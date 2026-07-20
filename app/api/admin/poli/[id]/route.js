export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

export async function PUT(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID tidak ditemukan di params.' },
        { status: 400 }
      );
    }

    const { nama_poli, nama_dokter, hari, jam, is_active } = await request.json();

    if (!nama_poli || !nama_dokter || !hari || !jam) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('poli_dokter')
      .update({
        nama_poli,
        nama_dokter,
        hari,
        jam,
        is_active: is_active !== undefined ? is_active : true,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error('[POLI PUT ERROR]', err.message);
    return NextResponse.json({ error: 'Gagal memperbarui data.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params; // ✅ fix

    if (!id) {
      return NextResponse.json(
        { error: 'ID tidak ditemukan di params.' },
        { status: 400 }
      );
    }

    const { error } = await supabase.from('poli_dokter').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[POLI DELETE ERROR]', err.message);
    return NextResponse.json({ error: err.message || 'Gagal menghapus data.' }, { status: 500 });
  }
}