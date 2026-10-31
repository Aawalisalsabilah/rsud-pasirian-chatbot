'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageQuestion, Repeat, Ticket, Flag, More, Danger, Refresh2 } from 'iconsax-react';
import {
  KATEGORI_TIKET,
  ALASAN_GAP,
  STATUS_GAP,
  kategoriKbDari,
  formatTanggalTiket,
} from '@/lib/tiket-constants';
// Semua data lewat lapisan ini (mock / API asli). Lihat lib/tiket-api.js & docs/kontrak-api-tiket.md
import { SUMBER_DATA, ambilDaftarGap, ubahStatusGap } from '@/lib/tiket-api';

const PER_HALAMAN = 10;

const selectBase =
  'h-10 rounded-xl border border-[#0B2B24]/12 bg-white px-3 text-[13px] font-medium text-[#0B2B24] focus:outline-none focus:ring-2 focus:ring-[#C08829]/40';

const ARSIR = (warna) =>
  `repeating-linear-gradient(135deg, ${warna} 0 3px, ${warna}B3 3px 6px)`;

// Ikon: Iconsax (vuesax) — https://iconsax.io
const IKON = { chat: MessageQuestion, ulang: Repeat, tiket: Ticket, bendera: Flag };

function Ikon({ nama, size = 18, variant = 'Linear', className = '' }) {
  const Komponen = IKON[nama];
  return <Komponen size={size} variant={variant} color="currentColor" className={className} aria-hidden="true" />;
}

function KartuRingkasan({ label, nilai, sub, warna, ikon, kecil }) {
  return (
    <div className="bg-white rounded-2xl border border-[#0B2B24]/8 px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[13px] font-semibold text-[#0B2B24]/75">{label}</span>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white" style={{ backgroundColor: warna }}>
          <Ikon nama={ikon} size={18} variant="Bold" />
        </span>
      </div>
      <div className={`mt-2 font-(family-name:--font-fraunces) font-semibold leading-tight tabular-nums truncate ${kecil ? 'text-[20px]' : 'text-[30px]'}`}>
        {nilai}
      </div>
      {sub && <div className="mt-1 text-[11.5px] text-[#0B2B24]/50">{sub}</div>}
    </div>
  );
}

// Menu aksi "⋯" — tutup otomatis saat klik di luar atau tekan Escape.
function MenuAksi({ label, items }) {
  const [buka, setBuka] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!buka) return;
    const tutup = (e) => { if (ref.current && !ref.current.contains(e.target)) setBuka(false); };
    const esc = (e) => e.key === 'Escape' && setBuka(false);
    document.addEventListener('mousedown', tutup);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', tutup);
      document.removeEventListener('keydown', esc);
    };
  }, [buka]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setBuka((b) => !b)}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={buka}
        className={`flex h-8 w-8 items-center justify-center rounded-lg border border-[#0B2B24]/12 bg-white text-[#0B2B24]/60 transition hover:border-[#0B2B24]/30 hover:text-[#0B2B24] ${buka ? 'border-[#C08829] text-[#0B2B24] ring-2 ring-[#C08829]/20' : ''}`}
      >
        <More size={16} color="currentColor" className="rotate-90" aria-hidden="true" />
      </button>
      {buka && (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-1 w-60 overflow-hidden rounded-xl border border-[#0B2B24]/10 bg-white py-1.5 shadow-[0_14px_34px_rgba(11,43,36,0.16)]"
        >
          {items.map((it) => (
            <button
              key={it.label}
              role="menuitem"
              onClick={() => { setBuka(false); it.onClick(); }}
              className="flex w-full flex-col items-start px-4 py-2.5 text-left hover:bg-[#FBF9F4]"
            >
              <span className={`text-[13px] font-semibold ${it.bahaya ? 'text-[#9E3B32]' : 'text-[#0B2B24]'}`}>{it.label}</span>
              {it.desc && <span className="text-[11.5px] text-[#0B2B24]/50">{it.desc}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const URUTAN_STATUS_GAP = ['belum_ditinjau', 'ditinjau', 'diabaikan'];

const RINGKASAN_KOSONG = {
  perStatus: { belum_ditinjau: 0, ditinjau: 0, diabaikan: 0 },
  total: 0, kemunculan: 0, punyaTiket: 0, daftarKategori: [], maks: 1, perAlasan: {},
};

export default function InfoGapTab({ onPerbaruiKB }) {
  const [tabStatus, setTabStatus] = useState('belum_ditinjau');
  const [cari, setCari] = useState('');
  const [cariAktif, setCariAktif] = useState('');
  const [filterAlasan, setFilterAlasan] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [urut, setUrut] = useState('jumlah');
  const [halaman, setHalaman] = useState(1);
  const [pesan, setPesan] = useState(null); // { teks, galat }

  const [daftar, setDaftar] = useState([]);
  const [totalHasil, setTotalHasil] = useState(0);
  const [ringkasan, setRingkasan] = useState(RINGKASAN_KOSONG);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState('');
  const [versi, setVersi] = useState(0);

  useEffect(() => {
    if (!pesan) return;
    const id = setTimeout(() => setPesan(null), 3500);
    return () => clearTimeout(id);
  }, [pesan]);

  useEffect(() => {
    const id = setTimeout(() => { setCariAktif(cari.trim()); setHalaman(1); }, 300);
    return () => clearTimeout(id);
  }, [cari]);

  useEffect(() => {
    let batal = false;
    setMemuat(true);
    setGalat('');
    ambilDaftarGap({
      status: tabStatus, kategori: filterKategori, alasan: filterAlasan, cari: cariAktif, urut,
      halaman, per_halaman: PER_HALAMAN,
    })
      .then((r) => {
        if (batal) return;
        setDaftar(r.data);
        setTotalHasil(r.total);
        setRingkasan(r.ringkasan);
      })
      .catch((e) => { if (!batal) setGalat(e.message); })
      .finally(() => { if (!batal) setMemuat(false); });
    return () => { batal = true; };
  }, [tabStatus, filterKategori, filterAlasan, cariAktif, urut, halaman, versi]);

  const totalHalaman = Math.max(1, Math.ceil(totalHasil / PER_HALAMAN));
  const halamanAman = Math.min(halaman, totalHalaman);
  const adaFilter = cari || filterAlasan || filterKategori;

  function ubah(setter) {
    return (e) => { setter(e.target.value); setHalaman(1); };
  }

  function resetFilter() {
    setCari(''); setCariAktif(''); setFilterAlasan(''); setFilterKategori(''); setHalaman(1);
  }

  async function pindahStatus(id, status) {
    try {
      await ubahStatusGap(id, status);
      setPesan({ teks: `Dipindahkan ke "${STATUS_GAP[status].label}".` });
      setVersi((v) => v + 1);
    } catch (e) {
      setPesan({ teks: e.message, galat: true });
    }
  }

  function perbaruiKB(g) {
    onPerbaruiKB?.({
      kategori: kategoriKbDari(g.kategori),
      judul: '',
      konten: '',
      konteks: `Information gap ${g.id} (ditanyakan ${g.jumlah} kali): "${g.pertanyaan}"`,
    });
  }

  function aksiUntuk(g) {
    const items = [];
    if (g.status !== 'diabaikan') {
      items.push({ label: 'Perbarui knowledge base', desc: 'Tambah jawaban ke FAQ chatbot', onClick: () => perbaruiKB(g) });
    }
    if (g.status === 'belum_ditinjau') {
      items.push({ label: 'Tandai sudah ditinjau', desc: 'Pindah ke tab Sudah ditinjau', onClick: () => pindahStatus(g.id, 'ditinjau') });
      items.push({ label: 'Abaikan', desc: 'Di luar layanan RSUD / tidak relevan', bahaya: true, onClick: () => pindahStatus(g.id, 'diabaikan') });
    } else {
      items.push({ label: 'Kembalikan ke Perlu ditinjau', onClick: () => pindahStatus(g.id, 'belum_ditinjau') });
    }
    return items;
  }

  const topik = ringkasan.daftarKategori[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-(family-name:--font-fraunces) text-[22px] font-semibold">Information Gap</h2>
        <p className="mt-1 text-[13px] text-[#0B2B24]/55 max-w-3xl">
          Pertanyaan pengguna yang belum bisa dijawab dengan baik oleh chatbot. Daftar ini terpisah dari tiket dan
          tidak otomatis menjadi tiket.
          {SUMBER_DATA === 'mock' && <span className="ml-1 font-medium text-[#A0701C]">Mode data contoh — perubahan hilang saat halaman di-refresh.</span>}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KartuRingkasan label="Pertanyaan unik" nilai={ringkasan.total} sub="tidak termasuk yang diabaikan" warna="#0B2B24" ikon="chat" />
        <KartuRingkasan label="Total ditanyakan" nilai={ringkasan.kemunculan} sub="kali oleh pengguna" warna="#C08829" ikon="ulang" />
        <KartuRingkasan label="Sudah punya tiket" nilai={ringkasan.punyaTiket} sub={`dari ${ringkasan.total} pertanyaan unik`} warna="#1F6B4F" ikon="tiket" />
        <KartuRingkasan label="Topik terbanyak" nilai={topik ? topik[0] : '-'} sub={topik ? `${topik[1].kali} kali ditanyakan` : ''} warna="#9E3B32" ikon="bendera" kecil />
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr]">
        <section className="bg-white rounded-2xl border border-[#0B2B24]/8 px-5 py-5">
          <h3 className="text-[15px] font-semibold">Topik paling sering tidak terjawab</h3>
          <p className="text-[12.5px] text-[#0B2B24]/55">Berapa kali pengguna bertanya, per kategori.</p>
          <ul className="mt-5 space-y-2" aria-label="Jumlah pertanyaan tidak terjawab per kategori">
            {ringkasan.daftarKategori.map(([kat, d], i) => {
              const utama = i === 0;
              const persen = (d.kali / ringkasan.maks) * 100;
              return (
                <li
                  key={kat}
                  className="group grid grid-cols-[120px_1fr] sm:grid-cols-[150px_1fr] items-center gap-3"
                  title={`${kat}: ${d.kali} kali ditanyakan, ${d.unik} pertanyaan unik`}
                >
                  <span className={`truncate text-[12.5px] ${utama ? 'font-semibold text-[#0B2B24]' : 'font-medium text-[#0B2B24]/70'}`}>{kat}</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-6 rounded-[4px] transition group-hover:opacity-85"
                      style={{
                        width: `calc((100% - 84px) * ${persen / 100})`,
                        minWidth: 6,
                        background: utama ? ARSIR('#C08829') : 'rgba(192,136,41,0.22)',
                      }}
                    />
                    {utama ? (
                      <span className="whitespace-nowrap rounded-md bg-white px-2 py-1 text-[12px] font-semibold shadow-[0_4px_14px_rgba(11,43,36,0.14)]">
                        <span className="mr-1.5 inline-block h-2 w-2 rounded-[2px] bg-[#C08829] align-middle" />
                        {d.kali} kali
                      </span>
                    ) : (
                      <span className="whitespace-nowrap text-[12px] tabular-nums text-[#0B2B24]/60">{d.kali} kali</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="bg-white rounded-2xl border border-[#0B2B24]/8 px-5 py-5 flex flex-col">
          <h3 className="text-[15px] font-semibold">Berdasarkan alasan</h3>
          <p className="text-[12.5px] text-[#0B2B24]/55">Kenapa chatbot belum bisa menjawab.</p>
          {(() => {
            const urutan = [
              { key: 'tidak_ditemukan', warna: '#2E8A66' },
              { key: 'tidak_memadai', warna: '#C08829' },
            ];
            const total = urutan.reduce((a, u) => a + (ringkasan.perAlasan[u.key]?.kali || 0), 0);
            return (
              <>
                <p className="mt-5 font-(family-name:--font-fraunces) text-[34px] font-semibold leading-none tabular-nums">
                  {total} <span className="text-[#0B2B24]/25">kali</span>
                </p>
                <div className="mt-4 flex h-7 gap-1" role="img" aria-label="Proporsi alasan">
                  {urutan.map((u) => {
                    const n = ringkasan.perAlasan[u.key]?.kali || 0;
                    return n ? (
                      <div
                        key={u.key}
                        className="h-full rounded-[4px]"
                        style={{ width: `${(n / (total || 1)) * 100}%`, background: ARSIR(u.warna) }}
                        title={`${ALASAN_GAP[u.key].label}: ${n} kali`}
                      />
                    ) : null;
                  })}
                </div>
                <dl className="mt-5 space-y-3.5">
                  {urutan.map((u) => {
                    const d = ringkasan.perAlasan[u.key] || { kali: 0, unik: 0 };
                    return (
                      <div key={u.key} className="flex items-start gap-2.5">
                        <span className="mt-[5px] h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: u.warna }} />
                        <div className="flex-1">
                          <dt className="text-[13px] font-semibold">
                            {ALASAN_GAP[u.key].label}{' '}
                            <span className="font-medium text-[#0B2B24]/50">({Math.round((d.kali / (total || 1)) * 100)}%)</span>
                          </dt>
                          <dd className="text-[12px] text-[#0B2B24]/55">{ALASAN_GAP[u.key].desc}</dd>
                        </div>
                      </div>
                    );
                  })}
                </dl>
              </>
            );
          })()}
        </section>
      </div>

      {/* Tanpa overflow-hidden supaya menu ⋯ tidak terpotong */}
      <section className="rounded-2xl border border-[#0B2B24]/8 bg-[#0B2B24]/[0.025] p-3 sm:p-4">
        <div className="px-1 pb-3">
          <h3 className="text-[15px] font-semibold">Daftar pertanyaan</h3>
          <p className="text-[12.5px] text-[#0B2B24]/55">Tinjau pertanyaan yang belum terjawab, lalu perbarui knowledge base bila perlu.</p>
        </div>
      <div className="bg-white rounded-xl border border-[#0B2B24]/8">
        <div role="tablist" aria-label="Status tinjauan" className="flex gap-1 overflow-x-auto overflow-y-hidden border-b border-[#0B2B24]/8 px-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {URUTAN_STATUS_GAP.map((st) => {
            const aktif = tabStatus === st;
            return (
              <button
                key={st}
                role="tab"
                aria-selected={aktif}
                onClick={() => { setTabStatus(st); setHalaman(1); }}
                className={`shrink-0 flex items-center gap-2 px-3 py-3.5 text-[13px] font-semibold border-b-[3px] -mb-px transition ${
                  aktif ? 'border-[#C08829] text-[#0B2B24]' : 'border-transparent text-[#0B2B24]/50 hover:text-[#0B2B24]/80'
                }`}
              >
                {STATUS_GAP[st].label}
                <span className={`rounded-full px-2 py-0.5 text-[11px] tabular-nums ${aktif ? 'bg-[#0B2B24] text-white' : 'bg-[#0B2B24]/8 text-[#0B2B24]/60'}`}>
                  {ringkasan.perStatus[st]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col lg:flex-row gap-3 lg:items-center p-4 border-b border-[#0B2B24]/8">
          <input
            type="search"
            value={cari}
            onChange={ubah(setCari)}
            placeholder="Cari isi pertanyaan"
            aria-label="Cari pertanyaan"
            className={`${selectBase} lg:flex-1 placeholder:text-[#0B2B24]/35`}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:flex">
            <select value={filterKategori} onChange={ubah(setFilterKategori)} aria-label="Filter kategori" className={selectBase}>
              <option value="">Semua kategori</option>
              {KATEGORI_TIKET.map((k) => <option key={k.value} value={k.value}>{k.value}</option>)}
            </select>
            <select value={filterAlasan} onChange={ubah(setFilterAlasan)} aria-label="Filter alasan" className={selectBase}>
              <option value="">Semua alasan</option>
              {Object.entries(ALASAN_GAP).map(([v, a]) => <option key={v} value={v}>{a.label}</option>)}
            </select>
            <select value={urut} onChange={ubah(setUrut)} aria-label="Urutkan" className={selectBase}>
              <option value="jumlah">Paling sering ditanyakan</option>
              <option value="terbaru">Terakhir muncul</option>
            </select>
          </div>
          {adaFilter && (
            <button onClick={resetFilter} className="text-[12.5px] font-semibold text-[#C08829] hover:underline whitespace-nowrap">
              Reset filter
            </button>
          )}
        </div>

        {galat ? (
          <div className="px-6 py-14 text-center" role="alert">
            <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#9E3B32]/10 text-[#9E3B32]">
              <Danger size={22} variant="Bulk" color="currentColor" aria-hidden="true" />
            </span>
            <p className="font-semibold">Data information gap gagal dimuat</p>
            <p className="mt-1 text-[13px] text-[#0B2B24]/55">{galat}</p>
            <button
              onClick={() => setVersi((v) => v + 1)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#0B2B24] px-4 py-1.5 text-[12.5px] font-semibold hover:bg-[#0B2B24] hover:text-white transition"
            >
              <Refresh2 size={15} color="currentColor" aria-hidden="true" /> Coba lagi
            </button>
          </div>
        ) : memuat && daftar.length === 0 ? (
          <div className="divide-y divide-[#0B2B24]/6" aria-label="Memuat daftar pertanyaan">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-4 animate-pulse" aria-hidden="true">
                <span className="h-9 w-9 rounded-lg bg-[#0B2B24]/8" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-2/5 rounded bg-[#0B2B24]/8" />
                  <div className="h-2.5 w-1/6 rounded bg-[#0B2B24]/6" />
                </div>
                <div className="h-3 w-16 rounded bg-[#0B2B24]/6" />
              </div>
            ))}
          </div>
        ) : daftar.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="font-semibold">
              {adaFilter ? 'Tidak ada pertanyaan yang cocok.' : `Tidak ada pertanyaan di "${STATUS_GAP[tabStatus].label}".`}
            </p>
            <p className="mt-1 text-[13px] text-[#0B2B24]/50">
              {adaFilter ? 'Coba ubah kata kunci atau filter.' : 'Semua sudah tertangani.'}
            </p>
          </div>
        ) : (
          <>
            <table className={`hidden md:table w-full table-fixed text-left text-[13px] transition-opacity ${memuat ? 'opacity-50' : ''}`} aria-busy={memuat}>
              <colgroup>
                <col className="w-[40%]" />
                <col className="w-[17%]" />
                <col className="w-[15%]" />
                <col className="w-[11%]" />
                <col className="w-[12%]" />
                <col className="w-[5%]" />
              </colgroup>
              <thead className="text-[12.5px] font-semibold text-[#0B2B24]">
                <tr className="border-b border-[#0B2B24]/8">
                  <th className="px-5 py-3">Pertanyaan pengguna</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">
                    <span title="Tidak ditemukan: info tidak ada di knowledge base. Tidak memadai: chatbot menjawab tapi dinilai kurang/keliru.">
                      Alasan
                    </span>
                  </th>
                  <th className="px-4 py-3">Ditanyakan</th>
                  <th className="px-4 py-3">Terakhir</th>
                  <th className="px-2 py-3"><span className="sr-only">Aksi</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0B2B24]/6">
                {daftar.map((g) => (
                  <tr key={g.id} className="hover:bg-[#FBF9F4]/70">
                    <td className="px-5 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#C08829]/12 text-[#A0701C]">
                          <Ikon nama="chat" size={18} variant="Bulk" />
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-[13.5px] leading-snug">{g.pertanyaan}</p>
                          <p className="mt-0.5 text-[12px] text-[#0B2B24]/50">{g.nomor_tiket || 'Belum ada tiket'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-middle text-[#0B2B24]/75">{g.kategori}</td>
                    <td className="px-4 py-4 align-middle text-[#0B2B24]/75">{ALASAN_GAP[g.alasan].label}</td>
                    <td className="px-4 py-4 align-middle">
                      <span className="font-semibold tabular-nums">{g.jumlah}</span>
                      <span className="text-[#0B2B24]/50"> kali</span>
                    </td>
                    <td className="px-4 py-4 align-middle text-[#0B2B24]/65">{formatTanggalTiket(g.terakhir_muncul)}</td>
                    <td className="px-2 py-4 align-middle">
                      <MenuAksi label={`Aksi untuk pertanyaan ${g.id}`} items={aksiUntuk(g)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <ul className="md:hidden divide-y divide-[#0B2B24]/6">
              {daftar.map((g) => (
                <li key={g.id} className="px-4 py-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-[13.5px] leading-snug">{g.pertanyaan}</p>
                    <MenuAksi label={`Aksi untuk pertanyaan ${g.id}`} items={aksiUntuk(g)} />
                  </div>
                  <p className="mt-1 text-[12px] text-[#0B2B24]/60">
                    <strong className="text-[#0B2B24]">{g.jumlah} kali</strong> · {g.kategori} · {ALASAN_GAP[g.alasan].label}
                  </p>
                  <p className="text-[12px] text-[#0B2B24]/45">
                    Terakhir {formatTanggalTiket(g.terakhir_muncul)}{g.nomor_tiket ? ` · Tiket ${g.nomor_tiket}` : ''}
                  </p>
                </li>
              ))}
            </ul>
          </>
        )}

        {!galat && (
        <div className="flex items-center justify-between gap-3 border-t border-[#0B2B24]/8 px-5 py-3 text-[12.5px]">
          <span className="text-[#0B2B24]/55">
            {totalHasil === 0
              ? '0 pertanyaan'
              : `${(halamanAman - 1) * PER_HALAMAN + 1}–${Math.min(halamanAman * PER_HALAMAN, totalHasil)} dari ${totalHasil} pertanyaan`}
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
        )}
      </div>
      </section>

      {pesan && (
        <div role="status" className={`fixed bottom-6 left-1/2 z-[70] max-w-[90vw] -translate-x-1/2 rounded-full px-5 py-3 text-[13px] font-medium text-white shadow-xl ${pesan.galat ? 'bg-[#9E3B32]' : 'bg-[#0B2B24]'}`}>
          {pesan.teks}
        </div>
      )}
    </div>
  );
}
