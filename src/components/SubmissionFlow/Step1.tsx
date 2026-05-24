import React from 'react';
import { PostType, PomenSubtype } from '../../types';
import { FileText, Heart, MessageSquare, Users } from 'lucide-react';

interface Step1Props {
  selectedType: PostType | null;
  onSelect: (type: PostType) => void;
}

export const Step1: React.FC<Step1Props> = ({ selectedType, onSelect }) => {
  const types = [
    { id: 'ТАЖНА ВЕСТ', icon: FileText, desc: 'Достоинствено известување за загуба и детали за погреб.' },
    { id: 'ПОСЛЕДЕН ПОЗДРАВ', icon: Users, desc: 'Испратете соодветни зборови за збогување со најблиските.' },
    { id: 'СОЧУВСТВО', icon: MessageSquare, desc: 'Изразување на искрено сочувство кон семејството.' },
    { id: 'ПОМЕН', icon: Heart, desc: 'Одбележување на 40 дена, 6 месеци, 1 година или годишнина.' },
  ];

  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-3 h-[260px] md:h-auto md:grid-rows-none">
      {types.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t.id as PostType)}
          className={`px-3 py-3 text-left border rounded-sm transition-all duration-300 group h-full flex flex-col ${
            selectedType === t.id
              ? 'bg-stone-900 border-stone-900 text-white shadow-xl'
              : 'bg-white border-stone-200 hover:border-stone-400 text-stone-900'
          }`}
        >
          <t.icon className={`mb-2 ${selectedType === t.id ? 'text-stone-300' : 'text-stone-400 group-hover:text-stone-600'}`} size={22} />
          <h3 className="text-base font-serif mb-1">{t.id}</h3>
          <p className={`text-xs md:text-sm line-clamp-3 ${selectedType === t.id ? 'text-stone-400' : 'text-stone-500'}`}>
            {t.desc}
          </p>
        </button>
      ))}
    </div>
  );
};
