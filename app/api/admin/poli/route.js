export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

export async function GET() {
  const { data, error } = await supabase
    .from('poli_dokter')
    .select('*')
    .order('nama_poli');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { data },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    }
  );
}

export async function POST(request) {
  try {
    const { nama_poli, nama_dokter, hari, jam, is_active } = await request.json();

    if (!nama_poli || !nama_dokter || !hari || !jam) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('poli_dokter')
      .insert({
        nama_poli,
        nama_dokter,
        hari,
        jam,
        is_active: is_active !== undefined ? is_active : true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error('[POLI POST ERROR]', err.message);
    return NextResponse.json({ error: 'Gagal menyimpan data.' }, { status: 500 });
  }
}