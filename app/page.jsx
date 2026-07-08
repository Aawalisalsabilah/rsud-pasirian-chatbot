'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { Fraunces, Inter } from 'next/font/google';

const fraunces = Fraunces({ subsets: ['latin'], weight: ['500', '600', '700'], style: ['normal', 'italic'], variable: '--font-fraunces' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-inter' });

const INK = '#0B2B24';
const BRASS = '#C08829';
const BRASS_SOFT = '#DDB169';
const CREAM = '#FBF9F4';
const EMERALD = '#1F6B4F';
const STEEL = '#2A6C93';
const CLAY = '#9E3B32';
const PLUM = '#6B4A8A';

const layanan = [
  { label: 'IGD 24 Jam', desc: 'Respon cepat untuk kondisi darurat, siaga sepanjang hari.', icon: 'M12 2v20M2 12h20', color: CLAY },
  { label: 'Persalinan 24 Jam', desc: 'Layanan ibu & bayi dengan ruang perinatologi.', icon: 'M12 21c-4-3-7-6.5-7-10a7 7 0 0 1 14 0c0 3.5-3 7-7 10Z', color: BRASS },
  { label: 'Laboratorium 24 Jam', desc: 'Pemeriksaan penunjang cepat dan akurat.', icon: 'M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3', color: STEEL },
  { label: 'Radiologi 24 Jam', desc: 'Pencitraan medis untuk diagnosis yang tepat.', icon: 'M12 2a10 10 0 1 0 10 10M12 6a6 6 0 1 0 6 6M12 12l6-6', color: EMERALD },
  { label: 'Farmasi 24 Jam', desc: 'Termasuk Sehat Ekspres — obat diantar ke rumah.', icon: 'M10.5 20.5 3.5 13.5a5 5 0 0 1 7-7l7 7a5 5 0 0 1-7 7ZM8 8l8 8', color: STEEL },
  { label: 'Klinik Spesialis', desc: 'Penyakit Dalam, Anak, Kandungan, Bedah, dan lainnya.', icon: 'M4.5 9.5v3a7.5 7.5 0 0 0 15 0v-3M8 4v3M16 4v3M12 20v-2.5', color: EMERALD },
];

const faktaCepat = [
  { angka: '10+', label: 'Tahun melayani Pasirian' },
  { angka: '24', label: 'Jam siaga, setiap hari' },
  { angka: '6', label: 'Layanan utama tersedia' },
];

const sejarahRS = [
  { tahun: '2015', judul: 'Perda Pendirian', desc: 'Perda Kabupaten Lumajang No. 4/2015 menetapkan Susunan Organisasi dan Tata Kerja RSUD Pasirian, dikembangkan dari Puskesmas Pasirian.', color: STEEL },
  { tahun: '2016', judul: 'Direktur Pertama', desc: 'Perbup No. 17/2016 menetapkan dr. Wawan Arwijanto sebagai direktur pertama, dilantik 17 Juni 2016.', color: EMERALD },
  { tahun: '2017', judul: 'Resmi Beroperasi', desc: 'RSUD Pasirian mulai melayani masyarakat sejak 15 Agustus 2017, dengan izin operasional dari Bupati Lumajang.', color: BRASS },
  { tahun: '2018', judul: 'Jadi UPT Dinkes', desc: 'Perbup No. 67/2018 menetapkan RSUD Pasirian sebagai UPT Dinas Kesehatan Kabupaten Lumajang, memperkuat akuntabilitas layanan.', color: PLUM },
  { tahun: '2021', judul: 'Berstatus BLUD', desc: 'Perbup No. 87/2021 menetapkan status Badan Layanan Umum Daerah, memberi keleluasaan pengelolaan keuangan.', color: STEEL },
  { tahun: '2022', judul: 'Naik Kelas C', desc: 'Izin operasional diperpanjang dan status naik menjadi Kelas C lewat sistem OSS pada 4 Maret 2022, berlaku 5 tahun.', color: CLAY },
];

const visiMisi = {
  visi: 'Mewujudkan masyarakat Lumajang yang berdaya saing, sejahtera, dan bermartabat.',
  misi: 'Memenuhi kebutuhan layanan kesehatan dasar untuk mendorong masyarakat yang lebih sejahtera dan mandiri.',
};

const legalitas = [
  'Izin operasional resmi dari Bupati Lumajang sejak 15 Agustus 2017',
  'UPT Dinas Kesehatan Kabupaten Lumajang sejak 2018',
  'Berstatus Badan Layanan Umum Daerah (BLUD) sejak 2021',
  'Terakreditasi Kelas C, diperpanjang via OSS pada 4 Maret 2022',
];

const kepemimpinan = {
  nama: 'dr. Wawan Arwijanto',
  jabatan: 'Direktur RSUD Pasirian',
  sejak: 'Menjabat sejak 17 Juni 2016',
};

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

function inisial(nama) {
  const bersih = nama.replace(/^(dr\.|drg\.)\s*/i, '');
  const parts = bersih.split(' ').filter(Boolean);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
}

const kategoriLayanan = [
  {
    nama: 'Rawat Jalan',
    color: PLUM,
    items: ['Poliklinik', 'Bedah', 'Penyakit Dalam', 'Anak', 'Obstetri & Ginekologi', 'Paru', 'Gigi & Prostodonti', 'Orthopedi & Traumatologi', 'Fisioterapi', 'Gizi'],
  },
  {
    nama: 'Rawat Inap',
    color: BRASS,
    items: ['Kelas I', 'Kelas II', 'Kelas III', 'Isolasi', 'Perawatan Obgyn', 'Neonatologi'],
  },
  {
    nama: 'Kegawatan & Tindakan',
    color: CLAY,
    items: ['IGD', 'PONEK', 'Kamar Operasi (OK)', 'R. Bersalin (VK)'],
  },
  {
    nama: 'Penunjang',
    color: STEEL,
    items: ['Farmasi', 'Gizi', 'Radiologi', 'Laboratorium', 'Pemulasaran Jenazah', 'Ambulance', 'IPSRS'],
  },
];

const ruangRawatInap = [
  { nama: 'Mutiara', kelas: 'VIP', ruang: 9, tt: 9, color: BRASS },
  { nama: 'Berlian', kelas: 'Kelas I', ruang: 6, tt: 12, color: STEEL },
  { nama: 'Zamrud', kelas: 'Kelas II', ruang: 6, tt: 18, color: EMERALD },
  { nama: 'Shapire', kelas: 'Kelas III', ruang: 6, tt: 24, color: PLUM },
  { nama: 'ICU', kelas: 'Intensif', ruang: 2, tt: 7, color: CLAY },
  { nama: 'PICU', kelas: 'Intensif', ruang: 1, tt: 1, color: CLAY },
  { nama: 'NICU', kelas: 'Intensif', ruang: 1, tt: 3, color: CLAY },
  { nama: 'Neonatologi', kelas: 'Kelas III', ruang: 1, tt: 16, color: PLUM },
  { nama: 'Permata', kelas: 'Kelas III', ruang: 5, tt: 10, color: PLUM },
];

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

const panduanJknMobile = [
  { langkah: 1, judul: 'Unduh Aplikasi', gambar: null, desc: 'Unduh Mobile JKN dari Play Store atau App Store, lalu buat akun baru.' },
  { langkah: 2, judul: 'Login', gambar: null, desc: 'Masuk menggunakan NIK dan kata sandi yang sudah didaftarkan.' },
  { langkah: 3, judul: 'Pilih Menu Pendaftaran', gambar: null, desc: 'Buka menu "Pendaftaran Pelayanan" pada halaman utama aplikasi.' },
  { langkah: 4, judul: 'Pilih RSUD Pasirian', gambar: null, desc: 'Cari dan pilih RSUD Pasirian sebagai fasilitas kesehatan tujuan.' },
  { langkah: 5, judul: 'Pilih Poli & Jadwal', gambar: null, desc: 'Pilih poli tujuan serta tanggal dan jam kontrol yang tersedia.' },
  { langkah: 6, judul: 'Dapatkan Nomor Antrean', gambar: null, desc: 'Simpan bukti pendaftaran berisi nomor antrean untuk ditunjukkan saat tiba.' },
];

function BedIcon({ color }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M2 18v-6a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v2M2 18v3M2 18h20v3M13 12h7a2 2 0 0 1 2 2v4M6 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
    </svg>
  );
}

function ServiceIcon({ d, color }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
      <path d={d} />
    </svg>
  );
}

function SemeruRidge({ tone = INK, bg = 'transparent', flip = false, className = '' }) {
  return (
    <div className={`w-full leading-[0] ${flip ? 'rotate-180' : ''} ${className}`} aria-hidden="true">
      <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="w-full h-[34px] sm:h-[46px]">
        <rect width="1200" height="60" fill={bg} />
        <path
          d="M0,60 L0,44 L140,26 L210,38 L300,10 L340,22 L430,4 L470,20 L560,30 L640,14 L700,32 L780,24 L860,40 L960,20 L1040,34 L1120,12 L1200,30 L1200,60 Z"
          fill={tone}
        />
      </svg>
    </div>
  );
}

const WA_NOMOR_UMUM = '6285230703508';
const MOBILE_JKN_LINK = 'https://play.google.com/store/apps/details?id=app.bpjs.mobile';

const NAMA_BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

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
      <span className="text-[12.5px] font-semibold text-[#0B2B24]/70">{label}</span>
      <input
        {...props}
        className="mt-1.5 w-full rounded-xl border border-[#0B2B24]/[0.12] px-3.5 py-2.5 text-[13.5px] text-[#0B2B24] outline-none focus:border-[#C08829] focus:ring-2 focus:ring-[#C08829]/15 transition"
      />
    </label>
  );
}

function LabeledSelect({ label, options, ...props }) {
  return (
    <label className="block">
      <span className="text-[12.5px] font-semibold text-[#0B2B24]/70">{label}</span>
      <select
        {...props}
        className="mt-1.5 w-full rounded-xl border border-[#0B2B24]/[0.12] px-3.5 py-2.5 text-[13.5px] text-[#0B2B24] outline-none focus:border-[#C08829] focus:ring-2 focus:ring-[#C08829]/15 transition bg-white"
      >
        <option value="" disabled>Pilih poli tujuan</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

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

const POLI_OPTIONS = daftarPoli.map((p) => p.nama);

function tanggalMinimalDaftar() {
  const besok = new Date();
  besok.setDate(besok.getDate() + 1);
  return besok.toISOString().split('T')[0];
}

function DaftarOnlineModal({ open, onClose }) {
  const [step, setStep] = useState('pilih'); 
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
        className="absolute inset-0 bg-[#0B2B24]/65 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-md max-h-[88vh] overflow-y-auto bg-white rounded-[28px] shadow-[0_30px_70px_rgba(11,43,36,0.3)] ring-1 ring-[#C08829]/15 p-6 sm:p-7 animate-[fadeUp_0.25s_ease-out]">
        <button
          onClick={handleClose}
          aria-label="Tutup"
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-[#0B2B24]/50 hover:bg-[#FBF9F4] hover:text-[#0B2B24] transition"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        {step === 'pilih' && (
          <>
            <span className="inline-flex items-center gap-2 text-[10.5px] font-semibold tracking-[0.16em] uppercase text-[#C08829] bg-[#C08829]/10 rounded-full px-3 py-1.5 w-fit">
              Daftar Online
            </span>
            <h3 id="daftar-online-title" className="font-[var(--font-fraunces)] font-semibold text-2xl tracking-tight mt-3 text-[#0B2B24]">
              Anda pasien apa?
            </h3>
            <p className="text-[13.5px] text-[#0B2B24]/60 mt-1.5 leading-relaxed">
              Pilih jenis pasien untuk mengetahui cara pendaftaran yang sesuai.
            </p>

            <div className="mt-6 space-y-3.5">
              {}
              <a
                href={MOBILE_JKN_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 rounded-2xl border border-[#0B2B24]/[0.08] p-4 hover:border-[#2A6C93]/40 hover:bg-[#2A6C93]/[0.04] transition"
              >
                <div className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center bg-[#2A6C93]/10">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#2A6C93" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M9 12l2 2 4-4M7.8 4.2 12 2l4.2 2.2L21 5v6c0 5-3.8 8.4-9 11-5.2-2.6-9-6-9-11V5l4.8-.8Z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-[var(--font-fraunces)] font-semibold text-[15px] text-[#0B2B24]">Pasien BPJS</p>
                  <p className="text-[12.5px] text-[#0B2B24]/60 mt-0.5 leading-relaxed">
                    Pendaftaran dilakukan lewat aplikasi Mobile JKN.
                  </p>
                  <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#2A6C93] mt-2 group-hover:underline">
                    Buka Mobile JKN <span>↗</span>
                  </span>
                </div>
              </a>

              {/* Opsi Umum */}
              <button
                onClick={() => setStep('form-umum')}
                className="group w-full flex items-start gap-4 rounded-2xl border border-[#0B2B24]/[0.08] p-4 hover:border-[#25D366]/50 hover:bg-[#25D366]/[0.05] transition text-left"
              >
                <div className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center bg-[#25D366]/10">
                  <svg viewBox="0 0 24 24" fill="#25D366" className="w-5 h-5">
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.29-1.38a9.87 9.87 0 0 0 4.7 1.2h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.13a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.14.82.84-3.06-.2-.32a8.19 8.19 0 0 1-1.26-4.35c0-4.53 3.69-8.22 8.24-8.22 2.2 0 4.27.86 5.83 2.42a8.16 8.16 0 0 1 2.41 5.81c0 4.53-3.69 8.23-8.23 8.23Zm4.51-6.16c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.56.12-.16.25-.64.8-.78.96-.15.16-.29.18-.53.06-.25-.12-1.04-.38-1.99-1.22-.73-.66-1.23-1.46-1.37-1.71-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.16-.25.24-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.36-.77-1.86-.2-.49-.41-.42-.56-.43-.14-.01-.31-.01-.48-.01-.16 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.57.12.16 1.75 2.67 4.24 3.74.59.26 1.06.41 1.42.52.6.19 1.14.16 1.57.1.48-.07 1.46-.6 1.66-1.17.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28Z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-[var(--font-fraunces)] font-semibold text-[15px] text-[#0B2B24]">Pasien Umum</p>
                  <p className="text-[12.5px] text-[#0B2B24]/60 mt-0.5 leading-relaxed">
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
              className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#0B2B24]/60 hover:text-[#0B2B24] transition mb-3"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M15 18l-6-6 6-6" /></svg>
              Kembali
            </button>

            <span className="inline-flex items-center gap-2 text-[10.5px] font-semibold tracking-[0.16em] uppercase text-[#25D366] bg-[#25D366]/10 rounded-full px-3 py-1.5 w-fit">
              Pasien Umum
            </span>
            <h3 className="font-[var(--font-fraunces)] font-semibold text-2xl tracking-tight mt-3 text-[#0B2B24]">
              Formulir Pendaftaran
            </h3>
            <p className="text-[13px] text-[#0B2B24]/60 mt-1.5 leading-relaxed">
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
                  <p className="text-[12px] text-[#9E3B32] mt-1.5 leading-relaxed">
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
              className="mt-6 w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] disabled:bg-[#0B2B24]/15 disabled:cursor-not-allowed text-white font-[var(--font-fraunces)] font-bold py-3.5 rounded-full transition"
            >
              Kirim ke WhatsApp <span>↗</span>
            </button>
            <p className="text-[11.5px] text-[#0B2B24]/45 mt-3 text-center leading-relaxed">
              Harap membawa identitas asli saat ke Rumah Sakit. Balasan dilayani jam kerja Senin–Jumat, 08.00–14.30.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function MegaphoneIcon({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 11v3a1 1 0 0 0 1 1h2l3.5 4V5.5L6 9.5H4a1 1 0 0 0-1 1ZM15 8a4 4 0 0 1 0 8M18 5a8 8 0 0 1 0 14" />
    </svg>
  );
}

export default function LandingPage() {
  const [daftarModalOpen, setDaftarModalOpen] = useState(false);

  const [klinikData, setKlinikData] = useState(klinikSpesialis);
  const [announcement, setAnnouncement] = useState(null);
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(76);

  useEffect(() => {
    fetch('/api/announcement')
      .then((res) => res.json())
      .then((json) => {
        const ann = json.data;
        if (ann?.is_active && ann?.message) setAnnouncement(ann);
      })
      .catch(() => {});
  }, []);

  // Ukur tinggi header setiap kali kontennya berubah (mis. saat pengumuman muncul),
  // dan juga saat ukuran layar berubah (mis. rotasi HP).
  useEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [announcement]);

  useEffect(() => {
    fetch('/api/poli')
      .then((res) => res.json())
      .then((res) => {
        const rows = res.data || [];

        const grouped = {};
        rows.forEach((item) => {
          if (item.is_active === false) return; 
          const namaKlinik = item.nama_poli;
          const baris = item.jam ? `${item.nama_dokter} — ${item.hari}, ${item.jam}` : item.nama_dokter;
          if (!grouped[namaKlinik]) grouped[namaKlinik] = [];
          grouped[namaKlinik].push(baris);
        });

        const hasil = Object.entries(grouped).map(([klinik, dokter]) => ({ klinik, dokter }));

        if (hasil.length > 0) {
          setKlinikData(hasil);
        }
      })
      .catch((err) => {
        console.error('[JADWAL DOKTER FETCH ERROR]', err);
      });
  }, []);

  return (
    <div className={`${fraunces.variable} ${inter.variable} font-[var(--font-inter)] min-h-screen bg-white text-[#0B2B24]`}>
      {}
      <div className="bg-[#0B2B24] text-[#F2E4C4] text-[12px]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L7.9 9.9a16 16 0 0 0 6 6l1.4-1.4a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2Z" /></svg>
              (0334) 5761114
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="m3 6 9 6 9-6M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" /></svg>
              rsud.pasirian@gmail.com
            </span>
          </div>
          <span className="hidden md:inline text-[#F2E4C4]/70 tracking-wide">RSUD Kelas C &middot; Milik Pemkab Lumajang</span>
        </div>
      </div>

      {}
      <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#C08829]/15 shadow-[0_1px_0_rgba(11,43,36,0.04)]">
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
              <h1 className="font-[var(--font-fraunces)] font-semibold text-[15px] leading-tight tracking-tight text-[#0B2B24]">RSUD Pasirian</h1>
              <p className="text-[11px] text-[#0B2B24]/60 tracking-[0.04em] font-medium">Lumajang, Jawa Timur</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-[13.5px] font-semibold text-[#0B2B24]/80">
            <a href="#tentang" className="hover:text-[#C08829] transition">Tentang</a>
            <a href="#layanan" className="hover:text-[#C08829] transition">Layanan</a>
            <a href="#dokter" className="hover:text-[#C08829] transition">Jadwal Dokter</a>
            <a href="#panduan-jkn" className="hover:text-[#C08829] transition">Panduan JKN</a>
            <a href="#kontak" className="hover:text-[#C08829] transition">Kontak</a>
          </nav>

          <button
            onClick={() => setDaftarModalOpen(true)}
            className="bg-gradient-to-b from-[#DDB169] to-[#C08829] hover:from-[#e6bd7c] hover:to-[#ca9235] text-[#0B2B24] px-4 sm:px-5 py-2.5 rounded-full text-[13px] font-[var(--font-fraunces)] font-bold transition shadow-[0_8px_20px_rgba(192,136,41,0.35)] whitespace-nowrap"
          >
            Daftar Online
          </button>
        </div>

        {}
        {/* Nav mobile: strip pill horizontal, selalu tampil (tanpa hamburger), bisa discroll ke samping */}
        <nav
          className="md:hidden flex items-center gap-2 overflow-x-auto px-5 pb-3 -mt-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Navigasi utama"
        >
          <a href="#tentang" className="shrink-0 text-[12.5px] font-semibold text-[#0B2B24]/70 bg-[#0B2B24]/[0.04] hover:bg-[#C08829]/10 hover:text-[#C08829] active:bg-[#C08829]/15 px-3.5 py-1.5 rounded-full transition whitespace-nowrap">
            Tentang
          </a>
          <a href="#layanan" className="shrink-0 text-[12.5px] font-semibold text-[#0B2B24]/70 bg-[#0B2B24]/[0.04] hover:bg-[#C08829]/10 hover:text-[#C08829] active:bg-[#C08829]/15 px-3.5 py-1.5 rounded-full transition whitespace-nowrap">
            Layanan
          </a>
          <a href="#dokter" className="shrink-0 text-[12.5px] font-semibold text-[#0B2B24]/70 bg-[#0B2B24]/[0.04] hover:bg-[#C08829]/10 hover:text-[#C08829] active:bg-[#C08829]/15 px-3.5 py-1.5 rounded-full transition whitespace-nowrap">
            Jadwal Dokter
          </a>
          <a href="#panduan-jkn" className="shrink-0 text-[12.5px] font-semibold text-[#0B2B24]/70 bg-[#0B2B24]/[0.04] hover:bg-[#C08829]/10 hover:text-[#C08829] active:bg-[#C08829]/15 px-3.5 py-1.5 rounded-full transition whitespace-nowrap">
            Panduan JKN
          </a>
          <a href="#kontak" className="shrink-0 text-[12.5px] font-semibold text-[#0B2B24]/70 bg-[#0B2B24]/[0.04] hover:bg-[#C08829]/10 hover:text-[#C08829] active:bg-[#C08829]/15 px-3.5 py-1.5 rounded-full transition whitespace-nowrap">
            Kontak
          </a>
        </nav>

        {}
        {announcement && (
          <div className="bg-[#C08829] text-[#0B2B24]">
            <div className="max-w-7xl mx-auto px-5 sm:px-6 py-2 flex items-center justify-center gap-2 text-center">
              <MegaphoneIcon className="w-4 h-4 shrink-0" />
              <p className="text-[12.5px] sm:text-[13px] font-semibold leading-snug">{announcement.message}</p>
            </div>
          </div>
        )}
      </header>

      {}
      <section className="relative w-full overflow-hidden bg-[#0B2B24]">
        <div className="relative h-[580px] sm:h-[620px] md:h-[660px] w-full" style={{ paddingTop: headerHeight }}>
          <Image
            src="/rsud-gedung.jpg"
            alt="Gedung RSUD Pasirian Lumajang"
            fill
            priority
            quality={65}
            sizes="100vw"
            className="object-cover object-center"
          />
          {}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B2B24]/95 via-[#0B2B24]/75 to-[#0B2B24]/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#04140f]/70 via-transparent to-transparent" />

          {}
          <svg viewBox="0 0 500 260" className="absolute right-0 bottom-0 w-[60%] max-w-[560px] opacity-[0.14] pointer-events-none" aria-hidden="true">
            <path d="M0,260 L0,210 L90,150 L150,190 L230,60 L270,110 L330,20 L380,90 L440,140 L500,110 L500,260 Z" fill="#F2E4C4" />
          </svg>

          <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 h-full flex flex-col justify-center">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase text-[#F2E4C4] border border-[#DDB169]/50 rounded-full px-3.5 py-1.5 w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DDB169] animate-pulse" />
                Siaga 24 Jam &middot; Pasirian, Lumajang
              </span>

              <h2 className="font-[var(--font-fraunces)] font-semibold text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.08] tracking-tight mt-6 text-white">
                Selamat Datang di
                <br />
                <span className="italic text-[#DDB169]">RSUD Pasirian.</span>
              </h2>

              <p className="text-[15.5px] sm:text-base text-white/80 leading-relaxed mt-5">
                Sejak 2016, kami tumbuh menjadi rumah sakit rujukan warga Pasirian dan sekitarnya.
                IGD, laboratorium, dan farmasi buka 24 jam penuh, ditangani tenaga medis berpengalaman.
                Ada juga <span className="font-semibold text-[#DDB169]">Sehat Ekspres</span>, layanan antar obat langsung ke rumah Anda.
              </p>

              <div className="flex flex-wrap gap-3.5 pt-7">
                <Link
                  href="/chat"
                  className="inline-flex items-center gap-2 bg-gradient-to-b from-[#DDB169] to-[#C08829] hover:from-[#e6bd7c] hover:to-[#ca9235] text-[#0B2B24] font-[var(--font-fraunces)] font-bold px-6 py-3.5 rounded-full shadow-[0_14px_30px_rgba(192,136,41,0.35)] transition"
                >
                  Chat dengan Kami
                </Link>
                <a
                  href="#layanan"
                  className="inline-flex items-center gap-2 border border-white/30 hover:bg-white/10 text-white font-medium px-6 py-3.5 rounded-full transition"
                >
                  Lihat Layanan
                </a>
              </div>
            </div>
          </div>
        </div>

        {}
        <SemeruRidge tone="#FBF9F4" />

        {}
        <div className="relative bg-[#FBF9F4]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6">
            <div className="-mt-11 sm:-mt-12 bg-white rounded-2xl shadow-[0_20px_50px_rgba(11,43,36,0.14)] ring-1 ring-[#C08829]/10 grid grid-cols-3 divide-x divide-[#0B2B24]/[0.06]">
              {faktaCepat.map((f) => (
                <div key={f.label} className="px-3 sm:px-6 py-5 text-center">
                  <p className="font-[var(--font-fraunces)] font-bold text-2xl sm:text-3xl text-[#0B2B24]">{f.angka}</p>
                  <p className="text-[11.5px] sm:text-[12.5px] text-[#0B2B24]/55 mt-1 leading-snug">{f.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {}
      <section id="tentang" className="bg-[#FBF9F4]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 pt-16 sm:pt-20 pb-16 sm:pb-20">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C08829]">Tentang Kami</span>
            <h3 className="font-[var(--font-fraunces)] font-semibold text-3xl sm:text-[2.25rem] tracking-tight mt-2 text-[#0B2B24]">
              Mengenal RSUD Pasirian
            </h3>
            <p className="text-[#0B2B24]/60 text-[15px] mt-3">
              Tumbuh dari Puskesmas Pasirian menjadi rumah sakit rujukan kelas C yang siaga 24 jam.
            </p>
          </div>

          {}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
            {sejarahRS.map((s) => (
              <div key={s.tahun} className="bg-white border border-[#0B2B24]/[0.06] rounded-2xl p-5 hover:shadow-[0_14px_34px_rgba(11,43,36,0.08)] hover:-translate-y-0.5 transition">
                <span
                  className="inline-block text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full mb-3"
                  style={{ backgroundColor: `${s.color}14`, color: s.color }}
                >
                  {s.tahun}
                </span>
                <h4 className="font-[var(--font-fraunces)] font-semibold text-[15px] text-[#0B2B24]">{s.judul}</h4>
                <p className="text-[12.5px] text-[#0B2B24]/60 mt-1.5 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          {}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-10">
            <div className="bg-white border border-[#0B2B24]/[0.06] rounded-2xl p-7">
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#1F6B4F]">Visi</span>
              <p className="font-[var(--font-fraunces)] font-semibold text-[16px] text-[#0B2B24] mt-2 leading-snug">
                {visiMisi.visi}
              </p>
            </div>
            <div className="bg-white border border-[#0B2B24]/[0.06] rounded-2xl p-7">
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C08829]">Misi</span>
              <p className="font-[var(--font-fraunces)] font-semibold text-[16px] text-[#0B2B24] mt-2 leading-snug">
                {visiMisi.misi}
              </p>
            </div>
            <div className="bg-white border border-[#0B2B24]/[0.06] rounded-2xl p-7">
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#6B4A8A]">Kepemimpinan</span>
              <div className="flex items-center gap-3 mt-3">
                <span className="w-11 h-11 shrink-0 rounded-full bg-[#0B2B24] text-[#DDB169] text-[13px] font-bold flex items-center justify-center">
                  {inisial(kepemimpinan.nama)}
                </span>
                <div>
                  <p className="font-[var(--font-fraunces)] font-semibold text-[14.5px] text-[#0B2B24]">{kepemimpinan.nama}</p>
                  <p className="text-[12px] text-[#0B2B24]/60">{kepemimpinan.jabatan}</p>
                </div>
              </div>
              <p className="text-[12px] text-[#0B2B24]/50 mt-3">{kepemimpinan.sejak}</p>
            </div>
          </div>

          {}
          <div className="bg-[#0B2B24] rounded-2xl p-7 sm:p-8 ring-1 ring-[#DDB169]/20">
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#DDB169]">Legalitas</span>
            <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5">
              {legalitas.map((l) => (
                <li key={l} className="flex items-start gap-2.5 text-[13.5px] text-white/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DDB169] mt-1.5 shrink-0" />
                  {l}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <SemeruRidge tone="#ffffff" bg="#FBF9F4" />

      {}
      <section id="layanan" className="max-w-7xl mx-auto px-5 sm:px-6 pt-16 sm:pt-20 pb-16 sm:pb-20">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#1F6B4F]">Layanan Kami</span>
          <h3 className="font-[var(--font-fraunces)] font-semibold text-3xl sm:text-[2.25rem] tracking-tight mt-2 text-[#0B2B24]">
            Fasilitas lengkap, siap melayani Anda
          </h3>
          <p className="text-[#0B2B24]/60 text-[15px] mt-3">
            Layanan ini mencerminkan papan petunjuk yang ada langsung di gerbang RSUD Pasirian.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {layanan.map((item) => (
            <div
              key={item.label}
              className="group bg-white border border-[#0B2B24]/[0.06] rounded-2xl p-6 hover:border-[#C08829]/30 hover:shadow-[0_14px_34px_rgba(11,43,36,0.08)] hover:-translate-y-0.5 transition"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: `${item.color}14` }}
              >
                <ServiceIcon d={item.icon} color={item.color} />
              </div>
              <h4 className="font-[var(--font-fraunces)] font-semibold text-[16px] text-[#0B2B24]">{item.label}</h4>
              <p className="text-[13.5px] text-[#0B2B24]/60 mt-1.5 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {}
        <div className="mt-16 sm:mt-20">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#6B4A8A]">Selengkapnya</span>
            <h4 className="font-[var(--font-fraunces)] font-semibold text-2xl sm:text-[1.75rem] tracking-tight mt-2 text-[#0B2B24]">
              Kategori layanan lengkap
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {kategoriLayanan.map((kat) => (
              <div key={kat.nama} className="bg-white border border-[#0B2B24]/[0.06] rounded-2xl overflow-hidden">
                <div className="px-5 py-3.5 flex items-center gap-2" style={{ backgroundColor: '#0B2B24' }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: kat.color }} />
                  <p className="font-[var(--font-fraunces)] font-semibold text-[14.5px] text-white">{kat.nama}</p>
                </div>
                <ul className="px-5 py-4 space-y-2">
                  {kat.items.map((it) => (
                    <li key={it} className="text-[13px] text-[#0B2B24]/70 flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full mt-2 shrink-0" style={{ backgroundColor: kat.color }} />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {}
        <div className="mt-16 sm:mt-20">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#1F6B4F]">Kapasitas</span>
            <h4 className="font-[var(--font-fraunces)] font-semibold text-2xl sm:text-[1.75rem] tracking-tight mt-2 text-[#0B2B24]">
              Kapasitas tempat tidur
            </h4>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white border border-[#0B2B24]/[0.06] rounded-2xl overflow-hidden">
              <div className="px-5 py-3.5 bg-[#0B2B24]">
                <p className="font-[var(--font-fraunces)] font-semibold text-[14.5px] text-white">Layanan Rawat Inap</p>
              </div>
              <table className="w-full text-[13.5px]">
                <tbody>
                  {kapasitasRawatInap.map((k, i) => (
                    <tr key={k.ruang} className={i % 2 === 1 ? 'bg-[#FBF9F4]' : ''}>
                      <td className="px-5 py-2.5 text-[#0B2B24]/75">{k.ruang}</td>
                      <td className="px-5 py-2.5 text-right font-semibold text-[#0B2B24] tabular-nums">{k.tt} TT</td>
                    </tr>
                  ))}
                  <tr className="border-t border-[#0B2B24]/[0.08]">
                    <td className="px-5 py-2.5 font-semibold text-[#0B2B24]">Total</td>
                    <td className="px-5 py-2.5 text-right font-bold text-[#C08829] tabular-nums">
                      {kapasitasRawatInap.reduce((sum, k) => sum + k.tt, 0)} TT
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-white border border-[#0B2B24]/[0.06] rounded-2xl overflow-hidden">
              <div className="px-5 py-3.5 bg-[#9E3B32]">
                <p className="font-[var(--font-fraunces)] font-semibold text-[14.5px] text-white">Layanan IGD 24 Jam</p>
              </div>
              <table className="w-full text-[13.5px]">
                <tbody>
                  {kapasitasIgd.map((k, i) => (
                    <tr key={k.ruang} className={i % 2 === 1 ? 'bg-[#FBF9F4]' : ''}>
                      <td className="px-5 py-2.5 text-[#0B2B24]/75">{k.ruang}</td>
                      <td className="px-5 py-2.5 text-right font-semibold text-[#0B2B24] tabular-nums">{k.tt} TT</td>
                    </tr>
                  ))}
                  <tr className="border-t border-[#0B2B24]/[0.08]">
                    <td className="px-5 py-2.5 font-semibold text-[#0B2B24]">Total</td>
                    <td className="px-5 py-2.5 text-right font-bold text-[#9E3B32] tabular-nums">
                      {kapasitasIgd.reduce((sum, k) => sum + k.tt, 0)} TT
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {}
        <div className="mt-16 sm:mt-20">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C08829]">Fasilitas Kamar</span>
            <h4 className="font-[var(--font-fraunces)] font-semibold text-2xl sm:text-[1.75rem] tracking-tight mt-2 text-[#0B2B24]">
              Ruang rawat inap
            </h4>
            <p className="text-[#0B2B24]/60 text-[14px] mt-3">
              Total 100 tempat tidur rawat inap, ditambah 13 tempat tidur di IGD 24 Jam.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {ruangRawatInap.map((r) => (
              <div key={r.nama} className="bg-white border border-[#0B2B24]/[0.06] rounded-2xl p-5 hover:border-[#C08829]/30 hover:shadow-[0_14px_34px_rgba(11,43,36,0.08)] transition">
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
                <h5 className="font-[var(--font-fraunces)] font-semibold text-[15px] text-[#0B2B24]">{r.nama}</h5>
                <p className="text-[12px] text-[#0B2B24]/55 mt-1">{r.ruang} ruang &middot; {r.tt} TT</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {}
      <section id="dokter" className="relative bg-[#0B2B24] py-16 sm:py-20">
        <svg viewBox="0 0 500 260" className="absolute left-0 top-0 w-[40%] max-w-[420px] opacity-[0.06] pointer-events-none" aria-hidden="true">
          <path d="M0,0 L0,50 L90,110 L150,70 L230,200 L270,150 L330,240 L380,170 L440,120 L500,150 L500,0 Z" fill="#F2E4C4" />
        </svg>
        <div className="relative max-w-7xl mx-auto px-5 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#DDB169]">Jadwal Dokter</span>
            <h3 className="font-[var(--font-fraunces)] font-semibold text-3xl sm:text-[2.25rem] tracking-tight mt-2 text-white">
              Dokter spesialis kami
            </h3>
            <p className="text-white/55 text-[15px] mt-3">
              Data diambil otomatis dari sistem admin. Untuk jam praktik terkini, silakan hubungi kami atau cek saat Daftar Online.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {klinikData.map((k) => (
              <div
                key={k.klinik}
                className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 hover:border-[#DDB169]/40 hover:bg-white/[0.06] transition"
              >
                <h4 className="font-[var(--font-fraunces)] font-semibold text-[16px] text-white mb-4">{k.klinik}</h4>
                <ul className="space-y-3">
                  {k.dokter.map((d) => (
                    <li key={d} className="flex items-center gap-3">
                      <span className="w-9 h-9 shrink-0 rounded-full bg-[#DDB169]/15 text-[#DDB169] text-[11px] font-bold flex items-center justify-center">
                        {inisial(d)}
                      </span>
                      <span className="text-[13.5px] text-white/75">{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {}
      <section id="panduan-jkn" className="bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 pt-16 sm:pt-20 pb-16 sm:pb-20">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#2A6C93]">Pasien BPJS</span>
            <h3 className="font-[var(--font-fraunces)] font-semibold text-3xl sm:text-[2.25rem] tracking-tight mt-2 text-[#0B2B24]">
              Panduan Mobile JKN
            </h3>
            <p className="text-[#0B2B24]/60 text-[15px] mt-3">
              Langkah-langkah mendaftar pemeriksaan lewat aplikasi Mobile JKN, khusus pasien BPJS.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {panduanJknMobile.map((p) => (
              <div
                key={p.langkah}
                className="bg-white border border-[#0B2B24]/[0.06] rounded-2xl overflow-hidden hover:border-[#2A6C93]/30 hover:shadow-[0_14px_34px_rgba(11,43,36,0.08)] hover:-translate-y-0.5 transition"
              >
                <div className="relative w-full aspect-[9/16] bg-[#FBF9F4] flex items-center justify-center">
                  {p.gambar ? (
                    <Image
                      src={p.gambar}
                      alt={`Panduan Mobile JKN langkah ${p.langkah}: ${p.judul}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-contain"
                    />
                  ) : (
                    
                    <div className="flex flex-col items-center gap-2 text-[#0B2B24]/25">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-9 h-9">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="m21 15-5-5L5 21" />
                      </svg>
                      <span className="text-[11px] font-medium">Screenshot menyusul</span>
                    </div>
                  )}
                  <span className="absolute top-3 left-3 w-7 h-7 rounded-full bg-[#2A6C93] text-white text-[12px] font-bold flex items-center justify-center shadow">
                    {p.langkah}
                  </span>
                </div>
                <div className="p-5">
                  <h4 className="font-[var(--font-fraunces)] font-semibold text-[15px] text-[#0B2B24]">{p.judul}</h4>
                  <p className="text-[12.5px] text-[#0B2B24]/60 mt-1.5 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <a
              href={MOBILE_JKN_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#2A6C93] hover:bg-[#255d80] text-white font-[var(--font-fraunces)] font-bold px-6 py-3.5 rounded-full transition"
            >
              Unduh Mobile JKN <span>↗</span>
            </a>
          </div>
        </div>
      </section>

      <SemeruRidge tone="#FBF9F4" bg="#ffffff" />

      {}
      <section id="kontak" className="bg-[#FBF9F4]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 pt-16 sm:pt-20 pb-16 sm:pb-20">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#2A6C93]">Kenali Kami</span>
            <h3 className="font-[var(--font-fraunces)] font-semibold text-3xl sm:text-[2.25rem] tracking-tight mt-2 text-[#0B2B24]">
              Kunjungi & hubungi kami
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <a
              href="https://youtu.be/ruxXLi-nwAI?si=IPz4N2DIJizgnCux"
              target="_blank"
              rel="noopener noreferrer"
              className="relative block w-full aspect-video rounded-2xl overflow-hidden group ring-1 ring-[#C08829]/15 shadow-[0_20px_50px_rgba(11,43,36,0.12)]"
            >
              {/* Poster custom, tidak bergantung pada thumbnail YouTube */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#04140f] via-[#0B2B24] to-[#153b31]" />
              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, #F2E4C4 1px, transparent 0)',
                  backgroundSize: '22px 22px',
                }}
              />
              <svg viewBox="0 0 500 260" className="absolute right-0 bottom-0 w-[70%] opacity-[0.1]" aria-hidden="true">
                <path d="M0,260 L0,210 L90,150 L150,190 L230,60 L270,110 L330,20 L380,90 L440,140 L500,110 L500,260 Z" fill="#DDB169" />
              </svg>

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-black/20 group-hover:via-black/10 transition-all duration-300" />
              <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start">
                <span className="bg-white/90 backdrop-blur-md text-[#9E3B32] text-[10px] font-[var(--font-fraunces)] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg">
                  Profil RS
                </span>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-4">
                <div className="w-16 h-16 bg-[#DDB169] text-[#0B2B24] rounded-full flex items-center justify-center text-xl shadow-xl group-hover:scale-110 transition-all duration-300 transform">
                  ▶
                </div>
                <p className="font-[var(--font-fraunces)] italic font-semibold text-white/90 text-lg sm:text-xl tracking-tight px-6 text-center">
                  Profil RSUD Pasirian
                </p>
              </div>
              <div className="absolute bottom-4 left-4 right-4 z-10">
                <div className="flex items-center justify-between text-[11px] text-white/70">
                  <span>Durasi: 3+ menit</span>
                  <span className="group-hover:underline flex items-center gap-1">Tonton di YouTube <span className="text-[#DDB169]">↗</span></span>
                </div>
              </div>
            </a>

            <div className="flex flex-col justify-center gap-4">
              <div className="flex items-start gap-3 bg-white border border-[#0B2B24]/[0.06] rounded-2xl px-5 py-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="#2A6C93" strokeWidth="1.7" className="w-5 h-5 shrink-0 mt-0.5">
                  <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
                <div>
                  <p className="text-[13px] font-semibold text-[#0B2B24]">Alamat</p>
                  <p className="text-[13.5px] text-[#0B2B24]/65 mt-0.5">Jl. Raya Pasirian No. 225A, Kebonan, Pasirian, Lumajang 67372</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white border border-[#0B2B24]/[0.06] rounded-2xl px-5 py-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="#1F6B4F" strokeWidth="1.7" className="w-5 h-5 shrink-0 mt-0.5">
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L7.9 9.9a16 16 0 0 0 6 6l1.4-1.4a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2Z" />
                </svg>
                <div>
                  <p className="text-[13px] font-semibold text-[#0B2B24]">Telepon</p>
                  <p className="text-[13.5px] text-[#0B2B24]/65 mt-0.5">(0334) 5761114</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {}
      <footer className="bg-[#0B2B24] text-white/65">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8 text-[13.5px]">
          <div>
            <p className="font-[var(--font-fraunces)] font-semibold text-white text-[16px]">RSUD Pasirian</p>
            <p className="mt-2 leading-relaxed">Rumah sakit rujukan warga Pasirian dan sekitarnya, siaga 24 jam sejak 2016.</p>
          </div>
          <div>
            <p className="text-white font-semibold mb-2">Tautan</p>
            <ul className="space-y-1.5">
              <li><a href="#tentang" className="hover:text-[#DDB169] transition">Tentang</a></li>
              <li><a href="#layanan" className="hover:text-[#DDB169] transition">Layanan</a></li>
              <li><a href="#dokter" className="hover:text-[#DDB169] transition">Jadwal Dokter</a></li>
              <li><a href="#panduan-jkn" className="hover:text-[#DDB169] transition">Panduan JKN</a></li>
              <li><a href="#kontak" className="hover:text-[#DDB169] transition">Kontak</a></li>
              <li><Link href="/chat" className="hover:text-[#DDB169] transition">Chat dengan Kami</Link></li>
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

      {}
      <Link
        href="/chat"
        className="fixed bottom-6 right-6 z-50 group"
        title="Tanya Asisten Virtual"
      >
        <span className="absolute inset-0 rounded-full bg-[#DDB169]/40 animate-ping" />
        <span className="relative flex w-14 h-14 rounded-full items-center justify-center text-[#0B2B24] shadow-[0_14px_30px_rgba(192,136,41,0.4)] transition group-hover:scale-110 bg-gradient-to-br from-[#DDB169] to-[#C08829]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
            <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
          </svg>
        </span>
      </Link>

      {}
      <DaftarOnlineModal open={daftarModalOpen} onClose={() => setDaftarModalOpen(false)} />

      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-ping, .animate-pulse { animation: none; }
        }
      `}</style>
    </div>
  );
}
