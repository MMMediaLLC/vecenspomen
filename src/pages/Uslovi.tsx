import React from 'react';

export const Uslovi: React.FC = () => {
  return (
    <div className="bg-stone-50 min-h-screen py-16 md:py-20 font-light">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-5xl font-serif text-stone-900 mb-10 text-center">Услови</h1>
        
        <div className="text-stone-700 leading-relaxed space-y-8 bg-white p-8 md:p-12 border border-stone-200/60 rounded-sm shadow-sm">
          
          <section>
            <h2 className="text-2xl font-serif text-stone-900 mb-4">Општи одредби</h2>
            <p>
              Со користење на услугите на платформата „Вечен Спомен“, вие се согласувате со овие Услови. Ве молиме внимателно да ги прочитате пред да продолжите со користење на нашите услуги.
            </p>
          </section>

          <section className="pt-6 border-t border-stone-200/60">
            <h2 className="text-2xl font-serif text-stone-900 mb-4">Намената на платформата</h2>
            <p>
              Оваа платформа е наменета исклучиво за достоинствени меморијални известувања, вклучувајќи објавување на тажни вести, помени, сочувства и последни поздрави во чест на саканите лица.
            </p>
          </section>

          <section className="pt-6 border-t border-stone-200/60">
            <h2 className="text-2xl font-serif text-stone-900 mb-4">Поднесување на содржина</h2>
            <p>
              Корисникот кој ја поднесува објавата е целосно одговорен за точноста, легалноста и достоинствениот карактер на поднесената содржина.
            </p>
            <p className="mt-4 font-medium text-stone-900">Строго е забрането поставување на:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Навредлива содржина или јазик</li>
              <li>Лажни информации</li>
              <li>Фотографии и текстови за кои корисникот нема право на користење (неовластена содржина)</li>
              <li>Било каква форма на злоупотреба</li>
              <li>Содржина која не е поврзана со меморијалната намена на платформата</li>
            </ul>
          </section>

          <section className="pt-6 border-t border-stone-200/60">
            <h2 className="text-2xl font-serif text-stone-900 mb-4">Плаќања</h2>
            <p>
              По успешно извршената уплата преку безбедната страница, меморијалната објава се активира и се прикажува според спецификациите на избраниот пакет.
            </p>
            <p className="mt-4">Поддржани платежни картички:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Visa</li>
              <li>Mastercard</li>
              <li>Maestro</li>
              <li>други поддржани дебитни и кредитни картички</li>
            </ul>
            <p className="mt-4">
              Прашањата поврзани со плаќања и евентуални корекции се разгледуваат согласно правилата на платформата и конкретниот случај.
            </p>
          </section>

          <section className="pt-6 border-t border-stone-200/60">
            <h2 className="text-2xl font-serif text-stone-900 mb-4">Право на одбивање или отстранување</h2>
            <p>
              Платформата го задржува полното право да одбие или отстрани несоодветна или правно проблематична содржина која ги прекршува овие услови или е во спротивност со етичките норми на платформата.
            </p>
          </section>

          <section className="pt-6 border-t border-stone-200/60">
            <h2 className="text-2xl font-serif text-stone-900 mb-4">Интелектуална сопственост</h2>
            <p>
              Корисникот гарантира дека ги поседува сите неопходни права или дозволи за прикачените материјали (текст и фотографии).
            </p>
          </section>

          <section className="pt-6 border-t border-stone-200/60">
            <h2 className="text-2xl font-serif text-stone-900 mb-4">Ограничување на одговорност</h2>
            <p>
              Платформата „Вечен Спомен“ не презема одговорност за евентуални неточности во содржината поднесена од страна на корисниците. Ние ја нудиме само услугата за техничко објавување.
            </p>
          </section>

          <section className="pt-6 border-t border-stone-200/60">
            <h2 className="text-2xl font-serif text-stone-900 mb-4">Промени на условите</h2>
            <p>
              Овие Услови може да бидат ажурирани повремено. Продолжувањето со користење на платформата по објавувањето на промените значи прифаќање на новите Услови.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
