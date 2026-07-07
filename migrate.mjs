
import { list } from '@vercel/blob';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });

async function embedText(text) {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values; // array of 768 numbers
}

const daftarPoli = [
  { nama: 'Poli Spesialis Bedah', dokter: [{ nama: 'dr. Hendra Setiawan, Sp.B', hari: 'Senin-Jumat', jam: '10.00-13.00' }, { nama: 'dr. Prima Budi Prayogi, Sp.B', hari: 'Jumat', jam: '12.00-15.00' }] },
  { nama: 'Poli Spesialis Ortopedi & Traumatologi', dokter: [{ nama: 'dr. Rosihan Effendi, Sp.OT', hari: 'Senin-Jumat', jam: '09.00-12.00' }] },
  { nama: 'Poli Spesialis Paru', dokter: [{ nama: 'dr. Trisasongko Budisatrio, Sp.P', hari: 'Senin-Jumat', jam: '08.30-12.00' }] },
  { nama: 'Poli Spesialis Penyakit Dalam', dokter: [{ nama: 'dr. Wiryawan Pradipto, Sp.Pd', hari: 'Senin-Jumat', jam: '08.00-12.00' }] },
  { nama: 'Poli Spesialis Kandungan', dokter: [{ nama: 'dr. Elvi Widiastuti, Sp.OG', hari: 'Senin, Rabu, Jumat', jam: '09.00-12.00' }, { nama: 'dr. Ryan Ishak, Sp.OG', hari: 'Selasa & Kamis', jam: '10.00-13.00' }] },
  { nama: 'Poli Spesialis Gigi Tiruan', dokter: [{ nama: 'dr. Agung Hardianto, Sp.Pros', hari: 'Senin-Jumat', jam: '08.00-13.00' }] },
  { nama: 'Poli Gigi Umum', dokter: [{ nama: 'dr. Reza Hesti Augustine', hari: 'Senin-Jumat', jam: '08.00-13.00' }] },
  { nama: 'Poli Spesialis Anak', dokter: [{ nama: 'dr. Nurul Yudhi Prihastuy, Sp.A', hari: 'Senin-Jumat', jam: '08.00-09.00' }] },
  { nama: 'Dokter VCT', dokter: [{ nama: 'dr. Niken Dumilah', hari: 'Senin-Jumat', jam: 'Sesuai Jam Kerja' }] },
  { nama: 'Radiologi', dokter: [{ nama: 'dr. Trilia Kurniati, Sp.Rad', hari: 'Senin-Jumat', jam: 'Sesuai Jam Kerja' }] },
  { nama: 'Laboratorium', dokter: [{ nama: 'dr. Dwita Riadini, Sp.PK', hari: 'Senin-Jumat', jam: 'Sesuai Jam Kerja' }] },
  { nama: 'Dokter Spesialis Anestesi', dokter: [{ nama: 'dr. Donny Tilon, Sp.An', hari: 'Senin-Jumat', jam: 'Sesuai Jam Kerja' }] },
  { nama: 'Dokter Spesialis Anestesiologi & Terapi Intensif', dokter: [{ nama: 'dr. Ardhani Khalifatul Nur Kholis, Sp.An-Ti', hari: 'Sabtu & Minggu', jam: 'Sesuai Jam Kerja' }] },
  { nama: 'Layanan Fisioterapi', dokter: [{ nama: 'Mochamad Nursaid, A.Md', hari: 'Senin-Jumat', jam: 'Sesuai Jam Kerja' }, { nama: 'David Aryanto, A.Md.F', hari: 'Senin-Jumat', jam: 'Sesuai Jam Kerja' }] },
  { nama: 'Layanan Konsultasi Gizi', dokter: [{ nama: 'Nur Rizqi Intan Syaputri, S.ST', hari: 'Senin-Jumat', jam: 'Sesuai Jam Kerja' }] },
];

async function getBlobData() {
  const { blobs } = await list();
  const file = blobs.find((b) => b.pathname === 'knowledge.json');

  if (!file) {
    throw new Error('File knowledge.json tidak ditemukan di Blob Store!');
  }

  const response = await fetch(file.url, {
    headers: {
      Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Gagal ambil knowledge.json. Status: ${response.status}`);
  }

  return await response.json();
}

function chunkText(text, maxLength = 800) {
  if (!text) return [];
  const paragraphs = text.split('\n\n').map((p) => p.trim()).filter(Boolean);
  const chunks = [];
  let current = '';

  for (const p of paragraphs) {
    if ((current + '\n\n' + p).length > maxLength && current) {
      chunks.push(current.trim());
      current = p;
    } else {
      current = current ? current + '\n\n' + p : p;
    }
  }
  if (current) chunks.push(current.trim());

  return chunks.length > 0 ? chunks : [text];
}

async function migrateKnowledgeBase() {
  console.log('\n📥 Mengambil data dari Vercel Blob...');
  const data = await getBlobData();

  const kategoriMap = {
    baseInfo: 'Informasi Umum',
    standarPelayananPublik: 'Standar Pelayanan Publik',
    panduanJKN: 'Panduan JKN Mobile',
  };

  let totalInserted = 0;

  for (const [key, judul] of Object.entries(kategoriMap)) {
    const rawText = data[key];
    if (!rawText) {
      console.log(`⚠️  Skip "${key}" — kosong/tidak ada di knowledge.json`);
      continue;
    }

    const chunks = chunkText(rawText);
    console.log(`\n📝 Kategori "${judul}": ${chunks.length} potongan (chunk)`);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      process.stdout.write(`   -> Generate embedding chunk ${i + 1}/${chunks.length}... `);

      const embedding = await embedText(chunk);

      const { error } = await supabase.from('knowledge_base').insert({
        kategori: key,
        judul: chunks.length > 1 ? `${judul} (bagian ${i + 1})` : judul,
        konten: chunk,
        embedding,
      });

      if (error) {
        console.log('❌ GAGAL:', error.message);
      } else {
        console.log('✅');
        totalInserted++;
      }

      await new Promise((r) => setTimeout(r, 300));
    }
  }

  console.log(`\n✅ Selesai migrasi knowledge_base. Total ${totalInserted} baris masuk.`);
}

async function migratePoliDokter() {
  console.log('\n📥 Migrasi data jadwal dokter (poli_dokter)...');
  let totalInserted = 0;

  for (const poli of daftarPoli) {
    for (const dokter of poli.dokter) {
      const { error } = await supabase.from('poli_dokter').insert({
        nama_poli: poli.nama,
        nama_dokter: dokter.nama,
        hari: dokter.hari,
        jam: dokter.jam,
      });

      if (error) {
        console.log(`❌ GAGAL insert ${dokter.nama}:`, error.message);
      } else {
        totalInserted++;
      }
    }
  }

  console.log(`✅ Selesai migrasi poli_dokter. Total ${totalInserted} baris masuk.`);
}

async function main() {
  console.log('🚀 Mulai migrasi data ke Supabase...\n');

  try {
    await migrateKnowledgeBase();
    await migratePoliDokter();
    console.log('\n🎉 SEMUA DATA BERHASIL DIMIGRASI!');
  } catch (err) {
    console.error('\n💥 ERROR:', err.message);
    if (err.cause) {
      console.error('   Penyebab asli:', err.cause.message || err.cause);
    }
    console.error('\n   Stack trace lengkap:');
    console.error(err);
    process.exit(1);
  }
}

main();
