import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

// Endpoint ringan khusus buat ambil daftar nama poli.
// SENGAJA tidak lewat Groq/LLM sama sekali -- ini query database polos,
// jadi instan, gratis, dan tidak makan jatah token TPM Groq.
export async function GET() {
  const { data, error } = await supabase
    .from('poli_dokter')
    .select('nama_poli')
    .order('nama_poli');

  if (error) {
    console.error('[SUPABASE poli-list ERROR]', error.message);
    return NextResponse.json({ polis: [] }, { status: 500 });
  }

  const uniqueNames = [...new Set((data || []).map((row) => row.nama_poli))];
  return NextResponse.json({ polis: uniqueNames });
}