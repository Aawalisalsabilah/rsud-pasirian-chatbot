'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Fraunces, Inter } from 'next/font/google';

const fraunces = Fraunces({ subsets: ['latin'], weight: ['600', '700'], style: ['normal', 'italic'], variable: '--font-fraunces' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-inter' });

// Layanan diambil langsung dari papan petunjuk asli di gerbang RSUD Pasirian.
const layanan = [
  { label: 'IGD 24 Jam', desc: 'Respon cepat untuk kondisi darurat, siaga sepanjang hari.', icon: 'M12 2v20M2 12h20', color: '#A3231F' },
  { label: 'Persalinan 24 Jam', desc: 'Layanan ibu & bayi dengan ruang perinatologi.', icon: 'M12 21c-4-3-7-6.5-7-10a7 7 0 0 1 14 0c0 3.5-3 7-7 10Z', color: '#F2A93B' },
  { label: 'Laboratorium 24 Jam', desc: 'Pemeriksaan penunjang cepat dan akurat.', icon: 'M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3', color: '#1477B0' },
  { label: 'Radiologi 24 Jam', desc: 'Pencitraan medis untuk diagnosis yang tepat.', icon: 'M12 2a10 10 0 1 0 10 10M12 6a6 6 0 1 0 6 6M12 12l6-6', color: '#279C4B' },
  { label: 'Farmasi 24 Jam', desc: 'Termasuk Sehat Ekspres — obat diantar ke rumah.', icon: 'M10.5 20.5 3.5 13.5a5 5 0 0 1 7-7l7 7a5 5 0 0 1-7 7ZM8 8l8 8', color: '#1477B0' },
  { label: 'Klinik Spesialis', desc: 'Penyakit Dalam, Anak, Kandungan, Bedah, dan lainnya.', icon: 'M4.5 9.5v3a7.5 7.5 0 0 0 15 0v-3M8 4v3M16 4v3M12 20v-2.5', color: '#279C4B' },
];

function ServiceIcon({ d, color }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
      <path d={d} />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className={`${fraunces.variable} ${inter.variable} font-[var(--font-inter)] min-h-screen bg-white text-[#0F2A24]`}>
      {/* Top utility bar */}
      <div className="bg-gradient-to-r from-[#1477B0] to-[#279C4B] text-white text-[12.5px]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L7.9 9.9a16 16 0 0 0 6 6l1.4-1.4a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2Z" /></svg>
              (0334) 5761114
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M4 4h16v16H4z" opacity="0" /><path d="m3 6 9 6 9-6M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" /></svg>
              rsud.pasirian@gmail.com
            </span>
          </div>
          <span className="hidden md:inline text-white/85">RSUD Kelas C &middot; Milik Pemkab Lumajang</span>
        </div>
      </div>

      {/* GLOBAL NAVBAR: Fixed nempel atas, bg-white solid 100%, dan z-50 agar menutup teks hero saat di-scroll */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200/80 shadow-md">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center overflow-hidden shrink-0">
              <Image 
                src="/logo-rs-removebg-preview.png" 
                alt="Logo RSUD Pasirian" 
                width={40} 
                height={40} 
                className="object-contain" 
              />
            </div>
            <div>
              <h1 className="font-[var(--font-fraunces)] font-semibold text-[15px] leading-tight tracking-tight text-slate-900">RSUD Pasirian</h1>
              <p className="text-[11px] text-[#0F2A24]/70 tracking-wide font-medium">Lumajang, Jawa Timur</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-[13.5px] font-semibold text-slate-800">
            <a href="#" className="hover:text-[#1477B0] transition">Tentang</a>
            <a href="#layanan" className="hover:text-[#1477B0] transition">Layanan</a>
            <a href="#" className="hover:text-[#1477B0] transition">Jadwal Dokter</a>
            <a href="#" className="hover:text-[#1477B0] transition">Kontak</a>
          </nav>

          <a
            href="https://play.google.com/store"
            target="_blank"
            className="bg-[#F2A93B] hover:bg-[#e0972a] text-[#0F2A24] px-4 sm:px-5 py-2.5 rounded-full text-[13px] font-[var(--font-fraunces)] font-bold transition shadow-[0_6px_16px_rgba(242,169,59,0.35)] whitespace-nowrap"
          >
            Daftar Online
          </a>
        </div>
      </header>

      {/* HERO SECTION: Menggunakan pt-[76px] agar pas posisinya di bawah navbar yang melayang */}
      <section className="relative h-[540px] sm:h-[580px] md:h-[620px] w-full overflow-hidden pt-[76px]">
        <Image
          src="/rsud-gedung.jpg"
          alt="Gedung RSUD Pasirian Lumajang"
          fill
          priority
          quality={65}
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#031817]/85 via-[#04382f]/60 to-[#04382f]/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 h-full flex flex-col justify-center">
          <div className="max-w-xl">
            <p className="text-white/85 text-[14px] sm:text-[15px] font-medium tracking-wide mb-3">
              Selamat datang di RSUD Pasirian Lumajang
            </p>
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] uppercase text-white bg-white/15 border border-white/25 rounded-full px-3.5 py-1.5 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F2A93B] animate-pulse" />
              Siaga 24 Jam &middot; Pasirian, Lumajang
            </span>

            <h2 className="font-[var(--font-fraunces)] font-bold text-4xl sm:text-5xl lg:text-[3.3rem] leading-[1.1] tracking-tight mt-5 text-white">
              Merawat Pasirian,
              <br />
              <span className="italic text-[#7fe9d0]">siap sedia setiap saat.</span>
            </h2>

            <p className="text-[15.5px] sm:text-base text-white/85 leading-relaxed mt-5">
              Sejak 2016, RSUD Pasirian tumbuh menjadi rumah sakit rujukan warga Pasirian dan sekitarnya. 
              IGD, laboratorium, dan farmasi buka 24 jam penuh, ditangani tenaga medis berpengalaman.
              Ada juga <span className="font-semibold text-[#F2A93B]">Sehat Ekspres</span>, layanan antar obat langsung ke rumah Anda.
            </p>

            <div className="flex flex-wrap gap-3.5 pt-7">
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 bg-[#F2A93B] hover:bg-[#e0972a] text-[#0F2A24] font-[var(--font-fraunces)] font-bold px-6 py-3.5 rounded-full shadow-[0_10px_26px_rgba(242,169,59,0.35)] transition"
              >
                Chat dengan Kami
              </Link>
              <a
                href="#layanan"
                className="inline-flex items-center gap-2 border border-white/40 hover:bg-white/10 text-white font-medium px-6 py-3.5 rounded-full transition"
              >
                Lihat Layanan
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Layanan */}
      <section id="layanan" className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-20">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#279C4B]">Layanan Kami</span>
          <h3 className="font-[var(--font-fraunces)] font-semibold text-3xl sm:text-[2.25rem] tracking-tight mt-2 text-[#0F2A24]">
            Fasilitas lengkap, siap melayani Anda
          </h3>
          <p className="text-[#0F2A24]/60 text-[15px] mt-3">
            Layanan ini mencerminkan papan petunjuk yang ada langsung di gerbang RSUD Pasirian.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {layanan.map((item) => (
            <div
              key={item.label}
              className="group bg-white border border-black/[0.06] rounded-2xl p-6 hover:shadow-[0_12px_30px_rgba(15,42,36,0.08)] hover:-translate-y-0.5 transition"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: `${item.color}14` }}
              >
                <ServiceIcon d={item.icon} color={item.color} />
              </div>
              <h4 className="font-[var(--font-fraunces)] font-semibold text-[16px] text-[#0F2A24]">{item.label}</h4>
              <p className="text-[13.5px] text-[#0F2A24]/60 mt-1.5 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Profil video + kontak */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 pb-16 sm:pb-20 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <a
          href="https://youtu.be/ruxXLi-nwAI?si=IPz4N2DIJizgnCux"
          target="_blank"
          rel="noopener noreferrer"
          className="relative block w-full aspect-video rounded-2xl overflow-hidden group border border-black/[0.06] bg-cover bg-center shadow-[0_16px_40px_rgba(15,42,36,0.1)]"
          style={{ backgroundImage: `url('https://img.youtube.com/vi/ruxXLi-nwAI/maxresdefault.jpg')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30 group-hover:via-black/20 transition-all duration-300" />
          <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start">
            <span className="bg-white/90 backdrop-blur-md text-[#A3231F] text-[10px] font-[var(--font-fraunces)] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg">
              Profil RS
            </span>
          </div>
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="w-16 h-16 bg-white/95 text-[#0F2A24] rounded-full flex items-center justify-center text-xl shadow-xl group-hover:scale-110 group-hover:bg-white transition-all duration-300 transform">
              ▶
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <p className="font-[var(--font-fraunces)] text-sm font-semibold tracking-wide text-white">Profil RSUD Pasirian Lumajang</p>
            <div className="flex items-center justify-between text-[11px] text-white/75 mt-1">
              <span>Durasi: 3+ menit</span>
              <span className="group-hover:underline flex items-center gap-1">Tonton di YouTube <span className="text-[#F2A93B]">↗</span></span>
            </div>
          </div>
        </a>

        <div className="flex flex-col justify-center gap-4">
          <div className="flex items-start gap-3 bg-[#F6F8F7] rounded-2xl px-5 py-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="#1477B0" strokeWidth="1.8" className="w-5 h-5 shrink-0 mt-0.5">
              <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            <div>
              <p className="text-[13px] font-semibold text-[#0F2A24]">Alamat</p>
              <p className="text-[13.5px] text-[#0F2A24]/65 mt-0.5">Jl. Raya Pasirian No. 225A, Kebonan, Pasirian, Lumajang 67372</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-[#F6F8F7] rounded-2xl px-5 py-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="#279C4B" strokeWidth="1.8" className="w-5 h-5 shrink-0 mt-0.5">
              <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L7.9 9.9a16 16 0 0 0 6 6l1.4-1.4a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2Z" />
            </svg>
            <div>
              <p className="text-[13px] font-semibold text-[#0F2A24]">Telepon</p>
              <p className="text-[13.5px] text-[#0F2A24]/65 mt-0.5">(0334) 5761114</p>
            </div>
          </div>
        </div>
      </section>

      {/* Floating chat button */}
      <Link
        href="/chat"
        className="fixed bottom-6 right-6 z-50 group"
        title="Tanya Asisten Virtual"
      >
        <span className="absolute inset-0 rounded-full bg-[#279C4B]/40 animate-ping" />
        <span className="relative flex w-14 h-14 rounded-full items-center justify-center text-white shadow-[0_10px_26px_rgba(20,119,176,0.35)] transition group-hover:scale-110 bg-gradient-to-br from-[#1477B0] to-[#279C4B]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
            <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
          </svg>
        </span>
      </Link>

      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}