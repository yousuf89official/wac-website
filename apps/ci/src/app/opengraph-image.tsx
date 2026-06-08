import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Collaborative Intelligence - Unified Campaign Intelligence Platform';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #0C1222 0%, #162032 50%, #0C1222 100%)',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Background glow */}
                <div style={{
                    position: 'absolute',
                    top: '-200px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '800px',
                    height: '600px',
                    background: 'radial-gradient(ellipse, rgba(13,148,136,0.15) 0%, transparent 70%)',
                    display: 'flex',
                }} />

                {/* Grid pattern */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.05,
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    display: 'flex',
                }} />

                {/* Logo */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '80px',
                    height: '80px',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #0D9488, #0EA5E9)',
                    marginBottom: '32px',
                    boxShadow: '0 20px 60px rgba(13,148,136,0.3)',
                }}>
                    <span style={{ color: 'white', fontSize: '36px', fontWeight: 800 }}>CI</span>
                </div>

                {/* Title */}
                <h1 style={{
                    color: 'white',
                    fontSize: '56px',
                    fontWeight: 800,
                    letterSpacing: '-2px',
                    margin: 0,
                    textAlign: 'center',
                    lineHeight: 1.1,
                }}>
                    Collaborative Intelligence
                </h1>

                {/* Subtitle */}
                <p style={{
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '24px',
                    fontWeight: 500,
                    margin: '16px 0 0 0',
                    textAlign: 'center',
                }}>
                    Unified Campaign Intelligence Platform
                </p>

                {/* Feature pills */}
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    marginTop: '40px',
                }}>
                    {['AI Analytics', 'Multi-Channel', 'Real-Time Insights', 'White-Label'].map(f => (
                        <div key={f} style={{
                            padding: '8px 20px',
                            borderRadius: '100px',
                            border: '1px solid rgba(13,148,136,0.3)',
                            background: 'rgba(13,148,136,0.1)',
                            color: '#0D9488',
                            fontSize: '14px',
                            fontWeight: 600,
                        }}>
                            {f}
                        </div>
                    ))}
                </div>

                {/* Domain */}
                <p style={{
                    position: 'absolute',
                    bottom: '30px',
                    color: 'rgba(255,255,255,0.2)',
                    fontSize: '16px',
                    fontWeight: 500,
                }}>
                    integratedmediahub.com
                </p>
            </div>
        ),
        { ...size }
    );
}
