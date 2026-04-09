import React from 'react';

export const KakoRaboti: React.FC = () => {
  return (
    <div className="bg-stone-50 min-h-screen py-16 md:py-20 font-light">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-5xl font-serif text-stone-900 mb-10 text-center">Како работи</h1>
        
        <div className="text-stone-700 leading-relaxed space-y-8 bg-white p-8 md:p-12 border border-stone-200/60 rounded-sm shadow-sm">
          <p className="text-lg">
            „Вечен Спомен“ е платформа наменета за достоинствено онлајн објавување на тажни вести, помени, сочувства и последни поздрави. Процесот е осмислен да биде јасен, едноставен и соодветен за чувствителни моменти, со можност објавата прво да се прегледа, а потоа безбедно да биде објавена.
          </p>

          <div className="pt-6 mt-6 border-t border-stone-200/60">
            <h2 className="text-2xl font-serif text-stone-900 mb-6">Како се поднесува објава</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-stone-900 mb-2 font-serif">1. Изберете тип на објава</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Тажна вест</li>
                  <li>Помен</li>
                  <li>Сочувство</li>
                  <li>Последен поздрав</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-stone-900 mb-2 font-serif">2. Внесете податоци и фотографија</h3>
                <p>
                  Потоа се пополнуваат потребните податоци во формата, како што се името, текстот на објавата, местото, датумот и другите релевантни информации. Доколку е предвидено, може да се прикачи и една фотографија.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-stone-900 mb-2 font-serif">3. Прегледајте ја објавата</h3>
                <p>
                  Пред продолжување, системот прикажува преглед на објавата за да може корисникот да види како ќе изгледа конечната содржина.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-stone-900 mb-2 font-serif">4. Извршете уплата</h3>
                <p className="mb-2">
                  По прегледот, следува безбедна онлајн уплата според избраниот пакет.
                </p>
                <p>Во моментов платформата прифаќа плаќања со:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Visa</li>
                  <li>Mastercard</li>
                  <li>Maestro</li>
                  <li>други стандардни дебитни и кредитни картички поддржани од платежниот систем</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-stone-900 mb-2 font-serif">5. Објавување на објавата</h3>
                <p>
                  По успешно извршената уплата, објавата се подготвува и се објавува на платформата во избраниот формат и пакет.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-stone-200/60">
            <p className="text-lg italic font-serif text-stone-600 text-center">
              Платформата е создадена за да овозможи едноставен, достоинствен и почитувачки начин на споделување спомени, известувања и пораки во чест на саканите лица.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
