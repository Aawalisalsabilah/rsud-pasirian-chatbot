import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { buildSystemPrompt, getValidDoctorNames } from '@/lib/knowledge';
import { put } from '@vercel/blob';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// ==== KONFIGURASI LINK PENDAFTARAN ====
// Link ini mengarah ke halaman utama (/) dengan query param, yang dibaca oleh
// app/page.jsx untuk otomatis membuka modal "Daftar Online" ke step yang sesuai.
const LINK_DAFTAR_UMUM = '/?openDaftar=umum';
const LINK_MOBILE_JKN_ANDROID = 'https://play.google.com/store/apps/details?id=com.telkom.mobile.jkn';
const LINK_MOBILE_JKN_IOS = 'https://apps.apple.com/id/app/mobile-jkn/id1237601115';

const KEYWORDS_PENDAFTARAN = ['daftar', 'pendaftaran', 'mendaftar', 'booking', 'cara periksa', 'cara berobat'];
const KEYWORDS_BPJS = ['bpjs', 'jkn'];
const KEYWORDS_UMUM = ['umum'];

// Nempelin link yang sudah pasti benar (bukan hasil karangan AI) di akhir reply,
// kalau konteks percakapan (pesan user ATAU jawaban AI) memang soal pendaftaran.
function appendRegistrationLink(reply, lastUserContent) {
    const lowerUser = (lastUserContent || '').toLowerCase();
    const lowerReply = (reply || '').toLowerCase();

    const isRegistrationContext = KEYWORDS_PENDAFTARAN.some((k) => lowerUser.includes(k) || lowerReply.includes(k));
    if (!isRegistrationContext) return reply;

    const mentionsBPJS = KEYWORDS_BPJS.some((k) => lowerUser.includes(k) || lowerReply.includes(k));
    const mentionsUmum = KEYWORDS_UMUM.some((k) => lowerUser.includes(k) || lowerReply.includes(k));

    // Kalau dua-duanya kesebut atau dua-duanya nggak jelas, jangan nebak — biarkan bot nanya dulu.
    if (mentionsBPJS && !mentionsUmum) {
        return `${reply}\n\n[📲 Download Mobile JKN (Android)](${LINK_MOBILE_JKN_ANDROID})\n[📲 Download Mobile JKN (iOS)](${LINK_MOBILE_JKN_IOS})`;
    }

    if (mentionsUmum && !mentionsBPJS) {
        return `${reply}\n\n[📝 Daftar Sekarang](${LINK_DAFTAR_UMUM})`;
    }

    return reply;
}

// Cek apakah reply menyebut nama dokter yang TIDAK ada di daftar dokter valid.
// Kalau iya, kemungkinan besar itu hasil manipulasi/prompt injection, bukan data asli.
function containsUnknownDoctor(replyText, validNames) {
    if (!validNames || validNames.length === 0) return false; // gagal fetch, skip verifikasi (fail-open untuk hindari false block total)

    // Cari semua pola "dr. Nama Nama" atau "Dr. Nama Nama" di reply
    const doctorMentionRegex = /\bdr\.?\s+([A-Z][a-zA-Z.]*(?:\s+[A-Z][a-zA-Z.]*){0,3})/gi;
    const mentions = [...replyText.matchAll(doctorMentionRegex)].map((m) => m[0].trim());

    if (mentions.length === 0) return false;

    const normalizedValidNames = validNames.map((n) => n.toLowerCase());

    for (const mention of mentions) {
        const normalizedMention = mention.toLowerCase();
        // valid kalau nama yang disebut adalah substring dari salah satu nama asli, atau sebaliknya
        const isKnown = normalizedValidNames.some(
            (validName) => validName.includes(normalizedMention) || normalizedMention.includes(validName)
        );
        if (!isKnown) return true; // ketemu nama dokter yang tidak dikenal
    }

    return false;
}

export async function POST(request) {
    let incomingMessages;
    try {
        const body = await request.json();
        incomingMessages = body.messages;

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
        dynamicSystemPrompt = await buildSystemPrompt(lastUserMessage?.content || '');
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
        const fullMessages = [
            { role: 'system', content: dynamicSystemPrompt },
            ...recentMessages,
        ];

        const chatCompletion = await groq.chat.completions.create({
            messages: fullMessages,
            model: 'llama-3.1-8b-instant',
            temperature: 0.3,
            max_tokens: 2048,
        });

        reply = chatCompletion.choices[0]?.message?.content || 'Maaf, sistem tidak memberikan respon.';

        // ===== VERIFIKASI: cek apakah reply menyebut dokter yang tidak ada di database =====
        if (containsUnknownDoctor(reply, validDoctorNames)) {
            console.warn('[INJECTION SUSPECTED] Reply menyebut nama dokter tidak dikenal:', reply);
            reply = 'Maaf, saya tidak dapat memverifikasi informasi tersebut. Untuk data dokter dan jadwal poli yang akurat, silakan hubungi bagian informasi RSUD Pasirian secara langsung.';
        }
        // ===== END VERIFIKASI =====

        // ===== AUTO-ATTACH LINK PENDAFTARAN (fixed, bukan hasil generate AI) =====
        reply = appendRegistrationLink(reply, lastUserMessage?.content);
        // ===== END AUTO-ATTACH LINK =====

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