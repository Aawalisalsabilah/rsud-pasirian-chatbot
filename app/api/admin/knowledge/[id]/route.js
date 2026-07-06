import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { embedTextWithRetry } from '@/lib/embedding-helper';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

// PUT -> update data, WAJIB re-generate embedding karena konten berubah
export async function PUT(request, { params }) {
  try {
    const { id } = await params; // ✅ fix: params sekarang Promise di Next.js 15
    const { kategori, judul, konten } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID tidak ditemukan di params.' },
        { status: 400 }
      );
    }

    if (!kategori || !konten) {
      return NextResponse.json(
        { error: 'Kategori dan konten wajib diisi.' },
        { status: 400 }
      );
    }

    const embedding = await embedTextWithRetry(konten);

    const { data, error } = await supabase
      .from('knowledge_base')
      .update({ kategori, judul, konten, embedding, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, kategori, judul, konten, updated_at')
      .single();

    if (error) {
      console.error('[SUPABASE UPDATE ERROR]', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error('[KNOWLEDGE PUT ERROR]', err.message);
    return NextResponse.json({ error: err.message || 'Gagal memperbarui data.' }, { status: 500 });
  }
}

// DELETE -> hapus data
export async function DELETE(request, { params }) {
  try {
    const { id } = await params; // ✅ fix yang sama

    if (!id) {
      return NextResponse.json(
        { error: 'ID tidak ditemukan di params.' },
        { status: 400 }
      );
    }

    const { error } = await supabase.from('knowledge_base').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[KNOWLEDGE DELETE ERROR]', err.message);
    return NextResponse.json({ error: err.message || 'Gagal menghapus data.' }, { status: 500 });
  }
}