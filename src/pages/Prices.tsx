import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, HelpCircle, Star, ShieldCheck, Infinity } from 'lucide-react';
import { PACKAGES } from '../constants';

export const Prices: React.FC = () => {
  const navigate = useNavigate();
  const onNavigateSubmit = () => { navigate('/objavi'); window.scrollTo(0, 0); };

  const packageIcons: Record<string, any> = {
    'Основен': ShieldCheck,
    'Истакнат': Star
  };

  const packageHighlights: Record<string, string> = {
    'Основен': 'Достоинствена и едноставна објава за сите типови.',
    'Истакнат': 'Поистакнат спомен со посебен визуелен изглед и украси.'
  };

  return (
    <div className="bg-stone-50 min-h-screen pb-32">
      {/* Header */}
      <div className="bg-white border-b border-stone-100 py-24 mb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-serif text-stone-900 mb-8 tracking-tight">Цени и пакети</h1>
          <p className="text-lg md:text-xl text-stone-500 max-w-2xl mx-auto font-light leading-relaxed">
            Универзален систем на пакети за сите типови на објави. Изберете го соодветниот начин за достоинствено одбележување на споменот.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-24">
          {PACKAGES.map((pkg) => {
            const Icon = packageIcons[pkg.name] || HelpCircle;
            const isPremium = pkg.name === 'Истакнат';

            return (
              <div 
                key={pkg.name} 
                className={`bg-white border rounded-sm p-10 flex flex-col h-full transition-all duration-700 relative group shadow-sm hover:shadow-xl ${
                  isPremium ? 'border-stone-900 bg-[#fdfbf6]' : 'border-stone-200'
                }`}
              >
                {isPremium && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-stone-900 text-white text-[9px] font-bold uppercase tracking-[0.3em] px-4 py-1.5 rounded-full ring-4 ring-stone-50">
                    Препорачано
                  </div>
                )}

                <div className="mb-10 text-center">
                  <div className={`w-14 h-14 mx-auto mb-6 flex items-center justify-center rounded-full transition-transform duration-700 group-hover:scale-110 ${
                    isPremium ? 'bg-stone-900 text-white' : 'bg-stone-50 text-stone-400'
                  }`}>
                    <Icon size={28} />
                  </div>
                  <h3 className="font-serif text-3xl text-stone-900 mb-2">{pkg.name}</h3>
                  <p className="text-xs text-stone-400 uppercase tracking-widest font-bold mb-4">
                    {isPremium ? 'Поистакнат спомен' : 'Достоинствена објава'}
                  </p>
                  <div className="flex items-baseline justify-center gap-1.5 pt-2 border-t border-stone-100 mt-4">
                    <span className="text-4xl font-bold text-stone-900 tracking-tighter">{pkg.price}</span>
                  </div>
                </div>
                
                <p className="text-stone-500 text-sm mb-10 leading-relaxed text-center font-serif h-12 flex items-center justify-center">
                  {packageHighlights[pkg.name]}
                </p>

                <ul className="space-y-6 mb-12 flex-grow border-t border-stone-50 pt-10">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex gap-4 text-sm text-stone-600 leading-tight">
                      <Check size={16} className={`${isPremium ? 'text-stone-900' : 'text-stone-400'} shrink-0`} />
                      <span className="font-light">{feature}</span>
                    </li>
                  ))}
                  {isPremium && (
                    <li className="flex gap-4 text-sm text-stone-600 leading-tight">
                      <Check size={16} className="text-stone-900 shrink-0" />
                      <span className="font-bold">Книга на сочувство</span>
                    </li>
                  )}
                </ul>

                <button
                  onClick={onNavigateSubmit}
                  className={`w-full py-5 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-3 shadow-lg ${
                    isPremium ? 'bg-stone-900 text-white hover:bg-stone-800' :
                    'bg-white border border-stone-200 text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  Избери пакет <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Comparison Note */}
        <div className="max-w-4xl mx-auto bg-stone-900 text-white p-12 md:p-20 rounded-sm mb-32 text-center relative overflow-hidden group">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] pointer-events-none" />
          <ShieldCheck size={140} className="absolute -left-10 -bottom-10 text-stone-800 rotate-12 transition-transform group-hover:rotate-6 duration-1000" />
          
          <h2 className="text-3xl md:text-4xl font-serif mb-6 relative z-10">Професионална уредничка проверка</h2>
          <p className="text-stone-400 font-light text-lg leading-relaxed relative z-10 max-w-2xl mx-auto">
            Секоја објава поминува низ внимателен преглед од нашиот тим. Ова осигурува дека платформата останува достоинствено место за сеќавање, ослободено од несоодветна содржина.
          </p>
        </div>

        {/* Detailed FAQ */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif text-stone-900 mb-4">Често поставувани прашања</h2>
            <div className="w-12 h-[2px] bg-[var(--color-gold)] mx-auto opacity-50" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
            {[
              {
                q: 'Колку долго останува објавата?',
                a: 'Сите објави на „Вечен Спомен“ се трајни. Архивата е наменета да служи како постојано дигитално место за сеќавање.'
              },
              {
                q: 'Што е AI асистент за пишување?',
                a: 'Тоа е алатка која ви помага да ги претворите вашите мисли во достоинствен и граматички правилен текст, соодветен за меморијална објава.'
              },
              {
                q: 'Дали може да се додадат повеќе фотографии?',
                a: 'Засега поддржуваме по една главна портретна фотографија за секоја објава, со цел да се одржи визуелната конзистентност на платформата.'
              },
              {
                q: 'Како функционира книгата на сочувство?',
                a: 'Посетителите можат да остават свои пораки. Сите пораки се прикриени додека не бидат одобрени од вас во вашиот персонален панел.'
              }
            ].map((faq) => (
              <div key={faq.q} className="space-y-3">
                <h4 className="text-lg font-serif text-stone-900 font-bold">{faq.q}</h4>
                <p className="text-stone-500 font-light leading-relaxed text-sm">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
