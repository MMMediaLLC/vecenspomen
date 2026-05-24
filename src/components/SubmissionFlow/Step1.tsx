import React from 'react';
import { PostType, PomenSubtype } from '../../types';
import { FileText, Heart, MessageSquare, Users } from 'lucide-react';

interface Step1Props {
  selectedType: PostType | null;
  onSelect: (type: PostType) => void;
}

export const Step1: React.FC<Step1Props> = ({ selectedType, onSelect }) => {
  const types = [
    { id: 'ТАЖНА ВЕСТ', icon: FileText, desc: 'Известување за загуба и детали за погреб.' },
    { id: 'ПОСЛЕДЕН ПОЗДРАВ', icon: Users, desc: 'Зборови за збогување со најблиските.' },
    { id: 'СОЧУВСТВО', icon: MessageSquare, desc: 'Искрено сочувство кон семејството.' },
    { id: 'ПОМЕН', icon: Heart, desc: 'За 40 дена, 6 месеци, 1 год. или годишнина.' },
  ];

  return (
    <div className="flex flex-col gap-2 md:grid md:grid-cols-2 md:gap-3">
      {types.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t.id as PostType)}
          className={`px-4 py-3 text-left border rounded-sm transition-all duration-300 group flex flex-row items-center gap-4 ${
            selectedType === t.id
              ? 'bg-stone-900 border-stone-900 text-white shadow-xl'
              : 'bg-white border-stone-200 hover:border-stone-400 text-stone-900'
          }`}
        >
          <t.icon className={`shrink-0 ${selectedType === t.id ? 'text-stone-300' : 'text-stone-400 group-hover:text-stone-600'}`} size={22} />
          <div>
            <h3 className="text-sm font-serif font-semibold mb-0.5">{t.id}</h3>
            <p className={`text-xs ${selectedType === t.id ? 'text-stone-400' : 'text-stone-500'}`}>
              {t.desc}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
};
