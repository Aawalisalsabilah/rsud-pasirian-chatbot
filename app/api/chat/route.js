import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { buildSystemPrompt } from '@/lib/knowledge';
import { put } from '@vercel/blob';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request) {
    try {
        const body = await request.json();
        const incomingMessages = body.messages;

        if (!incomingMessages || !Array.isArray(incomingMessages)) {
            return NextResponse.json({ reply: 'Format data chat tidak valid.' }, { status: 400 });
        }

        // Ambil pertanyaan terakhir
        const lastUserMessage = [...incomingMessages].reverse().find((m) => m.role === 'user');
        
        // Membangun system prompt dinamis
        const dynamicSystemPrompt = await buildSystemPrompt(lastUserMessage?.content || '');

        // Batasi histori chat
        const recentMessages = incomingMessages.slice(-6);

        const fullMessages = [
            {
                role: 'system',
                content: dynamicSystemPrompt,
            },
            ...recentMessages
        ];

        // Mendapatkan respon dari Groq
        const chatCompletion = await groq.chat.completions.create({
            messages: fullMessages,
            model: 'llama-3.1-8b-instant',
            temperature: 0.3,
            max_tokens: 800,
        });

        const reply = chatCompletion.choices[0]?.message?.content || 'Maaf, sistem tidak memberikan respon.';

        // --- PROSES PENYIMPANAN KE VERCEL BLOB ---
        try {
            const timestamp = new Date().toISOString();
            // Menyimpan log chat ke folder 'chat-logs'
            const fileName = `chat-logs/chat-${timestamp}.json`;
            await put(fileName, JSON.stringify({ 
                timestamp,
                incomingMessages, 
                reply 
            }), {
                access: 'private',
            });
        } catch (blobError) {
            // Log error tapi tidak membatalkan respon ke user
            console.error('Gagal menyimpan log ke Vercel Blob:', blobError);
        }

        return NextResponse.json({ reply });

    } catch (error) {
        console.error('Groq API Error:', error);
        // Pesan error yang ramah pengguna
        return NextResponse.json(
            { reply: 'Waduh, sistem AI sedang beristirahat sebentar. Coba kirim ulang ya!' },
            { status: 500 }
        );
    }
}