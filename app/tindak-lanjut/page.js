'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

// TODO: ganti kalau endpoint dari Tasya (B05) sudah beda
const API_TIKET = '/api/tiket';

const DESKRIPSI_MIN = 20;
const DESKRIPSI_MAX = 1000;

const KATEGORI = [
  'Jadwal dokter',
  'BPJS / JKN',
  'Pendaftaran',
  'Rawat inap',
  'Farmasi',
  'Biaya & administrasi',
  'Lainnya',
];

const JENIS_LAPORAN = [
  {
    value: 'permintaan',
    label: 'Permintaan Informasi',
    aksi: 'Ajukan Permintaan',
    desc: 'Informasi yang Anda cari belum ditemukan lewat chatbot atau website.',
    color: '#2A6C93',
    placeholder: 'Contoh: Saya ingin tahu jadwal dan syarat pemeriksaan MCU untuk karyawan.',
  },
  {
    value: 'pengaduan',
    label: 'Pengaduan Informasi',
    aksi: 'Ajukan Pengaduan',
    desc: 'Informasi di chatbot atau website tidak lengkap, keliru, atau tidak sesuai.',
    color: '#9E3B32',
    placeholder: 'Contoh: Jadwal dokter anak di website berbeda dengan yang dijawab chatbot.',
  },
];

function bersihkanWa(v) {
  return v.replace(/[^0-9+]/g, '').replace(/(?!^)\+/g, '').slice(0, 15);
}

function normalisasiWa(v) {
  const digit = v.replace(/\D/g, '');
  return digit.startsWith('0') ? `62${digit.slice(1)}` : digit;
}

function waValid(v) {
  return /^(08\d{8,11}|628\d{8,11})$/.test(v.replace(/\D/g, ''));
}

function FieldError({ id, children }) {
  if (!children) return null;
  return (
    <p id={id} className="text-[12px] text-[#9E3B32] mt-1.5 leading-relaxed">
      {children}
    </p>
  );
}

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

export default function TindakLanjutPage() {
  const [jenis, setJenis] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [noWa, setNoWa] = useState('');
  const [nama, setNama] = useState('');
  const [kategori, setKategori] = useState('');
  const [setuju, setSetuju] = useState(false);
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState('idle');
  const [serverError, setServerError] = useState('');
  const [tiket, setTiket] = useState(null);
  const [tersalin, setTersalin] = useState(false);

  const jenisAktif = JENIS_LAPORAN.find((j) => j.value === jenis);

  const deskripsiTrim = deskripsi.trim();
  const errJenis = !jenis ? 'Pilih dulu jenis laporan Anda.' : '';
  const errDeskripsi =
    deskripsiTrim.length < DESKRIPSI_MIN
      ? `Jelaskan minimal ${DESKRIPSI_MIN} karakter agar kami paham maksud Anda (saat ini ${deskripsiTrim.length}).`
      : '';
  const errWa = !waValid(noWa)
    ? 'Gunakan nomor WhatsApp Indonesia, contoh 0857xxxxxxx atau 62857xxxxxxx.'
    : '';
  const errKategori = !kategori ? 'Pilih topik yang paling sesuai.' : '';
  const errSetuju = !setuju ? 'Centang persetujuan agar kami boleh menghubungi Anda lewat WhatsApp.' : '';

  const tandai = (field) => () => setTouched((t) => ({ ...t, [field]: true }));

  const kirim = async (e) => {
    e.preventDefault();
    setTouched({ jenis: true, kategori: true, deskripsi: true, noWa: true, setuju: true });
    if (errJenis || errKategori || errDeskripsi || errWa || errSetuju || status === 'loading') return;

    setStatus('loading');
    setServerError('');
    try {
      const res = await fetch(API_TIKET, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          jenis,
          kategori,
          deskripsi: deskripsiTrim,
          nama: nama.trim() || null,
          no_wa: normalisasiWa(noWa),
          persetujuan_wa: setuju,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Laporan belum terkirim. Silakan coba lagi.');
      setTiket({ nomor: json.data?.nomor_tiket, jenis });
      setStatus('success');
    } catch (err) {
      setServerError(err.message || 'Laporan belum terkirim. Periksa koneksi Anda lalu coba lagi.');
      setStatus('idle');
    }
  };

  const salinNomor = async () => {
    try {
      await navigator.clipboard.writeText(tiket.nomor);
      setTersalin(true);
      setTimeout(() => setTersalin(false), 2000);
    } catch {
      setTersalin(false);
    }
  };

  const buatLagi = () => {
    setJenis('');
    setDeskripsi('');
    setNoWa('');
    setNama('');
    setKategori('');
    setSetuju(false);
    setTouched({});
    setTiket(null);
    setServerError('');
    setStatus('idle');
  };

  const inputBase =
    'mt-1.5 w-full rounded-xl border px-3.5 py-2.5 text-[13.5px] text-[#0B2B24] outline-none focus:ring-2 transition bg-white';
  const inputOk = 'border-[#0B2B24]/12 focus:border-[#C08829] focus:ring-[#C08829]/15';
  const inputErr = 'border-[#9E3B32] focus:border-[#9E3B32] focus:ring-[#9E3B32]/15';

  return (
    <div className="min-h-screen bg-[#FBF9F4] text-[#0B2B24]">
      <PageHeader />

      <main className="max-w-xl mx-auto px-5 sm:px-6 py-10 sm:py-14">
        {status === 'success' && tiket ? (
          <section
            className="bg-white rounded-[28px] shadow-[0_30px_70px_rgba(11,43,36,0.12)] ring-1 ring-[#C08829]/15 p-6 sm:p-8 text-center animate-[fadeUp_0.25s_ease-out]"
            aria-live="polite"
          >
            <span className="w-14 h-14 mx-auto rounded-full flex items-center justify-center bg-[#1F6B4F]/10">
              <svg viewBox="0 0 24 24" fill="none" stroke="#1F6B4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </span>
            <h1 className="font-fraunces font-semibold text-2xl tracking-tight mt-4">
              {tiket.jenis === 'pengaduan' ? 'Pengaduan' : 'Permintaan'} Anda sudah kami terima
            </h1>
            <p className="text-[13.5px] text-[#0B2B24]/60 mt-1.5 leading-relaxed">
              Simpan nomor tiket di bawah ini. Nomor ini dipakai untuk melacak laporan Anda.
            </p>

            <div className="mt-6 rounded-2xl bg-[#0B2B24] px-5 py-5">
              <p className="text-[12px] text-[#F2E4C4]/70">Nomor tiket</p>
              <p className="font-fraunces font-bold text-2xl sm:text-3xl text-[#DDB169] mt-1 tracking-wide break-all">{tiket.nomor}</p>
              <button
                type="button"
                onClick={salinNomor}
                className="mt-4 inline-flex items-center gap-2 text-[12.5px] font-semibold text-white border border-white/25 hover:bg-white/10 rounded-full px-4 py-2 transition"
              >
                {tersalin ? 'Nomor tersalin' : 'Salin nomor tiket'}
              </button>
            </div>

            <p className="text-[13px] text-[#0B2B24]/65 mt-5 leading-relaxed">
              Kami akan mengabari lewat WhatsApp ke <span className="font-semibold text-[#0B2B24]">{noWa}</span> saat laporan selesai ditindaklanjuti.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={buatLagi}
                className="inline-flex items-center justify-center border border-[#0B2B24]/15 hover:border-[#C08829]/50 hover:bg-[#C08829]/5 text-[#0B2B24] font-fraunces font-bold px-5 py-3 rounded-full transition"
              >
                Ajukan lagi
              </button>
              <Link
                href="/"
                className="inline-flex items-center justify-center bg-[#0B2B24] hover:bg-[#153b31] text-white font-fraunces font-bold px-5 py-3 rounded-full transition"
              >
                Kembali ke beranda
              </Link>
            </div>
          </section>
        ) : (
          <section className="bg-white rounded-[28px] shadow-[0_30px_70px_rgba(11,43,36,0.12)] ring-1 ring-[#C08829]/15 p-6 sm:p-8">
            <span className="inline-flex items-center gap-2 text-[10.5px] font-semibold tracking-[0.16em] uppercase text-[#C08829] bg-[#C08829]/10 rounded-full px-3 py-1.5 w-fit">
              Tindak Lanjut Informasi
            </span>
            <h1 className="font-fraunces font-semibold text-2xl sm:text-[1.75rem] tracking-tight mt-3">
              Sampaikan kebutuhan informasi Anda
            </h1>
            <p className="text-[13.5px] text-[#0B2B24]/60 mt-1.5 leading-relaxed">
              Tidak menemukan jawaban, atau menemukan informasi yang keliru? Tulis di sini, tim kami akan memeriksa dan mengabari Anda.
            </p>

            <form onSubmit={kirim} noValidate className="mt-6 space-y-5">
              <fieldset>
                <legend className="text-[12.5px] font-semibold text-[#0B2B24]/70">Jenis laporan</legend>
                <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {JENIS_LAPORAN.map((j) => {
                    const aktif = jenis === j.value;
                    return (
                      <label
                        key={j.value}
                        className={`relative flex flex-col rounded-2xl border p-4 cursor-pointer transition focus-within:ring-2 focus-within:ring-[#C08829]/30 ${
                          aktif ? 'bg-white' : 'border-[#0B2B24]/10 hover:border-[#0B2B24]/25'
                        }`}
                        style={aktif ? { borderColor: j.color, backgroundColor: `${j.color}0D` } : undefined}
                      >
                        <input
                          type="radio"
                          name="jenis"
                          value={j.value}
                          checked={aktif}
                          onChange={() => {
                            setJenis(j.value);
                            setTouched((t) => ({ ...t, jenis: true }));
                          }}
                          className="sr-only"
                        />
                        <span className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                            style={{ borderColor: aktif ? j.color : 'rgba(11,43,36,0.25)' }}
                            aria-hidden="true"
                          >
                            {aktif && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: j.color }} />}
                          </span>
                          <span className="font-fraunces font-semibold text-[14.5px] text-[#0B2B24]">{j.label}</span>
                        </span>
                        <span className="text-[12.5px] text-[#0B2B24]/60 mt-1.5 leading-relaxed">{j.desc}</span>
                      </label>
                    );
                  })}
                </div>
                {touched.jenis && <FieldError id="err-jenis">{errJenis}</FieldError>}
              </fieldset>

              <div>
                <label htmlFor="kategori" className="text-[12.5px] font-semibold text-[#0B2B24]/70">
                  Topik
                </label>
                <select
                  id="kategori"
                  value={kategori}
                  onChange={(e) => {
                    setKategori(e.target.value);
                    setTouched((t) => ({ ...t, kategori: true }));
                  }}
                  aria-invalid={touched.kategori && !!errKategori}
                  aria-describedby={touched.kategori && errKategori ? 'err-kategori' : undefined}
                  className={`${inputBase} ${touched.kategori && errKategori ? inputErr : inputOk}`}
                >
                  <option value="" disabled>Pilih topik</option>
                  {KATEGORI.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
                {touched.kategori && <FieldError id="err-kategori">{errKategori}</FieldError>}
              </div>

              <div>
                <label htmlFor="deskripsi" className="text-[12.5px] font-semibold text-[#0B2B24]/70">
                  Deskripsi
                </label>
                <textarea
                  id="deskripsi"
                  rows={5}
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value.slice(0, DESKRIPSI_MAX))}
                  onBlur={tandai('deskripsi')}
                  placeholder={jenisAktif?.placeholder || 'Ceritakan informasi yang Anda butuhkan atau yang perlu diperbaiki.'}
                  aria-invalid={touched.deskripsi && !!errDeskripsi}
                  aria-describedby={touched.deskripsi && errDeskripsi ? 'err-deskripsi' : undefined}
                  className={`${inputBase} resize-y leading-relaxed ${touched.deskripsi && errDeskripsi ? inputErr : inputOk}`}
                />
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">{touched.deskripsi && <FieldError id="err-deskripsi">{errDeskripsi}</FieldError>}</div>
                  <p className="text-[11.5px] text-[#0B2B24]/45 mt-1.5 tabular-nums shrink-0">
                    {deskripsi.length}/{DESKRIPSI_MAX}
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="nama" className="text-[12.5px] font-semibold text-[#0B2B24]/70">
                  Nama <span className="font-normal text-[#0B2B24]/45">(opsional)</span>
                </label>
                <input
                  id="nama"
                  type="text"
                  autoComplete="name"
                  placeholder="Contoh: Tutuk Yekti"
                  value={nama}
                  onChange={(e) => setNama(e.target.value.replace(/[^A-Za-zÀ-ÿ\s.,'-]/g, '').slice(0, 60))}
                  className={`${inputBase} ${inputOk}`}
                />
              </div>

              <div>
                <label htmlFor="no-wa" className="text-[12.5px] font-semibold text-[#0B2B24]/70">
                  Nomor WhatsApp
                </label>
                <input
                  id="no-wa"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="Contoh: 0857xxxxxxx"
                  value={noWa}
                  onChange={(e) => setNoWa(bersihkanWa(e.target.value))}
                  onBlur={tandai('noWa')}
                  aria-invalid={touched.noWa && !!errWa}
                  aria-describedby={touched.noWa && errWa ? 'err-wa' : 'hint-wa'}
                  className={`${inputBase} ${touched.noWa && errWa ? inputErr : inputOk}`}
                />
                {touched.noWa && errWa ? (
                  <FieldError id="err-wa">{errWa}</FieldError>
                ) : (
                  <p id="hint-wa" className="text-[12px] text-[#0B2B24]/50 mt-1.5 leading-relaxed">
                    Kami mengirim kabar ke nomor ini saat laporan selesai ditindaklanjuti.
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={setuju}
                    onChange={(e) => {
                      setSetuju(e.target.checked);
                      setTouched((t) => ({ ...t, setuju: true }));
                    }}
                    aria-invalid={touched.setuju && !!errSetuju}
                    aria-describedby={touched.setuju && errSetuju ? 'err-setuju' : undefined}
                    className="mt-0.5 w-4 h-4 shrink-0 accent-[#C08829]"
                  />
                  <span className="text-[12.5px] text-[#0B2B24]/70 leading-relaxed">
                    Saya setuju nomor WhatsApp ini digunakan RSUD Pasirian untuk memberi kabar tindak lanjut.
                  </span>
                </label>
                {touched.setuju && <FieldError id="err-setuju">{errSetuju}</FieldError>}
              </div>

              {serverError && (
                <p role="alert" className="text-[13px] text-[#9E3B32] bg-[#9E3B32]/8 rounded-xl px-4 py-3 leading-relaxed">
                  {serverError}
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full flex items-center justify-center gap-2 bg-linear-to-b from-[#DDB169] to-[#C08829] hover:from-[#e6bd7c] hover:to-[#ca9235] disabled:opacity-60 disabled:cursor-not-allowed text-[#0B2B24] font-fraunces font-bold py-3.5 rounded-full transition shadow-[0_8px_20px_rgba(192,136,41,0.35)]"
              >
                {status === 'loading' ? 'Mengirim...' : jenisAktif?.aksi || 'Kirim'}
              </button>
              <p className="text-[11.5px] text-[#0B2B24]/45 text-center leading-relaxed">
                Jangan menulis NIK, nomor rekam medis, atau data medis pribadi di kolom deskripsi.
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