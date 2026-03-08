import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'We Are Collaborative';
    const subtitle = searchParams.get('subtitle') || 'Elite Marketing Collective';

    return new ImageResponse(
        (
            <div
                style={{
                    width: '1200px',
                    height: '630px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-end',
                    background: '#0a0a0a',
                    padding: '72px 80px',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Grid lines */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        backgroundImage:
                            'linear-gradient(rgba(0,240,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.04) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }}
                />

                {/* Glow top-right */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-120px',
                        right: '-120px',
                        width: '600px',
                        height: '600px',
                        borderRadius: '9999px',
                        background: 'radial-gradient(circle, rgba(176,0,255,0.18) 0%, transparent 70%)',
                        display: 'flex',
                    }}
                />

                {/* Glow bottom-left */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: '-80px',
                        left: '-80px',
                        width: '480px',
                        height: '480px',
                        borderRadius: '9999px',
                        background: 'radial-gradient(circle, rgba(0,240,255,0.12) 0%, transparent 70%)',
                        display: 'flex',
                    }}
                />

                {/* Top badge */}
                <div
                    style={{
                        position: 'absolute',
                        top: '64px',
                        left: '80px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                    }}
                >
                    <div
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #00f0ff 0%, #b000ff 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <div style={{ color: '#0a0a0a', fontSize: '18px', fontWeight: 900, display: 'flex' }}>W</div>
                    </div>
                    <span
                        style={{
                            color: 'rgba(255,255,255,0.6)',
                            fontSize: '18px',
                            fontWeight: 500,
                            letterSpacing: '0.05em',
                        }}
                    >
                        wearecollaborative.net
                    </span>
                </div>

                {/* Cyan accent line */}
                <div
                    style={{
                        width: '64px',
                        height: '4px',
                        background: 'linear-gradient(90deg, #00f0ff, #b000ff)',
                        borderRadius: '2px',
                        marginBottom: '24px',
                        display: 'flex',
                    }}
                />

                {/* Title */}
                <div
                    style={{
                        fontSize: title.length > 40 ? '52px' : '64px',
                        fontWeight: 800,
                        color: '#ffffff',
                        lineHeight: 1.1,
                        maxWidth: '900px',
                        letterSpacing: '-0.02em',
                        marginBottom: '20px',
                        display: 'flex',
                        flexWrap: 'wrap',
                    }}
                >
                    {title}
                </div>

                {/* Subtitle */}
                <div
                    style={{
                        fontSize: '24px',
                        fontWeight: 400,
                        color: 'rgba(255,255,255,0.55)',
                        letterSpacing: '0.02em',
                        display: 'flex',
                    }}
                >
                    {subtitle}
                </div>

                {/* Bottom right tag */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: '64px',
                        right: '80px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                        borderRadius: '999px',
                        border: '1px solid rgba(0,240,255,0.25)',
                        background: 'rgba(0,240,255,0.05)',
                    }}
                >
                    <div
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '9999px',
                            background: '#00f0ff',
                            display: 'flex',
                        }}
                    />
                    <span style={{ color: '#00f0ff', fontSize: '16px', fontWeight: 500, display: 'flex' }}>
                        Digital Marketing Agency
                    </span>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    );
}
