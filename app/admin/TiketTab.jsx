'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  JENIS_TIKET,
  KATEGORI_TIKET,
  STATUS_TIKET,
  STATUS_URUTAN,
  samarkanWa,
  formatTanggalTiket,
  kategoriKbDari,
} from '@/lib/tiket-constants';
// SEMENTARA: data contoh. Ganti dengan fetch('/api/admin/tiket') kalau API Tasya sudah jadi.
import { TIKET_MOCK } from '@/lib/tiket-mock';

const PER_HALAMAN = 10;

// Riwayat awal disusun dari data contoh. Nanti riwayat asli datang dari API Tasya.
function buatRiwayatAwal(t) {
  const r = [{ aksi: 'Tiket dibuat oleh pengguna', oleh: 'Sistem', waktu: t.created_at }];
  const waktuCatatan = t.catatan_internal.map((c) => c.waktu);
  if (t.status !== 'baru') {
    r.push({ aksi: 'Status diubah: Baru → Diproses', oleh: 'Admin', waktu: waktuCatatan[0] || t.updated_at });
  }
  t.catatan_internal.forEach((c) => r.push({ aksi: 'Catatan internal ditambahkan', oleh: c.oleh, waktu: c.waktu }));
  if (t.status === 'selesai') {
    r.push({ aksi: 'Status diubah: Diproses → Selesai, notifikasi WhatsApp dikirim', oleh: 'Admin', waktu: t.updated_at });
  }
  return r.sort((a, b) => new Date(a.waktu) - new Date(b.waktu));
}

function RiwayatPenanganan({ riwayat }) {
  return (
    <ol className="relative ml-1.5 border-l border-[#0B2B24]/12">
      {[...riwayat].reverse().map((r, i) => (
        <li key={i} className="relative pl-5 pb-4 last:pb-0">
          <span
            className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-[#FBF9F4] ${i === 0 ? 'bg-[#C08829]' : 'bg-[#0B2B24]/25'}`}
          />
          <p className="text-[13px] font-medium">{r.aksi}</p>
          <p className="text-[11.5px] text-[#0B2B24]/45">
            {r.oleh} · {formatTanggalTiket(r.waktu, true)}
          </p>
        </li>
      ))}
    </ol>
  );
}

const selectBase =
  'h-10 rounded-xl border border-[#0B2B24]/12 bg-white px-3 text-[13px] font-medium text-[#0B2B24] focus:outline-none focus:ring-2 focus:ring-[#C08829]/40';

function StatusBadge({ status }) {
  const s = STATUS_TIKET[status];
  if (!s) return null;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold whitespace-nowrap"
      style={{ color: s.color, backgroundColor: `${s.bg}1A` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.bg }} />
      {s.label}
    </span>
  );
}

function JenisLabel({ jenis }) {
  const j = JENIS_TIKET[jenis];
  if (!j) return null;
  return (
    <span className="text-[12px] font-semibold whitespace-nowrap" style={{ color: j.color }}>
      {j.label}
    </span>
  );
}

function Bintang({ nilai }) {
  return (
    <span className="text-[#C08829] tracking-[0.1em]" aria-label={`${nilai} dari 5`}>
      {'★'.repeat(nilai)}
      <span className="text-[#0B2B24]/15">{'★'.repeat(5 - nilai)}</span>
    </span>
  );
}

function KartuRingkasan({ label, nilai, sub, warna }) {
  return (
    <div className="bg-white rounded-2xl border border-[#0B2B24]/8 px-5 py-4">
      <div className="flex items-center gap-2 text-[12px] font-semibold text-[#0B2B24]/55">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: warna }} />
        {label}
      </div>
      <div className="mt-1.5 font-(family-name:--font-fraunces) text-[28px] font-semibold leading-none">{nilai}</div>
      {sub && <div className="mt-1.5 text-[11.5px] text-[#0B2B24]/45">{sub}</div>}
    </div>
  );
}

const MIN_RINGKASAN = 20;

const HIJAU = '#1F6B4F';
const BRASS = '#C08829';
const GARIS_KOSONG = 'rgba(11,43,36,0.1)';

function AlurStatus({ status }) {
  const idx = STATUS_URUTAN.indexOf(status);
  const terakhir = STATUS_URUTAN.length - 1;
  return (
    <div className="rounded-xl border border-[#0B2B24]/8 bg-white px-3 pt-4 pb-3.5">
      <ol className="flex items-start" aria-label="Alur status tiket">
        {STATUS_URUTAN.map((s, i) => {
          const lewat = i < idx || (i === idx && i === terakhir);
          const sekarang = i === idx && !lewat;
          const warna = lewat ? HIJAU : sekarang ? BRASS : null;
          const keterangan = lewat ? 'Selesai' : sekarang ? 'Saat ini' : 'Menunggu';
          return (
            <li key={s} className="relative flex flex-1 flex-col items-center text-center" aria-current={i === idx ? 'step' : undefined}>
              {i > 0 && (
                <span
                  className="absolute left-0 right-1/2 top-[15px] h-[3px]"
                  style={{ backgroundColor: i <= idx ? HIJAU : GARIS_KOSONG }}
                />
              )}
              {i < terakhir && (
                <span
                  className="absolute left-1/2 right-0 top-[15px] h-[3px]"
                  style={{ backgroundColor: i < idx ? HIJAU : GARIS_KOSONG }}
                />
              )}
              <span
                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-bold transition ${
                  warna ? 'text-white' : 'border-2 border-[#0B2B24]/15 bg-white text-[#0B2B24]/40'
                }`}
                style={warna ? { backgroundColor: warna, boxShadow: sekarang ? `0 0 0 5px ${BRASS}2E` : undefined } : undefined}
              >
                {lewat ? '✓' : i + 1}
              </span>
              <span className={`mt-2 text-[12.5px] font-semibold ${i <= idx ? 'text-[#0B2B24]' : 'text-[#0B2B24]/40'}`}>
                {STATUS_TIKET[s].label}
              </span>
              <span className="text-[11px] font-medium" style={{ color: sekarang ? '#A0701C' : lewat ? HIJAU : 'rgba(11,43,36,0.4)' }}>
                {keterangan}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function KonfirmasiSelesai({ tiket, ringkasan, onBatal, onLanjut }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0B2B24]/50 p-4" onClick={onBatal}>
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="judul-konfirmasi-selesai"
      >
        <h3 id="judul-konfirmasi-selesai" className="font-(family-name:--font-fraunces) text-[18px] font-semibold">
          Tandai tiket sebagai selesai?
        </h3>
        <p className="mt-2 text-[13.5px] text-[#0B2B24]/70">
          Pengguna akan dikabari lewat WhatsApp ke <strong>+{tiket.no_wa}</strong>. Tindakan ini tidak bisa dibatalkan
          dan tiket akan dikunci.
        </p>
        <div className="mt-4 rounded-xl bg-[#1F6B4F]/5 border border-[#1F6B4F]/15 p-3 text-[13px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#1F6B4F]/80 mb-1">Pratinjau pesan</p>
          <p className="whitespace-pre-line text-[#0B2B24]/85">
            {`Halo${tiket.nama ? ` ${tiket.nama}` : ''}, tiket ${tiket.nomor_tiket} Anda telah selesai ditindaklanjuti.\n\n${ringkasan}`}
          </p>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onBatal} className="rounded-full border border-[#0B2B24]/15 px-4 py-2 text-[13px] font-semibold hover:bg-[#FBF9F4]">
            Batal
          </button>
          <button onClick={onLanjut} className="rounded-full bg-[#1F6B4F] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#0B2B24]">
            Ya, tandai selesai
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailTiket({ tiket, onTutup, onUbah, onPerbaruiKB }) {
  const [catatanBaru, setCatatanBaru] = useState('');
  const [ringkasan, setRingkasan] = useState(tiket.ringkasan_penyelesaian || '');
  const [konfirmasi, setKonfirmasi] = useState(false);
  const terkunci = tiket.status === 'selesai';
  const ringkasanCukup = ringkasan.trim().length >= MIN_RINGKASAN;

  function tambahCatatan() {
    const isi = catatanBaru.trim();
    if (!isi) return;
    onUbah({ catatan_internal: [...tiket.catatan_internal, { isi, oleh: 'Admin', waktu: new Date().toISOString() }] }, 'Catatan internal ditambahkan.');
    setCatatanBaru('');
  }

  function tandaiSelesai() {
    onUbah({ status: 'selesai', ringkasan_penyelesaian: ringkasan.trim() }, 'Tiket selesai. Notifikasi WhatsApp akan dikirim ke pengguna.');
    setKonfirmasi(false);
  }

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !konfirmasi && onTutup();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onTutup, konfirmasi]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#0B2B24]/40" onClick={onTutup}>
      <aside
        className="h-full w-full max-w-xl overflow-y-auto bg-[#FBF9F4] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="judul-detail-tiket"
      >
        <div className="sticky top-0 z-20 bg-[#0B2B24] px-6 py-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-white/50">Detail Tiket</p>
            <h3 id="judul-detail-tiket" className="mt-1 font-(family-name:--font-fraunces) text-[19px] font-semibold text-white">
              {tiket.nomor_tiket}
            </h3>
          </div>
          <button
            onClick={onTutup}
            className="rounded-full border border-white/25 px-3 py-1.5 text-[12.5px] font-semibold text-white/90 hover:bg-white/10"
          >
            Tutup
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          <AlurStatus status={tiket.status} />

          <div className="flex flex-wrap items-center gap-3">
            <JenisLabel jenis={tiket.jenis} />
            <span className="text-[12px] text-[#0B2B24]/50">· {tiket.kategori}</span>
          </div>

          <dl className="grid grid-cols-2 gap-4 text-[13px]">
            <div>
              <dt className="text-[11.5px] font-semibold text-[#0B2B24]/50">Pelapor</dt>
              <dd className="mt-0.5 font-medium">{tiket.nama || <span className="italic text-[#0B2B24]/45">Tanpa nama</span>}</dd>
            </div>
            <div>
              <dt className="text-[11.5px] font-semibold text-[#0B2B24]/50">WhatsApp</dt>
              <dd className="mt-0.5">
                <a
                  href={`https://wa.me/${tiket.no_wa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#1F6B4F] underline underline-offset-2 hover:text-[#0B2B24]"
                >
                  +{tiket.no_wa}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-[11.5px] font-semibold text-[#0B2B24]/50">Dibuat</dt>
              <dd className="mt-0.5">{formatTanggalTiket(tiket.created_at, true)}</dd>
            </div>
            <div>
              <dt className="text-[11.5px] font-semibold text-[#0B2B24]/50">Terakhir diperbarui</dt>
              <dd className="mt-0.5">{formatTanggalTiket(tiket.updated_at, true)}</dd>
            </div>
          </dl>

          <section>
            <h4 className="text-[13.5px] font-semibold text-[#0B2B24] mb-2">Deskripsi laporan</h4>
            <p className="whitespace-pre-line rounded-r-xl border-l-[3px] border-[#0B2B24]/20 bg-[#0B2B24]/[0.045] px-4 py-3 text-[13.5px] leading-relaxed">
              {tiket.deskripsi}
            </p>
          </section>

          <section>
            <h4 className="text-[13.5px] font-semibold text-[#0B2B24]">Catatan internal</h4>
            <p className="mb-2 text-[12px] text-[#0B2B24]/55">Hanya terlihat oleh admin, tidak dikirim ke pengguna.</p>
            {tiket.catatan_internal.length === 0 ? (
              <p className="text-[13px] text-[#0B2B24]/45 italic">Belum ada catatan.</p>
            ) : (
              <ul className="space-y-2">
                {tiket.catatan_internal.map((c, i) => (
                  <li key={i} className="rounded-r-xl border-l-[3px] border-[#0B2B24]/20 bg-[#0B2B24]/[0.045] px-3.5 py-2.5 text-[13px]">
                    <p>{c.isi}</p>
                    <p className="mt-1 text-[11.5px] text-[#0B2B24]/45">
                      {c.oleh} · {formatTanggalTiket(c.waktu, true)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            {!terkunci && (
              <div className="mt-3">
                <label htmlFor="catatan-baru" className="sr-only">Catatan internal baru</label>
                <textarea
                  id="catatan-baru"
                  value={catatanBaru}
                  onChange={(e) => setCatatanBaru(e.target.value)}
                  rows={2}
                  maxLength={500}
                  placeholder="Contoh: Sudah dikonfirmasi ke bagian poli anak."
                  className="w-full rounded-xl border-[1.5px] border-[#0B2B24]/40 bg-white px-3.5 py-3 text-[13.5px] text-[#0B2B24] shadow-[0_1px_3px_rgba(11,43,36,0.08)] placeholder:text-[#0B2B24]/50 hover:border-[#0B2B24]/60 focus:border-[#C08829] focus:outline-none focus:ring-4 focus:ring-[#C08829]/20 transition"
                />
                {catatanBaru.trim() && (
                  <div className="mt-2 flex justify-end gap-2">
                    <button
                      onClick={() => setCatatanBaru('')}
                      className="rounded-full px-4 py-1.5 text-[12.5px] font-semibold text-[#0B2B24]/60 hover:bg-[#0B2B24]/5 transition"
                    >
                      Batal
                    </button>
                    <button
                      onClick={tambahCatatan}
                      className="rounded-full bg-[#0B2B24] px-4 py-1.5 text-[12.5px] font-semibold text-white hover:bg-[#153b31] transition"
                    >
                      Tambah catatan
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>

          <section>
            <h4 className="text-[13.5px] font-semibold text-[#0B2B24]">Ringkasan penyelesaian</h4>
            <p className="mb-2 text-[12px] text-[#0B2B24]/55">Dikirim ke pengguna lewat WhatsApp saat tiket diselesaikan.</p>
            {terkunci ? (
              <p className="rounded-r-xl border-l-[3px] border-[#1F6B4F] bg-[#1F6B4F]/[0.07] px-4 py-3 text-[13.5px] leading-relaxed">
                {tiket.ringkasan_penyelesaian}
              </p>
            ) : tiket.status === 'baru' ? (
              <p className="text-[13px] text-[#0B2B24]/45 italic">Bisa diisi setelah tiket mulai diproses.</p>
            ) : (
              <>
                <label htmlFor="ringkasan" className="sr-only">Ringkasan penyelesaian</label>
                <textarea
                  id="ringkasan"
                  value={ringkasan}
                  onChange={(e) => setRingkasan(e.target.value)}
                  rows={4}
                  maxLength={1000}
                  placeholder="Contoh: Jadwal dokter anak yang benar adalah Senin–Jumat pukul 08.00–09.00. Informasi di chatbot sudah kami perbaiki."
                  className="w-full rounded-xl border-[1.5px] border-[#0B2B24]/40 bg-white px-3.5 py-3 text-[13.5px] text-[#0B2B24] shadow-[0_1px_3px_rgba(11,43,36,0.08)] placeholder:text-[#0B2B24]/50 hover:border-[#0B2B24]/60 focus:border-[#C08829] focus:outline-none focus:ring-4 focus:ring-[#C08829]/20 transition"
                />
                <div className="mt-1.5 flex justify-between gap-3 text-[11.5px]">
                  <span className={ringkasanCukup || !ringkasan.trim() ? 'text-[#0B2B24]/50' : 'text-[#A0701C] font-medium'}>
                    {ringkasanCukup
                      ? 'Siap dikirim.'
                      : ringkasan.trim()
                        ? `Tambah ${MIN_RINGKASAN - ringkasan.trim().length} karakter lagi.`
                        : `Minimal ${MIN_RINGKASAN} karakter.`}
                  </span>
                  <span className="tabular-nums text-[#0B2B24]/45">{ringkasan.trim().length}/1000</span>
                </div>
              </>
            )}
          </section>

          {tiket.status === 'selesai' && (
            <section>
              <h4 className="text-[13.5px] font-semibold text-[#0B2B24] mb-2">Penilaian pengguna</h4>
              {tiket.rating ? (
                <div className="rounded-r-xl border-l-[3px] border-[#0B2B24]/20 bg-[#0B2B24]/[0.045] px-4 py-3 text-[13.5px]">
                  <Bintang nilai={tiket.rating} />
                  {tiket.komentar && <p className="mt-2">“{tiket.komentar}”</p>}
                </div>
              ) : (
                <p className="text-[13px] text-[#0B2B24]/45 italic">Pengguna belum memberi penilaian.</p>
              )}
            </section>
          )}

          <section>
            <h4 className="text-[13.5px] font-semibold text-[#0B2B24] mb-3">Riwayat penanganan</h4>
            <RiwayatPenanganan riwayat={tiket.riwayat} />
          </section>

          <div className="rounded-xl border border-[#0B2B24]/8 bg-white p-4">
            {tiket.status === 'baru' && (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[13px] text-[#0B2B24]/65">Tiket belum ditangani.</p>
                <button
                  onClick={() => onUbah({ status: 'diproses' }, 'Status diubah menjadi Diproses.')}
                  className="rounded-full bg-[#C08829] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#A0701C]"
                >
                  Mulai proses
                </button>
              </div>
            )}
            {tiket.status === 'diproses' && (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[13px] text-[#0B2B24]/65">Isi ringkasan penyelesaian, lalu tandai selesai.</p>
                <button
                  onClick={() => setKonfirmasi(true)}
                  disabled={!ringkasanCukup}
                  className="rounded-full bg-[#1F6B4F] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#0B2B24] disabled:opacity-40 disabled:hover:bg-[#1F6B4F]"
                >
                  Tandai selesai
                </button>
              </div>
            )}
            {terkunci && (
              <p className="text-[13px] text-[#0B2B24]/65">🔒 Tiket sudah selesai dan dikunci. Status tidak bisa diubah lagi.</p>
            )}
          </div>

          {tiket.status !== 'baru' && onPerbaruiKB && (
            <div className="rounded-xl border border-[#0B2B24]/8 bg-white p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[13px] font-semibold">Perlu perbaikan informasi di chatbot?</p>
                <p className="text-[12px] text-[#0B2B24]/55">
                  Buka editor FAQ dengan kategori <strong>{kategoriKbDari(tiket.kategori)}</strong>. Simpan hanya informasi yang sudah diperiksa.
                </p>
              </div>
              <button
                onClick={() =>
                  onPerbaruiKB({
                    kategori: kategoriKbDari(tiket.kategori),
                    judul: '',
                    konten: tiket.ringkasan_penyelesaian || ringkasan.trim(),
                    konteks: `Tiket ${tiket.nomor_tiket} (${tiket.kategori}): "${tiket.deskripsi}"`,
                  })
                }
                className="rounded-full bg-[#0B2B24] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#153b31]"
              >
                Perbarui knowledge base
              </button>
            </div>
          )}
        </div>
      </aside>

      {konfirmasi && (
        <KonfirmasiSelesai
          tiket={tiket}
          ringkasan={ringkasan.trim()}
          onBatal={() => setKonfirmasi(false)}
          onLanjut={tandaiSelesai}
        />
      )}
    </div>
  );
}

export default function TiketTab({ onPerbaruiKB }) {
  // Salinan data contoh. Perubahan hanya tersimpan di memori: hilang saat halaman di-refresh.
  const [semuaTiket, setSemuaTiket] = useState(() => TIKET_MOCK.map((t) => ({ ...t, catatan_internal: [...t.catatan_internal], riwayat: buatRiwayatAwal(t) })));
  const [pesan, setPesan] = useState('');
  const [cari, setCari] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [halaman, setHalaman] = useState(1);
  const [nomorDipilih, setNomorDipilih] = useState(null);
  const dipilih = semuaTiket.find((t) => t.nomor_tiket === nomorDipilih) || null;

  useEffect(() => {
    if (!pesan) return;
    const id = setTimeout(() => setPesan(''), 3500);
    return () => clearTimeout(id);
  }, [pesan]);

  // Nanti diganti PATCH /api/admin/tiket/[nomor] dari Tasya.
  function ubahTiket(nomor, perubahan, info) {
    setSemuaTiket((daftar) =>
      daftar.map((t) => {
        if (t.nomor_tiket !== nomor) return t;
        if (t.status === 'selesai') return t; // tiket selesai dikunci
        if (perubahan.status && !STATUS_TIKET[t.status].next.includes(perubahan.status)) return t;
        const waktu = new Date().toISOString();
        const log = [];
        if (perubahan.status) {
          const teks = `Status diubah: ${STATUS_TIKET[t.status].label} → ${STATUS_TIKET[perubahan.status].label}`;
          log.push({ aksi: perubahan.status === 'selesai' ? `${teks}, notifikasi WhatsApp dikirim` : teks, oleh: 'Admin', waktu });
        }
        if (perubahan.catatan_internal) log.push({ aksi: 'Catatan internal ditambahkan', oleh: 'Admin', waktu });
        return { ...t, ...perubahan, riwayat: [...t.riwayat, ...log], updated_at: waktu };
      })
    );
    if (info) setPesan(info);
  }

  const ringkasan = useMemo(() => {
    const hitung = { baru: 0, diproses: 0, selesai: 0 };
    semuaTiket.forEach((t) => { hitung[t.status] = (hitung[t.status] || 0) + 1; });
    const dinilai = semuaTiket.filter((t) => t.rating);
    const rata = dinilai.length ? dinilai.reduce((a, t) => a + t.rating, 0) / dinilai.length : null;
    return { ...hitung, rata, jumlahDinilai: dinilai.length };
  }, [semuaTiket]);

  const hasil = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return semuaTiket
      .filter((t) => !q || t.nomor_tiket.toLowerCase().includes(q))
      .filter((t) => !filterJenis || t.jenis === filterJenis)
      .filter((t) => !filterKategori || t.kategori === filterKategori)
      .filter((t) => !filterStatus || t.status === filterStatus)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [semuaTiket, cari, filterJenis, filterKategori, filterStatus]);

  const totalHalaman = Math.max(1, Math.ceil(hasil.length / PER_HALAMAN));
  const halamanAman = Math.min(halaman, totalHalaman);
  const tampil = hasil.slice((halamanAman - 1) * PER_HALAMAN, halamanAman * PER_HALAMAN);
  const adaFilter = cari || filterJenis || filterKategori || filterStatus;

  function ubah(setter) {
    return (e) => { setter(e.target.value); setHalaman(1); };
  }

  function resetFilter() {
    setCari(''); setFilterJenis(''); setFilterKategori(''); setFilterStatus(''); setHalaman(1);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-(family-name:--font-fraunces) text-[22px] font-semibold">Tindak Lanjut Informasi</h2>
        <p className="mt-1 text-[13px] text-[#0B2B24]/55">
          Permintaan dan pengaduan informasi dari pengguna. Data saat ini masih data contoh.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KartuRingkasan label="Tiket baru" nilai={ringkasan.baru} warna={STATUS_TIKET.baru.bg} />
        <KartuRingkasan label="Diproses" nilai={ringkasan.diproses} warna={STATUS_TIKET.diproses.bg} />
        <KartuRingkasan label="Selesai" nilai={ringkasan.selesai} warna={STATUS_TIKET.selesai.bg} />
        <KartuRingkasan
          label="Rata-rata rating"
          nilai={ringkasan.rata ? ringkasan.rata.toFixed(1) : '-'}
          sub={`dari ${ringkasan.jumlahDinilai} penilaian`}
          warna="#C08829"
        />
      </div>

      <div className="bg-white rounded-2xl border border-[#0B2B24]/8 p-4 flex flex-col lg:flex-row gap-3 lg:items-center">
        <input
          type="search"
          value={cari}
          onChange={ubah(setCari)}
          placeholder="Cari nomor tiket, mis. TKT-20261027"
          aria-label="Cari nomor tiket"
          className={`${selectBase} lg:flex-1 placeholder:text-[#0B2B24]/35`}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:flex">
          <select value={filterJenis} onChange={ubah(setFilterJenis)} aria-label="Filter jenis" className={selectBase}>
            <option value="">Semua jenis</option>
            {Object.entries(JENIS_TIKET).map(([v, j]) => <option key={v} value={v}>{j.label}</option>)}
          </select>
          <select value={filterKategori} onChange={ubah(setFilterKategori)} aria-label="Filter kategori" className={selectBase}>
            <option value="">Semua kategori</option>
            {KATEGORI_TIKET.map((k) => <option key={k.value} value={k.value}>{k.value}</option>)}
          </select>
          <select value={filterStatus} onChange={ubah(setFilterStatus)} aria-label="Filter status" className={selectBase}>
            <option value="">Semua status</option>
            {STATUS_URUTAN.map((s) => <option key={s} value={s}>{STATUS_TIKET[s].label}</option>)}
          </select>
        </div>
        {adaFilter && (
          <button onClick={resetFilter} className="text-[12.5px] font-semibold text-[#C08829] hover:underline whitespace-nowrap">
            Reset filter
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#0B2B24]/8 overflow-hidden">
        {tampil.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="font-semibold">Tidak ada tiket yang cocok.</p>
            <p className="mt-1 text-[13px] text-[#0B2B24]/50">Coba ubah kata kunci atau filter.</p>
          </div>
        ) : (
          <>
            {/* Tabel untuk layar lebar */}
            <table className="hidden md:table w-full text-left text-[13px]">
              <thead className="bg-[#FBF9F4] text-[11.5px] font-semibold uppercase tracking-[0.05em] text-[#0B2B24]/50">
                <tr>
                  <th className="px-5 py-3">Nomor &amp; tanggal</th>
                  <th className="px-5 py-3">Jenis &amp; kategori</th>
                  <th className="px-5 py-3">Deskripsi</th>
                  <th className="px-5 py-3">Pelapor</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0B2B24]/6">
                {tampil.map((t) => (
                  <tr
                    key={t.nomor_tiket}
                    onClick={() => setNomorDipilih(t.nomor_tiket)}
                    className="cursor-pointer hover:bg-[#FBF9F4] transition"
                  >
                    <td className="px-5 py-4 align-top">
                      <div className="font-semibold whitespace-nowrap">{t.nomor_tiket}</div>
                      <div className="mt-0.5 text-[12px] text-[#0B2B24]/50">{formatTanggalTiket(t.created_at, true)}</div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <JenisLabel jenis={t.jenis} />
                      <div className="mt-0.5 text-[12px] text-[#0B2B24]/60">{t.kategori}</div>
                    </td>
                    <td className="px-5 py-4 align-top max-w-[320px]">
                      <p className="line-clamp-2 text-[#0B2B24]/80">{t.deskripsi}</p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="font-medium">{t.nama || <span className="italic text-[#0B2B24]/45">Tanpa nama</span>}</div>
                      <div className="mt-0.5 text-[12px] text-[#0B2B24]/50 tabular-nums">{samarkanWa(t.no_wa)}</div>
                    </td>
                    <td className="px-5 py-4 align-top"><StatusBadge status={t.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Kartu untuk HP */}
            <ul className="md:hidden divide-y divide-[#0B2B24]/6">
              {tampil.map((t) => (
                <li key={t.nomor_tiket}>
                  <button onClick={() => setNomorDipilih(t.nomor_tiket)} className="w-full text-left px-4 py-4 hover:bg-[#FBF9F4]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-[13.5px]">{t.nomor_tiket}</div>
                        <div className="text-[11.5px] text-[#0B2B24]/50">{formatTanggalTiket(t.created_at, true)}</div>
                      </div>
                      <StatusBadge status={t.status} />
                    </div>
                    <div className="mt-2"><JenisLabel jenis={t.jenis} /> <span className="text-[12px] text-[#0B2B24]/55">· {t.kategori}</span></div>
                    <p className="mt-1 line-clamp-2 text-[13px] text-[#0B2B24]/75">{t.deskripsi}</p>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-[#0B2B24]/8 px-5 py-3 text-[12.5px]">
          <span className="text-[#0B2B24]/55">
            {hasil.length === 0
              ? '0 tiket'
              : `${(halamanAman - 1) * PER_HALAMAN + 1}–${Math.min(halamanAman * PER_HALAMAN, hasil.length)} dari ${hasil.length} tiket`}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setHalaman(halamanAman - 1)}
              disabled={halamanAman <= 1}
              className="rounded-full border border-[#0B2B24]/15 px-3 py-1.5 font-semibold disabled:opacity-35 hover:bg-[#FBF9F4]"
            >
              Sebelumnya
            </button>
            <span className="tabular-nums text-[#0B2B24]/60">{halamanAman}/{totalHalaman}</span>
            <button
              onClick={() => setHalaman(halamanAman + 1)}
              disabled={halamanAman >= totalHalaman}
              className="rounded-full border border-[#0B2B24]/15 px-3 py-1.5 font-semibold disabled:opacity-35 hover:bg-[#FBF9F4]"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>

      {dipilih && (
        <DetailTiket
          key={dipilih.nomor_tiket}
          tiket={dipilih}
          onTutup={() => setNomorDipilih(null)}
          onUbah={(perubahan, info) => ubahTiket(dipilih.nomor_tiket, perubahan, info)}
          onPerbaruiKB={onPerbaruiKB}
        />
      )}

      {pesan && (
        <div role="status" className="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-[#0B2B24] px-5 py-3 text-[13px] font-medium text-white shadow-xl">
          {pesan}
        </div>
      )}
    </div>
  );
}
