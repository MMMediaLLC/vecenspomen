import React from 'react';
import { MemorialPost } from '../types';

interface PostCardProps {
  post: MemorialPost;
  onClick: (id: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onClick }) => {
  const formatMacedonianDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const months = [
      'јануари', 'февруари', 'март', 'април', 'мај', 'јуни',
      'јули', 'август', 'септември', 'октомври', 'ноември', 'декември'
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const getContextSubtitle = (post: MemorialPost) => {
    if (post.type === 'ТАЖНА ВЕСТ') {
      if (post.dateOfFuneral && post.timeOfFuneral) return `Погреб на ${formatMacedonianDate(post.dateOfFuneral)} во ${post.timeOfFuneral}`;
      if (post.dateOfFuneral) return `Погреб на ${formatMacedonianDate(post.dateOfFuneral)}`;
      if (post.timeOfFuneral) return `Погреб во ${post.timeOfFuneral} часот`;
      return 'Тажна вест';
    }
    if (post.type === 'ПОМЕН') {
      if (post.pomenDate) return `Сеќавање на ${formatMacedonianDate(post.pomenDate)} ${post.pomenTime ? `во ${post.pomenTime}` : ''}`;
      return 'Сеќавање';
    }
    if (post.type === 'ПОСЛЕДЕН ПОЗДРАВ') {
      if (post.senderType === 'колеги') return 'Последен поздрав од колегите';
      if (post.senderName) return `Последен поздрав од ${post.senderName}`;
      return 'Последен поздрав';
    }
    if (post.type === 'СОЧУВСТВО') {
      if (post.condolenceFamily) return `Искрено сочувство до ${post.condolenceFamily}`;
      return 'Искрено сочувство до семејството';
    }
    return '';
  };

  return (
    <div 
      onClick={() => onClick(post.slug || post.id)}
      className="group cursor-pointer bg-white border border-stone-100/60 hover:border-stone-200 rounded-sm overflow-hidden transition-all duration-700 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] flex flex-col h-full relative paper-texture"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
        <img 
          src={post.photoUrl} 
          alt={post.fullName} 
          className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className="px-2.5 py-1 text-[8px] font-medium tracking-wider uppercase rounded-sm bg-stone-900/60 backdrop-blur-sm text-white/70 transition-all group-hover:bg-stone-900/75 group-hover:text-white/90 font-sans">
            {post.type === 'ПОМЕН' ? (
              post.pomenSubtype === '40 дена' ? 'Четриесетдневен помен' :
              post.pomenSubtype === '6 месеци' ? 'Шестмесечен помен' :
              post.pomenSubtype === '1 година' ? 'Годишен помен' :
              post.pomenSubtype === 'Сеќавање' ? 'Сеќавање' : 'Помен'
            ) : post.type}
          </span>
        </div>
      </div>
      
      <div className="p-4 md:p-6 text-center flex flex-col items-center flex-grow">
        <h3 className="font-serif font-normal text-2xl text-stone-900 mb-1 group-hover:text-stone-700 transition-colors leading-tight">
          {post.fullName}
        </h3>
        
        {(post.birthYear || post.deathYear) && (
          <div className="text-stone-500 font-serif tracking-widest mb-2">
            {post.birthYear || '...'} – {post.deathYear || '...'}
          </div>
        )}
        
        <div className="text-[11px] md:text-xs tracking-[0.08em] text-stone-500 font-normal mb-3 font-sans">
          {post.city}
        </div>
        
        <div className="mt-auto pt-4 border-t border-stone-100 w-full">
          <p className="text-stone-500 text-sm font-serif">
            {getContextSubtitle(post)}
          </p>
        </div>
      </div>
    </div>
  );
};
