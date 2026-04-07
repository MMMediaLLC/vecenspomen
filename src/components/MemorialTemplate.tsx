import React from 'react';
import { MemorialPost } from '../types';
import { PremiumFrame, FrameStyle } from './PremiumFrame';

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
    package: packageType,
    selectedFrameStyle,
  } = post;

  const displayText = aiRefinedText || mainText;
  const isPremium = packageType === 'Истакнат';

  const ContentBody = () => (
    <div className={`${isPreview ? 'px-4 md:px-6' : 'px-8 md:px-20'} pb-12 relative z-10 ${type === 'ТАЖНА ВЕСТ' ? 'pt-5' : 'pt-10 md:pt-12'}`}>
      {/* Type Label (Very Top) */}
      <div className={`text-center ${type === 'ТАЖНА ВЕСТ' ? 'mb-5' : 'mb-10 md:mb-12'}`}>
        <h1 className={`uppercase tracking-normal text-stone-900 font-serif ${isPremium ? 'text-2xl md:text-3xl font-bold' : 'text-xl md:text-2xl font-semibold'} ${type === 'ТАЖНА ВЕСТ' ? 'mt-4' : ''}`}>
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
        <div className={`text-center max-w-full mx-auto ${isPreview ? 'mb-4' : 'mb-6'}`}>
          <p className={`text-stone-500 font-serif text-lg leading-relaxed ${isPreview ? 'px-1 line-clamp-2' : 'px-4'}`}>
            {introText}
          </p>
          <div className={`w-12 h-[1px] bg-stone-100 mx-auto mt-6 ${isPreview ? 'hidden' : 'block'}`} />
        </div>
      )}

      {/* Photo Container */}
      <div className={`flex justify-center ${isPreview ? 'mb-4' : 'mb-6'}`}>
        <div className="relative group">
          <div className={`absolute inset-0 bg-stone-900/5 rotate-1 scale-105 rounded-sm transition-transform duration-700 ${isPremium ? 'scale-110' : ''}`} />
          <div className={`relative w-44 h-60 md:w-56 md:h-74 overflow-hidden rounded-sm shadow-xl border-[6px] border-white ring-1 ring-stone-100 transition-all duration-700 ${isPremium ? 'scale-105 shadow-2xl' : ''}`}>
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={fullName || 'Фотографија'}
                className="w-full h-full object-cover grayscale-[0.1] contrast-[1.05]"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-stone-50 flex items-center justify-center text-stone-300 text-xs uppercase tracking-widest">
                Тишина
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Name & Years */}
      <div className={`text-center ${isPreview ? 'mb-2' : 'mb-6'}`}>
        <h2 className="font-serif text-stone-900 mb-2 leading-tight tracking-tight transition-all duration-700 text-3xl md:text-5xl font-normal">
          {fullName || 'Име и Презиме'}
        </h2>
        
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="flex items-center justify-center gap-4 text-stone-400">
             <div className="h-[1px] w-12 bg-stone-100" />
             <div className={`text-stone-500 font-serif tracking-[0.2em] transition-all duration-700 ${isPremium ? 'text-2xl font-normal' : 'text-xl font-light'}`}>
                {birthYear || '·'} – {deathYear || (post.dateOfDeath ? new Date(post.dateOfDeath).getFullYear() : '·')}
             </div>
             <div className="h-[1px] w-12 bg-stone-100" />
          </div>

          {(birthYear && (deathYear || post.dateOfDeath)) && (
            <div className="text-stone-400 font-serif text-[13px] uppercase tracking-normal mt-3 font-semibold">
              { (deathYear || new Date(post.dateOfDeath!).getFullYear()) - birthYear } години
            </div>
          )}
        </div>
      </div>

      {/* Farewell Title / Condolence Family Hint */}
      {farewellTitle && type === 'ПОСЛЕДЕН ПОЗДРАВ' && (
        <div className="text-center mb-4">
           <h3 className="text-stone-900 font-serif text-2xl font-bold">
              {farewellTitle}
           </h3>
           <div className="w-8 h-[1px] bg-stone-100 mx-auto mt-4" />
        </div>
      )}

      {condolenceFamily && type === 'СОЧУВСТВО' && (
        <div className="text-center mb-4">
           <h3 className="text-stone-900 font-serif text-xl">
              До {condolenceFamily}
           </h3>
           <div className="w-8 h-[1px] bg-stone-100 mx-auto mt-4" />
        </div>
      )}

      <div className="space-y-6 text-stone-800 leading-[1.55] text-center max-w-2xl mx-auto mb-6 px-1">
        {displayText ? (
          <p className="whitespace-pre-wrap text-lg md:text-xl font-serif text-stone-700 leading-[1.55] tracking-tight">
            {displayText}
          </p>
        ) : (
          <div className="h-20 flex items-center justify-center border border-dashed border-stone-100 rounded-sm">
              <p className="text-stone-300 text-sm">Текстот ќе биде прикажан овде...</p>
          </div>
        )}
      </div>

      {/* Detail Blocks */}
      {(type === 'ТАЖНА ВЕСТ' || type === 'ПОМЕН') && (
         <div className="max-w-md mx-auto mb-6">
            <div className="p-5 bg-stone-50/50 rounded-sm border border-stone-100 text-center space-y-2 shadow-sm">
              <div className="w-8 h-[1px] bg-stone-200 mx-auto" />
              
              {type === 'ТАЖНА ВЕСТ' && (dateOfFuneral || timeOfFuneral || placeOfFuneral) && (
                <>
                  <h4 className="text-[11px] font-semibold uppercase tracking-normal text-stone-400 font-serif">Погреб</h4>
                  <div className="text-stone-900 font-medium text-lg font-serif">
                    {dateOfFuneral && <span>{formatDate(dateOfFuneral)}</span>}
                    {timeOfFuneral && <span> во {timeOfFuneral} часот</span>}
                  </div>
                  {placeOfFuneral && <div className="text-stone-500 text-sm font-light">{placeOfFuneral}</div>}
                </>
              )}

              {type === 'ПОМЕН' && (pomenDate || pomenTime || pomenPlace) && (
                <>
                  <h4 className="text-[11px] font-semibold uppercase tracking-normal text-stone-400 font-serif">
                    {pomenSubtype === 'Сеќавање' ? 'Сеќавање' : 'Парастос'}
                  </h4>
                  {pomenDate && (
                    <div className="text-stone-900 font-medium text-lg font-serif">
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
      <div className="text-center pt-4 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-[1px] bg-stone-200/50" />
        
        <h4 className="text-[11px] font-semibold uppercase tracking-normal text-stone-400 mb-4 font-serif">
          {type === 'СОЧУВСТВО' ? 'Искрено сочувство' : 
           type === 'ПОСЛЕДЕН ПОЗДРАВ' ? 'Последен поздрав од' : 
           'Со љубов и почит од:'}
        </h4>
        
        <p className="text-lg md:text-xl font-serif text-stone-800 leading-[1.55] tracking-tight whitespace-pre-wrap max-w-2xl mx-auto px-1">
          {familyNote || senderName || 'Најблиските'}
        </p>
        
        {senderType && type === 'ПОСЛЕДЕН ПОЗДРАВ' && (
          <p className="mt-4 text-stone-400 text-[10px] uppercase tracking-widest font-bold">
            {senderType}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={`max-w-2xl mx-auto bg-white border rounded-sm memorial-card-shadow relative overflow-hidden paper-texture transition-all duration-700 ${
        isPreview ? 'scale-[0.98] origin-top' : ''
      } ${isPremium ? 'border-transparent' : 'border-stone-200/60'}`}
    >
      {isPremium ? (
        <PremiumFrame style={(selectedFrameStyle as FrameStyle) || 'elegant'}>
          <ContentBody />
        </PremiumFrame>
      ) : (
        <ContentBody />
      )}
      
      {/* Luxury frame hint */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-stone-200 opacity-20 pointer-events-none z-10" />
    </div>
  );
};
