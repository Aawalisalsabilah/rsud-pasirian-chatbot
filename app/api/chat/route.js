import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { buildSystemPrompt, getValidDoctorNames, detectPendaftaranAmbiguous } from '@/lib/knowledge';
import { chatRateLimit, getClientIp } from '@/lib/rate-limit';
import { put } from '@vercel/blob';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const LINK_DAFTAR_UMUM = '/?openDaftar=umum';
const LINK_MOBILE_JKN_ANDROID = 'https://play.google.com/store/apps/details?id=com.telkom.mobile.jkn';
const LINK_MOBILE_JKN_IOS = 'https://apps.apple.com/id/app/mobile-jkn/id1237601115';

const KEYWORDS_PENDAFTARAN = ['daftar', 'pendaftaran', 'mendaftar', 'booking', 'cara periksa', 'cara berobat'];
const KEYWORDS_BPJS = ['bpjs', 'jkn'];
const KEYWORDS_UMUM = ['umum'];

const MAX_MESSAGE_LENGTH = 1000;

const GREETING_REGEX = /^(hai+|ha?llo+|hi+|hey+|halo+|permisi|mau tanya|tanya dong|min|admin|assalamualaikum|selamat (pagi|siang|sore|malam)|pagi|siang|sore|malam|tes|test|p)[\s.,!?]*$/i;

const GREETING_REPLY = 'Halo, selamat datang di RSUD Pasirian Lumajang! 👋\n\nSaya Pasirian Smart Assistant, siap membantu Anda seputar informasi layanan rumah sakit seperti jadwal dokter, cara pendaftaran BPJS/umum, ketersediaan kamar rawat inap, dan lainnya.\n\nAda yang bisa saya bantu?';

const OFF_TOPIC_KEYWORDS = [
    'resep masakan', 'resep makanan', 'buatkan puisi', 'buat puisi', 'buatkan cerita', 'buat cerita',
    'kode program', 'coding', 'source code', 'terjemahkan', 'lirik lagu', 'buatkan lagu',
    'hitung', 'matematika', 'ramalan', 'zodiak', 'horoskop', 'lelucon', 'humor dong',
    'siapa presiden', 'cuaca hari ini', 'skor pertandingan', 'harga saham', 'kurs dollar',
];

const OFF_TOPIC_REPLY = 'Mohon maaf, saya hanya dapat membantu pertanyaan seputar layanan RSUD Pasirian Lumajang, seperti jadwal dokter, pendaftaran pasien, ketersediaan kamar, dan informasi layanan rumah sakit lainnya. Ada yang bisa saya bantu terkait hal tersebut?';

const PENDAFTARAN_CLARIFICATION_REPLY = 'Baik, sebelum saya jelaskan, Anda ingin mendaftar sebagai pasien BPJS/JKN atau pasien umum (mandiri)?';

function isGreeting(text) {
    return GREETING_REGEX.test((text || '').trim());
}

function isOffTopic(text) {
    const lower = (text || '').toLowerCase();
    return OFF_TOPIC_KEYWORDS.some((kw) => lower.includes(kw));
}

const MENU_RULES = [
    {
        menu: 'Cara Daftar Pasien BPJS',
        keywords: ['bpjs', 'jkn', 'daftar bpjs', 'daftar jkn', 'mobile jkn', 'kartu bpjs', 'peserta bpjs'],
    },
    {
        menu: 'Cara Daftar Pasien Umum',
        keywords: ['pasien umum', 'daftar umum', 'bayar sendiri', 'non bpjs', 'tanpa bpjs', 'biaya sendiri'],
    },
    {
        menu: 'Ubah Jadwal Kontrol BPJS',
        keywords: ['ubah jadwal', 'reschedule', 'ganti jadwal', 'jadwal kontrol', 'batal kontrol', 'pindah jadwal'],
    },
    {
        menu: 'Jadwal Pelayanan Poli Klinik',
        keywords: ['jadwal dokter', 'jadwal poli', 'praktek dokter', 'jam praktek', 'jadwal klinik'],
    },
    {
        menu: 'Info Kamar Rawat Inap',
        keywords: ['kamar rawat inap', 'rawat inap', 'ketersediaan kamar', 'kamar kosong', 'kelas kamar'],
    },
    {
        menu: 'Standar Pelayanan Publik',
        keywords: ['standar pelayanan', 'hak pasien', 'kewajiban pasien', 'sop pelayanan', 'maklumat pelayanan'],
    },
    {
        menu: 'Panduan Pendaftaran JKN Mobile',
        keywords: ['cara pakai mobile jkn', 'install mobile jkn', 'download mobile jkn', 'aplikasi jkn', 'panduan jkn mobile'],
    },
];

function detectMenu(userQuestion, botResponse) {
    const combined = `${(userQuestion || '').toLowerCase()} ${(botResponse || '').toLowerCase()}`;

    for (const rule of MENU_RULES) {
        const matched = rule.keywords.some((kw) => combined.includes(kw));
        if (matched) return rule.menu;
    }

    return null;
}

function isClarifyingQuestion(reply) {
    const trimmed = (reply || '').trim();
    return trimmed.endsWith('?');
}

function appendMenuSuggestion(reply, lastUserContent) {
    if (isClarifyingQuestion(reply)) return reply;

    const menuName = detectMenu(lastUserContent, reply);
    if (!menuName) return reply;
    if (reply.includes(menuName)) return reply;

    return `${reply}\n\nUntuk informasi lebih lengkap, Anda bisa klik menu **${menuName}** yang tersedia di halaman ini ya.`;
}

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

    let incomingMessages;
    try {
        const body = await request.json();
        incomingMessages = body.messages;
        var selectedPoli = body.selectedPoli || null;

        if (!incomingMessages || !Array.isArray(incomingMessages)) {
            return NextResponse.json({ reply: 'Format data chat tidak valid.' }, { status: 400 });
        }

        const lastMsg = [...incomingMessages].reverse().find((m) => m.role === 'user');
        if (lastMsg?.content && lastMsg.content.length > MAX_MESSAGE_LENGTH) {
            return NextResponse.json(
                { reply: `Pesan terlalu panjang. Mohon persingkat pertanyaan Anda (maksimal ${MAX_MESSAGE_LENGTH} karakter).` },
                { status: 400 }
            );
        }

    } catch (parseError) {
        console.error('[REQUEST PARSE ERROR]', parseError);
        return NextResponse.json({ reply: 'Format permintaan tidak valid.' }, { status: 400 });
    }

    const lastUserMessage = [...incomingMessages].reverse().find((m) => m.role === 'user');

    if (isGreeting(lastUserMessage?.content)) {
        return NextResponse.json({ reply: GREETING_REPLY });
    }

    if (isOffTopic(lastUserMessage?.content)) {
        return NextResponse.json({ reply: OFF_TOPIC_REPLY });
    }

    const lowerLastUserContent = (lastUserMessage?.content || '').toLowerCase();
    if (detectPendaftaranAmbiguous(lowerLastUserContent)) {
        return NextResponse.json({ reply: PENDAFTARAN_CLARIFICATION_REPLY });
    }

    let dynamicSystemPrompt;
    let validDoctorNames;
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
            model: 'openai/gpt-oss-20b',
            temperature: 0.3,
            max_tokens: 1024,
        });

        reply = chatCompletion.choices[0]?.message?.content || 'Maaf, sistem tidak memberikan respon.';

        if (containsUnknownDoctor(reply, validDoctorNames)) {
            console.warn('[INJECTION SUSPECTED] Reply menyebut nama dokter tidak dikenal:', reply);
            reply = 'Maaf, saya tidak dapat memverifikasi informasi tersebut. Untuk data dokter dan jadwal poli yang akurat, silakan hubungi bagian informasi RSUD Pasirian secara langsung.';
        }

        reply = appendRegistrationLink(reply, lastUserMessage?.content);
        reply = appendMenuSuggestion(reply, lastUserMessage?.content);

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