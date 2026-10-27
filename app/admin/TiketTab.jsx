'use client';

import { useCallback, useEffect, useState } from 'react';
import { TickCircle, Lock1, Star1, Notification, Timer1, Ticket, DocumentText, ArrowRight2, ArrowLeft2, ArrowSwapHorizontal, NoteText, Trash, Send2, Danger, Book1, Refresh2 } from 'iconsax-react';
import {
  JENIS_TIKET,
  KATEGORI_TIKET,
  STATUS_TIKET,
  STATUS_URUTAN,
  samarkanWa,
  formatTanggalTiket,
  kategoriKbDari,
} from '@/lib/tiket-constants';
// Semua data lewat lapisan ini (mock / API asli). Lihat lib/tiket-api.js & docs/kontrak-api-tiket.md
import {
  SUMBER_DATA,
  ambilDaftarTiket,
  ambilDetailTiket,
  mulaiProsesTiket,
  selesaikanTiket,
  tambahCatatanTiket,
  hapusCatatanTiket,
} from '@/lib/tiket-api';

const PER_HALAMAN = 10;

const GAYA_RIWAYAT = {
  dibuat: { Ikon: DocumentText, warna: '#0B2B24' },
  status: { Ikon: ArrowSwapHorizontal, warna: '#C08829' },
  catatan: { Ikon: NoteText, warna: '#5B6B66' },
  hapus_catatan: { Ikon: Trash, warna: '#9E3B32' },
  selesai: { Ikon: TickCircle, warna: '#1F6B4F' },
  wa_terkirim: { Ikon: Send2, warna: '#1F6B4F' },
  wa_gagal: { Ikon: Danger, warna: '#9E3B32' },
  rating: { Ikon: Star1, warna: '#C08829' },
  kb_diperbarui: { Ikon: Book1, warna: '#0B2B24' },
};

function RiwayatPenanganan({ riwayat }) {
  const urut = [...riwayat].reverse(); // terbaru di atas
  return (
    <ol className="space-y-0">
      {urut.map((r, i) => {
        const g = GAYA_RIWAYAT[r.tipe] || GAYA_RIWAYAT.status;
        const terakhir = i === urut.length - 1;
        return (
          <li key={i} className="relative flex gap-3 pb-5 last:pb-0">
            {!terakhir && <span className="absolute left-4 top-9 bottom-1 w-px -translate-x-1/2 bg-[#0B2B24]/12" aria-hidden="true" />}
            <span
              className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: `${g.warna}17`, color: g.warna }}
            >
              <g.Ikon size={16} variant="Bold" color="currentColor" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <p className="flex flex-wrap items-center gap-2 text-[13px] font-semibold leading-snug">
                {r.aksi}
                {i === 0 && (
                  <span className="rounded-md bg-[#0B2B24] px-1.5 py-0.5 text-[10.5px] font-semibold text-white">Terbaru</span>
                )}
              </p>
              {r.sub && <p className="text-[12.5px] text-[#0B2B24]/70">{r.sub}</p>}
              <p className="mt-0.5 text-[11.5px] text-[#0B2B24]/45">
                {r.oleh} · {formatTanggalTiket(r.waktu, true)}
              </p>
            </div>
          </li>
        );
      })}
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
      className="inline-flex items-center rounded-md px-2.5 py-1 text-[12px] font-semibold whitespace-nowrap"
      style={{ color: s.color, backgroundColor: `${s.bg}17` }}
    >
      {s.label}
    </span>
  );
}

function JenisLabel({ jenis }) {
  const j = JENIS_TIKET[jenis];
  if (!j) return null;
  return <span className="text-[12.5px] font-semibold whitespace-nowrap text-[#0B2B24]">{j.label}</span>;
}

// Tile seragam untuk semua baris: penanda "ini tiket". Status & jenis dibaca dari kolomnya sendiri.
function TileTiket() {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#C08829]/12 text-[#A0701C]">
      <DocumentText size={18} variant="Bulk" color="currentColor" aria-hidden="true" />
    </span>
  );
}

function Bintang({ nilai }) {
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`${nilai} dari 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star1 key={i} size={18} variant="Bold" color={i <= nilai ? '#C08829' : 'rgba(11,43,36,0.15)'} aria-hidden="true" />
      ))}
    </span>
  );
}

function KartuRingkasan({ label, nilai, sub, warna, Ikon }) {
  return (
    <div className="bg-white rounded-2xl border border-[#0B2B24]/8 px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[13px] font-semibold text-[#0B2B24]/75">{label}</span>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white" style={{ backgroundColor: warna }}>
          <Ikon size={18} variant="Bold" color="currentColor" aria-hidden="true" />
        </span>
      </div>
      <div className="mt-2 font-(family-name:--font-fraunces) text-[30px] font-semibold leading-tight tabular-nums">{nilai}</div>
      {sub && <div className="mt-1 text-[11.5px] text-[#0B2B24]/50">{sub}</div>}
    </div>
  );
}

function CatatanItem({ catatan, bisaHapus, onHapus, sibuk }) {
  const [konfirmasi, setKonfirmasi] = useState(false);
  return (
    <li
      className={`group rounded-r-xl border-l-[3px] px-3.5 py-2.5 text-[13px] transition ${
        konfirmasi ? 'border-[#9E3B32] bg-[#9E3B32]/[0.06]' : 'border-[#0B2B24]/20 bg-[#0B2B24]/[0.045]'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="whitespace-pre-line break-words">{catatan.isi}</p>
          <p className="mt-1 text-[11.5px] text-[#0B2B24]/45">
            {catatan.oleh} · {formatTanggalTiket(catatan.waktu, true)}
          </p>
        </div>
        {bisaHapus && !konfirmasi && (
          <button
            onClick={() => setKonfirmasi(true)}
            aria-label="Hapus catatan"
            title="Hapus catatan"
            className="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#0B2B24]/40 transition hover:bg-[#9E3B32]/10 hover:text-[#9E3B32] focus-visible:text-[#9E3B32]"
          >
            <Trash size={16} color="currentColor" aria-hidden="true" />
          </button>
        )}
      </div>
      {konfirmasi && (
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-[#9E3B32]/15 pt-2.5">
          <span className="text-[12.5px] font-medium text-[#9E3B32]">Hapus catatan ini?</span>
          <div className="flex gap-2">
            <button
              onClick={() => setKonfirmasi(false)}
              className="rounded-full px-3 py-1 text-[12px] font-semibold text-[#0B2B24]/65 hover:bg-[#0B2B24]/5"
            >
              Batal
            </button>
            <button
              onClick={onHapus}
              disabled={sibuk}
              autoFocus
              className="rounded-full bg-[#9E3B32] px-3 py-1 text-[12px] font-semibold text-white hover:bg-[#842f28]"
            >
              Hapus
            </button>
          </div>
        </div>
      )}
    </li>
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
                {lewat ? <TickCircle size={20} variant="Bold" color="currentColor" aria-hidden="true" /> : i + 1}
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

function KonfirmasiSelesai({ tiket, ringkasan, onBatal, onLanjut, sibuk }) {
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
          <button
            onClick={onLanjut}
            disabled={sibuk}
            className="rounded-full bg-[#1F6B4F] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#0B2B24] disabled:opacity-60"
          >
            {sibuk ? 'Menyimpan…' : 'Ya, tandai selesai'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailTiket({ tiket, onTutup, onAksi, sibuk, onPerbaruiKB }) {
  const [catatanBaru, setCatatanBaru] = useState('');
  const [ringkasan, setRingkasan] = useState(tiket.ringkasan_penyelesaian || '');
  const [konfirmasi, setKonfirmasi] = useState(false);
  const terkunci = tiket.status === 'selesai';
  const ringkasanCukup = ringkasan.trim().length >= MIN_RINGKASAN;

  async function tambahCatatan() {
    const isi = catatanBaru.trim();
    if (!isi) return;
    if (await onAksi('tambahCatatan', isi)) setCatatanBaru('');
  }

  async function tandaiSelesai() {
    await onAksi('selesaikan', ringkasan.trim());
    setKonfirmasi(false);
  }

  useEffect(() => {
    const sebelumnya = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = sebelumnya; };
  }, []);

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
                {tiket.catatan_internal.map((c) => (
                  <CatatanItem
                    key={c.id}
                    catatan={c}
                    bisaHapus={!terkunci}
                    sibuk={sibuk}
                    onHapus={() => onAksi('hapusCatatan', c.id)}
                  />
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
                      disabled={sibuk}
                      className="rounded-full bg-[#0B2B24] px-4 py-1.5 text-[12.5px] font-semibold text-white hover:bg-[#153b31] transition disabled:opacity-60"
                    >
                      {sibuk ? 'Menyimpan…' : 'Tambah catatan'}
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
                  onClick={() => onAksi('mulaiProses')}
                  disabled={sibuk}
                  className="rounded-full bg-[#C08829] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#A0701C] disabled:opacity-60"
                >
                  {sibuk ? 'Menyimpan…' : 'Mulai proses'}
                </button>
              </div>
            )}
            {tiket.status === 'diproses' && (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[13px] text-[#0B2B24]/65">Isi ringkasan penyelesaian, lalu tandai selesai.</p>
                <button
                  onClick={() => setKonfirmasi(true)}
                  disabled={!ringkasanCukup || sibuk}
                  className="rounded-full bg-[#1F6B4F] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#0B2B24] disabled:opacity-40 disabled:hover:bg-[#1F6B4F]"
                >
                  Tandai selesai
                </button>
              </div>
            )}
            {terkunci && (
              <p className="flex items-center gap-2 text-[13px] text-[#0B2B24]/65">
                <Lock1 size={18} variant="Bulk" color="#1F6B4F" aria-hidden="true" />
                Tiket sudah selesai dan dikunci. Status tidak bisa diubah lagi.
              </p>
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
          sibuk={sibuk}
        />
      )}
    </div>
  );
}

function BarisSkeleton() {
  return (
    <tr aria-hidden="true">
      <td className="px-5 py-4" colSpan={6}>
        <div className="flex items-center gap-3 animate-pulse">
          <span className="h-9 w-9 rounded-lg bg-[#0B2B24]/8" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 rounded bg-[#0B2B24]/8" />
            <div className="h-2.5 w-1/5 rounded bg-[#0B2B24]/6" />
          </div>
          <div className="hidden lg:block h-3 w-1/4 rounded bg-[#0B2B24]/6" />
          <div className="h-6 w-16 rounded-md bg-[#0B2B24]/8" />
        </div>
      </td>
    </tr>
  );
}

function PanelSementara({ judul, children, onTutup }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#0B2B24]/40" onClick={onTutup}>
      <aside className="h-full w-full max-w-xl overflow-y-auto bg-[#FBF9F4] shadow-2xl" onClick={(e) => e.stopPropagation()} aria-busy="true">
        <div className="sticky top-0 z-20 bg-[#0B2B24] px-6 py-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-white/50">Detail Tiket</p>
            <h3 className="mt-1 font-(family-name:--font-fraunces) text-[19px] font-semibold text-white">{judul}</h3>
          </div>
          <button onClick={onTutup} className="rounded-full border border-white/25 px-3 py-1.5 text-[12.5px] font-semibold text-white/90 hover:bg-white/10">
            Tutup
          </button>
        </div>
        <div className="px-6 py-6">{children}</div>
      </aside>
    </div>
  );
}

const AKSI = {
  mulaiProses: { fn: (n) => mulaiProsesTiket(n), pesan: 'Status diubah menjadi Diproses.' },
  selesaikan: { fn: (n, x) => selesaikanTiket(n, x), pesan: 'Tiket selesai. Notifikasi WhatsApp dikirim ke pengguna.' },
  tambahCatatan: { fn: (n, x) => tambahCatatanTiket(n, x), pesan: 'Catatan internal ditambahkan.' },
  hapusCatatan: { fn: (n, x) => hapusCatatanTiket(n, x), pesan: 'Catatan internal dihapus.' },
};

export default function TiketTab({ onPerbaruiKB }) {
  // --- filter & halaman ---
  const [cari, setCari] = useState('');
  const [cariAktif, setCariAktif] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [halaman, setHalaman] = useState(1);

  // --- data daftar ---
  const [daftar, setDaftar] = useState([]);
  const [total, setTotal] = useState(0);
  const [ringkasan, setRingkasan] = useState(null);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState('');
  const [versi, setVersi] = useState(0); // naikkan untuk memuat ulang

  // --- detail ---
  const [nomorDipilih, setNomorDipilih] = useState(null);
  const [detail, setDetail] = useState(null);
  const [galatDetail, setGalatDetail] = useState('');
  const [versiDetail, setVersiDetail] = useState(0);
  const [sibuk, setSibuk] = useState(false);

  // --- notifikasi kecil ---
  const [pesan, setPesan] = useState(null); // { teks, galat }

  useEffect(() => {
    if (!pesan) return;
    const id = setTimeout(() => setPesan(null), 3500);
    return () => clearTimeout(id);
  }, [pesan]);

  // Tunggu 300 ms setelah berhenti mengetik baru mencari
  useEffect(() => {
    const id = setTimeout(() => { setCariAktif(cari.trim()); setHalaman(1); }, 300);
    return () => clearTimeout(id);
  }, [cari]);

  useEffect(() => {
    let batal = false;
    setMemuat(true);
    setGalat('');
    ambilDaftarTiket({
      status: filterStatus, jenis: filterJenis, kategori: filterKategori, cari: cariAktif,
      halaman, per_halaman: PER_HALAMAN,
    })
      .then((r) => {
        if (batal) return;
        setDaftar(r.data);
        setTotal(r.total);
        setRingkasan(r.ringkasan);
      })
      .catch((e) => { if (!batal) setGalat(e.message); })
      .finally(() => { if (!batal) setMemuat(false); });
    return () => { batal = true; };
  }, [filterStatus, filterJenis, filterKategori, cariAktif, halaman, versi]);

  useEffect(() => {
    if (!nomorDipilih) { setDetail(null); return; }
    let batal = false;
    setGalatDetail('');
    ambilDetailTiket(nomorDipilih)
      .then((d) => { if (!batal) setDetail(d); })
      .catch((e) => { if (!batal) setGalatDetail(e.message); });
    return () => { batal = true; };
  }, [nomorDipilih, versiDetail]);

  const tutupDetail = useCallback(() => { setNomorDipilih(null); setDetail(null); }, []);

  // Menjalankan aksi di panel detail. Mengembalikan true kalau berhasil.
  async function jalankanAksi(nama, nilai) {
    setSibuk(true);
    try {
      const d = await AKSI[nama].fn(nomorDipilih, nilai);
      setDetail(d);
      setVersi((v) => v + 1);
      setPesan({ teks: AKSI[nama].pesan });
      return true;
    } catch (e) {
      setPesan({ teks: e.message, galat: true });
      return false;
    } finally {
      setSibuk(false);
    }
  }

  const totalHalaman = Math.max(1, Math.ceil(total / PER_HALAMAN));
  const halamanAman = Math.min(halaman, totalHalaman);
  const adaFilter = cari || filterJenis || filterKategori || filterStatus;

  function ubah(setter) {
    return (e) => { setter(e.target.value); setHalaman(1); };
  }

  function resetFilter() {
    setCari(''); setCariAktif(''); setFilterJenis(''); setFilterKategori(''); setFilterStatus(''); setHalaman(1);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-(family-name:--font-fraunces) text-[22px] font-semibold">Tindak Lanjut Informasi</h2>
        <p className="mt-1 text-[13px] text-[#0B2B24]/55">
          Permintaan dan pengaduan informasi dari pengguna.
          {SUMBER_DATA === 'mock' && <span className="ml-1 font-medium text-[#A0701C]">Mode data contoh — perubahan hilang saat halaman di-refresh.</span>}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KartuRingkasan label="Tiket baru" nilai={ringkasan?.baru ?? '–'} sub="belum ditangani" warna={STATUS_TIKET.baru.bg} Ikon={Notification} />
        <KartuRingkasan label="Diproses" nilai={ringkasan?.diproses ?? '–'} sub="sedang ditindaklanjuti" warna={STATUS_TIKET.diproses.bg} Ikon={Timer1} />
        <KartuRingkasan label="Selesai" nilai={ringkasan?.selesai ?? '–'} sub="pengguna sudah dikabari" warna={STATUS_TIKET.selesai.bg} Ikon={TickCircle} />
        <KartuRingkasan
          label="Rata-rata rating"
          nilai={ringkasan?.rata ? ringkasan.rata.toFixed(1) : '–'}
          sub={ringkasan ? `dari ${ringkasan.jumlahDinilai} penilaian` : 'memuat…'}
          warna="#0B2B24"
          Ikon={Star1}
        />
      </div>

      <section className="bg-white rounded-2xl border border-[#0B2B24]/8">
        <div className="px-5 pt-5">
          <h3 className="flex items-center gap-2 text-[17px] font-semibold">
            <Ticket size={22} variant="Bulk" color="#C08829" aria-hidden="true" />
            {galat ? 'Tiket' : memuat && !ringkasan ? 'Memuat tiket…' : `${total} Tiket${adaFilter ? ' ditemukan' : ''}`}
          </h3>
          <p className="mt-0.5 text-[12.5px] text-[#0B2B24]/55">Kelola dan pantau tindak lanjut permintaan serta pengaduan informasi.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-3 lg:items-center px-5 py-4">
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
              {STATUS_URUTAN.map((st) => <option key={st} value={st}>{STATUS_TIKET[st].label}</option>)}
            </select>
          </div>
          {adaFilter && (
            <button onClick={resetFilter} className="text-[12.5px] font-semibold text-[#C08829] hover:underline whitespace-nowrap">
              Reset filter
            </button>
          )}
        </div>

        {galat ? (
          <div className="px-6 py-14 text-center border-t border-[#0B2B24]/6" role="alert">
            <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#9E3B32]/10 text-[#9E3B32]">
              <Danger size={22} variant="Bulk" color="currentColor" aria-hidden="true" />
            </span>
            <p className="font-semibold">Daftar tiket gagal dimuat</p>
            <p className="mt-1 text-[13px] text-[#0B2B24]/55">{galat}</p>
            <button
              onClick={() => setVersi((v) => v + 1)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#0B2B24] px-4 py-1.5 text-[12.5px] font-semibold hover:bg-[#0B2B24] hover:text-white transition"
            >
              <Refresh2 size={15} color="currentColor" aria-hidden="true" /> Coba lagi
            </button>
          </div>
        ) : memuat && daftar.length === 0 ? (
          <table className="w-full border-t border-[#0B2B24]/8" aria-label="Memuat daftar tiket">
            <tbody className="divide-y divide-[#0B2B24]/6">
              {Array.from({ length: 5 }, (_, i) => <BarisSkeleton key={i} />)}
            </tbody>
          </table>
        ) : daftar.length === 0 ? (
          <div className="px-6 py-14 text-center border-t border-[#0B2B24]/6">
            <p className="font-semibold">{adaFilter ? 'Tidak ada tiket yang cocok.' : 'Belum ada tiket masuk.'}</p>
            <p className="mt-1 text-[13px] text-[#0B2B24]/50">
              {adaFilter ? 'Coba ubah kata kunci atau filter.' : 'Tiket dari formulir Tindak Lanjut Informasi akan muncul di sini.'}
            </p>
          </div>
        ) : (
          <>
            <table className={`hidden md:table w-full table-fixed text-left text-[13px] transition-opacity ${memuat ? 'opacity-50' : ''}`} aria-busy={memuat}>
              <colgroup>
                <col className="w-[25%]" />
                <col className="w-[14%]" />
                <col className="w-[28%]" />
                <col className="w-[14%]" />
                <col className="w-[10%]" />
                <col className="w-[9%]" />
              </colgroup>
              <thead className="text-[12.5px] font-semibold text-[#0B2B24]">
                <tr className="border-y border-[#0B2B24]/8">
                  <th className="px-5 py-3">Tiket</th>
                  <th className="px-4 py-3">Jenis</th>
                  <th className="px-4 py-3">Deskripsi</th>
                  <th className="px-4 py-3">Pelapor</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3"><span className="sr-only">Aksi</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0B2B24]/6">
                {daftar.map((t) => (
                  <tr
                    key={t.nomor_tiket}
                    onClick={() => setNomorDipilih(t.nomor_tiket)}
                    className="group cursor-pointer hover:bg-[#FBF9F4] transition"
                  >
                    <td className="px-5 py-3.5 align-middle">
                      <div className="flex items-center gap-3">
                        <TileTiket />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[13.5px]">{t.kategori}</p>
                          <p className="truncate text-[12px] text-[#0B2B24]/50">{t.nomor_tiket}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      <p className="text-[#0B2B24]/80">{JENIS_TIKET[t.jenis]?.label.replace(' Informasi', '')}</p>
                      <p className="text-[12px] text-[#0B2B24]/50">{formatTanggalTiket(t.created_at)}</p>
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      <p className="line-clamp-2 text-[#0B2B24]/75">{t.deskripsi}</p>
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      <p className="truncate font-medium">{t.nama || <span className="italic font-normal text-[#0B2B24]/45">Tanpa nama</span>}</p>
                      <p className="text-[12px] text-[#0B2B24]/50 tabular-nums">{samarkanWa(t.no_wa)}</p>
                    </td>
                    <td className="px-4 py-3.5 align-middle"><StatusBadge status={t.status} /></td>
                    <td className="px-4 py-3.5 align-middle">
                      <span className="inline-flex items-center gap-1 rounded-lg border border-[#0B2B24]/12 px-2.5 py-1.5 text-[12.5px] font-semibold text-[#0B2B24]/80 group-hover:border-[#0B2B24]/30">
                        Detail
                        <ArrowRight2 size={14} color="currentColor" aria-hidden="true" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <ul className="md:hidden divide-y divide-[#0B2B24]/6 border-t border-[#0B2B24]/8">
              {daftar.map((t) => (
                <li key={t.nomor_tiket}>
                  <button onClick={() => setNomorDipilih(t.nomor_tiket)} className="w-full text-left px-4 py-4 hover:bg-[#FBF9F4]">
                    <div className="flex items-start gap-3">
                      <TileTiket />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-[13.5px]">{t.kategori}</p>
                            <p className="text-[12px] text-[#0B2B24]/50">{t.nomor_tiket}</p>
                          </div>
                          <StatusBadge status={t.status} />
                        </div>
                        <p className="mt-1.5 line-clamp-2 text-[13px] text-[#0B2B24]/75">{t.deskripsi}</p>
                        <p className="mt-1 text-[12px] text-[#0B2B24]/50">
                          {JENIS_TIKET[t.jenis]?.label} · {formatTanggalTiket(t.created_at)}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {!galat && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#0B2B24]/8 px-5 py-4 text-[12.5px]">
          <span className="text-[#0B2B24]/55">
            {total === 0
              ? '0 tiket'
              : `Menampilkan ${(halamanAman - 1) * PER_HALAMAN + 1}–${Math.min(halamanAman * PER_HALAMAN, total)} dari ${total} tiket`}
          </span>
          <nav className="flex items-center gap-1.5" aria-label="Halaman">
            <button
              onClick={() => setHalaman(halamanAman - 1)}
              disabled={halamanAman <= 1}
              aria-label="Halaman sebelumnya"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#0B2B24]/12 hover:bg-[#FBF9F4] disabled:opacity-30"
            >
              <ArrowLeft2 size={16} color="currentColor" aria-hidden="true" />
            </button>
            {Array.from({ length: totalHalaman }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setHalaman(n)}
                aria-current={n === halamanAman ? 'page' : undefined}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-semibold tabular-nums transition ${
                  n === halamanAman ? 'bg-[#0B2B24] text-white' : 'border border-[#0B2B24]/12 text-[#0B2B24]/70 hover:bg-[#FBF9F4]'
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setHalaman(halamanAman + 1)}
              disabled={halamanAman >= totalHalaman}
              aria-label="Halaman berikutnya"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#0B2B24]/12 hover:bg-[#FBF9F4] disabled:opacity-30"
            >
              <ArrowRight2 size={16} color="currentColor" aria-hidden="true" />
            </button>
          </nav>
        </div>
        )}
      </section>

      {nomorDipilih && detail?.nomor_tiket === nomorDipilih ? (
        <DetailTiket
          key={detail.nomor_tiket}
          tiket={detail}
          onTutup={tutupDetail}
          onAksi={jalankanAksi}
          sibuk={sibuk}
          onPerbaruiKB={onPerbaruiKB}
        />
      ) : nomorDipilih ? (
        <PanelSementara judul={nomorDipilih} onTutup={tutupDetail}>
          {galatDetail ? (
            <div className="text-center py-10" role="alert">
              <p className="font-semibold">Detail tiket gagal dimuat</p>
              <p className="mt-1 text-[13px] text-[#0B2B24]/55">{galatDetail}</p>
              <button
                onClick={() => setVersiDetail((v) => v + 1)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#0B2B24] px-4 py-1.5 text-[12.5px] font-semibold hover:bg-[#0B2B24] hover:text-white transition"
              >
                <Refresh2 size={15} color="currentColor" aria-hidden="true" /> Coba lagi
              </button>
            </div>
          ) : (
            <div className="space-y-4 animate-pulse" aria-label="Memuat detail tiket">
              <div className="h-24 rounded-xl bg-[#0B2B24]/6" />
              <div className="h-4 w-1/3 rounded bg-[#0B2B24]/8" />
              <div className="h-20 rounded-xl bg-[#0B2B24]/6" />
              <div className="h-4 w-1/4 rounded bg-[#0B2B24]/8" />
              <div className="h-16 rounded-xl bg-[#0B2B24]/6" />
            </div>
          )}
        </PanelSementara>
      ) : null}

      {pesan && (
        <div
          role="status"
          className={`fixed bottom-6 z-[70] max-w-[90vw] rounded-full px-5 py-3 text-[13px] font-medium text-white shadow-xl ${
            pesan.galat ? 'bg-[#9E3B32]' : 'bg-[#0B2B24]'
          } ${nomorDipilih ? 'right-6 sm:right-72 sm:translate-x-1/2' : 'left-1/2 -translate-x-1/2'}`}
        >
          {pesan.teks}
        </div>
      )}
    </div>
  );
}
