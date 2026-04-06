import React from 'react';
import { MemorialPost } from '../types';
import { PremiumFrame, FrameStyle } from './PremiumFrame';

interface OGImageTemplateProps {
  post: Partial<MemorialPost>;
}

export const OGImageTemplate: React.FC<OGImageTemplateProps> = ({ post }) => {
  const {
    fullName,
    birthYear,
    deathYear,
    dateOfFuneral,
    timeOfFuneral,
    placeOfFuneral,
    familyNote,
    senderName,
    introText,
    aiRefinedText,
    mainText,
    photoUrl,
    type,
    package: packageType,
    selectedFrameStyle
  } = post;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const months = [
      'јануари', 'февруари', 'март', 'април', 'мај', 'јуни',
      'јули', 'август', 'септември', 'октомври', 'ноември', 'декември'
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const isPremium = packageType === 'Истакнат';
  const message = (type === 'ТАЖНА ВЕСТ' && introText) ? introText : (aiRefinedText || mainText || '');

  const ContentBody = () => (
    <div className="flex w-full h-full items-center">
      {/* Left Side: Photo (40%) */}
      <div className="w-[40%] h-full flex items-center justify-center pr-12">
        <div className="relative group">
          <div className="absolute inset-0 bg-stone-900/5 rotate-1 scale-105 rounded-sm" />
          <div className={`relative w-[340px] h-[460px] overflow-hidden rounded-sm shadow-2xl border-[10px] border-white ring-1 ring-stone-200 bg-white ${isPremium ? 'scale-105 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)]' : ''}`}>
            {photoUrl ? (
              <img 
                src={photoUrl} 
                alt={fullName} 
                className="w-full h-full object-cover grayscale-[0.05] contrast-[1.05]"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-full h-full bg-stone-50 flex items-center justify-center text-stone-200 text-4xl font-serif">
                Тишина
              </div>
            )}
            {/* Survival strip */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-stone-950/20 rotate-45 translate-x-12 -translate-y-12 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Right Side: Content (60%) */}
      <div className="w-[60%] h-full pl-8 flex flex-col justify-center py-10">
        
        <div className="mb-8">
           <div className="flex items-center gap-4 mb-4">
              <div className="h-[2px] w-12 bg-stone-200" />
              <span className="text-sm font-black uppercase tracking-[0.4em] text-stone-400 font-sans">
                {type === 'ПОМЕН' ? 'Во Вечен Спомен' : 'Известување'}
              </span>
           </div>
          <h1 className={`text-stone-900 mb-2 leading-tight font-serif tracking-tight ${isPremium ? 'text-7xl font-bold' : 'text-6xl font-normal'}`}>
            {fullName || 'Име и Презиме'}
          </h1>
          <div className={`text-stone-500 font-serif tracking-[0.25em] ${isPremium ? 'text-3xl font-bold' : 'text-2xl font-light'}`}>
            {birthYear || '...'} – {deathYear || (post.dateOfDeath ? new Date(post.dateOfDeath).getFullYear() : '...')}
          </div>
        </div>

        <div className="relative mb-10 overflow-hidden">
          <p className="text-3xl text-stone-600 leading-relaxed italic font-serif line-clamp-3">
             „{message}“
          </p>
        </div>

        <div className="mt-auto flex flex-col gap-6">
          <div className="h-[1px] w-full bg-stone-100" />
          <div className="flex justify-between items-end">
            <div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-stone-300 mb-2 font-sans">Со љубов и почит од:</h4>
              <p className={`text-stone-900 font-serif ${isPremium ? 'text-4xl font-bold' : 'text-3xl font-normal'}`}>
                {familyNote || senderName || 'Најблиските'}
              </p>
            </div>
            
            {/* URL Branding */}
            <div className="text-right">
               <p className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400 font-sans mb-1">Објавено на</p>
               <p className="font-serif text-2xl font-black tracking-tighter text-stone-900/80">
                  VECENSPOMEN.MK
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div 
      id="og-image-container"
      className={`bg-white w-[1200px] h-[630px] flex items-center p-20 relative overflow-hidden paper-texture marble-texture ${isPremium ? 'border-transparent' : 'border border-stone-200'}`}
      style={{ boxSizing: 'border-box' }}
    >
      {isPremium ? (
        <PremiumFrame style={(selectedFrameStyle as FrameStyle) || 'elegant'} className="p-10">
          <ContentBody />
        </PremiumFrame>
      ) : (
        <div className="w-full h-full border-[20px] border-stone-50 p-12 flex items-center">
          <ContentBody />
        </div>
      )}
      
      {/* Corner Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50 rotate-45 translate-x-16 -translate-y-16 border-l border-stone-100 opacity-50" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-stone-50 rotate-45 -translate-x-16 translate-y-16 border-r border-stone-100 opacity-50" />
    </div>
  );
};

