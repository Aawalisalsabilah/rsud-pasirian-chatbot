'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Fraunces, Inter } from 'next/font/google';

const fraunces = Fraunces({ subsets: ['latin'], weight: ['500', '600', '700'], style: ['normal', 'italic'], variable: '--font-fraunces' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-inter' });

function SemeruRidge({ tone = '#FBF9F4', className = '' }) {
  return (
    <div className={`w-full leading-[0] ${className}`} aria-hidden="true">
      <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="w-full h-[28px]">
        <path
          d="M0,60 L0,44 L140,26 L210,38 L300,10 L340,22 L430,4 L470,20 L560,30 L640,14 L700,32 L780,24 L860,40 L960,20 L1040,34 L1120,12 L1200,30 L1200,60 Z"
          fill={tone}
        />
      </svg>
    </div>
  );
}

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login gagal.');
        setLoading(false);
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError('Terjadi kesalahan koneksi.');
      setLoading(false);
    }
  }

  return (
    <div className={`${fraunces.variable} ${inter.variable} font-[var(--font-inter)] min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0B2B24] p-6`}>
      {}
      <div
        className="absolute w-[480px] h-[480px] rounded-full pointer-events-none -top-40 -right-40"
        style={{ background: 'radial-gradient(circle, rgba(192,136,41,0.32) 0%, rgba(192,136,41,0) 70%)' }}
      />
      <div
        className="absolute w-[420px] h-[420px] rounded-full pointer-events-none -bottom-36 -left-36"
        style={{ background: 'radial-gradient(circle, rgba(31,107,79,0.4) 0%, rgba(31,107,79,0) 70%)' }}
      />

      {}
      <svg viewBox="0 0 500 260" className="absolute right-0 bottom-0 w-[55%] max-w-[520px] opacity-[0.08] pointer-events-none" aria-hidden="true">
        <path d="M0,260 L0,210 L90,150 L150,190 L230,60 L270,110 L330,20 L380,90 L440,140 L500,110 L500,260 Z" fill="#F2E4C4" />
      </svg>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-[380px] bg-white rounded-[22px] shadow-[0_30px_70px_rgba(0,0,0,0.35)] ring-1 ring-[#C08829]/10 overflow-hidden"
      >
        <div className="px-8 sm:px-9 pt-9 pb-7">
          <div className="flex justify-center mb-5">
            <img
              src="/logo-rs.jpeg"
              alt="Logo RSUD Pasirian Lumajang"
              className="w-16 h-16 rounded-full object-cover bg-white shadow-[0_0_0_3px_#DDB16955]"
            />
          </div>

          <h1 className="font-[var(--font-fraunces)] font-semibold text-[21px] text-center text-[#0B2B24] tracking-tight">
            Admin RSUD Pasirian
          </h1>
          <p className="text-[13.5px] text-[#0B2B24]/55 text-center mt-1.5 mb-7">
            Masuk untuk mengelola data chatbot
          </p>

          <label className="block text-[12.5px] font-semibold text-[#0B2B24]/70 mb-1.5">Password</label>
          <input
            type="password"
            placeholder="Masukkan password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            className="w-full rounded-xl border border-[#0B2B24]/[0.12] px-3.5 py-2.5 text-[14px] text-[#0B2B24] outline-none focus:border-[#C08829] focus:ring-2 focus:ring-[#C08829]/15 transition mb-4"
          />

          {error && (
            <p className="flex items-center gap-2 text-[#9E3B32] text-[13px] bg-[#9E3B32]/10 px-3 py-2 rounded-lg -mt-1 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9E3B32] shrink-0" />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-b from-[#DDB169] to-[#C08829] hover:from-[#e6bd7c] hover:to-[#ca9235] disabled:opacity-80 disabled:cursor-not-allowed text-[#0B2B24] font-[var(--font-fraunces)] font-bold py-3 rounded-full text-[14.5px] transition shadow-[0_10px_24px_rgba(192,136,41,0.35)]"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>

          <p className="text-center text-[11.5px] text-[#0B2B24]/45 mt-6">
            RSUD Pasirian Lumajang &middot; Sistem Asisten Virtual
          </p>
        </div>

        <SemeruRidge tone="#0B2B24" />
      </form>
    </div>
  );
}