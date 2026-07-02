import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { buildSystemPrompt } from '@/lib/knowledge';
import { put } from '@vercel/blob';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request) {
    let incomingMessages;

    // --- 1. PARSE REQUEST BODY ---
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

    // --- 2. BANGUN SYSTEM PROMPT (termasuk ambil data dari Vercel Blob) ---
    let dynamicSystemPrompt;
    try {
        const lastUserMessage = [...incomingMessages].reverse().find((m) => m.role === 'user');
        dynamicSystemPrompt = await buildSystemPrompt(lastUserMessage?.content || '');
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

    // --- 3. PANGGIL GROQ API ---
    let reply;
    try {
        const recentMessages = incomingMessages.slice(-6);
        const fullMessages = [
            { role: 'system', content: dynamicSystemPrompt },
            ...recentMessages,
        ];

        const chatCompletion = await groq.chat.completions.create({
            messages: fullMessages,
            model: 'llama-3.1-8b-instant',
            temperature: 0.3,
            max_tokens: 800,
        });

        reply = chatCompletion.choices[0]?.message?.content || 'Maaf, sistem tidak memberikan respon.';
    } catch (groqError) {
        // groq-sdk biasanya melampirkan status & error body asli di sini
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

    // --- 4. SIMPAN LOG KE VERCEL BLOB (gagal di sini TIDAK membatalkan respon ke user) ---
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