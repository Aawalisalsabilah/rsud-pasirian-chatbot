# Kontrak API — Fitur Tindak Lanjut Informasi

> Pegangan bersama untuk **form (Salsa)**, **API (Tasya)**, dan **dashboard admin (Kharis)**.
> Kalau mau mengubah sesuatu di sini, **bilang di grup dulu**, karena tiga bagian ikut terdampak.

> **Status: SUDAH DIIMPLEMENTASIKAN** (B05, B06, B08, B10, B11). Semua endpoint di bawah sudah ada di `app/api/` dan sudah diuji.

Skema database: [`supabase/schema-tiket.sql`](../supabase/schema-tiket.sql)
Daftar nilai bersama (jenis, kategori, status): [`lib/tiket-constants.js`](../lib/tiket-constants.js)

---

## 0. Aturan umum

| Hal | Aturan |
|---|---|
| Format sukses | `{ "data": ... }` |
| Format gagal | `{ "error": "pesan yang bisa dibaca manusia" }` |
| Tanggal | ISO 8601 dari database, mis. `"2026-10-27T08:14:00+07:00"` |
| Endpoint `/api/admin/*` | **Otomatis dilindungi login admin** oleh `middleware.js`. Jangan taruh endpoint admin di luar folder ini. |
| Akses database | Hanya dari server memakai `SUPABASE_SECRET_KEY`. Tabel tiket sudah dikunci RLS, jadi tidak bisa diakses dari browser. |

### Kode status HTTP

| Kode | Kapan |
|---|---|
| `200` | Berhasil membaca / mengubah |
| `201` | Berhasil membuat data baru |
| `400` | Input tidak valid (format salah, field kurang) |
| `401` | Belum login admin (dari middleware) |
| `404` | Tiket / gap tidak ditemukan |
| `429` | Terlalu banyak laporan dari satu perangkat (maks 5 tiket per jam per IP) |
| `409` | **Ditolak aturan database** — mis. tiket sudah selesai, status lompat, rating dua kali |
| `500` | Error lain di server |

### Menerjemahkan error database (wajib dipakai di semua endpoint)

Trigger di database melempar error dengan pesan Bahasa Indonesia yang sudah rapi
(kode `P0001`). Pesan itu **langsung boleh ditampilkan ke admin**.

```js
// lib/supabase-error.js (usulan)
export function responsDariError(error) {
  if (error?.code === 'P0001') return { status: 409, body: { error: error.message } };     // aturan bisnis
  if (error?.code === '23505') return { status: 409, body: { error: 'Data sudah ada.' } };  // duplikat (mis. rating 2x)
  if (error?.code === '23514') return { status: 400, body: { error: 'Data tidak valid.' } }; // check constraint
  return { status: 500, body: { error: 'Terjadi kesalahan di server.' } };
}
```

---

## 1. Endpoint publik (dipakai pengguna)

### `POST /api/tiket` — kirim laporan *(Salsa → Tasya, B04/B05)*

Request:
```json
{
  "jenis": "pengaduan",
  "kategori": "Jadwal dokter",
  "deskripsi": "Jadwal dokter anak di website berbeda dengan chatbot.",
  "nama": "Rina Wulandari",
  "no_wa": "6285712345678",
  "persetujuan_wa": true,
  "information_gap_id": null,
  "pertanyaan_chatbot": null
}
```
- `nama` boleh `null`, maks 60 karakter.
- `information_gap_id` opsional: otomatis diisi form kalau pengguna datang dari link chatbot (`/tindak-lanjut?gap=<id>`).
- `pertanyaan_chatbot` opsional: pertanyaan asli pengguna di chatbot.
- **Jangan kirim** `status` / `nomor_tiket` — database mengisinya sendiri.

Response `201`:
```json
{ "data": { "nomor_tiket": "TKT-20261027-4821", "status": "baru" } }
```

Contoh implementasi:
```js
const { data, error } = await supabase
  .from('tiket')
  .insert({ jenis, kategori, deskripsi, nama: nama || null, no_wa, persetujuan_wa, information_gap_id })
  .select('nomor_tiket, status')
  .single();
```

### `GET /api/rating?token=<token>` — cek tiket sebelum dinilai *(B11)*

> Link rating di WhatsApp memakai **token acak 24 karakter** (`/rating/<token>`), bukan nomor tiket,
> supaya orang lain tidak bisa menebak dan menilai tiket milik orang lain. Halaman `app/rating/[nomor]`
> sudah disesuaikan (isi segmen URL-nya sekarang token).

Response `200`:
```json
{ "data": { "nomor_tiket": "TKT-...", "status": "selesai", "sudah_dinilai": false } }
```
`404` kalau token tidak ada. Hanya 3 data ini yang dikembalikan (tanpa nomor WA / deskripsi).

### `POST /api/rating` — kirim penilaian *(B11)*

Request: `{ "token": "<token>", "rating": 4, "komentar": "Cepat" }` (`komentar` boleh `null`, maks 500)
Response `201`: `{ "data": { "ok": true } }` · `409` kalau belum selesai / sudah dinilai.


---

## 2. Endpoint admin — tiket *(B07/B08, dipakai dashboard Kharis)*

### Bentuk data `TiketRingkas` (untuk daftar)

```json
{
  "nomor_tiket": "TKT-20261027-4821",
  "jenis": "pengaduan",
  "kategori": "Jadwal dokter",
  "deskripsi": "Jadwal dokter anak di website ...",
  "nama": "Rina Wulandari",
  "no_wa": "6285712345678",
  "status": "baru",
  "created_at": "2026-10-27T08:14:00+07:00",
  "updated_at": "2026-10-27T08:14:00+07:00",
  "rating": null
}
```

### `GET /api/admin/tiket`

Query (semua opsional):

| Param | Contoh | Keterangan |
|---|---|---|
| `status` | `baru` | `baru` / `diproses` / `selesai` |
| `jenis` | `pengaduan` | |
| `kategori` | `BPJS / JKN` | nilai persis dari `KATEGORI_TIKET` |
| `cari` | `1027` | cocokkan sebagian nomor tiket |
| `halaman` | `1` | mulai dari 1 |
| `per_halaman` | `10` | maks 50 |

Urutan: **terbaru di atas** (`created_at desc`).

Response `200`:
```json
{
  "data": [ /* TiketRingkas[] */ ],
  "total": 15,
  "ringkasan": { "baru": 4, "diproses": 4, "selesai": 7, "rata_rating": 3.8, "jumlah_dinilai": 6 }
}
```
- `total` = jumlah tiket **setelah filter** (untuk pagination).
- `ringkasan` = hitungan **semua** tiket (tidak terpengaruh filter), untuk kartu di atas daftar.

```js
let q = supabase
  .from('tiket')
  .select('nomor_tiket, jenis, kategori, deskripsi, nama, no_wa, status, created_at, updated_at, tiket_rating(rating)', { count: 'exact' })
  .order('created_at', { ascending: false })
  .range((halaman - 1) * perHalaman, halaman * perHalaman - 1);
if (status) q = q.eq('status', status);
if (jenis) q = q.eq('jenis', jenis);
if (kategori) q = q.eq('kategori', kategori);
if (cari) q = q.ilike('nomor_tiket', `%${cari}%`);
const { data, count, error } = await q;
```

### `GET /api/admin/tiket/[nomor]` — detail

Response `200`:
```json
{
  "data": {
    "nomor_tiket": "TKT-20261027-4821",
    "jenis": "pengaduan",
    "kategori": "Jadwal dokter",
    "deskripsi": "…teks lengkap, bisa multi-baris…",
    "nama": "Rina Wulandari",
    "no_wa": "6285712345678",
    "status": "diproses",
    "ringkasan_penyelesaian": null,
    "created_at": "…", "updated_at": "…", "selesai_at": null,
    "catatan": [
      { "id": "uuid", "isi": "Sudah dicek ke poli anak", "dibuat_oleh": "Admin", "created_at": "…" }
    ],
    "riwayat": [
      { "tipe": "dibuat", "keterangan": "Tiket dibuat oleh pengguna", "oleh": "Pengguna", "created_at": "…" },
      { "tipe": "status", "keterangan": "Status diubah: Baru → Diproses", "oleh": "Admin", "created_at": "…" }
    ],
    "rating": null
  }
}
```
- `catatan`: **hanya yang belum dihapus** (`dihapus_at is null`), urut lama → baru.
- `riwayat`: urut lama → baru. Tipe yang mungkin: `dibuat`, `status`, `catatan`, `hapus_catatan`, `selesai`, `wa_terkirim`, `wa_gagal`, `rating`, `kb_diperbarui`.
- `rating`: `null` atau `{ "rating": 4, "komentar": "…" }`.

```js
const { data, error } = await supabase
  .from('tiket')
  .select('*, tiket_catatan(id, isi, dibuat_oleh, created_at, dihapus_at), tiket_riwayat(tipe, keterangan, oleh, created_at), tiket_rating(rating, komentar)')
  .eq('nomor_tiket', nomor)
  .maybeSingle();
// lalu: buang catatan yang dihapus_at != null, urutkan catatan & riwayat by created_at
```

### `PATCH /api/admin/tiket/[nomor]` — ubah status

| Body | Arti |
|---|---|
| `{ "status": "diproses" }` | Mulai proses |
| `{ "status": "selesai", "ringkasan_penyelesaian": "…min 20 karakter…" }` | Selesaikan tiket |

Response `200`: **detail tiket terbaru** (bentuk sama dengan GET detail).
`409` kalau melanggar alur (sudah selesai, lompat status, ringkasan kurang).

Saat status menjadi `selesai`, API **juga** wajib (B10):
1. Kirim WA ke `no_wa` (atau simulasi kalau API WA belum ada), isi pesan: nomor tiket + `ringkasan_penyelesaian` + link `/rating/<nomor>`.
2. Catat hasilnya: `insert into tiket_notifikasi_wa (tiket_id, status, pesan, error)` dengan status `terkirim` / `gagal` / `simulasi`.
   Riwayat "WA terkirim/gagal" akan tercatat otomatis.

> ⚠️ Jangan pernah mengirim **catatan internal** ke pengguna. Yang dikirim hanya `ringkasan_penyelesaian`.

### `POST /api/admin/tiket/[nomor]/catatan` — tambah catatan internal

Body: `{ "isi": "Sudah dicek ke poli anak" }` (1–500 karakter)
Response `201`: detail tiket terbaru · `409` kalau tiket sudah selesai.

### `DELETE /api/admin/tiket/[nomor]/catatan/[id]` — hapus catatan

**Soft delete** — jangan `delete()`, tapi:
```js
await supabase.from('tiket_catatan').update({ dihapus_at: new Date().toISOString() }).eq('id', id);
```
Response `200`: detail tiket terbaru · `409` kalau tiket sudah selesai.

> Riwayat untuk semua aksi di atas **tercatat otomatis oleh database**. API tidak perlu (dan jangan) menulis ke `tiket_riwayat`.

---

## 3. Endpoint admin — information gap *(B06, dipakai dashboard Kharis)*

### Bentuk data `Gap`

```json
{
  "id": "uuid",
  "pertanyaan": "Jam besuk pasien rawat inap kelas III jam berapa?",
  "alasan": "tidak_ditemukan",
  "kategori": "Rawat inap",
  "jumlah": 23,
  "status": "belum_ditinjau",
  "pertama_muncul": "…",
  "terakhir_muncul": "…",
  "nomor_tiket": "TKT-20261026-7710"
}
```
`nomor_tiket`: tiket yang terhubung lewat `tiket.information_gap_id` (yang terbaru), atau `null`.

### `GET /api/admin/information-gap`

Query: `status` (default `belum_ditinjau`), `kategori`, `alasan`, `cari`, `urut` (`jumlah` | `terbaru`), `halaman`, `per_halaman`.

Response `200`:
```json
{
  "data": [ /* Gap[] */ ],
  "total": 9,
  "ringkasan": {
    "per_status": { "belum_ditinjau": 9, "ditinjau": 3, "diabaikan": 2 },
    "total_aktif": 12,
    "total_ditanyakan": 126,
    "punya_tiket": 7,
    "per_kategori": [ { "kategori": "Jadwal dokter", "kali": 24, "unik": 3 } ],
    "per_alasan": { "tidak_ditemukan": { "kali": 98, "unik": 9 }, "tidak_memadai": { "kali": 28, "unik": 3 } }
  }
}
```
"Aktif" = semua kecuali `diabaikan`.

### `PATCH /api/admin/information-gap/[id]`

Body: `{ "status": "ditinjau" }` (atau `belum_ditinjau` / `diabaikan`) → `200 { "data": Gap }`.

---

## 4. Mencatat information gap dari chatbot *(B06)*

**Implementasi saat ini** (`lib/information-gap.js` + `app/api/chat/route.js`):
1. System prompt chatbot ditambah instruksi: kalau jawaban **tidak ada di DATA RESMI**, model menulis penanda `[[INFO_TIDAK_TERSEDIA]]` di akhir jawaban.
2. Route chat membuang penanda itu, mencatat pertanyaan lewat `catat_information_gap`, lalu menambahkan link *"ajukan permintaan informasi"* ke `/tindak-lanjut?gap=<id>`.
3. Kategori ditebak dari kata kunci (BPJS, jadwal, kamar, obat, biaya, daftar).

Kriteria ini masih **usulan** sampai B02 disepakati.

### Catatan lama (usulan awal)

Di `lib/knowledge.js`, fungsi `searchRelevantKnowledge()` mencari FAQ dengan
`match_threshold: 0.6`. **Usulan kriteria "tidak ditemukan"**: tidak ada satu pun potongan FAQ
yang skornya ≥ 0.6 **dan** pertanyaan bukan sapaan/basa-basi.

```js
await supabase.rpc('catat_information_gap', {
  p_pertanyaan: pertanyaanPengguna,
  p_alasan: 'tidak_ditemukan',
  p_kategori: null, // atau tebakan kategori kalau ada
});
```
Fungsi ini otomatis menggabungkan pertanyaan yang sama (jumlah + 1).

**"Tidak memadai"** butuh tombol 👍/👎 di jawaban chatbot — **fitur ini belum ada**, perlu disepakati (B02).

---

## 5. Variabel `.env` tambahan

| Nama | Wajib? | Fungsi |
|---|---|---|
| `NEXT_PUBLIC_TIKET_SUMBER` | Ya, isi `api` | Dashboard memakai API asli (tanpa ini: data contoh) |
| `APP_URL` | Disarankan | Domain untuk link rating di WA, mis. `https://rsud-pasirian-chatbot.vercel.app`. Kalau kosong, dipakai alamat yang sedang diakses admin. |
| `WA_FONNTE_TOKEN` | Opsional | Token [Fonnte](https://fonnte.com) untuk kirim WA sungguhan. Kalau kosong, WA **disimulasikan** (dicatat di `tiket_notifikasi_wa` & terminal). |

## 6. Checklist sebelum bilang "API sudah jadi"

- [ ] `supabase/schema-tiket.sql` sudah dijalankan di Supabase tim (cukup sekali)
- [ ] Semua endpoint admin ada di dalam `app/api/admin/...`
- [ ] Semua error database lewat `responsDariError()` (bagian 0)
- [ ] File mock lama dihapus: `app/api/tiket/route.js` & `app/api/rating/route.js` diganti versi asli
- [ ] Dashboard dicoba dengan `NEXT_PUBLIC_TIKET_SUMBER=api` di `.env.local` (lihat `lib/tiket-api.js`)
- [ ] Catatan internal tidak pernah ikut terkirim ke WA
