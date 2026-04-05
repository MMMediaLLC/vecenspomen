import React from 'react';
import { MemorialPost, PackageType } from '../../types';
import { PACKAGES } from '../../constants';
import { MemorialTemplate } from '../MemorialTemplate';
import { Check, CreditCard, ShieldCheck } from 'lucide-react';

interface Step5Props {
  post: Partial<MemorialPost>;
  selectedPackage: PackageType | null;
  onSelect: (pkg: PackageType) => void;
  updatePost?: (data: Partial<MemorialPost>) => void;
}

const SYMBOLS = [
  { id: 'elegant', icon: '◻' },
  { id: 'orthodox', icon: '☦' },
  { id: 'catholic', icon: '✝' },
  { id: 'muslim', icon: '☾' },
  { id: 'star', icon: '★' },
  { id: 'clean', icon: '─' },
] as const;

export const Step5: React.FC<Step5Props> = ({ post, selectedPackage, onSelect, updatePost }) => {
  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      
      {/* 1) FINAL PREVIEW */}
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-serif text-stone-900 mb-2">Конечен преглед</h3>
          <p className="text-stone-500 text-sm italic">
            Вака ќе изгледа вашата објава на порталот. Проверете ги сите детали пред да продолжите.
          </p>
        </div>
        
        <div className="bg-stone-50 p-4 md:p-12 rounded-sm border border-stone-100 shadow-inner overflow-hidden">
          <div className="max-w-4xl mx-auto bg-white shadow-2xl">
            <MemorialTemplate post={post as MemorialPost} isPreview={true} />
          </div>
        </div>
      </div>

      {/* 2) PACKAGE SELECTION */}
      <div className="space-y-8 pt-8 border-t border-stone-100">
        <div className="text-center">
          <h3 className="text-2xl font-serif text-stone-900 mb-2">Изберете пакет за објава</h3>
          <p className="text-stone-500 text-sm">Изберете опција која најдобро одговара на вашите потреби.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {PACKAGES.map((pkg) => (
            <div 
              key={pkg.name}
              onClick={() => {
                onSelect(pkg.name);
                if (pkg.name === 'Истакнат' && !post.selectedFrameStyle && updatePost) {
                  updatePost({ selectedFrameStyle: 'clean' });
                }
              }}
              className={`relative p-8 border rounded-sm cursor-pointer transition-all duration-300 flex flex-col group ${
                selectedPackage === pkg.name 
                  ? 'border-stone-900 bg-stone-50 shadow-xl scale-[1.02] z-10' 
                  : 'border-stone-200 hover:border-stone-400 bg-white'
              }`}
            >
              {selectedPackage === pkg.name && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full">
                  Избрано
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-lg font-serif mb-1 ${selectedPackage === pkg.name ? 'text-stone-900' : 'text-stone-700'}`}>
                  {pkg.name}
                </h3>
                <div className="text-2xl font-bold text-stone-900">{pkg.price}</div>
              </div>

              <ul className="space-y-3 mb-8 flex-grow">
                {pkg.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-stone-500 leading-tight">
                    <Check size={16} className={`${selectedPackage === pkg.name ? 'text-stone-900' : 'text-stone-300'} mt-0.5 flex-shrink-0 transition-colors`} />
                    <span>{f}</span>
                  </li>
                ))}
                {pkg.name === 'Истакнат' && (
                  <li className="flex items-start gap-2 text-sm text-stone-900 leading-tight font-bold">
                    <Check size={16} className="text-stone-900 mt-0.5 flex-shrink-0" />
                    <span>Книга на сочувство</span>
                  </li>
                )}
              </ul>

              <button className={`w-full py-3 text-xs font-bold uppercase tracking-widest transition-all rounded-sm border ${
                selectedPackage === pkg.name 
                  ? 'bg-stone-900 text-white border-stone-900' 
                  : 'bg-white text-stone-500 border-stone-200 group-hover:border-stone-900 group-hover:text-stone-900'
              }`}>
                {selectedPackage === pkg.name ? 'Пакетот е избран' : 'Избери пакет'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 2.5) SYMBOL SELECTOR FOR PREMIUM */}
      {selectedPackage === 'Истакнат' && (
        <div className="space-y-6 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center">
            <h3 className="text-xl font-serif text-stone-900 mb-2">Изберете рамка за објавата</h3>
          </div>
          
          <div className="flex justify-center flex-wrap gap-3">
            {SYMBOLS.map((sym) => {
              const isSelected = post.selectedFrameStyle === sym.id || (!post.selectedFrameStyle && sym.id === 'clean');
              return (
                <button
                  key={sym.id}
                  onClick={() => updatePost?.({ selectedFrameStyle: sym.id as any })}
                  className={`w-14 h-14 flex items-center justify-center text-2xl rounded-sm transition-all duration-300
                    ${isSelected 
                      ? 'border-2 border-stone-800 bg-stone-50 text-stone-900 shadow-md scale-105' 
                      : 'border border-stone-200 bg-white text-stone-500 hover:border-stone-400 hover:text-stone-800 hover:shadow-sm'
                    }`}
                >
                  {sym.icon}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3) PAYMENT INFO PLACEHOLDER */}
      {selectedPackage && (
        <div className="bg-stone-950 text-white p-10 rounded-sm space-y-6 animate-in slide-in-from-bottom-8 duration-700">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
              <CreditCard className="text-[var(--color-gold)]" size={24} />
            </div>
            <div>
              <h4 className="text-lg font-serif">Сигурно плаќање</h4>
              <p className="text-stone-400 text-sm">Вашата трансакција е заштитена и безбедна.</p>
            </div>
          </div>

          <div className="p-6 bg-white/5 border border-white/10 rounded-sm space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-stone-400">Избран пакет:</span>
              <span className="font-bold underline decoration-[var(--color-gold)] decoration-2 underline-offset-4">{selectedPackage}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-white/10 pt-4">
              <span>Вкупно за плаќање:</span>
              <span className="text-[var(--color-gold)]">{PACKAGES.find(p => p.name === selectedPackage)?.price}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-stone-500 uppercase tracking-widest font-bold">
            <ShieldCheck size={14} className="text-green-500" />
            Плаќањето се процесира преку Lemon Squeezy • SSL Безбедно
          </div>
        </div>
      )}

    </div>
  );
};
