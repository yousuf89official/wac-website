import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { z } from 'zod'; // Import zod if we re-enable tools later
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim(),
});

export async function GET() {
    return NextResponse.json({ status: 'Chat API is online', model: 'gemini-1.5-flash-8b' });
}

export async function POST(req: Request) {
    try {
        const { messages: rawMessages } = await req.json();
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();

        if (!apiKey) {
            console.error("Missing Gemini API Key");
            return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
        }

        // Gemini MUST start with user and alternate. 
        // We only send the messages that fit this pattern.
        const messages = rawMessages
            .map((m: any) => {
                let content = '';
                if (typeof m.content === 'string') {
                    content = m.content;
                } else if (m.parts) {
                    content = m.parts.map((p: any) => p.text || '').join('');
                } else if (m.text) {
                    content = m.text;
                }

                return {
                    role: m.role === 'assistant' ? 'assistant' : 'user',
                    content: content || 'hello'
                };
            })
            .filter((m: any, index: number) => {
                // Ensure first message is user
                if (index === 0 && m.role !== 'user') return false;
                return true;
            });

        const result = await streamText({
            model: google('gemini-flash-latest'),
            messages: messages,
        });

        return result.toTextStreamResponse();

    } catch (error: any) {
        console.error('CRITICAL CHAT ERROR:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
