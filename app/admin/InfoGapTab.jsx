'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  KATEGORI_TIKET,
  ALASAN_GAP,
  STATUS_GAP,
  kategoriKbDari,
  formatTanggalTiket,
} from '@/lib/tiket-constants';
// SEMENTARA: data contoh. Ganti dengan fetch ke API information gap (B06) kalau sudah ada.
import { INFOGAP_MOCK } from '@/lib/infogap-mock';

const PER_HALAMAN = 10;

const selectBase =
  'h-10 rounded-xl border border-[#0B2B24]/12 bg-white px-3 text-[13px] font-medium text-[#0B2B24] focus:outline-none focus:ring-2 focus:ring-[#C08829]/40';

function Badge({ label, color }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold whitespace-nowrap"
      style={{ color, backgroundColor: `${color}1A` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
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
      <div className="mt-1.5 font-(family-name:--font-fraunces) text-[28px] font-semibold leading-none tabular-nums">{nilai}</div>
      {sub && <div className="mt-1.5 text-[11.5px] text-[#0B2B24]/45">{sub}</div>}
    </div>
  );
}

export default function InfoGapTab({ onPerbaruiKB }) {
  const [semuaGap, setSemuaGap] = useState(() => INFOGAP_MOCK.map((g) => ({ ...g })));
  const [cari, setCari] = useState('');
  const [filterAlasan, setFilterAlasan] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [filterStatus, setFilterStatus] = useState('belum_ditinjau');
  const [urut, setUrut] = useState('jumlah');
  const [halaman, setHalaman] = useState(1);
  const [pesan, setPesan] = useState('');

  useEffect(() => {
    if (!pesan) return;
    const id = setTimeout(() => setPesan(''), 3500);
    return () => clearTimeout(id);
  }, [pesan]);

  const ringkasan = useMemo(() => {
    const aktif = semuaGap.filter((g) => g.status !== 'diabaikan');
    const perKategori = {};
    aktif.forEach((g) => { perKategori[g.kategori] = (perKategori[g.kategori] || 0) + g.jumlah; });
    const daftarKategori = Object.entries(perKategori).sort((a, b) => b[1] - a[1]);
    return {
      total: aktif.length,
      belum: semuaGap.filter((g) => g.status === 'belum_ditinjau').length,
      kemunculan: aktif.reduce((a, g) => a + g.jumlah, 0),
      punyaTiket: aktif.filter((g) => g.nomor_tiket).length,
      daftarKategori,
      maks: daftarKategori[0]?.[1] || 1,
    };
  }, [semuaGap]);

  const hasil = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return semuaGap
      .filter((g) => !q || g.pertanyaan.toLowerCase().includes(q))
      .filter((g) => !filterAlasan || g.alasan === filterAlasan)
      .filter((g) => !filterKategori || g.kategori === filterKategori)
      .filter((g) => !filterStatus || g.status === filterStatus)
      .sort((a, b) =>
        urut === 'jumlah'
          ? b.jumlah - a.jumlah
          : new Date(b.terakhir_muncul) - new Date(a.terakhir_muncul)
      );
  }, [semuaGap, cari, filterAlasan, filterKategori, filterStatus, urut]);

  const totalHalaman = Math.max(1, Math.ceil(hasil.length / PER_HALAMAN));
  const halamanAman = Math.min(halaman, totalHalaman);
  const tampil = hasil.slice((halamanAman - 1) * PER_HALAMAN, halamanAman * PER_HALAMAN);

  function ubah(setter) {
    return (e) => { setter(e.target.value); setHalaman(1); };
  }

  // Nanti diganti PATCH ke API information gap.
  function ubahStatus(id, status) {
    setSemuaGap((daftar) => daftar.map((g) => (g.id === id ? { ...g, status } : g)));
    setPesan(`Ditandai: ${STATUS_GAP[status].label}.`);
  }

  function perbaruiKB(g) {
    onPerbaruiKB?.({
      kategori: kategoriKbDari(g.kategori),
      judul: '',
      konten: '',
      konteks: `Information gap ${g.id} (${g.jumlah}× ditanyakan): "${g.pertanyaan}"`,
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-(family-name:--font-fraunces) text-[22px] font-semibold">Information Gap</h2>
        <p className="mt-1 text-[13px] text-[#0B2B24]/55 max-w-3xl">
          Pertanyaan pengguna yang tidak terjawab atau dijawab kurang memadai oleh chatbot. Daftar ini terpisah dari
          tiket dan tidak otomatis menjadi tiket. Data saat ini masih data contoh.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KartuRingkasan label="Belum ditinjau" nilai={ringkasan.belum} warna={STATUS_GAP.belum_ditinjau.color} />
        <KartuRingkasan label="Total gap aktif" nilai={ringkasan.total} sub="tidak termasuk yang diabaikan" warna="#0B2B24" />
        <KartuRingkasan label="Total kemunculan" nilai={ringkasan.kemunculan} sub="jumlah pertanyaan serupa" warna="#C08829" />
        <KartuRingkasan label="Sudah punya tiket" nilai={ringkasan.punyaTiket} sub={`dari ${ringkasan.total} gap aktif`} warna="#1F6B4F" />
      </div>

      <div className="bg-white rounded-2xl border border-[#0B2B24]/8 px-5 py-4">
        <p className="text-[12px] font-semibold text-[#0B2B24]/55 mb-3">Kemunculan per kategori</p>
        <ul className="space-y-2">
          {ringkasan.daftarKategori.map(([kat, n]) => (
            <li key={kat} className="grid grid-cols-[140px_1fr_36px] sm:grid-cols-[180px_1fr_40px] items-center gap-3 text-[12.5px]">
              <button
                onClick={() => { setFilterKategori(kat); setHalaman(1); }}
                className="text-left font-medium truncate hover:text-[#C08829]"
                title={`Filter kategori ${kat}`}
              >
                {kat}
              </button>
              <div className="h-2.5 rounded-full bg-[#0B2B24]/6 overflow-hidden">
                <div className="h-full rounded-full bg-[#C08829]" style={{ width: `${(n / ringkasan.maks) * 100}%` }} />
              </div>
              <span className="text-right tabular-nums text-[#0B2B24]/60">{n}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-2xl border border-[#0B2B24]/8 p-4 flex flex-col lg:flex-row gap-3 lg:items-center">
        <input
          type="search"
          value={cari}
          onChange={ubah(setCari)}
          placeholder="Cari isi pertanyaan"
          aria-label="Cari pertanyaan"
          className={`${selectBase} lg:flex-1 placeholder:text-[#0B2B24]/35`}
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:flex">
          <select value={filterStatus} onChange={ubah(setFilterStatus)} aria-label="Filter status tinjau" className={selectBase}>
            <option value="">Semua status</option>
            {Object.entries(STATUS_GAP).map(([v, s]) => <option key={v} value={v}>{s.label}</option>)}
          </select>
          <select value={filterAlasan} onChange={ubah(setFilterAlasan)} aria-label="Filter alasan" className={selectBase}>
            <option value="">Semua alasan</option>
            {Object.entries(ALASAN_GAP).map(([v, a]) => <option key={v} value={v}>{a.label}</option>)}
          </select>
          <select value={filterKategori} onChange={ubah(setFilterKategori)} aria-label="Filter kategori" className={selectBase}>
            <option value="">Semua kategori</option>
            {KATEGORI_TIKET.map((k) => <option key={k.value} value={k.value}>{k.value}</option>)}
          </select>
          <select value={urut} onChange={ubah(setUrut)} aria-label="Urutkan" className={selectBase}>
            <option value="jumlah">Paling sering</option>
            <option value="terbaru">Terakhir muncul</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#0B2B24]/8 overflow-hidden">
        {tampil.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="font-semibold">Tidak ada information gap yang cocok.</p>
            <p className="mt-1 text-[13px] text-[#0B2B24]/50">Coba ubah kata kunci atau filter.</p>
          </div>
        ) : (
          <ul className="divide-y divide-[#0B2B24]/6">
            {tampil.map((g) => (
              <li key={g.id} className="px-5 py-4 flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex items-baseline gap-1 md:w-16 shrink-0">
                  <span className="font-(family-name:--font-fraunces) text-[22px] font-semibold tabular-nums">{g.jumlah}</span>
                  <span className="text-[11.5px] text-[#0B2B24]/45">×</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium">&ldquo;{g.pertanyaan}&rdquo;</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px]">
                    <Badge label={ALASAN_GAP[g.alasan].label} color={ALASAN_GAP[g.alasan].color} />
                    <Badge label={STATUS_GAP[g.status].label} color={STATUS_GAP[g.status].color} />
                    <span className="text-[#0B2B24]/55">{g.kategori}</span>
                    <span className="text-[#0B2B24]/35">·</span>
                    <span className="text-[#0B2B24]/55">Terakhir {formatTanggalTiket(g.terakhir_muncul, true)}</span>
                    {g.nomor_tiket && (
                      <span className="inline-flex items-center rounded-full border border-[#1F6B4F]/30 px-2.5 py-0.5 text-[11.5px] font-semibold text-[#1F6B4F]">
                        Ada tiket {g.nomor_tiket}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 md:justify-end shrink-0">
                  {g.status !== 'ditinjau' && (
                    <button
                      onClick={() => ubahStatus(g.id, 'ditinjau')}
                      className="rounded-full border border-[#0B2B24]/15 px-3 py-1.5 text-[12px] font-semibold hover:bg-[#FBF9F4]"
                    >
                      Tandai ditinjau
                    </button>
                  )}
                  {g.status === 'belum_ditinjau' && (
                    <button
                      onClick={() => ubahStatus(g.id, 'diabaikan')}
                      className="rounded-full px-3 py-1.5 text-[12px] font-semibold text-[#0B2B24]/55 hover:bg-[#FBF9F4]"
                    >
                      Abaikan
                    </button>
                  )}
                  {g.status !== 'diabaikan' && (
                    <button
                      onClick={() => perbaruiKB(g)}
                      className="rounded-full bg-[#0B2B24] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#153b31]"
                    >
                      Perbarui knowledge base
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-[#0B2B24]/8 px-5 py-3 text-[12.5px]">
          <span className="text-[#0B2B24]/55">
            {hasil.length === 0
              ? '0 gap'
              : `${(halamanAman - 1) * PER_HALAMAN + 1}–${Math.min(halamanAman * PER_HALAMAN, hasil.length)} dari ${hasil.length} gap`}
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

      {pesan && (
        <div role="status" className="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-[#0B2B24] px-5 py-3 text-[13px] font-medium text-white shadow-xl">
          {pesan}
        </div>
      )}
    </div>
  );
}
