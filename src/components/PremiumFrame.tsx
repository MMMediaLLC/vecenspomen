import React from 'react';

export type FrameStyle = 'elegant' | 'orthodox' | 'catholic' | 'muslim' | 'star' | 'clean';

interface PremiumFrameProps {
  style?: FrameStyle;
  children: React.ReactNode;
  className?: string;
}

export const PremiumFrame: React.FC<PremiumFrameProps> = ({ style = 'elegant', children, className = '' }) => {
  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      
      {/* 
        Outer decorations based on style 
      */}
      <div className="absolute inset-0 pointer-events-none z-0">
        
        {style === 'elegant' && (
          <div className="absolute inset-x-2 inset-y-2 md:inset-x-4 md:inset-y-4 border border-stone-800 pointer-events-none">
            <div className="absolute inset-x-1 inset-y-1 border border-stone-800/30" />
            <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-stone-800 -translate-x-[2px] -translate-y-[2px]" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-stone-800 translate-x-[2px] -translate-y-[2px]" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-stone-800 -translate-x-[2px] translate-y-[2px]" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-stone-800 translate-x-[2px] translate-y-[2px]" />
          </div>
        )}

        {style === 'orthodox' && (
          <div className="absolute inset-x-3 inset-y-3 md:inset-x-5 md:inset-y-5 border-2 border-stone-800 pointer-events-none">
             <div className="absolute top-3 left-3 w-10 h-10 border-t-2 border-l-2 border-stone-800 rounded-tl-full" />
             <div className="absolute top-3 right-3 w-10 h-10 border-t-2 border-r-2 border-stone-800 rounded-tr-full" />
             <div className="absolute bottom-3 left-3 w-10 h-10 border-b-2 border-l-2 border-stone-800 rounded-bl-full" />
             <div className="absolute bottom-3 right-3 w-10 h-10 border-b-2 border-r-2 border-stone-800 rounded-br-full" />
             {/* Center Top Symbol */}
             <div className="absolute -top-[0.6rem] md:-top-[1.25rem] left-1/2 -translate-x-1/2 bg-white px-2">
               <span className="text-3xl text-stone-800 block leading-none">☦</span>
             </div>
          </div>
        )}

        {style === 'catholic' && (
          <div className="absolute inset-x-4 inset-y-4 md:inset-x-6 md:inset-y-6 border-[3px] border-double border-stone-800 pointer-events-none flex items-center justify-center">
            <div className="absolute top-[-6px] left-[-6px] w-3 h-3 bg-stone-800 rotate-45" />
            <div className="absolute top-[-6px] right-[-6px] w-3 h-3 bg-stone-800 rotate-45" />
            <div className="absolute bottom-[-6px] left-[-6px] w-3 h-3 bg-stone-800 rotate-45" />
            <div className="absolute bottom-[-6px] right-[-6px] w-3 h-3 bg-stone-800 rotate-45" />
            {/* Center Top Symbol */}
            <div className="absolute -top-[1.25rem] left-1/2 -translate-x-1/2 bg-white px-3 flex justify-center">
               <span className="text-xl text-stone-800 block leading-none font-bold">✝</span>
            </div>
          </div>
        )}

        {style === 'muslim' && (
          <div className="absolute inset-x-4 inset-y-4 md:inset-x-6 md:inset-y-6 border border-stone-800 pointer-events-none">
            <div className="absolute top-0 left-0 w-12 h-12 border-b border-r border-stone-800 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white" />
            <div className="absolute top-0 right-0 w-12 h-12 border-b border-l border-stone-800 translate-x-1/2 -translate-y-1/2 -rotate-45 bg-white" />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-t border-r border-stone-800 -translate-x-1/2 translate-y-1/2 -rotate-45 bg-white" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-t border-l border-stone-800 translate-x-1/2 translate-y-1/2 rotate-45 bg-white" />
            {/* Center Top Symbol */}
            <div className="absolute -top-[1rem] left-1/2 -translate-x-1/2 bg-white px-2">
               <span className="text-xl text-stone-800 block leading-none font-sans">☾</span>
            </div>
          </div>
        )}

        {style === 'star' && (
          <div className="absolute inset-x-3 inset-y-3 md:inset-x-5 md:inset-y-5 border border-stone-800 pointer-events-none">
            <div className="absolute inset-x-1 inset-y-1 border border-dashed border-stone-300" />
            {/* Center Top Symbol */}
            <div className="absolute -top-[0.8rem] left-1/2 -translate-x-1/2 bg-white px-2">
               <span className="text-lg text-stone-800 block leading-none">★</span>
            </div>
          </div>
        )}

        {style === 'clean' && (
          <div className="absolute inset-x-4 inset-y-4 md:inset-x-6 md:inset-y-6 border border-stone-800 pointer-events-none" />
        )}
      </div>

      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};
