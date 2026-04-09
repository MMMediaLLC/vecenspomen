import React from 'react';

export const PolitikaNaPrivatnost: React.FC = () => {
  return (
    <div className="bg-stone-50 min-h-screen py-16 md:py-20 font-light">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-5xl font-serif text-stone-900 mb-10 text-center">Политика на приватност</h1>
        
        <div className="text-stone-700 leading-relaxed space-y-8 bg-white p-8 md:p-12 border border-stone-200/60 rounded-sm shadow-sm">
          <section>
            <h2 className="text-2xl font-serif text-stone-900 mb-4">Вовед</h2>
            <p>
              Оваа Политика на приватност го објаснува начинот на кој платформата „Вечен Спомен“ може да собира, користи и заштитува одредени податоци поврзани со користењето на услугите.
            </p>
          </section>

          <section className="pt-6 border-t border-stone-200/60">
            <h2 className="text-2xl font-serif text-stone-900 mb-4">Кои податоци може да ги собираме</h2>
            <p>
              За време на користењето на платформата и процесот на поднесување објави, може да собираме податоци како што се името на починатото лице, имиња на членови на семејството (доколку се внесени), текстот на меморијалната објава, град, релевантни датуми, прикачени фотографии и други информации доброволно внесени од корисникот.
            </p>
          </section>

          <section className="pt-6 border-t border-stone-200/60">
            <h2 className="text-2xl font-serif text-stone-900 mb-4">Како ги користиме податоците</h2>
            <p>
              Собраните податоци се користат исклучиво за процесирање, визуелно обликување, објавување на содржината на платформата и одржување на стабилноста на услугата.
            </p>
          </section>

          <section className="pt-6 border-t border-stone-200/60">
            <h2 className="text-2xl font-serif text-stone-900 mb-4">Фотографии и содржина</h2>
            <p>
              Корисникот е целосно одговорен за авторските права и правата за споделување на поднесените текстови и фотографии. Платформата ги користи исклучиво за целите на прикажување во рамките на креираната објава.
            </p>
          </section>

          <section className="pt-6 border-t border-stone-200/60">
            <h2 className="text-2xl font-serif text-stone-900 mb-4">Плаќања</h2>
            <p>
              Сите плаќања се процесираат преку безбедна онлајн платежна инфраструктура. Платформата не чува податоци од платежни картички на своите сервери.
            </p>
          </section>

          <section className="pt-6 border-t border-stone-200/60">
            <h2 className="text-2xl font-serif text-stone-900 mb-4">Колачиња и технички податоци</h2>
            <p>
              Платформата може да собира основни технички податоци (како тип на прелистувач, уред и IP адреса) и да користи колачиња (cookies) за нормално функционирање, безбедност и стабилност на системот.
            </p>
          </section>

          <section className="pt-6 border-t border-stone-200/60">
            <h2 className="text-2xl font-serif text-stone-900 mb-4">Чување и заштита на податоците</h2>
            <p>
              Ние применуваме разумни технички и организациски мерки за заштита на податоците од неовластен пристап, губење или злоупотреба.
            </p>
          </section>

          <section className="pt-6 border-t border-stone-200/60">
            <h2 className="text-2xl font-serif text-stone-900 mb-4">Права на корисниците</h2>
            <p>
              Корисниците имаат право да побараат корекции поврзани со содржината што ја поднеле, согласно можностите на платформата.
            </p>
          </section>

          <section className="pt-6 border-t border-stone-200/60">
            <h2 className="text-2xl font-serif text-stone-900 mb-4">Промени на политиката</h2>
            <p>
              Оваа Политика на приватност може да биде ажурирана со текот на времето. Секоја промена ќе биде објавена на оваа страница.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};
