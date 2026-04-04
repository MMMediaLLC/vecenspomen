import React from 'react';
import { MemorialPost } from '../types';

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
    type
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

  // Logic: Use introText for Тажна вест if present, otherwise mainText (refined priority)
  const message = (type === 'ТАЖНА ВЕСТ' && introText) ? introText : (aiRefinedText || mainText || '');

  return (
    <div 
      id="og-image-container"
      className="bg-stone-50 w-[1200px] h-[630px] flex items-center p-16 border border-stone-200"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* Left Side: Photo (35%) */}
      <div className="w-[35%] h-full flex items-center justify-center pr-12 border-r border-stone-200">
        <div className="w-full aspect-[3/4] rounded-xl overflow-hidden shadow-lg border border-stone-200 bg-white">
          {photoUrl ? (
            <img 
              src={photoUrl} 
              alt={fullName} 
              className="w-full h-full object-cover grayscale-[0.2]"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-300 text-2xl">
              Фотографија
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Content (65%) */}
      <div className="w-[65%] h-full pl-16 flex flex-col justify-center relative">
        <div className="mb-8">
          <h1 className="text-6xl font-serif text-stone-900 mb-4 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
            {fullName || 'Име и Презиме'}
          </h1>
          {(birthYear || deathYear) && (
            <div className="text-3xl text-stone-500 font-serif tracking-widest" style={{ fontFamily: 'Playfair Display, serif' }}>
              {birthYear || '...'} – {deathYear || '...'}
            </div>
          )}
        </div>

        <div className="text-2xl text-stone-700 leading-relaxed mb-10 line-clamp-3 italic" style={{ fontFamily: 'Playfair Display, serif' }}>
          "{message}"
        </div>

        {(dateOfFuneral || timeOfFuneral || placeOfFuneral) && (
          <div className="mb-10">
            <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-stone-400 mb-2">Погреб</h4>
            <div className="text-2xl text-stone-800 font-medium">
              {dateOfFuneral && <span>{formatDate(dateOfFuneral)}</span>}
              {timeOfFuneral && <span> во {timeOfFuneral} часот</span>}
            </div>
            {placeOfFuneral && <div className="text-xl text-stone-600 mt-1">{placeOfFuneral}</div>}
          </div>
        )}

        <div>
          <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-stone-400 mb-2">Ожалостени</h4>
          <p className="text-3xl text-stone-900 font-serif italic" style={{ fontFamily: 'Playfair Display, serif' }}>
            {senderName || 'Вашето име/семејство'}
          </p>
        </div>

        {/* Branding */}
        <div className="absolute bottom-0 right-0 flex items-center gap-3 opacity-60">
          <div className="w-8 h-8 bg-stone-900 rounded-sm flex items-center justify-center text-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <span className="font-serif text-xl font-bold tracking-tight text-stone-900" style={{ fontFamily: 'Playfair Display, serif' }}>
            ВЕЧЕН СПОМЕН <span className="text-sm uppercase tracking-[0.3em] text-stone-500 ml-2">Македонија</span>
          </span>
        </div>
      </div>
    </div>
  );
};
