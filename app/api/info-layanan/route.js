import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

export async function GET() {
  const { data, error } = await supabase
    .from('knowledge_base')
    .select('id, judul, konten')
    .eq('kategori', 'infoLayanan')
    .order('judul');

  if (error) {
    console.error('[SUPABASE info-layanan ERROR]', error.message);
    return NextResponse.json({ items: [] }, { status: 500 });
  }

  const items = (data || []).map((row) => ({
    id: row.id,
    title: row.judul,
    content: row.konten,
  }));

  return NextResponse.json({ items });
}