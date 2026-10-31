// =====================================================================
//  LAPISAN DATA "TINDAK LANJUT INFORMASI" untuk dashboard admin
// =====================================================================
//  Tampilan (TiketTab, InfoGapTab) HANYA memanggil fungsi di file ini.
//  Sumber data dipilih lewat .env.local:
//
//    NEXT_PUBLIC_TIKET_SUMBER=mock   -> data contoh di memori (default)
//    NEXT_PUBLIC_TIKET_SUMBER=api    -> panggil /api/admin/... (API Tasya)
//
//  Mode mock meniru PERSIS bentuk respons & aturan di docs/kontrak-api-tiket.md,
//  jadi kalau API asli sudah mengikuti kontrak, tampilan tidak perlu diubah.
//  Setelah mengubah .env.local, jalankan ulang `npm run dev`.
// =====================================================================

import { TIKET_MOCK } from './tiket-mock';
import { INFOGAP_MOCK } from './infogap-mock';
import { STATUS_TIKET } from './tiket-constants';

export const SUMBER_DATA = process.env.NEXT_PUBLIC_TIKET_SUMBER === 'api' ? 'api' : 'mock';

export class GalatApi extends Error {
  constructor(pesan, status = 500) {
    super(pesan);
    this.name = 'GalatApi';
    this.status = status;
  }
}

// ---------------------------------------------------------------------
//  ADAPTER: bentuk kontrak API  ->  bentuk yang dipakai tampilan
// ---------------------------------------------------------------------

function keTiketRingkasUi(t) {
  return {
    nomor_tiket: t.nomor_tiket,
    jenis: t.jenis,
    kategori: t.kategori,
    deskripsi: t.deskripsi,
    nama: t.nama,
    no_wa: t.no_wa,
    status: t.status,
    created_at: t.created_at,
    updated_at: t.updated_at,
    rating: t.rating ?? null,
  };
}

function keTiketDetailUi(d) {
  return {
    ...keTiketRingkasUi(d),
    ringkasan_penyelesaian: d.ringkasan_penyelesaian ?? null,
    selesai_at: d.selesai_at ?? null,
    rating: d.rating?.rating ?? null,
    komentar: d.rating?.komentar ?? null,
    catatan_internal: (d.catatan || []).map((c) => ({ id: c.id, isi: c.isi, oleh: c.dibuat_oleh, waktu: c.created_at })),
    riwayat: (d.riwayat || []).map((r) => ({ tipe: r.tipe, aksi: r.keterangan, oleh: r.oleh, waktu: r.created_at })),
  };
}

function keRingkasanTiketUi(r) {
  return {
    baru: r?.baru ?? 0,
    diproses: r?.diproses ?? 0,
    selesai: r?.selesai ?? 0,
    rata: r?.rata_rating ?? null,
    jumlahDinilai: r?.jumlah_dinilai ?? 0,
  };
}

function keRingkasanGapUi(r) {
  const daftarKategori = (r?.per_kategori || []).map((k) => [k.kategori, { kali: k.kali, unik: k.unik }]);
  return {
    perStatus: r?.per_status || { belum_ditinjau: 0, ditinjau: 0, diabaikan: 0 },
    total: r?.total_aktif ?? 0,
    kemunculan: r?.total_ditanyakan ?? 0,
    punyaTiket: r?.punya_tiket ?? 0,
    daftarKategori,
    maks: daftarKategori[0]?.[1].kali || 1,
    perAlasan: r?.per_alasan || {},
  };
}

// ---------------------------------------------------------------------
//  MODE API: panggil endpoint asli
// ---------------------------------------------------------------------

async function panggil(url, opsi = {}) {
  let res;
  try {
    res = await fetch(url, {
      ...opsi,
      headers: { 'Content-Type': 'application/json', ...(opsi.headers || {}) },
      cache: 'no-store',
    });
  } catch {
    throw new GalatApi('Tidak bisa terhubung ke server. Periksa koneksi internet.', 0);
  }
  let body = null;
  try { body = await res.json(); } catch { /* respons kosong */ }
  if (res.status === 401) throw new GalatApi('Sesi login habis. Silakan login ulang.', 401);
  if (!res.ok) {
    const bawaan = {
      404: 'Layanan belum tersedia di server. Kemungkinan API-nya belum dibuat.',
      500: 'Terjadi kesalahan di server. Coba beberapa saat lagi.',
    };
    throw new GalatApi(body?.error || bawaan[res.status] || `Permintaan gagal (kode ${res.status}).`, res.status);
  }
  return body;
}

function keQuery(params) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
  });
  return q.toString();
}

const api = {
  daftarTiket: (p) => panggil(`/api/admin/tiket?${keQuery(p)}`),
  detailTiket: (nomor) => panggil(`/api/admin/tiket/${encodeURIComponent(nomor)}`),
  ubahStatus: (nomor, body) =>
    panggil(`/api/admin/tiket/${encodeURIComponent(nomor)}`, { method: 'PATCH', body: JSON.stringify(body) }),
  tambahCatatan: (nomor, isi) =>
    panggil(`/api/admin/tiket/${encodeURIComponent(nomor)}/catatan`, { method: 'POST', body: JSON.stringify({ isi }) }),
  hapusCatatan: (nomor, id) =>
    panggil(`/api/admin/tiket/${encodeURIComponent(nomor)}/catatan/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  daftarGap: (p) => panggil(`/api/admin/information-gap?${keQuery(p)}`),
  ubahStatusGap: (id, status) =>
    panggil(`/api/admin/information-gap/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};

// ---------------------------------------------------------------------
//  MODE MOCK: "database" di memori yang meniru aturan supabase/schema-tiket.sql
//  Data hilang saat halaman di-refresh.
// ---------------------------------------------------------------------

const JEDA_MS = 350;
const tunggu = () => new Promise((r) => setTimeout(r, JEDA_MS));
const salin = (x) => JSON.parse(JSON.stringify(x));
let idUrut = 1;
const idBaru = () => `mock-${idUrut++}`;
const labelStatus = (s) => STATUS_TIKET[s]?.label || s;

function riwayatAwal(t) {
  const r = [{ tipe: 'dibuat', keterangan: 'Tiket dibuat oleh pengguna', oleh: 'Pengguna', created_at: t.created_at }];
  if (t.status !== 'baru') {
    r.push({ tipe: 'status', keterangan: 'Status diubah: Baru → Diproses', oleh: 'Admin', created_at: t.catatan_internal[0]?.waktu || t.updated_at });
  }
  t.catatan_internal.forEach((c) => r.push({ tipe: 'catatan', keterangan: 'Catatan internal ditambahkan', oleh: c.oleh, created_at: c.waktu }));
  if (t.status === 'selesai') {
    r.push({ tipe: 'selesai', keterangan: 'Tiket diselesaikan', oleh: 'Admin', created_at: t.updated_at });
    r.push({ tipe: 'wa_terkirim', keterangan: 'Notifikasi WhatsApp dikirim (simulasi)', oleh: 'Sistem', created_at: t.updated_at });
  }
  if (t.rating) {
    r.push({ tipe: 'rating', keterangan: `Pengguna memberi penilaian ${t.rating}/5`, oleh: 'Pengguna', created_at: t.updated_at });
  }
  return r.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
}

let dbMock = null;
function db() {
  if (dbMock) return dbMock;
  dbMock = {
    tiket: TIKET_MOCK.map((t) => ({
      nomor_tiket: t.nomor_tiket,
      jenis: t.jenis,
      kategori: t.kategori,
      deskripsi: t.deskripsi,
      nama: t.nama,
      no_wa: t.no_wa,
      status: t.status,
      ringkasan_penyelesaian: t.ringkasan_penyelesaian,
      created_at: t.created_at,
      updated_at: t.updated_at,
      selesai_at: t.status === 'selesai' ? t.updated_at : null,
      catatan: t.catatan_internal.map((c) => ({ id: idBaru(), isi: c.isi, dibuat_oleh: c.oleh, created_at: c.waktu, dihapus_at: null })),
      riwayat: riwayatAwal(t),
      rating: t.rating ? { rating: t.rating, komentar: t.komentar } : null,
    })),
    gap: INFOGAP_MOCK.map((g) => ({ ...g })),
  };
  return dbMock;
}

function cariTiket(nomor) {
  const t = db().tiket.find((x) => x.nomor_tiket === nomor);
  if (!t) throw new GalatApi('Tiket tidak ditemukan.', 404);
  return t;
}

function detailMock(t) {
  return {
    ...t,
    catatan: t.catatan.filter((c) => !c.dihapus_at),
    riwayat: [...t.riwayat],
  };
}

function riwayat(t, tipe, keterangan, oleh) {
  t.riwayat.push({ tipe, keterangan, oleh, created_at: new Date().toISOString() });
}

const mock = {
  async daftarTiket({ status, jenis, kategori, cari, halaman = 1, per_halaman = 10 }) {
    await tunggu();
    const semua = db().tiket;
    const q = (cari || '').trim().toLowerCase();
    const hasil = semua
      .filter((t) => !status || t.status === status)
      .filter((t) => !jenis || t.jenis === jenis)
      .filter((t) => !kategori || t.kategori === kategori)
      .filter((t) => !q || t.nomor_tiket.toLowerCase().includes(q))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const dinilai = semua.filter((t) => t.rating);
    return salin({
      data: hasil.slice((halaman - 1) * per_halaman, halaman * per_halaman).map((t) => ({ ...t, rating: t.rating?.rating ?? null })),
      total: hasil.length,
      ringkasan: {
        baru: semua.filter((t) => t.status === 'baru').length,
        diproses: semua.filter((t) => t.status === 'diproses').length,
        selesai: semua.filter((t) => t.status === 'selesai').length,
        rata_rating: dinilai.length ? dinilai.reduce((a, t) => a + t.rating.rating, 0) / dinilai.length : null,
        jumlah_dinilai: dinilai.length,
      },
    });
  },

  async detailTiket(nomor) {
    await tunggu();
    return salin({ data: detailMock(cariTiket(nomor)) });
  },

  async ubahStatus(nomor, { status, ringkasan_penyelesaian }) {
    await tunggu();
    const t = cariTiket(nomor);
    if (t.status === 'selesai') throw new GalatApi(`Tiket ${nomor} sudah selesai dan dikunci.`, 409);
    if (!STATUS_TIKET[t.status].next.includes(status)) {
      throw new GalatApi(`Perubahan status ${t.status} -> ${status} tidak diizinkan. Alur: baru -> diproses -> selesai.`, 409);
    }
    if (status === 'selesai') {
      if (!ringkasan_penyelesaian || ringkasan_penyelesaian.trim().length < 20) {
        throw new GalatApi('Ringkasan penyelesaian wajib diisi minimal 20 karakter.', 409);
      }
      t.ringkasan_penyelesaian = ringkasan_penyelesaian.trim();
      t.selesai_at = new Date().toISOString();
      t.status = 'selesai';
      riwayat(t, 'selesai', 'Tiket diselesaikan', 'Admin');
      riwayat(t, 'wa_terkirim', 'Notifikasi WhatsApp dikirim (simulasi)', 'Sistem');
    } else {
      riwayat(t, 'status', `Status diubah: ${labelStatus(t.status)} → ${labelStatus(status)}`, 'Admin');
      t.status = status;
    }
    t.updated_at = new Date().toISOString();
    return salin({ data: detailMock(t) });
  },

  async tambahCatatan(nomor, isi) {
    await tunggu();
    const t = cariTiket(nomor);
    if (t.status === 'selesai') throw new GalatApi('Tiket sudah selesai, catatan tidak bisa diubah.', 409);
    const bersih = (isi || '').trim();
    if (!bersih || bersih.length > 500) throw new GalatApi('Catatan harus 1–500 karakter.', 400);
    t.catatan.push({ id: idBaru(), isi: bersih, dibuat_oleh: 'Admin', created_at: new Date().toISOString(), dihapus_at: null });
    riwayat(t, 'catatan', 'Catatan internal ditambahkan', 'Admin');
    t.updated_at = new Date().toISOString();
    return salin({ data: detailMock(t) });
  },

  async hapusCatatan(nomor, id) {
    await tunggu();
    const t = cariTiket(nomor);
    if (t.status === 'selesai') throw new GalatApi('Tiket sudah selesai, catatan tidak bisa diubah.', 409);
    const c = t.catatan.find((x) => x.id === id && !x.dihapus_at);
    if (!c) throw new GalatApi('Catatan tidak ditemukan.', 404);
    c.dihapus_at = new Date().toISOString();
    riwayat(t, 'hapus_catatan', 'Catatan internal dihapus', 'Admin');
    t.updated_at = new Date().toISOString();
    return salin({ data: detailMock(t) });
  },

  async daftarGap({ status = 'belum_ditinjau', kategori, alasan, cari, urut = 'jumlah', halaman = 1, per_halaman = 10 }) {
    await tunggu();
    const semua = db().gap;
    const q = (cari || '').trim().toLowerCase();
    const hasil = semua
      .filter((g) => !status || g.status === status)
      .filter((g) => !kategori || g.kategori === kategori)
      .filter((g) => !alasan || g.alasan === alasan)
      .filter((g) => !q || g.pertanyaan.toLowerCase().includes(q))
      .sort((a, b) => (urut === 'terbaru'
        ? new Date(b.terakhir_muncul) - new Date(a.terakhir_muncul)
        : b.jumlah - a.jumlah));

    const aktif = semua.filter((g) => g.status !== 'diabaikan');
    const perKategori = {};
    const perAlasan = {};
    aktif.forEach((g) => {
      perKategori[g.kategori] ??= { kategori: g.kategori, kali: 0, unik: 0 };
      perKategori[g.kategori].kali += g.jumlah;
      perKategori[g.kategori].unik += 1;
      perAlasan[g.alasan] ??= { kali: 0, unik: 0 };
      perAlasan[g.alasan].kali += g.jumlah;
      perAlasan[g.alasan].unik += 1;
    });

    return salin({
      data: hasil.slice((halaman - 1) * per_halaman, halaman * per_halaman),
      total: hasil.length,
      ringkasan: {
        per_status: {
          belum_ditinjau: semua.filter((g) => g.status === 'belum_ditinjau').length,
          ditinjau: semua.filter((g) => g.status === 'ditinjau').length,
          diabaikan: semua.filter((g) => g.status === 'diabaikan').length,
        },
        total_aktif: aktif.length,
        total_ditanyakan: aktif.reduce((a, g) => a + g.jumlah, 0),
        punya_tiket: aktif.filter((g) => g.nomor_tiket).length,
        per_kategori: Object.values(perKategori).sort((a, b) => b.kali - a.kali),
        per_alasan: perAlasan,
      },
    });
  },

  async ubahStatusGap(id, status) {
    await tunggu();
    const g = db().gap.find((x) => x.id === id);
    if (!g) throw new GalatApi('Information gap tidak ditemukan.', 404);
    if (!['belum_ditinjau', 'ditinjau', 'diabaikan'].includes(status)) throw new GalatApi('Status tidak valid.', 400);
    g.status = status;
    return salin({ data: g });
  },
};

const sumber = SUMBER_DATA === 'api' ? api : mock;

// =====================================================================
//  FUNGSI YANG DIPAKAI TAMPILAN
// =====================================================================

/** Daftar tiket + ringkasan. params: { status, jenis, kategori, cari, halaman, per_halaman } */
export async function ambilDaftarTiket(params = {}) {
  const res = await sumber.daftarTiket(params);
  return {
    data: (res.data || []).map(keTiketRingkasUi),
    total: res.total ?? 0,
    ringkasan: keRingkasanTiketUi(res.ringkasan),
  };
}

/** Detail lengkap satu tiket (catatan, riwayat, rating). */
export async function ambilDetailTiket(nomor) {
  return keTiketDetailUi((await sumber.detailTiket(nomor)).data);
}

/** Baru -> Diproses */
export async function mulaiProsesTiket(nomor) {
  return keTiketDetailUi((await sumber.ubahStatus(nomor, { status: 'diproses' })).data);
}

/** Diproses -> Selesai (memicu notifikasi WA di server) */
export async function selesaikanTiket(nomor, ringkasan) {
  return keTiketDetailUi((await sumber.ubahStatus(nomor, { status: 'selesai', ringkasan_penyelesaian: ringkasan })).data);
}

export async function tambahCatatanTiket(nomor, isi) {
  return keTiketDetailUi((await sumber.tambahCatatan(nomor, isi)).data);
}

export async function hapusCatatanTiket(nomor, idCatatan) {
  return keTiketDetailUi((await sumber.hapusCatatan(nomor, idCatatan)).data);
}

/** Daftar information gap + ringkasan. params: { status, kategori, alasan, cari, urut, halaman, per_halaman } */
export async function ambilDaftarGap(params = {}) {
  const res = await sumber.daftarGap(params);
  return { data: res.data || [], total: res.total ?? 0, ringkasan: keRingkasanGapUi(res.ringkasan) };
}

export async function ubahStatusGap(id, status) {
  return (await sumber.ubahStatusGap(id, status)).data;
}
