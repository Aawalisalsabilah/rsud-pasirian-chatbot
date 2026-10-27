'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  JENIS_TIKET,
  KATEGORI_TIKET,
  STATUS_TIKET,
  STATUS_URUTAN,
  samarkanWa,
  formatTanggalTiket,
} from '@/lib/tiket-constants';
// SEMENTARA: data contoh. Ganti dengan fetch('/api/admin/tiket') kalau API Tasya sudah jadi.
import { TIKET_MOCK } from '@/lib/tiket-mock';

const PER_HALAMAN = 10;

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

function DetailTiket({ tiket, onTutup }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onTutup();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onTutup]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#0B2B24]/40" onClick={onTutup}>
      <aside
        className="h-full w-full max-w-xl overflow-y-auto bg-[#FBF9F4] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="judul-detail-tiket"
      >
        <div className="sticky top-0 bg-[#0B2B24] px-6 py-5 flex items-start justify-between gap-4">
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
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={tiket.status} />
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
            <h4 className="text-[12px] font-semibold text-[#0B2B24]/55 mb-2">Deskripsi laporan</h4>
            <p className="whitespace-pre-line rounded-xl border border-[#0B2B24]/8 bg-white p-4 text-[13.5px] leading-relaxed">
              {tiket.deskripsi}
            </p>
          </section>

          <section>
            <h4 className="text-[12px] font-semibold text-[#0B2B24]/55 mb-2">Catatan internal (hanya admin)</h4>
            {tiket.catatan_internal.length === 0 ? (
              <p className="text-[13px] text-[#0B2B24]/45 italic">Belum ada catatan.</p>
            ) : (
              <ul className="space-y-2">
                {tiket.catatan_internal.map((c, i) => (
                  <li key={i} className="rounded-xl bg-white border border-[#0B2B24]/8 p-3 text-[13px]">
                    <p>{c.isi}</p>
                    <p className="mt-1 text-[11.5px] text-[#0B2B24]/45">
                      {c.oleh} · {formatTanggalTiket(c.waktu, true)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h4 className="text-[12px] font-semibold text-[#0B2B24]/55 mb-2">Ringkasan penyelesaian (dikirim ke pengguna via WA)</h4>
            {tiket.ringkasan_penyelesaian ? (
              <p className="rounded-xl border border-[#1F6B4F]/20 bg-[#1F6B4F]/5 p-4 text-[13.5px] leading-relaxed">
                {tiket.ringkasan_penyelesaian}
              </p>
            ) : (
              <p className="text-[13px] text-[#0B2B24]/45 italic">Belum diisi.</p>
            )}
          </section>

          {tiket.status === 'selesai' && (
            <section>
              <h4 className="text-[12px] font-semibold text-[#0B2B24]/55 mb-2">Penilaian pengguna</h4>
              {tiket.rating ? (
                <div className="rounded-xl bg-white border border-[#0B2B24]/8 p-4 text-[13.5px]">
                  <Bintang nilai={tiket.rating} />
                  {tiket.komentar && <p className="mt-2">“{tiket.komentar}”</p>}
                </div>
              ) : (
                <p className="text-[13px] text-[#0B2B24]/45 italic">Pengguna belum memberi penilaian.</p>
              )}
            </section>
          )}

          <p className="rounded-xl border border-dashed border-[#C08829]/50 bg-[#C08829]/5 p-4 text-[12.5px] text-[#0B2B24]/70">
            Ubah status, tambah catatan, dan tombol &ldquo;Perbarui knowledge base&rdquo; akan ditambahkan di tahap berikutnya (B08 &amp; B09).
          </p>
        </div>
      </aside>
    </div>
  );
}

export default function TiketTab() {
  const [semuaTiket] = useState(TIKET_MOCK);
  const [cari, setCari] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [halaman, setHalaman] = useState(1);
  const [dipilih, setDipilih] = useState(null);

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
                    onClick={() => setDipilih(t)}
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
                  <button onClick={() => setDipilih(t)} className="w-full text-left px-4 py-4 hover:bg-[#FBF9F4]">
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

      {dipilih && <DetailTiket tiket={dipilih} onTutup={() => setDipilih(null)} />}
    </div>
  );
}
