'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import { Fraunces, Inter } from 'next/font/google';

const fraunces = Fraunces({ subsets: ['latin'], weight: ['500', '600', '700'], style: ['normal', 'italic'], variable: '--font-fraunces' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-inter' });

const INK = '#0B2B24';
const BRASS = '#C08829';
const BRASS_SOFT = '#DDB169';
const CREAM = '#FBF9F4';
const EMERALD = '#1F6B4F';

// Komponen kustom buat render link markdown jadi tombol brass,
// biar link "Daftar Sekarang" / "Download Mobile JKN" dari AI kelihatan jelas & bisa diklik.
function MarkdownLink({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 mt-1 mb-1 bg-linear-to-b from-[#DDB169] to-[#C08829] hover:from-[#e6bd7c] hover:to-[#ca9235] text-[#0B2B24] font-(--font-fraunces) font-bold px-4 py-2 rounded-full text-sm no-underline shadow-[0_6px_16px_rgba(192,136,41,0.3)] transition"
    >
      {children} →
    </a>
  );
}

// ===== KONTEN STATIS: CARA DAFTAR PASIEN BPJS & UMUM =====
// PENTING: Konten ini SENGAJA di-hardcode di frontend (BUKAN lewat Groq/LLM,
// BUKAN lewat RAG search). Alasannya:
// 1. Info prosedural ini jarang berubah -> gak butuh "kecerdasan" AI buat jawab.
// 2. Harus SAKLEK/konsisten setiap kali diklik -- kalau lewat LLM, jawaban bisa
//    sedikit beda tiap request dan berisiko halusinasi (contoh kasus URL kemarin).
// 3. Instan & gratis, gak makan jatah token TPM Groq sama sekali.
// Kalau suatu saat syarat/alur pendaftaran BPJS atau umum berubah, edit teks
// di bawah ini langsung -- TIDAK perlu ubah apapun di knowledge_base/Supabase.
const STATIC_CONTENT = {
  bpjs: `**Syarat Sebelum Mendaftar:**
- Aplikasi **Mobile JKN** sudah terinstal dan akun sudah terverifikasi
- **Surat Rujukan** dari Faskes Tingkat Pertama (Puskesmas/Klinik) masih aktif dan sudah mengarah ke RSUD Pasirian Lumajang
- **Kode Faskes Rujukan RSUD Pasirian Lumajang: 0188R008**

**Langkah-Langkah Mendaftar:**

*Belum punya akun Mobile JKN? Lakukan langkah 1-2 dulu. Jika sudah punya akun, langsung ke langkah 3.*

1. **Buka Aplikasi** — Tekan "Daftar" untuk membuat akun baru
2. **Isi Data Pendaftaran** — Isi NIK, nama lengkap, tanggal lahir, captcha, dan kode referral **0188R008** untuk RSUD Pasirian, lalu tekan "Verifikasi Data". Lanjutkan dengan verifikasi nomor HP, verifikasi wajah, lalu buat password untuk login ke akun Anda nanti
3. **Tekan Masuk** — Kembali ke halaman awal, lalu tekan tombol "Masuk" untuk login ke akun Anda
4. **Login Akun** — Isi NIK, password Mobile JKN, dan captcha, lalu tekan "Masuk"
5. **Ambil Antrean** — Pada halaman utama, tekan tombol "Ambil Antrean" di bagian Antrean Online
6. **Pilih Jenis Antrean** — Pilih "Faskes Rujukan Tingkat Lanjut" karena RSUD Pasirian adalah faskes rujukan
7. **Pilih RSUD Pasirian** — Pada daftar rujukan yang tersedia, tekan "Ambil Antrean" di RSUD Pasirian Lumajang
8. **Pilih Tanggal & Dokter** — Periksa info rujukan, pilih tanggal kunjungan dan dokter, lalu tekan "Daftar pelayanan"
9. **Antrean Berhasil** — Nomor antrean poliklinik dan kode booking Anda muncul, simpan untuk ditunjukkan saat datang

**Setelah Berhasil Mendaftar:**
- Nomor antrean poliklinik dan kode booking Anda muncul di aplikasi
- Datang ke RSUD Pasirian sesuai tanggal kunjungan, lalu lapor ke Admisi untuk verifikasi kunjungan sesuai jadwal rencana kunjungan

**Catatan Penting:**
- **Ambil antrean paling lambat H-1 (1 hari sebelum) tanggal rencana kunjungan** antrean di hari yang sama tidak dapat diproses
- Jika Anda mengalami kesulitan dalam mendaftar, silakan hubungi Call Center BPJS atau kunjungi website resmi BPJS untuk bantuan lebih lanjut.

[📱 Download Mobile JKN (Android)](https://play.google.com/store/apps/details?id=app.bpjs.mobile)
[📱 Download Mobile JKN (iOS)](https://apps.apple.com/id/app/mobile-jkn/id1237601115)`,

  umum: `**Syarat Sebelum Mendaftar:**
- Tidak ada syarat khusus untuk mendaftar sebagai pasien umum

**Langkah-Langkah Mendaftar:**
1. Klik tombol "Daftar Online" di halaman Beranda
2. Isi Formulir Pendaftaran dengan data berikut:
   - Nama lengkap (sesuai KTP)
   - Tanggal kontrol/periksa
   - Nomor RM (kosongkan jika pasien baru)
   - NIK KTP
   - Tempat lahir
   - Tanggal lahir
   - Alamat KTP lengkap
   - No. Telp aktif
   - Nama ibu kandung
   - Poli tujuan (pilih dari daftar poli tujuan)
3. Tekan tombol "Kirim ke WhatsApp" data akan otomatis tersusun rapi dan terkirim ke WhatsApp RSUD Pasirian

**Setelah Berhasil Mendaftar:**
- Tim kami akan memproses data pendaftaran yang Anda kirim lewat WhatsApp
- Tunggu balasan konfirmasi dari admin terkait jadwal kunjungan Anda

**Catatan Penting:**
- **Daftar paling lambat H-1 (1 hari sebelum) tanggal rencana kunjungan** pendaftaran di hari yang sama tidak dapat diproses
- Pastikan Anda memiliki data yang lengkap dan akurat
- Untuk melihat jadwal dan jam praktik dokter per poli, klik menu **"Jadwal Pelayanan Poli Klinik"** di sidebar
- Jika Anda mengalami kesulitan dalam mendaftar, silakan hubungi Info Layanan RSUD Pasirian untuk bantuan lebih lanjut.

Atau, Anda juga dapat mendaftar sebagai pasien umum secara offline dengan datang langsung ke RSUD Pasirian dan mengisi formulir pendaftaran yang tersedia di loket informasi.

[📝 Daftar Sekarang](/)`,

  // BARU: info reschedule/cancel jadwal kontrol BPJS ke poli spesialis.
  // Sama kayak bpjs/umum di atas -- ini nomor petugas per poli, jarang
  // berubah, jadi cukup statis aja gak usah lewat Groq/RAG.
  ubahJadwal: `Untuk Bapak/Ibu pasien **BPJS** yang berhalangan hadir atau ingin mengubah jadwal kunjungan kontrol ke poliklinik spesialis (yang telah dijadwalkan oleh petugas poliklinik), silakan konfirmasi dengan menghubungi nomor petugas berikut:

- **Poli Gigi**: 085875083014
- **Poli Anak**: 085854646617
- **Poli Dalam**: 0881026486146
- **Poli Obgyn**: 085196238626
- **Poli Paru**: 081336778319
- **Poli Orthopedi**: 085785050605
- **Poli Bedah**: 085850756768

**Catatan:** Konfirmasi sebaiknya dilakukan sebelum jadwal kunjungan agar slot kontrol Anda dapat diatur ulang oleh petugas poliklinik terkait.`,

  standarIntro: `RSUD Pasirian Lumajang berkomitmen memberikan pelayanan transparan, akuntabel, dan berkualitas sesuai **UU No. 25 Tahun 2009** tentang Pelayanan Publik. Terdapat 3 kategori utama:

1. **Pelayanan Pendaftaran Pasien Rawat Jalan**
2. **Pelayanan Gawat Darurat (IGD)**
3. **Penanganan Pengaduan, Saran, dan Masukan**

Silakan pilih layanan yang Anda butuhkan untuk mengetahui informasi lebih lanjut.`,

  standarPendaftaran: `**Persyaratan:**
- **Pasien Umum**: Tidak ada syarat khusus, dapat mendaftar online lewat formulir pendaftaran (data terkirim ke WhatsApp) atau datang langsung ke loket informasi
- **Pasien BPJS**:
  - Aplikasi **Mobile JKN** sudah terinstal dan akun sudah terverifikasi
  - **Surat Rujukan** dari Faskes Tingkat Pertama (Puskesmas/Klinik) masih aktif dan mengarah ke RSUD Pasirian Lumajang (kode faskes **0188R008**)
  - Ambil antrean lewat Mobile JKN paling lambat **H-1** sebelum tanggal kunjungan

**Prosedur:**
- Mengambil nomor antrean
- Menuju loket pendaftaran saat nomor dipanggil
- Petugas memverifikasi data
- Pasien menerima berkas dan diarahkan ke poliklinik tujuan

**Jangka Waktu:**
- Rata-rata **5-10 menit** per pasien (di luar waktu tunggu antrean)

**Biaya/Tarif:**
- Sesuai Peraturan Daerah (Perda) Kabupaten Lumajang tentang Tarif Layanan Kesehatan
- **Gratis** bagi peserta BPJS aktif sesuai ketentuan`,

  standarIgd: `**Persyaratan:**
- Pasien atau pengantar pasien mendaftar di **triase IGD**
- Identitas pasien dapat dilengkapi kemudian

**Prosedur:**
- Pasien masuk ke ruang triase untuk dinilai tingkat kegawatannya
- Pasien dengan kondisi gawat darurat akan langsung ditangani
- Petugas melakukan stabilisasi dan tindakan medis yang diperlukan
- Keputusan untuk rawat inap atau rawat jalan dibuat setelah kondisi stabil

**Jangka Waktu:**
- Waktu tanggap (response time) di triase **kurang dari 5 menit**

**Biaya/Tarif:**
- Sesuai Peraturan Daerah (Perda) tentang Tarif Layanan Kesehatan
- **Ditanggung BPJS** untuk kasus gawat darurat sesuai ketentuan`,

  standarPengaduan: `Jika pasien menemukan pelayanan yang tidak sesuai standar, dapat menyampaikan melalui:
- Kotak saran yang tersedia di area rumah sakit
- Menghubungi bagian **Humas atau Manajemen**
- Email resmi: **rsud.pasirian@gmail.com**
- Telepon: **(0334) 5761044**`,
};
// ===== END KONTEN STATIS =====

// Daftar kategori untuk tombol tahap-2 Standar Pelayanan Publik.
// contentKey merujuk ke key di STATIC_CONTENT di atas.
const STANDAR_KATEGORI = [
  { contentKey: 'standarPendaftaran', label: 'Pelayanan Pendaftaran Pasien Rawat Jalan' },
  { contentKey: 'standarIgd', label: 'Pelayanan Gawat Darurat (IGD)' },
  { contentKey: 'standarPengaduan', label: 'Penanganan Pengaduan, Saran, dan Masukan' },
];

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Selamat datang di Layanan Asisten Virtual RSUD Pasirian Lumajang. Dengan senang hati saya akan membantu Anda. Silakan sampaikan pertanyaan seputar jadwal dokter, standar pelayanan, atau prosedur pendaftaran yang ingin Anda ketahui.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Sedang menyusun jawaban...');
  const textareaRef = useRef(null);

  const topics = [
    { icon: '🩺', label: 'Jadwal Pelayanan Poli Klinik', shortLabel: 'Jadwal Poli Klinik', isPoliPicker: true },
    { icon: '🛏️', label: 'Info Kamar Rawat Inap', shortLabel: 'Kamar Rawat Inap', isInfoLayanan: true },
    { icon: '📋', label: 'Standar Pelayanan Publik', shortLabel: 'Standar Pelayanan Publik', isStaticList: true },
    { icon: '📝', label: 'Panduan Pendaftaran JKN Mobile', shortLabel: 'Pendaftaran JKN Mobile', isLink: true, href: '/#panduan-jkn' },
    { icon: '🪪', label: 'Cara Daftar Pasien BPJS', shortLabel: 'Daftar Pasien BPJS', isStatic: true, staticKey: 'bpjs' },
    { icon: '🧾', label: 'Cara Daftar Pasien Umum', shortLabel: 'Daftar Pasien Umum', isStatic: true, staticKey: 'umum' },
    { icon: '📞', label: 'Ubah Jadwal Kontrol BPJS', shortLabel: 'Ubah Jadwal Kontrol', isStatic: true, staticKey: 'ubahJadwal' },
  ];

  // selectedPoli (opsional): dikirim ke backend saat user KLIK tombol poli
  // spesifik, supaya backend bisa filter data jadwal secara EKSAK tanpa
  // harus nebak-nebak dari kata kunci di dalam teks pesan.
  const sendMessage = async (messageContent, label = 'Sedang menyusun jawaban...', selectedPoli = null) => {
    if (!messageContent.trim() || isLoading) return;

    setLoadingText(label);
    const userMessage = { role: 'user', content: messageContent };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages, selectedPoli }),
      });

      const data = await response.json();

      if (response.ok && data.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: 'Mohon maaf, sistem sedang mengalami gangguan sesaat. Silakan coba kirim kembali pertanyaan Anda.' }]);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Mohon maaf, koneksi ke server gagal. Silakan periksa kembali koneksi Anda.' }]);
    } finally {
      setIsLoading(false);
      setLoadingText('Sedang menyusun jawaban...');
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  // Tahap 1: user klik "Jadwal Pelayanan Poli Klinik" -> ambil daftar nama poli
  // LANGSUNG dari database (endpoint /api/poli-list), TANPA lewat Groq/LLM.
  // Ini instan, gratis, dan gak makan jatah token TPM Groq sama sekali.
  const handleShowPoliList = async () => {
    if (isLoading) return;

    setMessages((prev) => [...prev, { role: 'user', content: 'Jadwal Pelayanan Poli Klinik' }]);
    setIsLoading(true);
    setLoadingText('Mengambil daftar poliklinik...');

    try {
      const res = await fetch('/api/poli-list');
      const data = await res.json();
      const polis = data.polis || [];

      if (polis.length === 0) {
        setMessages((prev) => [...prev, { role: 'assistant', content: 'Maaf, daftar poliklinik belum tersedia saat ini. Silakan coba lagi nanti.' }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            type: 'poli-buttons',
            polis,
            content: 'Berikut poliklinik yang tersedia di RSUD Pasirian. Silakan pilih salah satu untuk melihat jadwal dokter dan jam praktiknya:',
          },
        ]);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Maaf, gagal memuat daftar poliklinik. Silakan periksa koneksi Anda.' }]);
    } finally {
      setIsLoading(false);
      setLoadingText('Sedang menyusun jawaban...');
    }
  };

  // Tahap 2: user klik salah satu nama poli -> baru di sini kita panggil
  // Groq, dengan selectedPoli persis biar backend gak perlu nebak dan
  // prompt yang dibangun cuma berisi data poli ini aja (kecil, hemat token).
  const handlePoliSelect = (namaPoli) => {
    sendMessage(`Jadwal dan dokter untuk ${namaPoli}`, `Mencari jadwal ${namaPoli}...`, namaPoli);
  };

  // Tahap 1: user klik "Info Kamar Rawat Inap" -> ambil data ketersediaan kamar
  // LANGSUNG dari database (endpoint /api/info-layanan, kategori "infoLayanan"),
  // TANPA lewat Groq/LLM. Instan, gratis, gak makan jatah token TPM Groq.
  const handleShowInfoLayanan = async () => {
    if (isLoading) return;

    setMessages((prev) => [...prev, { role: 'user', content: 'Info Kamar Rawat Inap' }]);
    setIsLoading(true);
    setLoadingText('Mengambil info kamar rawat inap...');

    try {
      const res = await fetch('/api/info-layanan');
      const data = await res.json();
      const items = data.items || [];

      if (items.length === 0) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Maaf, info ketersediaan kamar belum tersedia saat ini. Silakan hubungi bagian informasi RSUD Pasirian.' },
        ]);
      } else if (items.length === 1) {
        // Cuma 1 entri di database -> langsung tampilkan isinya, gak perlu tombol pilihan
        setMessages((prev) => [...prev, { role: 'assistant', content: items[0].content }]);
      } else {
        // Lebih dari 1 entri -> tampilkan sebagai tombol pilihan (mirip standar-buttons)
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            type: 'infolayanan-buttons',
            items,
            content: 'Silakan pilih info ruangan yang ingin Anda lihat:',
          },
        ]);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Maaf, gagal memuat info kamar rawat inap. Silakan periksa koneksi Anda.' }]);
    } finally {
      setIsLoading(false);
      setLoadingText('Sedang menyusun jawaban...');
    }
  };

  // Tahap 2 (kalau entri > 1): user klik salah satu judul ruangan -> tampilkan isinya
  const handleInfoLayananSelect = (item) => {
    if (isLoading) return;
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: item.title },
      { role: 'assistant', content: item.content },
    ]);
  };

  // Tahap 1 (statis, instan): user klik "Standar Pelayanan Publik" -> langsung
  // tampilkan teks pengantar + 3 tombol kategori. TANPA fetch/Groq sama sekali,
  // karena daftar 3 kategori ini fixed dan gak berubah-ubah.
  const handleShowStandarPelayanan = () => {
    if (isLoading) return;

    setMessages((prev) => [
      ...prev,
      { role: 'user', content: 'Standar Pelayanan Publik' },
      { role: 'assistant', type: 'standar-buttons', content: STATIC_CONTENT.standarIntro },
    ]);
  };

  // Tahap 2 (statis, instan): user klik salah satu kategori -> tampilkan detail
  // kategori tersebut dari STATIC_CONTENT. Juga TANPA fetch/Groq.
  const handleStandarSelect = (contentKey, label) => {
    if (isLoading) return;

    setMessages((prev) => [
      ...prev,
      { role: 'user', content: label },
      { role: 'assistant', content: STATIC_CONTENT[contentKey] },
    ]);
  };

  // Handler untuk section STATIS (Cara Daftar Pasien BPJS / Umum / Ubah Jadwal Kontrol).
  // TIDAK memanggil /api/chat sama sekali -- langsung push pertanyaan user
  // dan jawaban tetap dari STATIC_CONTENT ke state messages. Instan, dan
  // jawabannya dijamin SAMA PERSIS setiap kali diklik (gak lewat LLM).
  const handleShowStatic = (staticKey, label) => {
    if (isLoading) return;

    setMessages((prev) => [
      ...prev,
      { role: 'user', content: label },
      { role: 'assistant', content: STATIC_CONTENT[staticKey] },
    ]);
  };

  const handleTopicClick = (topic) => {
    if (topic.isPoliPicker) {
      handleShowPoliList();
    } else if (topic.isInfoLayanan) {
      handleShowInfoLayanan();
    } else if (topic.isStaticList) {
      handleShowStandarPelayanan();
    } else if (topic.isStatic) {
      handleShowStatic(topic.staticKey, topic.label);
    } else {
      sendMessage(topic.text, topic.loading);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [isLoading]);

  return (
    <div className={`${fraunces.variable} ${inter.variable} font-(--font-inter) flex h-dvh bg-[${CREAM}] text-[#0B2B24] overflow-hidden relative`} style={{ backgroundColor: CREAM }}>
      {}
      <aside className="w-80 bg-[#0B2B24] p-6 flex flex-col justify-between hidden md:flex shadow-xl text-white z-10">
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1 shadow-md overflow-hidden shrink-0">
              <Image src="/logo-rs.jpeg" alt="Logo RSUD Pasirian" width={40} height={40} className="object-contain" />
            </div>
            <div>
              <h2 className="font-(--font-fraunces) font-semibold text-sm leading-tight text-white tracking-tight">RSUD Pasirian</h2>
              <p className="text-[11px] text-[#DDB169] font-semibold tracking-[0.14em] uppercase">Virtual Assistant</p>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#DDB169]/80">Layanan Informasi</p>
            <div className="flex flex-col gap-2.5 pt-1">
              {topics.map((topic) =>
                topic.isLink ? (
                  <Link
                    key={topic.label}
                    href={topic.href}
                    className="text-left text-[13px] bg-white/4 hover:bg-white/8 hover:border-[#DDB169]/40 p-3.5 rounded-xl border border-white/10 transition text-white/85 font-medium"
                  >
                    <span className="mr-1.5">{topic.icon}</span>{topic.label}
                  </Link>
                ) : (
                  <button
                    key={topic.label}
                    type="button"
                    onClick={() => handleTopicClick(topic)}
                    className="text-left text-[13px] bg-white/4 hover:bg-white/8 hover:border-[#DDB169]/40 p-3.5 rounded-xl border border-white/10 transition text-white/85 font-medium"
                  >
                    <span className="mr-1.5">{topic.icon}</span>{topic.label}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
        <div className="bg-white/4 p-3 rounded-xl flex items-center gap-2 border border-white/10">
          <span className="w-2 h-2 bg-[#DDB169] rounded-full animate-pulse"></span>
          <span className="text-[12.5px] font-medium text-white/75">Sistem AI Aktif</span>
        </div>
      </aside>

      {}
      <main className="flex-1 flex flex-col bg-[#FBF9F4] overflow-hidden w-full relative min-h-0">
        <header className="px-4 py-3 md:px-6 md:py-4 bg-white/95 backdrop-blur-md border-b border-[#C08829]/15 flex items-center justify-between shadow-[0_1px_0_rgba(11,43,36,0.04)] z-10 gap-2 shrink-0">
          <h1 className="font-(--font-fraunces) font-semibold text-sm md:text-base tracking-tight text-[#0B2B24] truncate">
            Pasirian Smart Assistant
          </h1>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 bg-linear-to-b from-[#DDB169] to-[#C08829] hover:from-[#e6bd7c] hover:to-[#ca9235] text-[#0B2B24] text-xs md:text-sm font-(--font-fraunces) font-bold px-3.5 py-1.5 md:px-4 md:py-2 rounded-full transition shadow-[0_8px_20px_rgba(192,136,41,0.3)] shrink-0"
          >
            ← <span className="hidden sm:inline">Kembali ke </span>Beranda
          </Link>
        </header>

        <div className="flex-1 min-h-0 p-3 md:p-6 overflow-y-auto bg-[#FBF9F4] bg-[radial-gradient(#0B2B24_0.5px,transparent_0.5px)] bg-size-[18px_18px] [background-opacity:0.05]">
          <div className="space-y-4 max-w-full lg:max-w-6xl mx-auto w-full px-2 md:px-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role !== 'user' && (
                  <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center p-0.5 shadow-md overflow-hidden shrink-0 border border-[#0B2B24]/8">
                    <Image src="/logo-rs.jpeg" alt="Logo RSUD Pasirian" width={36} height={36} className="object-contain" />
                  </div>
                )}
                <div
                  className={`p-4 rounded-2xl text-sm md:text-base leading-relaxed shadow-[0_10px_28px_rgba(11,43,36,0.08)] max-w-[85%] md:max-w-[80%] border ${
                    msg.role === 'user'
                      ? 'bg-linear-to-b from-[#DDB169] to-[#C08829] text-[#0B2B24] border-[#C08829]/40 rounded-tr-none'
                      : 'bg-white text-[#0B2B24] border-[#0B2B24]/6 rounded-tl-none'
                  }`}
                >
                  {msg.type === 'poli-buttons' ? (
                    <div className="space-y-3">
                      <p className="text-sm md:text-base leading-relaxed text-[#0B2B24]">{msg.content}</p>
                      <div className="flex flex-wrap gap-2">
                        {msg.polis.map((namaPoli) => (
                          <button
                            key={namaPoli}
                            type="button"
                            disabled={isLoading}
                            onClick={() => handlePoliSelect(namaPoli)}
                            className="text-left text-xs md:text-sm font-medium px-3.5 py-2 rounded-full border border-[#C08829]/40 bg-[#FBF9F4] hover:bg-[#C08829]/10 text-[#0B2B24] transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {namaPoli}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : msg.type === 'infolayanan-buttons' ? (
                    <div className="space-y-3">
                      <p className="text-sm md:text-base leading-relaxed text-[#0B2B24]">{msg.content}</p>
                      <div className="flex flex-wrap gap-2">
                        {msg.items.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleInfoLayananSelect(item)}
                            className="text-left text-xs md:text-sm font-medium px-3.5 py-2 rounded-full border border-[#C08829]/40 bg-[#FBF9F4] hover:bg-[#C08829]/10 text-[#0B2B24] transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {item.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : msg.type === 'standar-buttons' ? (
                    <div className="space-y-3">
                      <div className="text-sm md:text-base leading-relaxed space-y-2 text-[#0B2B24] [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:pl-1">
                        <ReactMarkdown remarkPlugins={[remarkBreaks]} components={{ a: MarkdownLink }}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {STANDAR_KATEGORI.map((kat) => (
                          <button
                            key={kat.contentKey}
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleStandarSelect(kat.contentKey, kat.label)}
                            className="text-left text-xs md:text-sm font-medium px-3.5 py-2 rounded-full border border-[#C08829]/40 bg-[#FBF9F4] hover:bg-[#C08829]/10 text-[#0B2B24] transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {kat.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : msg.role === 'assistant' ? (
                    <div className="text-sm md:text-base leading-relaxed space-y-2 text-[#0B2B24] [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:pl-1">
                      <ReactMarkdown
                        remarkPlugins={[remarkBreaks]}
                        components={{ a: MarkdownLink }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <span className="whitespace-pre-line wrap-break-word font-medium">{msg.content}</span>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start items-center">
                <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center p-0.5 shadow-md overflow-hidden shrink-0 border border-[#0B2B24]/8">
                  <Image src="/logo-rs.jpeg" alt="Logo RSUD Pasirian" width={36} height={36} className="object-contain" />
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-tl-none text-sm text-[#0B2B24]/55 italic flex items-center gap-2 shadow-[0_10px_28px_rgba(11,43,36,0.08)] border border-[#0B2B24]/6">
                  {loadingText}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 md:hidden px-3 pt-2 bg-[#FBF9F4] overflow-x-auto">
          <div className="flex gap-2 pb-2 w-max">
            {topics.map((topic) =>
              topic.isLink ? (
                <Link
                  key={topic.label}
                  href={topic.href}
                  className="shrink-0 flex items-center gap-1.5 bg-white border border-[#0B2B24]/10 text-[#0B2B24] text-sm font-medium px-3.5 py-2.5 rounded-full shadow-sm"
                >
                  <span>{topic.icon}</span> <span>{topic.shortLabel}</span>
                </Link>
              ) : (
                <button
                  key={topic.label}
                  type="button"
                  onClick={() => handleTopicClick(topic)}
                  className="shrink-0 flex items-center gap-1.5 bg-white border border-[#0B2B24]/10 text-[#0B2B24] text-sm font-medium px-3.5 py-2.5 rounded-full shadow-sm"
                >
                  <span>{topic.icon}</span> <span>{topic.shortLabel}</span>
                </button>
              )
            )}
          </div>
        </div>

        <form onSubmit={handleSendMessage} className="shrink-0 p-3 md:p-4 bg-white border-t border-[#C08829]/15 flex gap-2 md:gap-3 items-end shadow-[0_-4px_20px_rgba(11,43,36,0.05)] z-10">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={1}
            placeholder={isLoading ? 'Mohon tunggu...' : 'Tulis pertanyaanmu di sini...'}
            className="flex-1 bg-[#FBF9F4] border border-[#0B2B24]/12 rounded-xl px-4 py-3 text-sm text-[#0B2B24] focus:outline-none focus:border-[#C08829] focus:ring-2 focus:ring-[#C08829]/15 transition resize-none max-h-30"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-linear-to-b from-[#DDB169] to-[#C08829] hover:from-[#e6bd7c] hover:to-[#ca9235] disabled:opacity-60 text-[#0B2B24] font-(--font-fraunces) font-bold px-4 md:px-6 py-3 rounded-xl text-sm transition shadow-[0_8px_20px_rgba(192,136,41,0.3)] shrink-0"
          >
            {isLoading ? '...' : 'Kirim'}
          </button>
        </form>
      </main>
    </div>
  );
}
