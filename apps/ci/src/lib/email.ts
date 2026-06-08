/**
 * Email service via Resend.
 * Set RESEND_API_KEY in .env to enable. Without it, emails are logged only.
 */

export async function sendEmail(params: { to: string[]; subject: string; html: string; from?: string }) {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        console.log(`[Email] Would send to: ${params.to.join(', ')} | Subject: ${params.subject}`);
        return { id: 'mock', message: 'RESEND_API_KEY not set — email logged only' };
    }

    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);

    return resend.emails.send({
        from: params.from || 'Collaborative Intelligence <reports@integratedmediahub.com>',
        to: params.to,
        subject: params.subject,
        html: params.html,
    });
}
