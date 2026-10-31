'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const API_RATING = '/api/rating';

const KOMENTAR_MAX = 500;
const LABEL_RATING = ['Sangat kurang', 'Kurang', 'Cukup', 'Baik', 'Sangat baik'];

const PESAN_STATUS = {
  notfound: {
    judul: 'Tiket tidak ditemukan',
    desc: 'Periksa kembali tautan dari pesan WhatsApp Anda. Jika masih gagal, hubungi kami di (0334) 5761114.',
    warna: '#9E3B32',
  },
  'belum-selesai': {
    judul: 'Tiket ini belum selesai ditangani',
    desc: 'Penilaian bisa diisi setelah tim kami selesai menindaklanjuti. Kami akan mengabari Anda lewat WhatsApp.',
    warna: '#C08829',
  },
  'sudah-dinilai': {
    judul: 'Tiket ini sudah dinilai',
    desc: 'Terima kasih, penilaian untuk tiket ini sudah kami terima dan tidak bisa diisi dua kali.',
    warna: '#1F6B4F',
  },
  error: {
    judul: 'Halaman belum bisa dimuat',
    desc: 'Terjadi gangguan saat memuat tiket Anda. Coba muat ulang halaman beberapa saat lagi.',
    warna: '#9E3B32',
  },
};

function PageHeader() {
  return (
    <header className="bg-white/95 border-b border-[#C08829]/15">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="w-10 h-10 flex items-center justify-center overflow-hidden shrink-0">
            <Image src="/logo-rs-removebg-preview.png" alt="Logo RSUD Pasirian" width={40} height={40} className="object-contain" />
          </span>
          <span>
            <span className="block font-fraunces font-semibold text-[15px] leading-tight tracking-tight text-[#0B2B24]">RSUD Pasirian</span>
            <span className="block text-[11px] text-[#0B2B24]/60 tracking-[0.04em] font-medium">Lumajang, Jawa Timur</span>
          </span>
        </Link>
        <Link href="/" className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#0B2B24]/60 hover:text-[#0B2B24] transition">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M15 18l-6-6 6-6" /></svg>
          Beranda
        </Link>
      </div>
    </header>
  );
}

function StarIcon({ penuh }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-10 h-10 sm:w-11 sm:h-11 transition"
      fill={penuh ? '#C08829' : 'none'}
      stroke={penuh ? '#C08829' : 'rgba(11,43,36,0.25)'}
      strokeWidth="1.5"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.1 5.9-.8Z" />
    </svg>
  );
}

function KartuStatus({ tipe }) {
  const p = PESAN_STATUS[tipe];
  return (
    <section className="bg-white rounded-[28px] shadow-[0_30px_70px_rgba(11,43,36,0.12)] ring-1 ring-[#C08829]/15 p-6 sm:p-8 text-center">
      <span className="w-14 h-14 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: `${p.warna}14` }}>
        <svg viewBox="0 0 24 24" fill="none" stroke={p.warna} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
          {tipe === 'sudah-dinilai' ? <path d="M5 12.5l4.5 4.5L19 7.5" /> : <path d="M12 8v5M12 16.5v.5M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />}
        </svg>
      </span>
      <h1 className="font-fraunces font-semibold text-2xl tracking-tight mt-4">{p.judul}</h1>
      <p className="text-[13.5px] text-[#0B2B24]/60 mt-1.5 leading-relaxed">{p.desc}</p>
      <Link
        href="/"
        className="inline-flex items-center justify-center bg-[#0B2B24] hover:bg-[#153b31] text-white font-fraunces font-bold px-5 py-3 rounded-full transition mt-7"
      >
        Kembali ke beranda
      </Link>
    </section>
  );
}

export default function RatingPage() {
  const params = useParams();
  // Segmen URL berisi TOKEN acak dari link WhatsApp (bukan nomor tiket, supaya tidak bisa ditebak).
  // Nama folder [nomor] dibiarkan supaya tidak mengubah struktur halaman.
  const token = decodeURIComponent(params.nomor || '');
  const [nomor, setNomor] = useState('');

  const [view, setView] = useState('loading');
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [komentar, setKomentar] = useState('');
  const [coba, setCoba] = useState(false);
  const [mengirim, setMengirim] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    let batal = false;
    fetch(`${API_RATING}?token=${encodeURIComponent(token)}`, { cache: 'no-store' })
      .then(async (res) => {
        if (batal) return;
        if (res.status === 404) return setView('notfound');
        if (!res.ok) return setView('error');
        const json = await res.json();
        setNomor(json.data?.nomor_tiket || '');
        if (json.data?.status !== 'selesai') return setView('belum-selesai');
        if (json.data?.sudah_dinilai) return setView('sudah-dinilai');
        setView('ready');
      })
      .catch(() => {
        if (!batal) setView('error');
      });
    return () => {
      batal = true;
    };
  }, [token]);

  const errRating = rating === 0 ? 'Pilih jumlah bintang dulu.' : '';
  const bintangAktif = hover || rating;

  const kirim = async (e) => {
    e.preventDefault();
    setCoba(true);
    if (errRating || mengirim) return;

    setMengirim(true);
    setServerError('');
    try {
      const res = await fetch(API_RATING, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          token,
          rating,
          komentar: komentar.trim() || null,
        }),
      });
      if (res.status === 409) return setView('sudah-dinilai');
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Penilaian belum terkirim. Silakan coba lagi.');
      setView('success');
    } catch (err) {
      setServerError(err.message || 'Penilaian belum terkirim. Periksa koneksi Anda lalu coba lagi.');
    } finally {
      setMengirim(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F4] text-[#0B2B24]">
      <PageHeader />

      <main className="max-w-xl mx-auto px-5 sm:px-6 py-10 sm:py-14">
        {view === 'loading' && (
          <p className="text-center text-[13.5px] text-[#0B2B24]/55 py-20" role="status">
            Memuat tiket Anda...
          </p>
        )}

        {PESAN_STATUS[view] && <KartuStatus tipe={view} />}

        {view === 'success' && (
          <section
            className="bg-white rounded-[28px] shadow-[0_30px_70px_rgba(11,43,36,0.12)] ring-1 ring-[#C08829]/15 p-6 sm:p-8 text-center animate-[fadeUp_0.25s_ease-out]"
            aria-live="polite"
          >
            <span className="w-14 h-14 mx-auto rounded-full flex items-center justify-center bg-[#1F6B4F]/10">
              <svg viewBox="0 0 24 24" fill="none" stroke="#1F6B4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </span>
            <h1 className="font-fraunces font-semibold text-2xl tracking-tight mt-4">Terima kasih atas penilaian Anda</h1>
            <p className="text-[13.5px] text-[#0B2B24]/60 mt-1.5 leading-relaxed">
              Masukan Anda membantu kami memperbaiki informasi di chatbot dan website RSUD Pasirian.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center bg-[#0B2B24] hover:bg-[#153b31] text-white font-fraunces font-bold px-5 py-3 rounded-full transition mt-7"
            >
              Kembali ke beranda
            </Link>
          </section>
        )}

        {view === 'ready' && (
          <section className="bg-white rounded-[28px] shadow-[0_30px_70px_rgba(11,43,36,0.12)] ring-1 ring-[#C08829]/15 p-6 sm:p-8">
            <span className="inline-flex items-center gap-2 text-[10.5px] font-semibold tracking-[0.16em] uppercase text-[#C08829] bg-[#C08829]/10 rounded-full px-3 py-1.5 w-fit">
              Penilaian Layanan
            </span>
            <h1 className="font-fraunces font-semibold text-2xl sm:text-[1.75rem] tracking-tight mt-3">
              Bagaimana penanganan laporan Anda?
            </h1>
            <p className="text-[13.5px] text-[#0B2B24]/60 mt-1.5 leading-relaxed">
              Tiket <span className="font-semibold text-[#0B2B24] break-all">{nomor}</span> sudah selesai ditindaklanjuti. Beri penilaian agar kami tahu apa yang perlu ditingkatkan.
            </p>

            <form onSubmit={kirim} noValidate className="mt-6 space-y-5">
              <fieldset>
                <legend className="sr-only">Penilaian</legend>
                <div className="flex justify-center gap-1" onMouseLeave={() => setHover(0)}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <label
                      key={n}
                      onMouseEnter={() => setHover(n)}
                      className="cursor-pointer p-1 rounded-xl focus-within:ring-2 focus-within:ring-[#C08829]/40"
                    >
                      <input
                        type="radio"
                        name="rating"
                        value={n}
                        checked={rating === n}
                        onChange={() => setRating(n)}
                        aria-label={`${n} bintang, ${LABEL_RATING[n - 1]}`}
                        className="sr-only"
                      />
                      <StarIcon penuh={n <= bintangAktif} />
                    </label>
                  ))}
                </div>
                <p className="text-center text-[13px] font-semibold mt-2 min-h-5" style={{ color: bintangAktif ? '#C08829' : 'rgba(11,43,36,0.45)' }}>
                  {bintangAktif ? LABEL_RATING[bintangAktif - 1] : 'Ketuk bintang untuk menilai'}
                </p>
                {coba && errRating && (
                  <p className="text-center text-[12px] text-[#9E3B32] mt-1.5">{errRating}</p>
                )}
              </fieldset>

              <div>
                <label htmlFor="komentar" className="text-[12.5px] font-semibold text-[#0B2B24]/70">
                  Komentar <span className="font-normal text-[#0B2B24]/45">(opsional)</span>
                </label>
                <textarea
                  id="komentar"
                  rows={4}
                  value={komentar}
                  onChange={(e) => setKomentar(e.target.value.slice(0, KOMENTAR_MAX))}
                  placeholder="Ceritakan pengalaman Anda atau saran perbaikan."
                  className="mt-1.5 w-full rounded-xl border border-[#0B2B24]/12 px-3.5 py-2.5 text-[13.5px] text-[#0B2B24] outline-none focus:border-[#C08829] focus:ring-2 focus:ring-[#C08829]/15 transition bg-white resize-y leading-relaxed"
                />
                <p className="text-[11.5px] text-[#0B2B24]/45 mt-1.5 text-right tabular-nums">
                  {komentar.length}/{KOMENTAR_MAX}
                </p>
              </div>

              {serverError && (
                <p role="alert" className="text-[13px] text-[#9E3B32] bg-[#9E3B32]/8 rounded-xl px-4 py-3 leading-relaxed">
                  {serverError}
                </p>
              )}

              <button
                type="submit"
                disabled={mengirim}
                className="w-full flex items-center justify-center gap-2 bg-linear-to-b from-[#DDB169] to-[#C08829] hover:from-[#e6bd7c] hover:to-[#ca9235] disabled:opacity-60 disabled:cursor-not-allowed text-[#0B2B24] font-fraunces font-bold py-3.5 rounded-full transition shadow-[0_8px_20px_rgba(192,136,41,0.35)]"
              >
                {mengirim ? 'Mengirim...' : 'Kirim penilaian'}
              </button>
              <p className="text-[11.5px] text-[#0B2B24]/45 text-center leading-relaxed">
                Penilaian hanya bisa diisi satu kali untuk setiap tiket.
              </p>
            </form>
          </section>
        )}
      </main>

      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[fadeUp_0\\.25s_ease-out\\] { animation: none; }
        }
      `}</style>
    </div>
  );
}