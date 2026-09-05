import React from 'react';

interface GuruLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  subtitleText?: string;
  className?: string;
}

export const GuruLogo: React.FC<GuruLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  subtitleText = 'Adaptive Learning',
  className = '',
}) => {
  const sizeConfig = {
    sm: {
      img: 'w-8 h-8 rounded-lg',
      title: 'text-sm font-bold',
      sub: 'text-[9px]',
      gap: 'gap-2.5',
    },
    md: {
      img: 'w-10 h-10 rounded-xl',
      title: 'text-base font-bold',
      sub: 'text-[10px]',
      gap: 'gap-3',
    },
    lg: {
      img: 'w-14 h-14 rounded-2xl',
      title: 'text-xl font-bold',
      sub: 'text-xs',
      gap: 'gap-3.5',
    },
    xl: {
      img: 'w-20 h-20 rounded-2xl',
      title: 'text-2xl font-bold',
      sub: 'text-sm',
      gap: 'gap-4',
    },
  }[size];

  return (
    <div className={`flex items-center ${sizeConfig.gap} select-none ${className}`}>
      {/* Logo Mascot Image */}
      <div className={`relative overflow-hidden shrink-0 border border-[var(--border)] shadow-xs bg-[#0b0f19] ${sizeConfig.img}`}>
        <img
          src="/guru-ai-logo.jpg"
          alt="Guru AI Mascot Logo"
          className="w-full h-full object-cover object-center transform scale-105"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Fallback if image path is unavailable
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className={`font-serif tracking-tight text-[var(--text-primary)] leading-none flex items-center gap-1 ${sizeConfig.title}`}>
          <span className="font-extrabold tracking-tight">Guru</span>
          <span className="text-[var(--primary)] font-sans font-black bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
            AI
          </span>
        </div>
        {showSubtitle && (
          <span className={`uppercase font-mono font-medium tracking-widest text-[var(--text-secondary)] leading-tight mt-0.5 ${sizeConfig.sub}`}>
            {subtitleText}
          </span>
        )}
      </div>
    </div>
  );
};
