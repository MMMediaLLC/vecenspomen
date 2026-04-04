import React from 'react';
import { MemorialPost } from '../types';

interface MemorialTemplateProps {
  post: Partial<MemorialPost>;
  isPreview?: boolean;
}

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const months = [
    'јануари', 'февруари', 'март', 'април', 'мај', 'јуни',
    'јули', 'август', 'септември', 'октомври', 'ноември', 'декември',
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

export const MemorialTemplate: React.FC<MemorialTemplateProps> = ({ post, isPreview = false }) => {
  const {
    type,
    fullName,
    birthYear,
    deathYear,
    age,
    dateOfFuneral,
    timeOfFuneral,
    placeOfFuneral,
    familyNote,
    pomenSubtype,
    pomenDate,
    pomenTime,
    pomenPlace,
    condolenceFamily,
    senderType,
    senderName,
    farewellTitle,
    introText,
    aiRefinedText,
    mainText,
    photoUrl,
  } = post;

  const displayText = aiRefinedText || mainText;

  return (
    <div
      className={`max-w-2xl mx-auto bg-white border border-stone-100 rounded-sm shadow-2xl relative overflow-hidden ${
        isPreview ? 'scale-[0.98] origin-top' : ''
      }`}
    >
      {/* Texture hint */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />

      <div className="px-8 pb-20 md:px-20 relative z-10 pt-16">
        
        {/* Type Label (Very Top) */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-normal text-stone-900">
            {type === 'ПОМЕН' ? (
              pomenSubtype === '40 дена' ? 'Четриесетдневен помен' :
              pomenSubtype === '6 месеци' ? 'Шестмесечен помен' :
              pomenSubtype === '1 година' ? 'Годишен помен' :
              pomenSubtype === 'Сеќавање' ? 'Сеќавање' : 'Помен'
            ) : (
              type === 'ТАЖНА ВЕСТ' ? 'Тажна вест' :
              type === 'ПОСЛЕДЕН ПОЗДРАВ' ? 'Последен поздрав' :
              type === 'СОЧУВСТВО' ? 'Сочувство' : type
            )}
          </h1>
        </div>
        
        {/* Hierarchy 1: Intro Message (Above Photo) */}
        {type === 'ТАЖНА ВЕСТ' && introText && (
          <div className="text-center mb-10 max-w-lg mx-auto">
            <p className="text-stone-500 font-serif italic text-lg leading-relaxed px-4">
              {introText}
            </p>
            <div className="w-12 h-[1px] bg-stone-100 mx-auto mt-6" />
          </div>
        )}

        {/* Photo Container */}
        <div className="flex justify-center mb-12">
          <div className="relative group">
            <div className="absolute inset-0 bg-stone-900/5 rotate-1 scale-105 rounded-sm" />
            <div className="relative w-44 h-60 md:w-56 md:h-74 overflow-hidden rounded-sm shadow-xl border-[6px] border-white ring-1 ring-stone-100">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={fullName || 'Фотографија'}
                  className="w-full h-full object-cover grayscale-[0.1] contrast-[1.05]"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-stone-50 flex items-center justify-center text-stone-300 text-xs uppercase tracking-widest italic">
                  Тишина
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Name & Years */}
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-serif text-stone-900 mb-4 leading-tight tracking-tight italic">
            {fullName || 'Име и Презиме'}
          </h2>
          
          <div className="flex items-center justify-center gap-4 text-stone-400">
             <div className="h-[1px] w-12 bg-stone-100" />
             <div className="text-stone-500 text-xl font-serif tracking-[0.2em] font-light">
                {birthYear || '·'} – {deathYear || (post.dateOfDeath ? new Date(post.dateOfDeath).getFullYear() : '·')}
             </div>
             <div className="h-[1px] w-12 bg-stone-100" />
          </div>

          {age && (
            <div className="text-stone-400 text-[10px] uppercase tracking-widest mt-3 font-bold">
              {age} години
            </div>
          )}

          {familyNote && (
            <p className="mt-8 text-stone-500 font-serif italic text-base max-w-sm mx-auto leading-relaxed opacity-80">
              „{familyNote}“
            </p>
          )}
        </div>

        {/* Farewell Title / Condolence Family Hint */}
        {farewellTitle && type === 'ПОСЛЕДЕН ПОЗДРАВ' && (
          <div className="text-center mb-8">
             <h3 className="text-stone-900 font-serif text-2xl italic font-bold">
                {farewellTitle}
             </h3>
             <div className="w-8 h-[1px] bg-stone-100 mx-auto mt-4" />
          </div>
        )}

        {condolenceFamily && type === 'СОЧУВСТВО' && (
          <div className="text-center mb-8">
             <h3 className="text-stone-900 font-serif text-xl italic">
                До {condolenceFamily}
             </h3>
             <div className="w-8 h-[1px] bg-stone-100 mx-auto mt-4" />
          </div>
        )}

        {/* Hierarchy 4: Main memorial message */}
        <div className="space-y-8 text-stone-800 leading-relaxed text-center max-w-lg mx-auto mb-16 px-4">
          {displayText ? (
            <p className={`whitespace-pre-wrap text-lg md:text-xl font-serif text-stone-700 leading-loose ${aiRefinedText ? 'italic' : ''}`}>
              {displayText}
            </p>
          ) : (
            <div className="h-20 flex items-center justify-center border border-dashed border-stone-100 rounded-sm">
                <p className="text-stone-300 text-sm italic">Текстот ќе биде прикажан овде...</p>
            </div>
          )}
        </div>

        {/* Detail Blocks */}
        {(type === 'ТАЖНА ВЕСТ' || type === 'ПОМЕН') && (
           <div className="max-w-md mx-auto mb-16">
              <div className="p-8 bg-stone-50/50 rounded-sm border border-stone-100 text-center space-y-4 shadow-sm">
                <div className="w-8 h-[1px] bg-stone-200 mx-auto" />
                
                {type === 'ТАЖНА ВЕСТ' && (dateOfFuneral || timeOfFuneral || placeOfFuneral) && (
                  <>
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">Детали за погребот</h4>
                    <div className="text-stone-900 font-medium text-lg font-serif italic">
                      {dateOfFuneral && <span>{formatDate(dateOfFuneral)}</span>}
                      {timeOfFuneral && <span> во {timeOfFuneral} часот</span>}
                    </div>
                    {placeOfFuneral && <div className="text-stone-500 text-sm font-light">{placeOfFuneral}</div>}
                  </>
                )}

                {type === 'ПОМЕН' && (pomenDate || pomenTime || pomenPlace) && (
                  <>
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">
                      {pomenSubtype === 'Сеќавање' ? 'Сеќавање' : 'Парастос'}
                    </h4>
                    {pomenDate && (
                      <div className="text-stone-900 font-medium text-lg font-serif italic">
                        {formatDate(pomenDate)}
                        {pomenTime && <span> во {pomenTime} часот</span>}
                      </div>
                    )}
                    {pomenPlace && <div className="text-stone-500 text-sm font-light">{pomenPlace}</div>}
                  </>
                )}
              </div>
           </div>
        )}

        {/* Sender / Family Section */}
        <div className="text-center pt-10 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-[1px] bg-stone-200/50" />
          
          <h4 className="text-[9px] font-bold uppercase tracking-[0.4em] text-stone-400 mb-6">
            {type === 'СОЧУВСТВО' ? 'Со најдлабоко сочувство' : 
             type === 'ПОСЛЕДЕН ПОЗДРАВ' ? 'Последен поздрав од' : 
             'Семејство и ожалостени'}
          </h4>
          
          <p className="text-stone-900 font-serif text-2xl italic tracking-tight">
            {senderName || 'Најблиските'}
          </p>
          
          {senderType && type === 'ПОСЛЕДЕН ПОЗДРАВ' && (
            <p className="mt-2 text-stone-400 text-[10px] uppercase tracking-widest font-bold">
              {senderType}
            </p>
          )}
        </div>

      </div>

      {/* Luxury frame hint */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-stone-200 opacity-20" />
    </div>
  );
};
