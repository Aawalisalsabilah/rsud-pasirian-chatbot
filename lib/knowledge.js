import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ===== SETUP CLIENTS =====
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });

// ===== HELPER: hitung Senin-Minggu untuk minggu berjalan =====
const namaHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const namaBulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function formatTanggal(date) {
  return `${date.getDate()} ${namaBulan[date.getMonth()]} ${date.getFullYear()}`;
}

export function getCurrentWeekInfo() {
  const today = new Date();
  const dayIndex = today.getDay();
  const diffToMonday = dayIndex === 0 ? -6 : 1 - dayIndex;

  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);

  const week = {};
  const urutanHari = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  urutanHari.forEach((hari, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    week[hari] = formatTanggal(d);
  });

  const periodeText = `${week['Senin']} - ${week['Minggu']}`;
  const todayLabel = `${namaHari[today.getDay()]} , ${formatTanggal(today)}`;

  return { week, periodeText, todayLabel };
}

function hariKeTanggal(hariText, week) {
  if (hariText === 'Senin-Jumat') return `Senin-Jumat (${week['Senin']} - ${week['Jumat']})`;
  if (hariText === 'Sabtu & Minggu') return `Sabtu & Minggu (${week['Sabtu']} & ${week['Minggu']})`;
  if (hariText === 'Selasa & Kamis') return `Selasa & Kamis (${week['Selasa']} & ${week['Kamis']})`;
  if (hariText === 'Senin, Rabu, Jumat') return `Senin, Rabu, Jumat (${week['Senin']}, ${week['Rabu']}, ${week['Jumat']})`;
  if (hariText === 'Jumat') return `Jumat (${week['Jumat']})`;
  return hariText;
}

async function getJadwalPoliText(week, periodeText) {
  const { data, error } = await supabase
    .from('poli_dokter')
    .select('nama_poli, nama_dokter, hari, jam')
    .eq('is_active', true)
    .order('nama_poli');

  if (error || !data || data.length === 0) {
    console.error('[SUPABASE poli_dokter ERROR]', error?.message);
    return '';
  }

  const grouped = {};
  for (const row of data) {
    if (!grouped[row.nama_poli]) grouped[row.nama_poli] = [];
    grouped[row.nama_poli].push(row);
  }

  const daftarText = Object.entries(grouped).map(([namaPoli, dokterList]) => {
    const dokterText = dokterList
      .map((d) => `  • **${d.nama_dokter}** — ${hariKeTanggal(d.hari, week)}, **${d.jam}**`)
      .join('\n');
    return `- **${namaPoli}**:\n${dokterText}`;
  }).join('\n');

  return `\nDAFTAR POLIKLINIK & JADWAL DOKTER (PERIODE: **${periodeText}**):\n${daftarText}`;
}

async function getBaseInfo() {
  const { data, error } = await supabase
    .from('knowledge_base')
    .select('konten')
    .eq('kategori', 'baseInfo');

  if (error || !data || data.length === 0) {
    console.error('[SUPABASE baseInfo ERROR]', error?.message);
    return '';
  }

  return data.map((row) => row.konten).join('\n\n');
}

// ===== GENERATE EMBEDDING BUAT PERTANYAAN USER =====
async function embedQuestion(text) {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}

// ===== RAG: CARI KONTEN PALING RELEVAN BERDASARKAN SIMILARITY =====
async function searchRelevantKnowledge(userQuestion) {
  if (!userQuestion || !userQuestion.trim()) return [];

  const queryEmbedding = await embedQuestion(userQuestion);

  const { data, error } = await supabase.rpc('match_knowledge_base', {
    query_embedding: queryEmbedding,
    match_threshold: 0.5,
    match_count: 5,
  });

  if (error) {
    console.error('[SUPABASE RAG SEARCH ERROR]', error.message);
    return [];
  }

  return data || [];
}

export async function buildSystemPrompt(userQuestion = '') {
  const q = userQuestion.toLowerCase();
  const { week, periodeText, todayLabel } = getCurrentWeekInfo();
  const infoHariIni = `\nINFORMASI WAKTU SAAT INI: Hari ini ${todayLabel}.`;

  const baseInfo = await getBaseInfo();

  // 2. RAG: cari konten paling relevan dari knowledge_base berdasarkan makna pertanyaan
  const relevantChunks = await searchRelevantKnowledge(userQuestion);
  const relevantText = relevantChunks
    .map((chunk) => `[${chunk.judul}]\n${chunk.konten}`)
    .join('\n\n');

  const keywordsJadwal = ['poli', 'jadwal', 'dokter', 'praktik', 'praktek', 'jam', 'bedah', 'ortopedi', 'paru', 'kandungan', 'gigi', 'anak', 'vct', 'radiologi', 'lab', 'anestesi', 'fisio', 'gizi'];
  let jadwalPoliText = '';
  if (keywordsJadwal.some((k) => q.includes(k))) {
    jadwalPoliText = await getJadwalPoliText(week, periodeText);
  }

  const parts = [baseInfo, infoHariIni, relevantText, jadwalPoliText].filter(Boolean);

  return parts.join('\n').trim();
}