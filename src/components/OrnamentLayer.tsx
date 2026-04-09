import React from 'react';
import { StyleVariant, MEMORIAL_STYLES } from './MemorialStyles';

interface OrnamentLayerProps {
  variant: StyleVariant;
  children: React.ReactNode;
  className?: string;
  isPremium?: boolean;
}

const FloralWatermark = () => (
  // Right-side faded floral branch mirroring the image
  <svg 
    className="absolute right-0 top-1/4 w-[160px] h-[400px] text-[var(--color-gold-muted,#B89C6F)] opacity-[0.25] pointer-events-none translate-x-12"
    viewBox="0 0 100 300" fill="currentColor" xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M90 50 C80 100, 60 150, 40 250 C50 200, 70 150, 95 100 Z" />
    <path d="M80 80 Q60 50 65 30 Q75 60 85 85 Z" />
    <path d="M70 130 Q40 100 30 80 Q50 115 75 135 Z" />
    <path d="M60 180 Q25 160 15 140 Q40 170 65 185 Z" />
    <path d="M50 230 Q15 220 5 200 Q30 225 55 235 Z" />
    <circle cx="65" cy="30" r="1.5" />
    <circle cx="30" cy="80" r="1.5" />
    <circle cx="15" cy="140" r="1.5" />
    <circle cx="5" cy="200" r="1.5" />
  </svg>
);

const CornerOrnament = ({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) => {
  const transform = {
    tl: '',
    tr: 'scaleX(-1)',
    bl: 'scaleY(-1)',
    br: 'scale(-1, -1)'
  }[position];

  return (
    <svg 
      className={`absolute w-16 h-16 text-[var(--color-gold-muted,#B89C6F)] opacity-90 ${position === 'tl' ? 'top-3 left-3' : position === 'tr' ? 'top-3 right-3' : position === 'bl' ? 'bottom-3 left-3' : 'bottom-3 right-3'}`}
      style={{ transform }}
      viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5"
    >
      <path d="M10,90 L10,10 L90,10" />
      <path d="M15,85 L15,15 L85,15" strokeWidth="0.5" />
      {/* Ornate corner swirls */}
      <path d="M10,40 C30,40 40,30 40,10" strokeWidth="1" />
      <path d="M15,45 C40,45 45,40 45,15" strokeWidth="0.5" />
      <path d="M10,25 C20,25 25,20 25,10" strokeWidth="1.5" />
      <circle cx="30" cy="30" r="2" fill="currentColor" stroke="none" />
      <circle cx="15" cy="55" r="1" fill="currentColor" stroke="none" />
      <circle cx="55" cy="15" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
};

export const OrnamentLayer: React.FC<OrnamentLayerProps> = ({ 
  variant, 
  children, 
  className = '',
  isPremium = true
}) => {
  const config = MEMORIAL_STYLES[variant];
  
  // High-end warm paper texture wrapper. 
  // We use multiple box inner shadows to simulate the subtle paper edge burn/vignette.
  const baseCardStyle = isPremium 
    ? "bg-[#F7F4EB] text-stone-800 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.1),inset_0_0_80px_rgba(184,156,111,0.05)] border-[0.5px] border-[#e8dfc8]"
    : "bg-white text-stone-800 border-[0.5px] border-stone-200";

  return (
    <div className={`relative w-full h-full overflow-hidden ${baseCardStyle} ${className}`}>
      
      {/* Paper noise texture overlay for the true print feeling */}
      <div className="absolute inset-0 opacity-[0.015] mix-blend-multiply pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")" }} />

      {/* Common watermark for premium variants */}
      {isPremium && <FloralWatermark />}

      {/* Outer borders and ornaments - ONLY render if Premium */}
      {isPremium && (
        <div className="absolute inset-0 pointer-events-none z-0">
          
          {/* Orthodox, Catholic, and Muslim share the intricate border in the 1:1 image */}
          {['orthodox', 'catholic', 'arabesque'].includes(config.ornamentType) && (
            <div className="absolute inset-5 border border-[#B89C6F]/40 flex justify-center">
              <CornerOrnament position="tl" />
              <CornerOrnament position="tr" />
              <CornerOrnament position="bl" />
              <CornerOrnament position="br" />
              {/* Inner thin frame */}
              <div className="absolute inset-[6px] border border-[#B89C6F]/20" />
            </div>
          )}

          {/* Emotiven / Atheist uses asymmetrical minimal branch */}
          {config.ornamentType === 'floral-soft' && (
            <div className="absolute inset-5 border border-stone-300/40">
               {/* Minimal branch top-left */}
               <svg className="absolute -top-1 -left-1 w-24 h-24 text-[var(--color-gold-muted,#B89C6F)] opacity-60" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                 <path d="M0,0 Q30,50 80,80" strokeWidth="1" />
                 <path d="M15,10 Q20,30 35,35" strokeWidth="0.5" />
                 <path d="M10,15 Q30,20 35,35" strokeWidth="0.5" />
                 <path d="M40,30 Q50,50 65,55" strokeWidth="0.5" />
                 <path d="M30,40 Q50,50 55,65" strokeWidth="0.5" />
               </svg>
            </div>
          )}

          {/* Star variant uses clean corners */}
          {config.ornamentType === 'star' && (
            <div className="absolute inset-5 border border-[#B89C6F]/50">
               <div className="absolute inset-[4px] border border-[#B89C6F]/30" />
               <div className="absolute top-2 left-2 text-[#B89C6F]/60 text-xs">★</div>
               <div className="absolute top-2 right-2 text-[#B89C6F]/60 text-xs">★</div>
               <div className="absolute bottom-2 left-2 text-[#B89C6F]/60 text-xs">★</div>
               <div className="absolute bottom-2 right-2 text-[#B89C6F]/60 text-xs">★</div>
            </div>
          )}

          {/* Classic variant uses plain elegant borders */}
          {config.ornamentType === 'floral' && (
            <div className="absolute inset-5 border-2 border-[#B89C6F]/30">
               <div className="absolute inset-[4px] border border-[#B89C6F]/20" />
            </div>
          )}

          {/* Top Symbol Placement perfectly spaced */}
          {config.symbol && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-[#F7F4EB] px-6 py-1 flex justify-center z-10 font-premium">
               {config.ornamentType === 'catholic' ? (
                 <span className="text-3xl font-light text-[#B89C6F] block leading-none">✝</span>
               ) : config.ornamentType === 'orthodox' ? (
                 <span className="text-[34px] font-light text-[#B89C6F] block leading-none">☦</span>
               ) : config.ornamentType === 'arabesque' ? (
                 <span className="text-[32px] font-light text-[#B89C6F] block leading-none">☾</span>
               ) : (
                 <span className={`text-[28px] font-light block leading-none ${config.colorTheme === 'red' ? 'text-red-900/80' : 'text-[#B89C6F]'}`}>
                   {config.symbol}
                 </span>
               )}
            </div>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div className={`relative z-10 w-full h-full pt-[70px] pb-[30px] ${config.fontTheme}`}>
        {children}
      </div>
    </div>
  );
};
