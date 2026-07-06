import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

// GET -> endpoint PUBLIK untuk halaman utama (bukan admin, tidak perlu login)
export async function GET() {
  const { data, error } = await supabase
    .from('poli_dokter')
    .select('*')
    .eq('is_active', true)
    .order('nama_poli');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}