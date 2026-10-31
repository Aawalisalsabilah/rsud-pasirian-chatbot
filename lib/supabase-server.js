// Klien Supabase KHUSUS SERVER (memakai secret key).
// Jangan pernah di-import dari komponen 'use client'.
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
});
