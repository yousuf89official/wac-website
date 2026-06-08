import React, { useState } from 'react';

interface NeonButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

const NeonButton: React.FC<NeonButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  type = 'button',
  className = '',
  disabled = false,
  icon,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const baseStyles = 'relative font-semibold uppercase tracking-wider transition-all duration-300 overflow-hidden group rounded-lg';

  const sizeStyles = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  const variantStyles = {
    primary: `bg-gradient-to-r from-[#00f0ff] to-[#b000ff] text-black hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] ${isHovered ? 'scale-105' : ''}`,
    secondary: `bg-[#1a1a1a] text-white border border-[#00f0ff]/30 hover:border-[#00f0ff] hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]`,
    outline: `bg-transparent text-[#00f0ff] border-2 border-[#00f0ff] hover:bg-[#00f0ff]/10 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]`,
    ghost: `bg-transparent text-gray-400 hover:text-white hover:bg-white/5 transition-colors`,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {icon && <span className="flex items-center">{icon}</span>}
        {children}
      </span>
      {variant === 'primary' && (
        <span
          className="absolute inset-0 bg-gradient-to-r from-[#b000ff] to-[#00f0ff] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          aria-hidden="true"
        />
      )}
    </button>
  );
};

export default NeonButton;
