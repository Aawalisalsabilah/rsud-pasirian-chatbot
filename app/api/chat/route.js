import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { buildSystemPrompt } from '@/lib/knowledge';

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
        
        // --- PERUBAHAN DI SINI: Tambahkan 'await' ---
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

        const chatCompletion = await groq.chat.completions.create({
            messages: fullMessages,
            model: 'llama-3.1-8b-instant',
            temperature: 0.3,
            max_tokens: 800,
        });

        const reply = chatCompletion.choices[0]?.message?.content || 'Maaf, sistem tidak memberikan respon.';
        return NextResponse.json({ reply });

    } catch (error) {
        console.error('Groq API Error:', error);
        return NextResponse.json(
            { reply: 'Waduh, sistem AI sedang beristirahat sebentar. Coba kirim ulang ya!' },
            { status: 500 }
        );
    }
}