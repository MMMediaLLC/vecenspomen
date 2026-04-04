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
      className="group cursor-pointer bg-white border border-stone-100 rounded-sm overflow-hidden transition-all duration-700 hover:shadow-2xl hover:-translate-y-2 flex flex-col h-full relative"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
        <img 
          src={post.photoUrl} 
          alt={post.fullName} 
          className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1.5 text-[9px] font-semibold tracking-normal uppercase rounded-sm bg-white/95 backdrop-blur-sm text-stone-900 shadow-lg transition-all group-hover:bg-white font-serif">
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
        <h3 className="font-serif text-2xl md:text-3xl text-stone-900 mb-1 group-hover:text-stone-700 transition-colors leading-tight">
          {post.fullName}
        </h3>
        
        {(post.birthYear || post.deathYear) && (
          <div className="text-stone-500 font-serif tracking-widest mb-2">
            {post.birthYear || '...'} – {post.deathYear || '...'}
          </div>
        )}
        
        <div className="text-stone-400 text-[10px] uppercase tracking-normal font-semibold mb-3 font-sans">
          {post.city}
        </div>
        
        <div className="mt-auto pt-4 border-t border-stone-100 w-full">
          <p className="text-stone-600 text-sm italic font-serif">
            {getContextSubtitle(post)}
          </p>
        </div>
      </div>
    </div>
  );
};
