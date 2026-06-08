import React from 'react';

interface GlitchTextProps {
  text: string;
  className?: string;
}

const GlitchText: React.FC<GlitchTextProps> = ({ text, className = '' }) => {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{text}</span>
      <span 
        className="absolute top-0 left-0 text-[#00f0ff] opacity-70 animate-pulse"
        style={{ 
          clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)',
          transform: 'translate(-2px, -2px)',
          animation: 'glitch1 2s infinite linear alternate-reverse'
        }}
        aria-hidden="true"
      >
        {text}
      </span>
      <span 
        className="absolute top-0 left-0 text-[#ff006e] opacity-70"
        style={{ 
          clipPath: 'polygon(0 55%, 100% 55%, 100% 100%, 0 100%)',
          transform: 'translate(2px, 2px)',
          animation: 'glitch2 3s infinite linear alternate-reverse'
        }}
        aria-hidden="true"
      >
        {text}
      </span>
      <style>{`
        @keyframes glitch1 {
          0% { transform: translate(-2px, -2px); }
          20% { transform: translate(2px, 0px); }
          40% { transform: translate(-1px, -1px); }
          60% { transform: translate(1px, 1px); }
          80% { transform: translate(-2px, 2px); }
          100% { transform: translate(2px, -2px); }
        }
        @keyframes glitch2 {
          0% { transform: translate(2px, 2px); }
          25% { transform: translate(-2px, 0px); }
          50% { transform: translate(1px, -1px); }
          75% { transform: translate(-1px, 1px); }
          100% { transform: translate(2px, -2px); }
        }
      `}</style>
    </span>
  );
};

export default GlitchText;
