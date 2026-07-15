import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { buildSystemPrompt, getValidDoctorNames } from '@/lib/knowledge';
import { chatRateLimit, getClientIp } from '@/lib/rate-limit';
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

// Batas panjang pesan user, biar nggak ada yang sengaja kirim teks raksasa
// buat bikin prompt membengkak dan kena limit TPM Groq.
const MAX_MESSAGE_LENGTH = 1000;

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

function normalizeDoctorName(str) {
    return str
        .toLowerCase()
        .replace(/\bdr\.?\s*/g, '')
        .split(',')[0]
        .replace(/[.]/g, '')
        .trim();
}

function containsUnknownDoctor(replyText, validNames) {
    if (!validNames || validNames.length === 0) return false;

    const doctorMentionRegex = /\bdr\.?\s+([A-Z][a-zA-Z.]*(?:\s+[A-Z][a-zA-Z.]*){0,3})/gi;
    const mentions = [...replyText.matchAll(doctorMentionRegex)].map((m) => m[0].trim());

    if (mentions.length === 0) return false;

    const normalizedValidNames = validNames.map(normalizeDoctorName);

    for (const mention of mentions) {
        const normalizedMention = normalizeDoctorName(mention);
        const isKnown = normalizedValidNames.some(
            (validName) => validName.includes(normalizedMention) || normalizedMention.includes(validName)
        );
        if (!isKnown) return true;
    }

    return false;
}

export async function POST(request) {
    // ===== RATE LIMITING =====
    // Dibungkus try-catch: kalau Upstash lagi down/misconfigured, JANGAN
    // sampai seluruh chatbot ikut down. Fail-open (izinkan request) supaya
    // fitur utama tetap jalan meskipun proteksi rate limit sedang bermasalah.
    try {
        const ip = getClientIp(request);
        const { success, limit, remaining, reset } = await chatRateLimit.limit(ip);

        if (!success) {
            console.warn('[RATE LIMIT EXCEEDED]', { ip, limit, remaining });
            return NextResponse.json(
                { reply: 'Terlalu banyak permintaan dalam waktu singkat. Mohon tunggu sebentar sebelum mengirim pesan lagi ya.' },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': limit.toString(),
                        'X-RateLimit-Remaining': remaining.toString(),
                        'X-RateLimit-Reset': reset.toString(),
                    },
                }
            );
        }
    } catch (rateLimitError) {
        console.error('[RATE LIMIT ERROR - FAIL OPEN]', rateLimitError.message);
    }
    // ===== END RATE LIMITING =====

    let incomingMessages;
    try {
        const body = await request.json();
        incomingMessages = body.messages;
        var selectedPoli = body.selectedPoli || null;

        if (!incomingMessages || !Array.isArray(incomingMessages)) {
            return NextResponse.json({ reply: 'Format data chat tidak valid.' }, { status: 400 });
        }

        // ===== VALIDASI PANJANG PESAN =====
        const lastMsg = [...incomingMessages].reverse().find((m) => m.role === 'user');
        if (lastMsg?.content && lastMsg.content.length > MAX_MESSAGE_LENGTH) {
            return NextResponse.json(
                { reply: `Pesan terlalu panjang. Mohon persingkat pertanyaan Anda (maksimal ${MAX_MESSAGE_LENGTH} karakter).` },
                { status: 400 }
            );
        }
        // ===== END VALIDASI PANJANG PESAN =====

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
            max_tokens: 1024,
        });

        reply = chatCompletion.choices[0]?.message?.content || 'Maaf, sistem tidak memberikan respon.';

        if (containsUnknownDoctor(reply, validDoctorNames)) {
            console.warn('[INJECTION SUSPECTED] Reply menyebut nama dokter tidak dikenal:', reply);
            reply = 'Maaf, saya tidak dapat memverifikasi informasi tersebut. Untuk data dokter dan jadwal poli yang akurat, silakan hubungi bagian informasi RSUD Pasirian secara langsung.';
        }

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