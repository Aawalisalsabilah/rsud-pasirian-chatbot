import { NextResponse } from 'next/server';
import { revokeAdminSession } from '@/lib/admin-session';

export async function POST(request) {
  const token = request.cookies.get('admin_session')?.value;

  try {
    await revokeAdminSession(token);
  } catch (err) {
    console.error('[LOGOUT ERROR]', err.message);
    // Tetap lanjut hapus cookie di browser meskipun gagal hapus dari Redis --
    // minimal browser user nggak nyimpen token lagi.
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin_session');
  return response;
}