// Helper respons API supaya semua endpoint tiket konsisten (lihat docs/kontrak-api-tiket.md)
import { NextResponse } from 'next/server';

const TANPA_CACHE = { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' };

export function ok(body, status = 200) {
  return NextResponse.json(body, { status, headers: TANPA_CACHE });
}

export function gagal(pesan, status = 400) {
  return NextResponse.json({ error: pesan }, { status, headers: TANPA_CACHE });
}

// Menerjemahkan error Supabase/Postgres jadi pesan yang ramah.
// Detail teknis hanya ditulis ke log server, tidak dikirim ke browser.
export function gagalDariDb(error, konteks = 'DB') {
  if (error?.code === 'P0001') return gagal(error.message, 409); // aturan bisnis dari trigger (pesan sudah Bahasa Indonesia)
  if (error?.code === '23505') return gagal('Data sudah ada.', 409);
  if (error?.code === '23514' || error?.code === '22P02') return gagal('Data tidak valid.', 400);
  console.error(`[${konteks} ERROR]`, error?.code, error?.message);
  return gagal('Terjadi kesalahan di server. Silakan coba lagi.', 500);
}

export async function bacaJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export const POLA_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
