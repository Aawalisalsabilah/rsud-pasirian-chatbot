'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import { Poppins } from 'next/font/google';

const fraunces = Poppins({ subsets: ['latin'], weight: ['500', '600', '700'], style: ['normal', 'italic'], variable: '--font-fraunces' });
const inter = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-inter' });

const INK = '#0B2B24';
const BRASS = '#C08829';
const BRASS_SOFT = '#DDB169';
const CREAM = '#FBF9F4';
const EMERALD = '#1F6B4F';

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

  ubahJadwal: `Untuk Bapak/Ibu pasien **BPJS** yang berhalangan hadir atau ingin mengubah jadwal kunjungan kontrol ke poliklinik spesialis (yang telah dijadwalkan oleh petugas poliklinik), silakan konfirmasi dengan menghubungi nomor petugas berikut:

- **Poli Gigi**: 085875083014
- **Poli Anak**: 085854646617
- **Poli Dalam**: 0881026486146
- **Poli Obgyn**: 085196238626
- **Poli Paru**: 081336778319
- **Poli Orthopedi**: 085785050605
- **Poli Bedah**: 085850756768

**Catatan:** Konfirmasi sebaiknya dilakukan sebelum jadwal kunjungan agar slot kontrol Anda dapat diatur ulang oleh petugas poliklinik terkait.`,

  standarIntro: `RSUD Pasirian Lumajang berkomitmen memberikan pelayanan transparan, akuntabel, dan berkualitas sesuai **UU No. 25 Tahun 2009** tentang Pelayanan Publik. Silakan pilih kategori layanan di bawah ini untuk informasi lebih lanjut.`,

  standarPendaftaran: `**Persyaratan Pelayanan:**

*Pasien BPJS Kesehatan:*
- Pasien Baru: KTP/KK, Surat Rujukan dari Fasilitas Kesehatan Tingkat Pertama
- Pasien Lama: KTP/KK, Surat Rujukan dari Faskes Tingkat Pertama / Surat Kontrol (SKDP) / Resume Medis

*Pasien Umum:*
- Pasien Baru: KTP/KK
- Pasien Lama: KTP/KK, Surat Kontrol/Resume Medis (jika ada)

*Pasien BPJS Ketenagakerjaan:*
- Pasien Baru: KTP/KK, Kartu Peserta BPJS Ketenagakerjaan, Formulir 3KK 1 & 3KK 2, Kronologi Kejadian, Berita Acara, Absensi, Fotocopy KTP saksi 2 orang & rekom JR (jika kecelakaan kerja di jalan raya)
- Pasien Lama: KTP/KK, Kartu Peserta BPJS Ketenagakerjaan, Surat Kontrol/Resume Medis (jika ada)

*Pasien Jasa Raharja:*
- Pasien Baru: Surat Rekomendasi Jasa Raharja, Fotocopy KTP Penanggung Jawab, Fotocopy KTP Pasien, Materai 10.000 (3 lembar)
- Pasien Lama: Fotocopy KTP Pasien, Materai 10.000 (2 lembar) pada kontrol pertama Post Rawat Inap, Surat Kontrol/Resume Medis (jika ada)

**Prosedur Pelayanan:**

1. **Daftar di Tempat (Onsite)** — Ambil nomor antrean di mesin anjungan → dipanggil menuju loket pendaftaran → petugas melengkapi data di SIMRS sesuai poliklinik tujuan → khusus pasien BPJS Kesehatan wajib validasi Finger Print/Face Recognise untuk penerbitan SEP → menuju ruang tunggu poliklinik tujuan
2. **Daftar Melalui Mobile JKN** (khusus BPJS Kesehatan) — Check-in via barcode di poliklinik tujuan → validasi Finger Print di poli → petugas mencetak SEP
3. **Daftar Melalui WhatsApp** — Datang ke loket pendaftaran menunjukkan bukti pendaftaran online → ke kasir terlebih dahulu → menuju poliklinik tujuan

**Jangka Waktu Pelayanan:**
- Senin–Kamis: 07.30–11.30
- Jumat: 07.30–10.00
- Waktu pelayanan: **5–10 menit/pasien**

**Biaya Pelayanan:**
Sesuai Perda Kabupaten Lumajang No. 9 Tahun 2025 tentang Pajak Daerah dan Retribusi Daerah
- Biaya Administrasi: **Rp 0**
- Biaya Jasa Dokter: **Rp 35.000**
- Asuhan Keperawatan: **Rp 7.500**
- Pasien BPJS Kesehatan: gratis sesuai ketentuan yang berlaku
- Pasien BPJS Ketenagakerjaan & Jasa Raharja: mengikuti regulasi dan tarif masing-masing penjamin

**Produk Pelayanan:**
- Nomor Rekam Medis Pasien
- Kartu Berobat Pasien (KIB)
- Bukti Pendaftaran Rawat Jalan
- Nomor Antrean (Onsite, Online, Mobile JKN)
- Data Kunjungan Pasien Rawat Jalan
- SEP untuk pasien BPJS Kesehatan`,

  standarPendaftaranRawatInap: `**Persyaratan Pelayanan:**

*Pasien BPJS Kesehatan:* KTP/KK, Surat Rujukan dari Faskes sebelumnya (jika ada), Surat Pengantar Rawat Inap dari IGD, SEP (Surat Eligibilitas Peserta)

*Pasien Umum:* KTP/KK, Surat Rujukan dari Faskes sebelumnya (jika ada), Surat Pengantar Rawat Inap dari IGD

*Pasien BPJS Ketenagakerjaan:* KTP/KK, Kartu Peserta BPJS Ketenagakerjaan, Formulir 3KK 1 & 3KK 2, Kronologi Kejadian, Berita Acara, Absensi, Surat Pengantar Rawat Inap dari IGD, Fotocopy KTP saksi 2 orang & rekom JR (jika kecelakaan kerja di jalan raya)

*Pasien Jasa Raharja:* KTP/KK/SIM, Surat Rekomendasi Jasa Raharja, Fotocopy KTP Penanggung Jawab, Materai 10.000 (3 lembar), Surat Pengantar Rawat Inap dari IGD

*Pasien SKTM:* KTP/KK, Surat Keterangan Tidak Mampu dari Kantor Desa & Kecamatan, Bukti DTSEN (desil 1–10), Surat Rekomendasi Dinas Sosial, Virtual Account BPJS (untuk desil 6–10), Surat Pengantar Rawat Inap dari IGD

*Pasien Persalinan Gratis (PG):* KTP/KK, Surat Rujukan dari Puskesmas, Surat Pengantar Rawat Inap dari IGD

**Prosedur Pelayanan:**
1. **IGD** — Pasien dan keluarga datang ke IGD untuk pemeriksaan
2. **Pendaftaran** — Petugas melakukan identifikasi dan entry data pasien di SIMRS beserta kelengkapan administrasi
3. **Berobat Jalan** — Jika hanya berobat jalan, pasien menuju kasir lalu loket farmasi
4. **Kembali ke IGD** — Keluarga pasien kembali membawa formulir bukti pendaftaran (Formulir Identitas Pasien & General Consent)
5. **Finger Print** — Khusus pasien BPJS, dilakukan Finger Print oleh petugas admin IGD beserta surat permintaan rawat inap untuk menentukan ruang dan hak kelas perawatan
6. **Informasi Kamar** — Petugas menginformasikan ketersediaan kamar sesuai hak kelas dan fasilitas rawat inap
7. **Formulir** — Keluarga mengisi formulir persetujuan rawat inap di Loket Pendaftaran Rawat Inap
8. **Cetak Gelang & SEP** — Petugas mencetak gelang pasien dan SEP (jika ada jaminan kesehatan)
9. **Pindah Ruang** — Pasien dipindahkan ke ruang rawat inap oleh transporter
10. **Rawat Inap** — Pasien mendapat pelayanan sesuai kebutuhan medis

**Jangka Waktu Pelayanan:**
- Waktu operasional pendaftaran: **Setiap hari 24 jam**, terbagi 3 shift — Pagi (07.30–13.30), Sore (13.30–19.30), Malam (19.30–07.30)
- Waktu pelayanan pendaftaran: **≤ 15 menit/pasien**

**Biaya Pelayanan:**
Sesuai Perda Kabupaten Lumajang No. 9 Tahun 2025 tentang Pajak Daerah dan Retribusi Daerah
- Pasien Umum: sesuai tarif Perda dan kelas perawatan yang berlaku
- Pasien BPJS Kesehatan, BPJS Ketenagakerjaan, Jasa Raharja: sesuai regulasi dan tarif masing-masing penjamin
- Pasien SKTM & PG: sesuai regulasi dan tarif pada Peraturan Bupati

*Ketentuan Selisih Naik Kelas (Khusus Peserta BPJS Kesehatan Kelas 2 & Kelas 1):*
Sesuai **PERMENKES Nomor 3 Tahun 2023**, peserta BPJS/JKN yang bersedia membayar biaya tambahan untuk naik kelas perawatan dikenakan selisih dengan perhitungan sebagai berikut:
- **Kelas 2 → Kelas 1**: selisih tarif INACBG kelas 1 dengan tarif INACBG kelas 2
- **Kelas 2 → VIP**: selisih tarif INACBG kelas 1 dengan kelas 2, ditambah paling banyak 75% dari tarif INACBG kelas 1
- **Kelas 1 → VIP**: paling banyak 75% dari tarif INACBG kelas 1

Tarif INACBG merupakan sistem pembayaran paket yang ditanggung BPJS/JKN berdasarkan penyakit/diagnosa yang diderita pasien. Ketentuan naik kelas ini hanya berlaku untuk peserta BPJS/JKN dengan hak kelas 2 dan kelas 1.

**Produk Pelayanan:**
- Nomor Rekam Medis Pasien
- Bukti Pendaftaran Rawat Inap
- Data Kunjungan Pasien Rawat Inap
- SEP untuk pasien BPJS Kesehatan
- Penempatan ruang/kamar perawatan
- Berkas Rekam Medis Pasien Rawat Inap`,

  standarIgd: `**Persyaratan Pelayanan:**
- **Pasien Umum**: KTP/kartu identitas
- **Pasien JKN**: KTP/kartu identitas, Surat Rujukan/Surat Pengantar (bila bukan kasus gawat darurat)

**Prosedur Pelayanan:**
1. Pasien datang ke IGD, keluarga menuju tempat pendaftaran dengan menunjukkan persyaratan yang diperlukan
2. Dokter jaga IGD melakukan triase dibantu tenaga paramedis
3. Petugas melakukan asesmen awal IGD
4. Pemeriksaan penunjang (laboratorium & radiologi) dilakukan bila diperlukan
5. Dokter mendiagnosa, memberikan tindakan pengobatan, dan melakukan observasi
6. Pasien dipindahkan ke rawat inap/rawat jalan/ruang tindakan/dirujuk/pulang atas permintaan sendiri
   - Bila kamar rawat inap belum tersedia, pasien ditempatkan di ruang transit
   - Bila pasien meninggal dunia, dipindahkan ke ruang jenazah
7. Dokter meresepkan obat, keluarga mengambil di depo farmasi
8. Pasien melakukan pembayaran di kasir
9. Pasien pulang

**Sistem Triase IGD — Siapa yang Didahulukan?**
Semua pasien pasti dilayani, namun yang paling gawat akan ditolong lebih dulu. Berikut 5 level triase yang digunakan:

- **Level 1 — Sangat Gawat Darurat** (harus segera ditangani): henti jantung, henti napas, perdarahan hebat, tidak sadar/koma
- **Level 2 — Gawat Darurat** (≤ 15 menit): nyeri dada, trauma kepala dengan penurunan kesadaran, sesak berat
- **Level 3 — Darurat** (≤ 30 menit, butuh cepat tapi bisa tunggu sebentar): demam tinggi pada anak, luka dengan perdarahan terkendali, nyeri tanpa tanda syok, kecelakaan kerja
- **Level 4 — Tidak Darurat** (≤ 60 menit, kondisi masih stabil): nyeri kronis tanpa defisit neurologis, sakit tenggorokan, luka ringan tanpa perdarahan
- **Level 5 — Tidak Mendesak** (≤ 120 menit, keluhan ringan): resep ulang obat, kontrol rutin, batuk pilek, luka lecet

*"Bukan pilih kasih, tapi menyelamatkan nyawa. Mohon pengertian bila harus menunggu."*

**Jangka Waktu Pelayanan:**
Buka **24 jam**
- Pendaftaran: 15 menit
- Triase: < 5 menit
- Pemeriksaan dokter: 10–15 menit
- Pemeriksaan penunjang (bila diperlukan): 30–60 menit
- Tindakan pengobatan: 30–60 menit

**Biaya Pelayanan:**
Sesuai Perda Kabupaten Lumajang No. 9 Tahun 2025 tentang Pajak Daerah dan Retribusi Daerah
- Konsultasi dokter umum di rawat jalan/IGD: **Rp 22.500**
- Asuhan Keperawatan/Kebidanan — Partial care: Rp 20.000, Total care: Rp 40.000, Intensif: Rp 60.000
- Biaya obat dan BHHP tindakan pengobatan disesuaikan dengan kebutuhan terapi pasien
- Pelayanan pasien BPJS Kesehatan dilayani sesuai ketentuan yang berlaku tanpa biaya tambahan/gratis

**Produk Pelayanan:**
Pelayanan Gawat Darurat dengan **respon time < 5 menit**, terhitung sejak pasien datang sampai dilakukan pemeriksaan oleh dokter, perawat, atau bidan.`,

  standarIcu: `**Persyaratan Pelayanan:**
Pasien dengan indikasi medis rawat ICU sesuai kriteria:
- **Prioritas 1 (Tertinggi)**: Pasien kritis, tidak stabil, dan sangat membutuhkan terapi intensif (ventilator, obat vasoaktif, dll). Contoh: syok septik, gagal napas, koma
- **Prioritas 2**: Pasien yang memerlukan pemantauan ketat dan berpotensi membutuhkan terapi intensif segera. Contoh: riwayat penyakit jantung berat atau gangguan paru yang membutuhkan observasi
- **Prioritas 3**: Pasien kritis/sakit berat dengan peluang sembuh kecil karena penyakit penyerta kronis yang sudah parah, dirawat untuk mengatasi kegawatan akut tanpa tindakan ekstrem seperti CPR bila terjadi henti jantung

**Prosedur Pelayanan:**
1. Pasien yang akan masuk ICU disetujui oleh DPJP dan dokter Anestesi sebagai penanggung jawab
2. Perawat IGD/bangsal menghubungi perawat ICU terkait pasien yang akan dirawat
3. Bila tempat tersedia, perawat ICU mempersiapkan tempat dan alat sesuai kebutuhan monitoring dan tindakan
4. Pasien mendapat pelayanan intensif oleh petugas
5. Setelah pelayanan intensif, pasien dapat pindah ruangan, meninggal, pulang sembuh, APS, atau dirujuk ke RS lain
6. Bila pasien membaik dan acc KRS dr.Sp.A, dilakukan proses pembayaran di kasir
7. Bila pasien tidak membaik (APS, Rujuk, Meninggal), dilakukan proses pembayaran di kasir

**Jangka Waktu Pelayanan:**
Pelayanan ICU diberikan secara cepat, tepat, dan berfokus pada pasien, dengan jangka waktu berbeda-beda sesuai kondisi pasien dan kriteria eksklusif pelayanan ICU.

**Biaya Pelayanan:**
Sesuai Perda Kabupaten Lumajang No. 9 Tahun 2025 tentang Pajak Daerah dan Retribusi Daerah. Beberapa rincian tarif:
- Akomodasi rawat ICU: Rp 255.000/hari
- Visite dokter spesialis: Rp 75.000/visite
- Konsultasi dokter spesialis: Rp 35.000/konsultasi
- Visite dokter umum: Rp 40.000/visite
- Asuhan keperawatan ICU: Rp 60.000/hari
- Resusitasi Jantung Paru Otak: Rp 133.000/tindakan
- Pemasangan oksigen: Rp 14.850/tindakan
- Oksigen Nasal Canule / Simple Mask: Rp 141.075/12 jam
- Oksigen NRBM / Jackson Reese: Rp 141.075/6 jam
- Oksigen Ventilator / HFNC: Rp 519.750/6 jam
- Pemasangan EKG: Rp 74.250/tindakan
- Pemberian Nutrisi (Enteral/Parenteral): Rp 27.000/hari
- Pemeriksaan Lab khusus cepat (GDA): Rp 29.700/tindakan
- Tunjangan fungsi vital selama transportasi: Rp 59.400/tindakan
- Terapi Tertitrasi (syringe pump): Rp 33.000/tindakan
- Bed side monitor / Infus pump: Rp 33.000
- Ventilator: Rp 165.000
- Intubasi endo tracheal: Rp 383.600/tindakan
- Ekstubasi: Rp 168.600/tindakan
- Pelayanan pasien BPJS Kesehatan dilayani sesuai ketentuan yang berlaku tanpa biaya tambahan/gratis`,

  standarNeonatologi: `**Persyaratan Pelayanan:**
1. Bayi baru lahir dari IGD/VK/OK
2. Bayi sakit dari IGD/Poli Anak usia 0–28 hari
3. **Level I**: asuhan neonatus normal
4. **Level II**: asuhan neonatus dengan ketergantungan tinggi
5. **Level III**: asuhan neonatus intensif (NICU)
6. TTD persetujuan Rawat Inap

**Prosedur Pelayanan:**
- Bayi baru lahir (Level 1, 2, 3) dari IGD/VK/OK, atau bayi usia 0–28 hari (Level 2 & 3) dari IGD/Poli Anak, didaftarkan ke admisi rawat inap
- Pasien dengan pembiayaan Umum/BPJS/SKTM memenuhi persyaratan dan menandatangani persetujuan rawat inap
- Bayi baru lahir langsung masuk ruang perawatan Neonatologi/NICU
- Bayi usia 0–28 hari dari IGD/Poli Anak, setelah pemeriksaan penunjang (Lab & Radiologi) dan persetujuan dokter Sp.A, masuk ke ruang perawatan Neonatologi/NICU
- Bila bayi membaik dan acc KRS dr.Sp.A, dilakukan proses pembayaran di kasir
- Bila bayi tidak membaik (APS, Rujuk, Meninggal), dilakukan proses pembayaran di kasir
- Pasien pulang

**Jangka Waktu Pelayanan:**
- **Bayi Rawat Gabung**: observasi 6 jam di Ruang Neonatologi
- **Level I**: 1–2 hari, setelah observasi 24 jam sejak lahir
- **Level II**: 3–4 hari, tergantung kondisi pasien
- **Level III**: jangka waktu berbeda-beda tergantung kondisi pasien (NICU)

**Biaya Pelayanan:**
Sesuai Perda Kabupaten Lumajang No. 9 Tahun 2025 tentang Pajak Daerah dan Retribusi Daerah, mengacu tarif SIMRS Khanza. Beberapa rincian tarif:
- Resusitasi BBL: Rp 103.950
- Suction slim: Rp 59.400
- Perawatan tali pusat: Rp 22.275
- Asuhan Keperawatan Intensif: Rp 60.000
- Asuhan Keperawatan Total Care: Rp 40.000
- Asuhan Gizi/kali kunjungan: Rp 20.000
- Injeksi Intramuscular/Intravena: Rp 21.600
- Pasang Infus: Rp 40.500 · Lepas Infus: Rp 24.300
- Infant warmer / Incubator: Rp 61.600
- Gda stik: Rp 29.700
- Oksigen nasal 3 jam: Rp 14.850 · 6 jam: Rp 35.000 · 12 jam: Rp 70.000
- Oksigen masker/masker rebreathing 6 jam: Rp 141.500
- Oksigen ventilator 6 jam: Rp 519.750
- CPAP: Rp 110.000
- Infusion pump / Syringe pump / Bedside monitor: Rp 33.000
- Observasi pasien gawat: Rp 59.400
- Pasang OGT: Rp 35.100 · Lepas OGT: Rp 14.850
- Pengambilan sampel darah vena: Rp 32.400
- Resusitasi Jantung Paru Otak: Rp 133.000
- Nebulizer: Rp 21.600
- Ventilator: Rp 165.000
- Pelayanan pasien BPJS Kesehatan dilayani sesuai ketentuan yang berlaku tanpa biaya tambahan/gratis

**Produk Pelayanan:**
- Bayi baru lahir (RG, Level I, II, dan III)
- Bayi sakit usia 0–28 hari`,

  standarPengaduan: `Jika pasien menemukan pelayanan yang tidak sesuai standar, dapat menyampaikan melalui:

**Langsung / Onsite**
- Kotak Saran: tersedia di area IGD, Rawat Jalan, dan Rawat Inap

**WhatsApp / SMS / Telepon**
- 085143407352 (kontak pengaduan resmi)
- (0334) 5761044 (telepon kantor)

**Online & Media Sosial**
- Website: **rsudpasirian.lumajangkab.go.id**
- Email: **rsud.pasirian@gmail.com**
- Google Review: RSUD Pasirian
- Instagram: **@rsud_pasirian**
- Facebook: **Rsud Pasirian Lumajang**
- TikTok: **@rsud_pasirian**
- YouTube: **@rsudpasirianlumajang**

**Koordinator Pengaduan**
Reni Puspita Sari, S.KM

**Survei Kepuasan Masyarakat (SKM) Online:**
Kami sangat menghargai penilaian dan masukan Anda terhadap pelayanan kami. Silakan isi Survei Kepuasan Masyarakat secara online melalui tautan berikut, mencakup layanan IGD, Rawat Jalan, Rawat Inap, Kamar Operasi, Pendaftaran, ICU, Neonatologi, Radiologi, Farmasi, Pemulasaraan Jenazah, Gizi, Laboratorium, Unit Pencucian dan Sterilisasi, Ambulance, hingga Transfusi/Donor Darah:

[📊 Isi Survei Kepuasan Masyarakat (SKM)](https://skm.go.id/share/instansi/9eb408d7-7a3e-4d5d-921d-ca3005d258b2/2)

*"Punya keluhan, kritik, atau saran? Suara Anda adalah kunci perbaikan layanan kami. Jangan ragu menyampaikannya agar kami dapat melayani Anda lebih baik lagi."*`,

  standarKompensasi: `**Kompensasi Ketidaksesuaian Standar Pelayanan (Komponen Service Delivery)**
Nomor: 400.7.1/520/427.52.02/2026

Apabila Bapak/Ibu mengalami ketidaksesuaian pelayanan dari komponen Service Delivery berikut, RSUD Pasirian akan memberikan kompensasi sesuai ketentuan di bawah ini:

**1. Persyaratan Pelayanan**
*Bentuk Ketidaksesuaian/Maladministrasi:* Petugas meminta persyaratan tambahan yang tidak relevan atau di luar ketentuan Standar Pelayanan yang telah dipublikasikan.

*Bentuk Kompensasi:*
1. Penyampaian permohonan maaf secara lisan dan tertulis dari Pimpinan Unit Pelayanan
2. Pelayanan tetap diproses secara langsung tanpa menuntut pengguna melengkapi syarat tambahan tersebut
3. Pemberian akses "Jalur Prioritas" (Fast Track) bagi pengguna layanan untuk permohonan layanan saat ini atau layanan berikutnya

**2. Sistem, Mekanisme, dan Prosedur**
*Bentuk Ketidaksesuaian/Maladministrasi:* Prosedur berbelit-belit, tidak sesuai SOP, atau pengguna layanan dipingpong antar meja/loket pelayanan.

*Bentuk Kompensasi:*
1. Penyampaian permohonan maaf langsung dari petugas dan penyelia layanan
2. Penyediaan petugas pendamping khusus yang akan mengurusakan seluruh proses dokumen pengguna layanan hingga tuntas tanpa pengguna perlu berpindah loket

**3. Jangka Waktu Penyelesaian**
*Bentuk Ketidaksesuaian/Maladministrasi:* Waktu penyelesaian layanan melebihi batas waktu (SLA) yang dijanjikan dalam Standar Pelayanan.

*Bentuk Kompensasi:*
1. Penyampaian permohonan maaf disertai penjelasan alasan keterlambatan kepada pengguna layanan

**4. Biaya / Tarif**
*Bentuk Ketidaksesuaian/Maladministrasi:* Ketidaksesuaian Biaya Pelayanan (petugas memungut biaya di luar ketentuan tarif resmi / Pungli).

*Bentuk Kompensasi:*
1. Penyampaian permohonan maaf secara resmi dan tindakan tegas kepada oknum petugas
2. Pengembalian biaya sepenuhnya (100%) kepada pengguna layanan

**5. Produk Pelayanan**
*Bentuk Ketidaksesuaian/Maladministrasi:* Terdapat kesalahan teknis/cacat pada produk layanan yang diterbitkan (contoh: salah ketik nama, spesifikasi dokumen keliru, buram).

*Bentuk Kompensasi:*
1. Penyampaian permohonan maaf atas kelalaian petugas dalam proses verifikasi
2. Pencetakan/penerbitan ulang produk layanan yang benar secara instan saat itu juga (on the spot)

**Catatan:** Jika Bapak/Ibu mengalami salah satu ketidaksesuaian di atas, silakan segera laporkan ke bagian Humas atau Manajemen RSUD Pasirian agar kompensasi dapat segera diproses.`,
};

const STANDAR_KATEGORI = [
  { contentKey: 'standarPendaftaran', label: 'Pelayanan Pendaftaran Pasien Rawat Jalan' },
  { contentKey: 'standarPendaftaranRawatInap', label: 'Pelayanan Pendaftaran Pasien Rawat Inap' },
  { contentKey: 'standarIgd', label: 'Pelayanan Gawat Darurat (IGD)' },
  { contentKey: 'standarIcu', label: 'Pelayanan Ruang Intensif (ICU)' },
  { contentKey: 'standarNeonatologi', label: 'Pelayanan Unit Neonatologi' },
  { contentKey: 'standarPengaduan', label: 'Penanganan Pengaduan, Saran, dan Masukan' },
  { contentKey: 'standarKompensasi', label: 'Kompensasi Ketidaksesuaian Standar Pelayanan' },
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

  const handlePoliSelect = (namaPoli) => {
    sendMessage(`Jadwal dan dokter untuk ${namaPoli}`, `Mencari jadwal ${namaPoli}...`, namaPoli);
  };

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
        setMessages((prev) => [...prev, { role: 'assistant', content: items[0].content }]);
      } else {
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

  const handleInfoLayananSelect = (item) => {
    if (isLoading) return;
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: item.title },
      { role: 'assistant', content: item.content },
    ]);
  };

  const handleShowStandarPelayanan = () => {
    if (isLoading) return;

    setMessages((prev) => [
      ...prev,
      { role: 'user', content: 'Standar Pelayanan Publik' },
      { role: 'assistant', type: 'standar-buttons', content: STATIC_CONTENT.standarIntro },
    ]);
  };

  const handleStandarSelect = (contentKey, label) => {
    if (isLoading) return;

    setMessages((prev) => [
      ...prev,
      { role: 'user', content: label },
      { role: 'assistant', content: STATIC_CONTENT[contentKey] },
    ]);
  };

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