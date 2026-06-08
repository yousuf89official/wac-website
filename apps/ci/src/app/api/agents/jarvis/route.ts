import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { askJarvis } from '@/agents/jarvis';
import { logActivity } from '@/lib/activity-log';

// POST /api/agents/jarvis — Run Jarvis with a prompt
export async function POST(request: Request) {
    const { error, session } = await requireAdmin();
    if (error) return error;

    try {
        const { prompt, maxTurns, maxBudgetUsd } = await request.json();

        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        await logActivity({
            userId: session!.user.id,
            userName: session!.user.name || 'Admin',
            userEmail: session!.user.email || 'system',
            action: 'create',
            target: 'Agent:Jarvis',
            detail: `Jarvis invoked: "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"`,
        });

        const result = await askJarvis(prompt, {
            maxTurns: maxTurns || 30,
            maxBudgetUsd: maxBudgetUsd || 3.0,
        });

        return NextResponse.json({ result });
    } catch (err: any) {
        console.error('Jarvis error:', err);
        return NextResponse.json({ error: err.message || 'Jarvis encountered an error' }, { status: 500 });
    }
}
