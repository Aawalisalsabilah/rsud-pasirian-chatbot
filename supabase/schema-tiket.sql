-- =====================================================================
--  SKEMA FITUR "TINDAK LANJUT INFORMASI" — RSUD Pasirian (Capstone)
-- =====================================================================
--  Isi : information_gap, tiket, tiket_catatan, tiket_riwayat,
--        tiket_rating, tiket_notifikasi_wa
--
--  Cara pakai (cukup SATU orang yang menjalankan):
--    Supabase Dashboard -> SQL Editor -> New query -> tempel file ini -> Run
--  Aman dijalankan ulang (pakai IF NOT EXISTS / OR REPLACE).
--
--  PRINSIP: aturan bisnis dikunci DI DATABASE, bukan hanya di kode.
--  Jadi walaupun ada bug di API, database tetap menolak data yang salah:
--    - status hanya boleh: baru -> diproses -> selesai (tidak bisa mundur)
--    - tiket "selesai" wajib punya ringkasan & dikunci (tidak bisa diubah)
--    - satu tiket hanya bisa dinilai (rating) satu kali, dan hanya kalau selesai
--    - riwayat penanganan dicatat OTOMATIS oleh trigger, API tidak perlu menulisnya
--    - catatan internal tidak benar-benar dihapus (soft delete) demi jejak audit
--
--  Daftar nilai (jenis/kategori/status) harus sama dengan lib/tiket-constants.js
--  Sudah disesuaikan dengan catatan Salsa (nama maks 60, link rating pakai token acak,
--  kolom opsional pertanyaan_chatbot, nomor tiket unik di level database).
-- =====================================================================

create extension if not exists pgcrypto;  -- untuk gen_random_uuid()


-- ---------------------------------------------------------------------
-- 1. INFORMATION GAP  (B06)
--    Pertanyaan chatbot yang tidak terjawab / jawabannya tidak memadai.
--    Pertanyaan yang sama digabung (kolom jumlah bertambah), tidak dobel.
-- ---------------------------------------------------------------------
create table if not exists public.information_gap (
  id                uuid primary key default gen_random_uuid(),
  pertanyaan        text not null check (char_length(trim(pertanyaan)) between 3 and 1000),
  pertanyaan_normal text not null unique,               -- versi huruf kecil tanpa tanda baca, untuk menggabungkan
  alasan            text not null check (alasan in ('tidak_ditemukan', 'tidak_memadai')),
  kategori          text check (kategori is null or kategori in (
                      'Jadwal dokter', 'BPJS / JKN', 'Pendaftaran', 'Rawat inap',
                      'Farmasi', 'Biaya & administrasi', 'Lainnya')),
  jumlah            integer not null default 1 check (jumlah >= 1),
  status            text not null default 'belum_ditinjau'
                      check (status in ('belum_ditinjau', 'ditinjau', 'diabaikan')),
  pertama_muncul    timestamptz not null default now(),
  terakhir_muncul   timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists information_gap_status_idx on public.information_gap (status, jumlah desc);

-- Dipanggil dari API chat:  supabase.rpc('catat_information_gap', { p_pertanyaan, p_alasan, p_kategori })
-- Kalau pertanyaan yang sama sudah ada -> jumlah + 1.
-- Kalau gap itu sudah "ditinjau" tapi masih muncul lagi -> dibuka kembali jadi "belum_ditinjau".
create or replace function public.catat_information_gap(
  p_pertanyaan text,
  p_alasan     text,
  p_kategori   text default null
) returns uuid
language plpgsql
as $$
declare
  v_normal text;
  v_id     uuid;
begin
  v_normal := lower(regexp_replace(regexp_replace(trim(p_pertanyaan), '[^[:alnum:][:space:]]', '', 'g'), '\s+', ' ', 'g'));

  insert into public.information_gap (pertanyaan, pertanyaan_normal, alasan, kategori)
  values (trim(p_pertanyaan), v_normal, p_alasan, p_kategori)
  on conflict (pertanyaan_normal) do update
    set jumlah          = information_gap.jumlah + 1,
        terakhir_muncul = now(),
        updated_at      = now(),
        status          = case when information_gap.status = 'ditinjau' then 'belum_ditinjau'
                               else information_gap.status end
  returning id into v_id;

  return v_id;
end;
$$;


-- ---------------------------------------------------------------------
-- 2. TIKET  (B04, B05, B07, B08)
-- ---------------------------------------------------------------------
create table if not exists public.tiket (
  id                     uuid primary key default gen_random_uuid(),
  nomor_tiket            text not null unique,              -- diisi otomatis: TKT-YYYYMMDD-XXXX
  jenis                  text not null check (jenis in ('permintaan', 'pengaduan')),
  kategori               text not null check (kategori in (
                           'Jadwal dokter', 'BPJS / JKN', 'Pendaftaran', 'Rawat inap',
                           'Farmasi', 'Biaya & administrasi', 'Lainnya')),
  deskripsi              text not null check (char_length(trim(deskripsi)) between 20 and 1000),
  nama                   text check (nama is null or char_length(trim(nama)) between 1 and 60),
  no_wa                  text not null check (no_wa ~ '^628[0-9]{8,11}$'),
  persetujuan_wa         boolean not null check (persetujuan_wa = true),
  status                 text not null default 'baru' check (status in ('baru', 'diproses', 'selesai')),
  ringkasan_penyelesaian text check (ringkasan_penyelesaian is null
                                     or char_length(trim(ringkasan_penyelesaian)) between 20 and 1000),
  information_gap_id     uuid references public.information_gap (id) on delete set null,
  pertanyaan_chatbot     text check (pertanyaan_chatbot is null or char_length(pertanyaan_chatbot) <= 1000),
  token_rating           text not null unique,               -- diisi otomatis, dipakai di link rating WA (bukan nomor tiket, supaya tidak bisa ditebak)
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  selesai_at             timestamptz,
  constraint tiket_selesai_wajib_ringkasan check (
    status <> 'selesai' or (ringkasan_penyelesaian is not null and selesai_at is not null)
  )
);

create index if not exists tiket_status_idx     on public.tiket (status);
create index if not exists tiket_created_at_idx on public.tiket (created_at desc);
create index if not exists tiket_kategori_idx   on public.tiket (kategori);


-- ---------------------------------------------------------------------
-- 3. CATATAN INTERNAL  (hanya untuk admin, TIDAK dikirim ke pengguna)
-- ---------------------------------------------------------------------
create table if not exists public.tiket_catatan (
  id          uuid primary key default gen_random_uuid(),
  tiket_id    uuid not null references public.tiket (id) on delete cascade,
  isi         text not null check (char_length(trim(isi)) between 1 and 500),
  dibuat_oleh text not null default 'Admin',
  created_at  timestamptz not null default now(),
  dihapus_at  timestamptz            -- soft delete: diisi saat "dihapus", baris tetap ada
);

create index if not exists tiket_catatan_tiket_idx on public.tiket_catatan (tiket_id, created_at);


-- ---------------------------------------------------------------------
-- 4. RIWAYAT PENANGANAN  (diisi otomatis oleh trigger, jangan ditulis manual)
-- ---------------------------------------------------------------------
create table if not exists public.tiket_riwayat (
  id         bigint generated always as identity primary key,
  tiket_id   uuid not null references public.tiket (id) on delete cascade,
  tipe       text not null check (tipe in (
               'dibuat', 'status', 'catatan', 'hapus_catatan', 'selesai',
               'wa_terkirim', 'wa_gagal', 'rating', 'kb_diperbarui')),
  keterangan text not null,
  oleh       text not null default 'Sistem',
  created_at timestamptz not null default now()
);

create index if not exists tiket_riwayat_tiket_idx on public.tiket_riwayat (tiket_id, created_at);


-- ---------------------------------------------------------------------
-- 5. RATING  (B11) — primary key = tiket_id, jadi otomatis hanya 1x per tiket
-- ---------------------------------------------------------------------
create table if not exists public.tiket_rating (
  tiket_id   uuid primary key references public.tiket (id) on delete cascade,
  rating     integer not null check (rating between 1 and 5),
  komentar   text check (komentar is null or char_length(komentar) <= 500),
  created_at timestamptz not null default now()
);


-- ---------------------------------------------------------------------
-- 6. LOG NOTIFIKASI WHATSAPP  (B10 — "mencatat status pengiriman")
-- ---------------------------------------------------------------------
create table if not exists public.tiket_notifikasi_wa (
  id         uuid primary key default gen_random_uuid(),
  tiket_id   uuid not null references public.tiket (id) on delete cascade,
  status     text not null check (status in ('terkirim', 'gagal', 'simulasi')),
  pesan      text not null,
  error      text,
  created_at timestamptz not null default now()
);


-- =====================================================================
--  TRIGGER — di sinilah aturan bisnis dikunci
-- =====================================================================

-- helper: tulis satu baris riwayat
create or replace function public._riwayat(p_tiket uuid, p_tipe text, p_ket text, p_oleh text)
returns void language sql as $$
  insert into public.tiket_riwayat (tiket_id, tipe, keterangan, oleh) values (p_tiket, p_tipe, p_ket, p_oleh);
$$;

create or replace function public._label_status(s text) returns text language sql immutable as $$
  select case s when 'baru' then 'Baru' when 'diproses' then 'Diproses' when 'selesai' then 'Selesai' else s end;
$$;

-- 2a. Sebelum tiket dibuat: isi nomor tiket unik, paksa status awal "baru"
create or replace function public.tiket_sebelum_insert() returns trigger
language plpgsql as $$
declare
  v_nomor text;
begin
  loop
    v_nomor := 'TKT-' || to_char(now() at time zone 'Asia/Jakarta', 'YYYYMMDD') || '-'
               || lpad((floor(random() * 10000))::int::text, 4, '0');
    exit when not exists (select 1 from public.tiket where nomor_tiket = v_nomor);
  end loop;

  new.nomor_tiket            := v_nomor;
  new.token_rating           := encode(gen_random_bytes(12), 'hex');  -- 24 karakter acak
  new.status                 := 'baru';   -- pengguna tidak bisa membuat tiket yang langsung "selesai"
  new.ringkasan_penyelesaian := null;
  new.selesai_at             := null;
  new.created_at             := now();
  new.updated_at             := now();
  return new;
end;
$$;

drop trigger if exists tiket_sebelum_insert on public.tiket;
create trigger tiket_sebelum_insert before insert on public.tiket
  for each row execute function public.tiket_sebelum_insert();

-- 2b. Sebelum tiket diubah: kunci tiket selesai, validasi alur status, kunci data pengguna
create or replace function public.tiket_sebelum_update() returns trigger
language plpgsql as $$
begin
  if old.status = 'selesai' then
    raise exception 'Tiket % sudah selesai dan dikunci.', old.nomor_tiket using errcode = 'P0001';
  end if;

  if new.nomor_tiket is distinct from old.nomor_tiket
     or new.jenis     is distinct from old.jenis
     or new.deskripsi is distinct from old.deskripsi
     or new.nama      is distinct from old.nama
     or new.no_wa     is distinct from old.no_wa
     or new.token_rating is distinct from old.token_rating
     or new.created_at is distinct from old.created_at then
    raise exception 'Data laporan dari pengguna tidak boleh diubah.' using errcode = 'P0001';
  end if;

  if new.status is distinct from old.status then
    if not ((old.status = 'baru' and new.status = 'diproses')
         or (old.status = 'diproses' and new.status = 'selesai')) then
      raise exception 'Perubahan status % -> % tidak diizinkan. Alur: baru -> diproses -> selesai.',
        old.status, new.status using errcode = 'P0001';
    end if;
    if new.status = 'selesai' then
      if new.ringkasan_penyelesaian is null or char_length(trim(new.ringkasan_penyelesaian)) < 20 then
        raise exception 'Ringkasan penyelesaian wajib diisi minimal 20 karakter.' using errcode = 'P0001';
      end if;
      new.selesai_at := now();
    end if;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists tiket_sebelum_update on public.tiket;
create trigger tiket_sebelum_update before update on public.tiket
  for each row execute function public.tiket_sebelum_update();

-- 2c. Setelah tiket dibuat / statusnya berubah: tulis riwayat
create or replace function public.tiket_setelah_berubah() returns trigger
language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    perform public._riwayat(new.id, 'dibuat', 'Tiket dibuat oleh pengguna', 'Pengguna');
  elsif new.status is distinct from old.status then
    if new.status = 'selesai' then
      perform public._riwayat(new.id, 'selesai', 'Tiket diselesaikan', 'Admin');
    else
      perform public._riwayat(new.id, 'status',
        'Status diubah: ' || public._label_status(old.status) || ' → ' || public._label_status(new.status), 'Admin');
    end if;
  end if;
  return null;
end;
$$;

drop trigger if exists tiket_setelah_berubah on public.tiket;
create trigger tiket_setelah_berubah after insert or update on public.tiket
  for each row execute function public.tiket_setelah_berubah();

-- 3a. Catatan: tidak boleh ditambah/diubah kalau tiket sudah selesai; isi tidak boleh diedit
create or replace function public.catatan_sebelum_berubah() returns trigger
language plpgsql as $$
begin
  if (select status from public.tiket where id = new.tiket_id) = 'selesai' then
    raise exception 'Tiket sudah selesai, catatan tidak bisa diubah.' using errcode = 'P0001';
  end if;
  if tg_op = 'UPDATE' then
    if new.isi is distinct from old.isi or new.tiket_id is distinct from old.tiket_id then
      raise exception 'Isi catatan tidak bisa diedit. Hapus lalu buat catatan baru.' using errcode = 'P0001';
    end if;
    if old.dihapus_at is not null then
      raise exception 'Catatan sudah dihapus.' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists catatan_sebelum_berubah on public.tiket_catatan;
create trigger catatan_sebelum_berubah before insert or update on public.tiket_catatan
  for each row execute function public.catatan_sebelum_berubah();

-- 3b. Catatan ditambah / dihapus -> riwayat
create or replace function public.catatan_setelah_berubah() returns trigger
language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    perform public._riwayat(new.tiket_id, 'catatan', 'Catatan internal ditambahkan', new.dibuat_oleh);
  elsif old.dihapus_at is null and new.dihapus_at is not null then
    perform public._riwayat(new.tiket_id, 'hapus_catatan', 'Catatan internal dihapus', 'Admin');
  end if;
  return null;
end;
$$;

drop trigger if exists catatan_setelah_berubah on public.tiket_catatan;
create trigger catatan_setelah_berubah after insert or update on public.tiket_catatan
  for each row execute function public.catatan_setelah_berubah();

-- 5a. Rating hanya untuk tiket selesai -> riwayat
create or replace function public.rating_sebelum_insert() returns trigger
language plpgsql as $$
begin
  if (select status from public.tiket where id = new.tiket_id) is distinct from 'selesai' then
    raise exception 'Tiket belum selesai, belum bisa dinilai.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists rating_sebelum_insert on public.tiket_rating;
create trigger rating_sebelum_insert before insert on public.tiket_rating
  for each row execute function public.rating_sebelum_insert();

create or replace function public.rating_setelah_insert() returns trigger
language plpgsql as $$
begin
  perform public._riwayat(new.tiket_id, 'rating', 'Pengguna memberi penilaian ' || new.rating || '/5', 'Pengguna');
  return null;
end;
$$;

drop trigger if exists rating_setelah_insert on public.tiket_rating;
create trigger rating_setelah_insert after insert on public.tiket_rating
  for each row execute function public.rating_setelah_insert();

-- 6a. Notifikasi WA -> riwayat
create or replace function public.notifikasi_setelah_insert() returns trigger
language plpgsql as $$
begin
  if new.status = 'gagal' then
    perform public._riwayat(new.tiket_id, 'wa_gagal', 'Notifikasi WhatsApp gagal dikirim', 'Sistem');
  else
    perform public._riwayat(new.tiket_id, 'wa_terkirim',
      case when new.status = 'simulasi' then 'Notifikasi WhatsApp dikirim (simulasi)'
           else 'Notifikasi WhatsApp terkirim' end, 'Sistem');
  end if;
  return null;
end;
$$;

drop trigger if exists notifikasi_setelah_insert on public.tiket_notifikasi_wa;
create trigger notifikasi_setelah_insert after insert on public.tiket_notifikasi_wa
  for each row execute function public.notifikasi_setelah_insert();

-- Riwayat bersifat append-only: tidak boleh diedit
create or replace function public.riwayat_tolak_update() returns trigger
language plpgsql as $$
begin
  raise exception 'Riwayat penanganan tidak boleh diubah.' using errcode = 'P0001';
end;
$$;

drop trigger if exists riwayat_tolak_update on public.tiket_riwayat;
create trigger riwayat_tolak_update before update on public.tiket_riwayat
  for each row execute function public.riwayat_tolak_update();

-- information_gap: updated_at otomatis
create or replace function public.gap_sebelum_update() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists gap_sebelum_update on public.information_gap;
create trigger gap_sebelum_update before update on public.information_gap
  for each row execute function public.gap_sebelum_update();


-- =====================================================================
--  KEAMANAN — Row Level Security
--  RLS aktif tanpa policy = tabel TIDAK bisa dibaca/ditulis lewat key publik.
--  Semua akses wajib lewat API server (memakai SUPABASE_SECRET_KEY),
--  karena tabel ini berisi nomor WhatsApp & laporan pengguna.
-- =====================================================================
alter table public.information_gap     enable row level security;
alter table public.tiket               enable row level security;
alter table public.tiket_catatan       enable row level security;
alter table public.tiket_riwayat       enable row level security;
alter table public.tiket_rating        enable row level security;
alter table public.tiket_notifikasi_wa enable row level security;

-- Fungsi internal tidak boleh dipanggil dari luar
revoke execute on function public._riwayat(uuid, text, text, text) from public;
