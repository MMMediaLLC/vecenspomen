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
    <div className="flex w-full h-full">
      {/* Left Side: Photo (35%) */}
      <div className="w-[38%] h-full flex items-center justify-center pr-16 border-r-2 border-stone-100">
        <div className={`w-full aspect-[3/4] rounded-sm overflow-hidden shadow-2xl border-[8px] border-white ring-1 ring-stone-200 bg-white ${isPremium ? 'scale-105' : ''}`}>
          {photoUrl ? (
            <img 
              src={photoUrl} 
              alt={fullName} 
              className="w-full h-full object-cover grayscale-[0.1]"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="w-full h-full bg-stone-50 flex items-center justify-center text-stone-200 text-3xl font-serif">
              Тишина
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Content (62%) */}
      <div className="w-[62%] h-full pl-16 flex flex-col justify-center relative">
        
        <div className="mb-10">
          <h1 className={`text-stone-900 mb-4 leading-tight font-serif ${isPremium ? 'text-7xl font-bold' : 'text-6xl font-normal'}`}>
            {fullName || 'Име и Презиме'}
          </h1>
          <div className={`text-stone-500 font-serif tracking-[0.2em] ${isPremium ? 'text-4xl font-bold' : 'text-3xl font-light'}`}>
            {birthYear || '...'} – {deathYear || '...'}
          </div>
        </div>

        <div className="text-3xl text-stone-600 leading-relaxed mb-12 line-clamp-2 font-serif">
          "{message}"
        </div>

        <div className="flex justify-between items-end mt-auto">
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-stone-400 mb-4">Со љубов и почит од:</h4>
            <p className={`text-stone-900 font-serif ${isPremium ? 'text-4xl font-bold' : 'text-3xl font-normal'}`}>
              {senderName || 'Најблиските'}
            </p>
          </div>

          {/* Type Badge */}
          <div className="bg-stone-50 px-6 py-3 border border-stone-100 rounded-full">
            <span className="text-sm font-black uppercase tracking-[0.2em] text-stone-400">{type}</span>
          </div>
        </div>

        {/* Branding */}
        <div className="absolute bottom-[-40px] right-0 flex items-center gap-4 opacity-40">
          <span className="font-serif text-2xl font-black tracking-tighter text-stone-900">
            ВЕЧЕН СПОМЕН
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div 
      id="og-image-container"
      className={`bg-white w-[1200px] h-[630px] flex items-center p-20 relative overflow-hidden ${isPremium ? 'border-transparent' : 'border border-stone-200'}`}
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {isPremium ? (
        <PremiumFrame style={(selectedFrameStyle as FrameStyle) || 'elegant'} className="p-8">
          <ContentBody />
        </PremiumFrame>
      ) : (
        <ContentBody />
      )}
    </div>
  );
};

