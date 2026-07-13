import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { buildSystemPrompt, getValidDoctorNames } from '@/lib/knowledge';
import { put } from '@vercel/blob';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// ==== KONFIGURASI LINK PENDAFTARAN ====
const LINK_DAFTAR_UMUM = '/?openDaftar=umum';
const LINK_MOBILE_JKN_ANDROID = 'https://play.google.com/store/apps/details?id=com.telkom.mobile.jkn';
const LINK_MOBILE_JKN_IOS = 'https://apps.apple.com/id/app/mobile-jkn/id1237601115';

const KEYWORDS_PENDAFTARAN = ['daftar', 'pendaftaran', 'mendaftar', 'booking', 'cara periksa', 'cara berobat'];
const KEYWORDS_BPJS = ['bpjs', 'jkn'];
const KEYWORDS_UMUM = ['umum'];

function appendRegistrationLink(reply, lastUserContent) {
    const lowerUser = (lastUserContent || '').toLowerCase();
    const lowerReply = (reply || '').toLowerCase();

    const isRegistrationContext = KEYWORDS_PENDAFTARAN.some((k) => lowerUser.includes(k) || lowerReply.includes(k));
    if (!isRegistrationContext) return reply;

    const mentionsBPJS = KEYWORDS_BPJS.some((k) => lowerUser.includes(k) || lowerReply.includes(k));
    const mentionsUmum = KEYWORDS_UMUM.some((k) => lowerUser.includes(k) || lowerReply.includes(k));

    if (mentionsBPJS && !mentionsUmum) {
        return `${reply}\n\n[📲 Download Mobile JKN (Android)](${LINK_MOBILE_JKN_ANDROID})\n[📲 Download Mobile JKN (iOS)](${LINK_MOBILE_JKN_IOS})`;
    }

    if (mentionsUmum && !mentionsBPJS) {
        return `${reply}\n\n[📝 Daftar Sekarang](${LINK_DAFTAR_UMUM})`;
    }

    return reply;
}

// Normalisasi nama sebelum dibandingkan — buang prefix "dr." dan buang gelar
// spesialis (Sp.A, Sp.An-Ti, dst) setelah koma pertama, biar format "dr. Nama"
// (dari reply LLM) vs "dr. Nama, Sp.X" (dari database) tetap match.
function normalizeDoctorName(str) {
    return str
        .toLowerCase()
        .replace(/\bdr\.?\s*/g, '')   // buang semua kemunculan prefix "dr."/"dr "
        .split(',')[0]                 // buang gelar spesialis setelah koma pertama
        .replace(/[.]/g, '')
        .trim();
}

// Cek apakah reply menyebut nama dokter yang TIDAK ada di daftar dokter valid.
// Kalau iya, kemungkinan besar itu hasil manipulasi/prompt injection, bukan data asli.
function containsUnknownDoctor(replyText, validNames) {
    if (!validNames || validNames.length === 0) return false; // gagal fetch, skip verifikasi (fail-open)

    const doctorMentionRegex = /\bdr\.?\s+([A-Z][a-zA-Z.]*(?:\s+[A-Z][a-zA-Z.]*){0,3})/gi;
    const mentions = [...replyText.matchAll(doctorMentionRegex)].map((m) => m[0].trim());

    if (mentions.length === 0) return false;

    const normalizedValidNames = validNames.map(normalizeDoctorName);

    // DEBUG: lihat persis apa yang dibandingkan — hapus blok ini kalau sudah beres
    console.log('[DEBUG] validNames mentah:', validNames);
    console.log('[DEBUG] validNames dinormalisasi:', normalizedValidNames);

    for (const mention of mentions) {
        const normalizedMention = normalizeDoctorName(mention);
        const isKnown = normalizedValidNames.some(
            (validName) => validName.includes(normalizedMention) || normalizedMention.includes(validName)
        );
        console.log(`[DEBUG] mention="${mention}" -> normalized="${normalizedMention}" -> isKnown=${isKnown}`);
        if (!isKnown) return true; // ketemu nama dokter yang tidak dikenal
    }

    return false;
}

export async function POST(request) {
    let incomingMessages;
    try {
        const body = await request.json();
        incomingMessages = body.messages;
        var selectedPoli = body.selectedPoli || null; // dikirim frontend saat user klik tombol poli spesifik

        if (!incomingMessages || !Array.isArray(incomingMessages)) {
            return NextResponse.json({ reply: 'Format data chat tidak valid.' }, { status: 400 });
        }
    } catch (parseError) {
        console.error('[REQUEST PARSE ERROR]', parseError);
        return NextResponse.json({ reply: 'Format permintaan tidak valid.' }, { status: 400 });
    }

    let dynamicSystemPrompt;
    let validDoctorNames;
    const lastUserMessage = [...incomingMessages].reverse().find((m) => m.role === 'user');
    try {
        dynamicSystemPrompt = await buildSystemPrompt(lastUserMessage?.content || '', selectedPoli);
        validDoctorNames = await getValidDoctorNames();
    } catch (knowledgeError) {
        console.error('[KNOWLEDGE/BLOB ERROR]', {
            message: knowledgeError.message,
            name: knowledgeError.name,
            stack: knowledgeError.stack,
        });
        return NextResponse.json(
            { reply: 'Waduh, gagal memuat data layanan. Silakan coba beberapa saat lagi.' },
            { status: 500 }
        );
    }

    let reply;
    try {
        const recentMessages = incomingMessages.slice(-4);
        // PENTING: Groq API strict -- cuma terima {role, content} di tiap
        // message. Pesan dari frontend yang berupa tombol pilihan poli punya
        // field ekstra (type, polis) yang bikin Groq nolak seluruh request
        // dengan error 400. Sanitize dulu di sini, ambil role & content aja.
        const sanitizedMessages = recentMessages.map((m) => ({
            role: m.role,
            content: m.content,
        }));
        const fullMessages = [
            { role: 'system', content: dynamicSystemPrompt },
            ...sanitizedMessages,
        ];

        const chatCompletion = await groq.chat.completions.create({
            messages: fullMessages,
            model: 'llama-3.1-8b-instant',
            temperature: 0.3,
            max_tokens: 1024, // turun dari 2048 -- ini ikut dihitung sbg "requested tokens" oleh Groq TPM limit
        });

        reply = chatCompletion.choices[0]?.message?.content || 'Maaf, sistem tidak memberikan respon.';

        // ===== VERIFIKASI: cek apakah reply menyebut dokter yang tidak ada di database =====
        if (containsUnknownDoctor(reply, validDoctorNames)) {
            console.warn('[INJECTION SUSPECTED] Reply menyebut nama dokter tidak dikenal:', reply);
            reply = 'Maaf, saya tidak dapat memverifikasi informasi tersebut. Untuk data dokter dan jadwal poli yang akurat, silakan hubungi bagian informasi RSUD Pasirian secara langsung.';
        }
        // ===== END VERIFIKASI =====

        reply = appendRegistrationLink(reply, lastUserMessage?.content);

    } catch (groqError) {
        console.error('[GROQ API ERROR]', {
            message: groqError.message,
            status: groqError.status,
            error: groqError.error,
        });
        return NextResponse.json(
            { reply: 'Waduh, sistem AI sedang beristirahat sebentar. Coba kirim ulang ya!' },
            { status: 500 }
        );
    }

    try {
        const timestamp = new Date().toISOString();
        const fileName = `chat-logs/chat-${timestamp}.json`;
        await put(fileName, JSON.stringify({ timestamp, incomingMessages, reply }), {
            access: 'private',
        });
    } catch (blobError) {
        console.error('[BLOB SAVE ERROR]', {
            message: blobError.message,
            name: blobError.name,
        });
    }

    return NextResponse.json({ reply });
}