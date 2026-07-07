import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { embedTextWithRetry } from '@/lib/embedding-helper';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

export async function GET() {
  const { data, error } = await supabase
    .from('knowledge_base')
    .select('id, kategori, judul, konten, updated_at')
    .order('updated_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request) {
  try {
    const { kategori, judul, konten } = await request.json();

    if (!kategori || !konten) {
      return NextResponse.json(
        { error: 'Kategori dan konten wajib diisi.' },
        { status: 400 }
      );
    }

    const embedding = await embedTextWithRetry(konten);

    const { data, error } = await supabase
      .from('knowledge_base')
      .insert({ kategori, judul, konten, embedding })
      .select('id, kategori, judul, konten, updated_at')
      .single();

    if (error) {
      console.error('[SUPABASE INSERT ERROR]', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error('[KNOWLEDGE POST ERROR]', err.message);
    return NextResponse.json({ error: err.message || 'Gagal menyimpan data.' }, { status: 500 });
  }
}
