'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
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

// Fakta singkat yang menunjukkan kredibilitas rumah sakit di hero.
const faktaCepat = [
  { angka: '10+', label: 'Tahun melayani Pasirian' },
  { angka: '24', label: 'Jam siaga, setiap hari' },
  { angka: '6', label: 'Layanan utama tersedia' },
];

// Data klinik & dokter spesialis, diambil dari materi Layanan Spesialistik RSUD Pasirian.
const klinikSpesialis = [
  { klinik: 'Klinik Anak', dokter: ['dr. Nurul Yudhi, Sp.A', 'dr. Wigit K, Sp.A'] },
  { klinik: 'Klinik Bedah', dokter: ['dr. Arry Setyo D, Sp.B', 'dr. Hendra S, Sp.B'] },
  { klinik: 'Klinik Obgyn', dokter: ['dr. Elvi W, Sp.OG', 'dr. Ryan I, Sp.OG'] },
  { klinik: 'Klinik Penyakit Dalam', dokter: ['dr. Endra G, Sp.PD', 'dr. Wiryawan P, Sp.PD'] },
  { klinik: 'Klinik Gigi Umum & Prostodonti', dokter: ['drg. Agung H, Sp.Pros', 'drg. Reza H, S.KG'] },
  { klinik: 'Klinik Paru', dokter: ['dr. T.S Budi Satrio, Sp.P'] },
  { klinik: 'Klinik Orthopedi', dokter: ['dr. Rosihan E, Sp.OT'] },
  { klinik: 'Pelayanan Anestesi', dokter: ['dr. Doni T, Sp.An', 'dr. Ardhani, Sp.An'] },
  { klinik: 'Pelayanan Radiologi', dokter: ['dr. Trilia, Sp.Rad'] },
  { klinik: 'Pelayanan Laboratorium', dokter: ['dr. Dwita Riadini, Sp.PK'] },
];

// Inisial dipakai sebagai avatar placeholder karena foto dokter belum tersedia sebagai aset web.
function inisial(nama) {
  const bersih = nama.replace(/^(dr\.|drg\.)\s*/i, '');
  const parts = bersih.split(' ').filter(Boolean);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
}

// Kategori layanan lengkap, dari slide "Layanan RSUD Pasirian".
const kategoriLayanan = [
  {
    nama: 'Rawat Jalan',
    color: '#7C4DBE',
    items: ['Poliklinik', 'Bedah', 'Penyakit Dalam', 'Anak', 'Obstetri & Ginekologi', 'Paru', 'Gigi & Prostodonti', 'Orthopedi & Traumatologi', 'Fisioterapi', 'Gizi'],
  },
  {
    nama: 'Rawat Inap',
    color: '#F2A93B',
    items: ['Kelas I', 'Kelas II', 'Kelas III', 'Isolasi', 'Perawatan Obgyn', 'Neonatologi'],
  },
  {
    nama: 'Kegawatan & Tindakan',
    color: '#A3231F',
    items: ['IGD', 'PONEK', 'Kamar Operasi (OK)', 'R. Bersalin (VK)'],
  },
  {
    nama: 'Penunjang',
    color: '#1477B0',
    items: ['Farmasi', 'Gizi', 'Radiologi', 'Laboratorium', 'Pemulasaran Jenazah', 'Ambulance', 'IPSRS'],
  },
];

// Ruang rawat inap beserta kapasitas tempat tidur (TT), dari slide "Ruang Rawat Inap".
const ruangRawatInap = [
  { nama: 'Mutiara', kelas: 'VIP', ruang: 9, tt: 9, color: '#A3231F' },
  { nama: 'Berlian', kelas: 'Kelas I', ruang: 6, tt: 12, color: '#1477B0' },
  { nama: 'Zamrud', kelas: 'Kelas II', ruang: 6, tt: 18, color: '#279C4B' },
  { nama: 'Shapire', kelas: 'Kelas III', ruang: 6, tt: 24, color: '#F2A93B' },
  { nama: 'ICU', kelas: 'Intensif', ruang: 2, tt: 7, color: '#A3231F' },
  { nama: 'PICU', kelas: 'Intensif', ruang: 1, tt: 1, color: '#A3231F' },
  { nama: 'NICU', kelas: 'Intensif', ruang: 1, tt: 3, color: '#A3231F' },
  { nama: 'Neonatologi', kelas: 'Kelas III', ruang: 1, tt: 16, color: '#F2A93B' },
  { nama: 'Permata', kelas: 'Kelas III', ruang: 5, tt: 10, color: '#F2A93B' },
];

// Kapasitas tempat tidur (TT), dari slide ringkasan "Layanan Rawat Inap" & "Layanan IGD 24 Jam".
const kapasitasRawatInap = [
  { ruang: 'Intensif', tt: 10 },
  { ruang: 'VIP', tt: 9 },
  { ruang: 'Kelas I', tt: 10 },
  { ruang: 'Kelas II', tt: 14 },
  { ruang: 'Kelas III', tt: 46 },
  { ruang: 'Isolasi', tt: 11 },
];
const kapasitasIgd = [
  { ruang: 'Triase', tt: 7 },
  { ruang: 'Isolasi', tt: 2 },
  { ruang: 'Ponek', tt: 2 },
  { ruang: 'Transit', tt: 2 },
];

function BedIcon({ color }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M2 18v-6a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v2M2 18v3M2 18h20v3M13 12h7a2 2 0 0 1 2 2v4M6 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
    </svg>
  );
}

function ServiceIcon({ d, color }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
      <path d={d} />
    </svg>
  );
}

// Nomor WhatsApp untuk pendaftaran pasien umum.
const WA_NOMOR_UMUM = '6285230703508';
// Link resmi aplikasi Mobile JKN untuk pendaftaran pasien BPJS.
const MOBILE_JKN_LINK = 'https://play.google.com/store/apps/details?id=app.bpjs.mobile';

const NAMA_BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

// Ubah "2026-07-03" (format input date HTML) menjadi "3 Juli 2026".
function formatTanggalIndo(isoDate) {
  if (!isoDate) return '';
  const [tahun, bulan, tanggal] = isoDate.split('-');
  const namaBulan = NAMA_BULAN[parseInt(bulan, 10) - 1] || '';
  return `${parseInt(tanggal, 10)} ${namaBulan} ${tahun}`;
}

const FORM_KOSONG = {
  tanggalKontrol: '',
  nomorRM: '',
  nik: '',
  namaLengkap: '',
  tempatLahir: '',
  tanggalLahir: '',
  alamat: '',
  telp: '',
  namaIbu: '',
  poliTujuan: '',
};

// Susun form menjadi format pesan resmi pendaftaran, biar pasien tidak perlu isi 2 kali.
function susunPesanPendaftaran(f) {
  const baris = [
    `Format pengisian pendaftaran pasien : ${f.namaLengkap}`,
    `Tanggal kontrol/periksa : ${formatTanggalIndo(f.tanggalKontrol)}`,
    `Nomor RM  : ${f.nomorRM || '-'}`,
    `NIK KTP : ${f.nik}`,
    `Nama lengkap : ${f.namaLengkap}`,
    `Tempat & tanggal Lahir : ${f.tempatLahir}, ${formatTanggalIndo(f.tanggalLahir)}`,
    `Alamat KTP Lengkap : ${f.alamat}`,
    `No. Telp Aktif : ${f.telp}`,
    `Nama ibu kandung : ${f.namaIbu}`,
    `Poli Tujuan : ${f.poliTujuan}`,
    `Jenis Pembayaran : UMUM`,
    ``,
    `Harap membawa identitas asli saat ke Rumah Sakit.`,
  ];
  return baris.join('\n');
}

function LabeledInput({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-[12.5px] font-semibold text-[#0F2A24]/75">{label}</span>
      <input
        {...props}
        className="mt-1.5 w-full rounded-xl border border-black/[0.1] px-3.5 py-2.5 text-[13.5px] text-[#0F2A24] outline-none focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/15 transition"
      />
    </label>
  );
}

function LabeledSelect({ label, options, ...props }) {
  return (
    <label className="block">
      <span className="text-[12.5px] font-semibold text-[#0F2A24]/75">{label}</span>
      <select
        {...props}
        className="mt-1.5 w-full rounded-xl border border-black/[0.1] px-3.5 py-2.5 text-[13.5px] text-[#0F2A24] outline-none focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/15 transition bg-white"
      >
        <option value="" disabled>Pilih poli tujuan</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

// Daftar poliklinik RSUD Pasirian (nama, dokter, jadwal) — dipakai untuk dropdown Poli Tujuan di form pendaftaran.
const daftarPoli = [
  { nama: 'Poli Spesialis Bedah', dokter: [{ nama: 'dr. Hendra Setiawan, Sp.B', hari: 'Senin-Jumat', jam: '10.00-13.00' }, { nama: 'dr. Prima Budi Prayogi, Sp.B', hari: 'Jumat', jam: '12.00-15.00' }] },
  { nama: 'Poli Spesialis Ortopedi & Traumatologi', dokter: [{ nama: 'dr. Rosihan Effendi, Sp.OT', hari: 'Senin-Jumat', jam: '09.00-12.00' }] },
  { nama: 'Poli Spesialis Paru', dokter: [{ nama: 'dr. Trisasongko Budisatrio, Sp.P', hari: 'Senin-Jumat', jam: '08.30-12.00' }] },
  { nama: 'Poli Spesialis Penyakit Dalam', dokter: [{ nama: 'dr. Wiryawan Pradipto, Sp.Pd', hari: 'Senin-Jumat', jam: '08.00-12.00' }] },
  { nama: 'Poli Spesialis Kandungan', dokter: [{ nama: 'dr. Elvi Widiastuti, Sp.OG', hari: 'Senin, Rabu, Jumat', jam: '09.00-12.00' }, { nama: 'dr. Ryan Ishak, Sp.OG', hari: 'Selasa & Kamis', jam: '10.00-13.00' }] },
  { nama: 'Poli Spesialis Gigi Tiruan', dokter: [{ nama: 'dr. Agung Hardianto, Sp.Pros', hari: 'Senin-Jumat', jam: '08.00-13.00' }] },
  { nama: 'Poli Gigi Umum', dokter: [{ nama: 'dr. Reza Hesti Augustine', hari: 'Senin-Jumat', jam: '08.00-13.00' }] },
  { nama: 'Poli Spesialis Anak', dokter: [{ nama: 'dr. Nurul Yudhi Prihastuy, Sp.A', hari: 'Senin-Jumat', jam: '08.00-09.00' }] },
  { nama: 'Dokter VCT', dokter: [{ nama: 'dr. Niken Dumilah', hari: 'Senin-Jumat', jam: 'Sesuai Jam Kerja' }] },
  { nama: 'Radiologi', dokter: [{ nama: 'dr. Trilia Kurniati, Sp.Rad', hari: 'Senin-Jumat', jam: 'Sesuai Jam Kerja' }] },
  { nama: 'Laboratorium', dokter: [{ nama: 'dr. Dwita Riadini, Sp.PK', hari: 'Senin-Jumat', jam: 'Sesuai Jam Kerja' }] },
  { nama: 'Dokter Spesialis Anestesi', dokter: [{ nama: 'dr. Donny Tilon, Sp.An', hari: 'Senin-Jumat', jam: 'Sesuai Jam Kerja' }] },
  { nama: 'Dokter Spesialis Anestesiologi & Terapi Intensif', dokter: [{ nama: 'dr. Ardhani Khalifatul Nur Kholis, Sp.An-Ti', hari: 'Sabtu & Minggu', jam: 'Sesuai Jam Kerja' }] },
  { nama: 'Layanan Fisioterapi', dokter: [{ nama: 'Mochamad Nursaid, A.Md', hari: 'Senin-Jumat', jam: 'Sesuai Jam Kerja' }, { nama: 'David Aryanto, A.Md.F', hari: 'Senin-Jumat', jam: 'Sesuai Jam Kerja' }] },
  { nama: 'Layanan Konsultasi Gizi', dokter: [{ nama: 'Nur Rizqi Intan Syaputri, S.ST', hari: 'Senin-Jumat', jam: 'Sesuai Jam Kerja' }] },
];

// Untuk dropdown Poli Tujuan, cukup ambil namanya saja.
const POLI_OPTIONS = daftarPoli.map((p) => p.nama);

// Cari tanggal ISO (YYYY-MM-DD) untuk H-1 dari hari ini, dipakai sebagai batas minimal pendaftaran.
function tanggalMinimalDaftar() {
  const besok = new Date();
  besok.setDate(besok.getDate() + 1);
  return besok.toISOString().split('T')[0];
}

// Modal pilihan jenis pendaftaran: BPJS (via Mobile JKN) atau Umum (form → WhatsApp terisi otomatis).
function DaftarOnlineModal({ open, onClose }) {
  const [step, setStep] = useState('pilih'); // 'pilih' | 'form-umum'
  const [form, setForm] = useState(FORM_KOSONG);

  if (!open) return null;

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep('pilih');
      setForm(FORM_KOSONG);
    }, 200);
  };

  const ubah = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const batasMinimalTanggal = tanggalMinimalDaftar();
  const tanggalKontrolValid = !form.tanggalKontrol || form.tanggalKontrol >= batasMinimalTanggal;

  const wajibTerisi = form.tanggalKontrol && tanggalKontrolValid && form.nik && form.namaLengkap && form.tempatLahir
    && form.tanggalLahir && form.alamat && form.telp && form.namaIbu && form.poliTujuan;

  const kirimWhatsApp = () => {
    const pesan = susunPesanPendaftaran(form);
    const url = `https://wa.me/${WA_NOMOR_UMUM}?text=${encodeURIComponent(pesan)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    handleClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="daftar-online-title"
    >
      <div
        className="absolute inset-0 bg-[#0F2A24]/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-md max-h-[88vh] overflow-y-auto bg-white rounded-3xl shadow-[0_24px_60px_rgba(15,42,36,0.25)] p-6 sm:p-7 animate-[fadeUp_0.25s_ease-out]">
        <button
          onClick={handleClose}
          aria-label="Tutup"
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-[#0F2A24]/50 hover:bg-[#F6F8F7] hover:text-[#0F2A24] transition"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        {step === 'pilih' && (
          <>
            <span className="inline-flex items-center gap-2 text-[10.5px] font-semibold tracking-[0.16em] uppercase text-[#279C4B] bg-[#279C4B]/10 rounded-full px-3 py-1.5 w-fit">
              Daftar Online
            </span>
            <h3 id="daftar-online-title" className="font-[var(--font-fraunces)] font-semibold text-2xl tracking-tight mt-3 text-[#0F2A24]">
              Anda pasien apa?
            </h3>
            <p className="text-[13.5px] text-[#0F2A24]/60 mt-1.5 leading-relaxed">
              Pilih jenis pasien untuk mengetahui cara pendaftaran yang sesuai.
            </p>

            <div className="mt-6 space-y-3.5">
              {/* Opsi BPJS */}
              <a
                href={MOBILE_JKN_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 rounded-2xl border border-black/[0.06] p-4 hover:border-[#1477B0]/40 hover:bg-[#1477B0]/[0.04] transition"
              >
                <div className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center bg-[#1477B0]/10">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#1477B0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M9 12l2 2 4-4M7.8 4.2 12 2l4.2 2.2L21 5v6c0 5-3.8 8.4-9 11-5.2-2.6-9-6-9-11V5l4.8-.8Z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-[var(--font-fraunces)] font-semibold text-[15px] text-[#0F2A24]">Pasien BPJS</p>
                  <p className="text-[12.5px] text-[#0F2A24]/60 mt-0.5 leading-relaxed">
                    Pendaftaran dilakukan lewat aplikasi Mobile JKN.
                  </p>
                  <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#1477B0] mt-2 group-hover:underline">
                    Buka Mobile JKN <span>↗</span>
                  </span>
                </div>
              </a>

              {/* Opsi Umum */}
              <button
                onClick={() => setStep('form-umum')}
                className="group w-full flex items-start gap-4 rounded-2xl border border-black/[0.06] p-4 hover:border-[#25D366]/50 hover:bg-[#25D366]/[0.05] transition text-left"
              >
                <div className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center bg-[#25D366]/10">
                  <svg viewBox="0 0 24 24" fill="#25D366" className="w-5 h-5">
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.29-1.38a9.87 9.87 0 0 0 4.7 1.2h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.13a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.14.82.84-3.06-.2-.32a8.19 8.19 0 0 1-1.26-4.35c0-4.53 3.69-8.22 8.24-8.22 2.2 0 4.27.86 5.83 2.42a8.16 8.16 0 0 1 2.41 5.81c0 4.53-3.69 8.23-8.23 8.23Zm4.51-6.16c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.56.12-.16.25-.64.8-.78.96-.15.16-.29.18-.53.06-.25-.12-1.04-.38-1.99-1.22-.73-.66-1.23-1.46-1.37-1.71-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.16-.25.24-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.36-.77-1.86-.2-.49-.41-.42-.56-.43-.14-.01-.31-.01-.48-.01-.16 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.57.12.16 1.75 2.67 4.24 3.74.59.26 1.06.41 1.42.52.6.19 1.14.16 1.57.1.48-.07 1.46-.6 1.66-1.17.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28Z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-[var(--font-fraunces)] font-semibold text-[15px] text-[#0F2A24]">Pasien Umum</p>
                  <p className="text-[12.5px] text-[#0F2A24]/60 mt-0.5 leading-relaxed">
                    Isi data sekali, langsung terkirim rapi ke WhatsApp kami.
                  </p>
                  <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#25D366] mt-2 group-hover:underline">
                    Isi Formulir <span>→</span>
                  </span>
                </div>
              </button>
            </div>
          </>
        )}

        {step === 'form-umum' && (
          <>
            <button
              onClick={() => setStep('pilih')}
              className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#0F2A24]/60 hover:text-[#0F2A24] transition mb-3"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M15 18l-6-6 6-6" /></svg>
              Kembali
            </button>

            <span className="inline-flex items-center gap-2 text-[10.5px] font-semibold tracking-[0.16em] uppercase text-[#25D366] bg-[#25D366]/10 rounded-full px-3 py-1.5 w-fit">
              Pasien Umum
            </span>
            <h3 className="font-[var(--font-fraunces)] font-semibold text-2xl tracking-tight mt-3 text-[#0F2A24]">
              Formulir Pendaftaran
            </h3>
            <p className="text-[13px] text-[#0F2A24]/60 mt-1.5 leading-relaxed">
              Isi data di bawah ini, nanti otomatis tersusun rapi dan terkirim ke WhatsApp kami.
            </p>

            <div className="mt-5 space-y-3.5">
              <LabeledInput label="Nama lengkap (sesuai KTP)" type="text" placeholder="Contoh: Tutuk Yekti Andayani" value={form.namaLengkap} onChange={ubah('namaLengkap')} />
              <div>
                <LabeledInput
                  label="Tanggal kontrol/periksa"
                  type="date"
                  min={batasMinimalTanggal}
                  value={form.tanggalKontrol}
                  onChange={ubah('tanggalKontrol')}
                />
                {form.tanggalKontrol && !tanggalKontrolValid && (
                  <p className="text-[12px] text-[#A3231F] mt-1.5 leading-relaxed">
                    Pendaftaran online minimal H-1 sebelum jadwal periksa. Untuk periksa hari ini, silakan datang langsung ke IGD/Poliklinik atau hubungi kami di (0334) 5761114.
                  </p>
                )}
              </div>
              <LabeledInput label="Nomor RM (kosongkan jika pasien baru)" type="text" placeholder="Contoh: 002862" value={form.nomorRM} onChange={ubah('nomorRM')} />
              <LabeledInput label="NIK KTP" type="text" inputMode="numeric" placeholder="16 digit NIK" value={form.nik} onChange={ubah('nik')} />
              <div className="grid grid-cols-2 gap-3">
                <LabeledInput label="Tempat lahir" type="text" placeholder="Contoh: Lumajang" value={form.tempatLahir} onChange={ubah('tempatLahir')} />
                <LabeledInput label="Tanggal lahir" type="date" value={form.tanggalLahir} onChange={ubah('tanggalLahir')} />
              </div>
              <LabeledInput label="Alamat KTP lengkap" type="text" placeholder="Sesuai KTP" value={form.alamat} onChange={ubah('alamat')} />
              <LabeledInput label="No. Telp aktif" type="tel" inputMode="numeric" placeholder="Contoh: 0857xxxxxxx" value={form.telp} onChange={ubah('telp')} />
              <LabeledInput label="Nama ibu kandung" type="text" value={form.namaIbu} onChange={ubah('namaIbu')} />
              <LabeledSelect label="Poli tujuan" options={POLI_OPTIONS} value={form.poliTujuan} onChange={ubah('poliTujuan')} />
            </div>

            <button
              onClick={kirimWhatsApp}
              disabled={!wajibTerisi}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] disabled:bg-[#0F2A24]/15 disabled:cursor-not-allowed text-white font-[var(--font-fraunces)] font-bold py-3.5 rounded-full transition"
            >
              Kirim ke WhatsApp <span>↗</span>
            </button>
            <p className="text-[11.5px] text-[#0F2A24]/45 mt-3 text-center leading-relaxed">
              Harap membawa identitas asli saat ke Rumah Sakit. Balasan dilayani jam kerja Senin–Jumat, 08.00–14.30.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [daftarModalOpen, setDaftarModalOpen] = useState(false);

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
            <a href="#dokter" className="hover:text-[#1477B0] transition">Jadwal Dokter</a>
            <a href="#kontak" className="hover:text-[#1477B0] transition">Kontak</a>
          </nav>

          <button
            onClick={() => setDaftarModalOpen(true)}
            className="bg-[#F2A93B] hover:bg-[#e0972a] text-[#0F2A24] px-4 sm:px-5 py-2.5 rounded-full text-[13px] font-[var(--font-fraunces)] font-bold transition shadow-[0_6px_16px_rgba(242,169,59,0.35)] whitespace-nowrap"
          >
            Daftar Online
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative w-full overflow-hidden">
        <div className="relative h-[560px] sm:h-[600px] md:h-[640px] w-full pt-[76px]">
          <Image
            src="/rsud-gedung.jpg"
            alt="Gedung RSUD Pasirian Lumajang"
            fill
            priority
            quality={65}
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#031817]/90 via-[#04382f]/65 to-[#04382f]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

          <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 h-full flex flex-col justify-center">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] uppercase text-white bg-white/15 border border-white/25 rounded-full px-3.5 py-1.5 backdrop-blur-md w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F2A93B] animate-pulse" />
                Siaga 24 Jam &middot; Pasirian, Lumajang
              </span>

              <h2 className="font-[var(--font-fraunces)] font-bold text-4xl sm:text-5xl lg:text-[3.3rem] leading-[1.1] tracking-tight mt-5 text-white">
                Selamat Datang di
                <br />
                <span className="italic text-[#7fe9d0]">RSUD Pasirian.</span>
              </h2>

              <p className="text-[15.5px] sm:text-base text-white/85 leading-relaxed mt-5">
                Sejak 2016, kami tumbuh menjadi rumah sakit rujukan warga Pasirian dan sekitarnya.
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
        </div>

        {/* Trust strip: melayang di batas bawah hero, kasih kesan modern & kredibel */}
        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6">
          <div className="-mt-9 sm:-mt-10 bg-white rounded-2xl shadow-[0_16px_40px_rgba(15,42,36,0.14)] border border-black/[0.04] grid grid-cols-3 divide-x divide-black/[0.06]">
            {faktaCepat.map((f) => (
              <div key={f.label} className="px-3 sm:px-6 py-5 text-center">
                <p className="font-[var(--font-fraunces)] font-bold text-2xl sm:text-3xl text-[#0F2A24]">{f.angka}</p>
                <p className="text-[11.5px] sm:text-[12.5px] text-[#0F2A24]/60 mt-1 leading-snug">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Layanan */}
      <section id="layanan" className="max-w-7xl mx-auto px-5 sm:px-6 pt-16 sm:pt-20 pb-16 sm:pb-20">
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

        {/* Kategori layanan lengkap */}
        <div className="mt-16 sm:mt-20">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#7C4DBE]">Selengkapnya</span>
            <h4 className="font-[var(--font-fraunces)] font-semibold text-2xl sm:text-[1.75rem] tracking-tight mt-2 text-[#0F2A24]">
              Kategori layanan lengkap
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {kategoriLayanan.map((kat) => (
              <div key={kat.nama} className="bg-white border border-black/[0.06] rounded-2xl overflow-hidden">
                <div className="px-5 py-3.5" style={{ backgroundColor: kat.color }}>
                  <p className="font-[var(--font-fraunces)] font-semibold text-[14.5px] text-white">{kat.nama}</p>
                </div>
                <ul className="px-5 py-4 space-y-2">
                  {kat.items.map((it) => (
                    <li key={it} className="text-[13px] text-[#0F2A24]/70 flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full mt-2 shrink-0" style={{ backgroundColor: kat.color }} />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Kapasitas tempat tidur */}
        <div className="mt-16 sm:mt-20">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#279C4B]">Kapasitas</span>
            <h4 className="font-[var(--font-fraunces)] font-semibold text-2xl sm:text-[1.75rem] tracking-tight mt-2 text-[#0F2A24]">
              Kapasitas tempat tidur
            </h4>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white border border-black/[0.06] rounded-2xl overflow-hidden">
              <div className="px-5 py-3.5 bg-[#0F2A24]">
                <p className="font-[var(--font-fraunces)] font-semibold text-[14.5px] text-white">Layanan Rawat Inap</p>
              </div>
              <table className="w-full text-[13.5px]">
                <tbody>
                  {kapasitasRawatInap.map((k, i) => (
                    <tr key={k.ruang} className={i % 2 === 1 ? 'bg-[#F6F8F7]' : ''}>
                      <td className="px-5 py-2.5 text-[#0F2A24]/75">{k.ruang}</td>
                      <td className="px-5 py-2.5 text-right font-semibold text-[#0F2A24]">{k.tt} TT</td>
                    </tr>
                  ))}
                  <tr className="border-t border-black/[0.08]">
                    <td className="px-5 py-2.5 font-semibold text-[#0F2A24]">Total</td>
                    <td className="px-5 py-2.5 text-right font-bold text-[#279C4B]">
                      {kapasitasRawatInap.reduce((sum, k) => sum + k.tt, 0)} TT
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-white border border-black/[0.06] rounded-2xl overflow-hidden">
              <div className="px-5 py-3.5 bg-[#A3231F]">
                <p className="font-[var(--font-fraunces)] font-semibold text-[14.5px] text-white">Layanan IGD 24 Jam</p>
              </div>
              <table className="w-full text-[13.5px]">
                <tbody>
                  {kapasitasIgd.map((k, i) => (
                    <tr key={k.ruang} className={i % 2 === 1 ? 'bg-[#F6F8F7]' : ''}>
                      <td className="px-5 py-2.5 text-[#0F2A24]/75">{k.ruang}</td>
                      <td className="px-5 py-2.5 text-right font-semibold text-[#0F2A24]">{k.tt} TT</td>
                    </tr>
                  ))}
                  <tr className="border-t border-black/[0.08]">
                    <td className="px-5 py-2.5 font-semibold text-[#0F2A24]">Total</td>
                    <td className="px-5 py-2.5 text-right font-bold text-[#A3231F]">
                      {kapasitasIgd.reduce((sum, k) => sum + k.tt, 0)} TT
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Ruang Rawat Inap */}
        <div className="mt-16 sm:mt-20">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#F2A93B]">Fasilitas Kamar</span>
            <h4 className="font-[var(--font-fraunces)] font-semibold text-2xl sm:text-[1.75rem] tracking-tight mt-2 text-[#0F2A24]">
              Ruang rawat inap
            </h4>
            <p className="text-[#0F2A24]/60 text-[14px] mt-3">
              Total 100 tempat tidur rawat inap, ditambah 13 tempat tidur di IGD 24 Jam.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {ruangRawatInap.map((r) => (
              <div key={r.nama} className="bg-white border border-black/[0.06] rounded-2xl p-5 hover:shadow-[0_12px_30px_rgba(15,42,36,0.08)] transition">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${r.color}14` }}
                >
                  <BedIcon color={r.color} />
                </div>
                <span
                  className="inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full mb-1.5"
                  style={{ backgroundColor: `${r.color}14`, color: r.color }}
                >
                  {r.kelas}
                </span>
                <h5 className="font-[var(--font-fraunces)] font-semibold text-[15px] text-[#0F2A24]">{r.nama}</h5>
                <p className="text-[12px] text-[#0F2A24]/55 mt-1">{r.ruang} ruang &middot; {r.tt} TT</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Jadwal Dokter / Klinik Spesialis */}
      <section id="dokter" className="bg-[#F6F8F7] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#A3231F]">Jadwal Dokter</span>
            <h3 className="font-[var(--font-fraunces)] font-semibold text-3xl sm:text-[2.25rem] tracking-tight mt-2 text-[#0F2A24]">
              Dokter spesialis kami
            </h3>
            <p className="text-[#0F2A24]/60 text-[15px] mt-3">
              10 klinik spesialistik dengan dokter berpengalaman. Untuk jam praktik terkini, silakan hubungi kami atau cek saat Daftar Online.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {klinikSpesialis.map((k) => (
              <div
                key={k.klinik}
                className="bg-white border border-black/[0.06] rounded-2xl p-6 hover:shadow-[0_12px_30px_rgba(15,42,36,0.08)] transition"
              >
                <h4 className="font-[var(--font-fraunces)] font-semibold text-[16px] text-[#0F2A24] mb-4">{k.klinik}</h4>
                <ul className="space-y-3">
                  {k.dokter.map((d) => (
                    <li key={d} className="flex items-center gap-3">
                      <span className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-[#1477B0] to-[#279C4B] text-white text-[11px] font-bold flex items-center justify-center">
                        {inisial(d)}
                      </span>
                      <span className="text-[13.5px] text-[#0F2A24]/80">{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Profil video + kontak */}
      <section id="kontak" className="max-w-7xl mx-auto px-5 sm:px-6 pb-16 sm:pb-20">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#1477B0]">Kenali Kami</span>
          <h3 className="font-[var(--font-fraunces)] font-semibold text-3xl sm:text-[2.25rem] tracking-tight mt-2 text-[#0F2A24]">
            Kunjungi & hubungi kami
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <a
            href="https://youtu.be/ruxXLi-nwAI?si=IPz4N2DIJizgnCux"
            target="_blank"
            rel="noopener noreferrer"
            className="relative block w-full aspect-video rounded-2xl overflow-hidden group border border-black/[0.06] shadow-[0_16px_40px_rgba(15,42,36,0.1)]"
          >
            {/* Poster custom, tidak bergantung pada thumbnail YouTube */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#04382f] via-[#0F2A24] to-[#1477B0]" />
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                backgroundSize: '22px 22px',
              }}
            />
            <div className="absolute -right-10 -bottom-16 w-64 h-64 rounded-full bg-[#279C4B]/25 blur-2xl" />
            <div className="absolute -left-10 -top-10 w-48 h-48 rounded-full bg-[#F2A93B]/15 blur-2xl" />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-black/20 group-hover:via-black/15 transition-all duration-300" />
            <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start">
              <span className="bg-white/90 backdrop-blur-md text-[#A3231F] text-[10px] font-[var(--font-fraunces)] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg">
                Profil RS
              </span>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-4">
              <div className="w-16 h-16 bg-white/95 text-[#0F2A24] rounded-full flex items-center justify-center text-xl shadow-xl group-hover:scale-110 group-hover:bg-white transition-all duration-300 transform">
                ▶
              </div>
              <p className="font-[var(--font-fraunces)] italic font-semibold text-white/90 text-lg sm:text-xl tracking-tight px-6 text-center">
                Profil RSUD Pasirian
              </p>
            </div>
            <div className="absolute bottom-4 left-4 right-4 z-10">
              <div className="flex items-center justify-between text-[11px] text-white/75">
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
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F2A24] text-white/70">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8 text-[13.5px]">
          <div>
            <p className="font-[var(--font-fraunces)] font-semibold text-white text-[16px]">RSUD Pasirian</p>
            <p className="mt-2 leading-relaxed">Rumah sakit rujukan warga Pasirian dan sekitarnya, siaga 24 jam sejak 2016.</p>
          </div>
          <div>
            <p className="text-white font-semibold mb-2">Tautan</p>
            <ul className="space-y-1.5">
              <li><a href="#layanan" className="hover:text-white transition">Layanan</a></li>
              <li><a href="#dokter" className="hover:text-white transition">Jadwal Dokter</a></li>
              <li><a href="#kontak" className="hover:text-white transition">Kontak</a></li>
              <li><Link href="/chat" className="hover:text-white transition">Chat dengan Kami</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-white font-semibold mb-2">Hubungi</p>
            <p>(0334) 5761114</p>
            <p>rsud.pasirian@gmail.com</p>
          </div>
        </div>
        <div className="border-t border-white/10 text-center text-[12px] py-4">
          &copy; {new Date().getFullYear()} RSUD Pasirian &middot; Milik Pemkab Lumajang &middot; ASA365
        </div>
      </footer>

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

      {/* Modal Daftar Online */}
      <DaftarOnlineModal open={daftarModalOpen} onClose={() => setDaftarModalOpen(false)} />

      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}