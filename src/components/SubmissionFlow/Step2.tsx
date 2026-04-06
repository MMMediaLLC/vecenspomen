import React, { useState } from 'react';
import { MemorialPost } from '../../types';
import { CITIES } from '../../constants';
import { Sparkles, Loader2, Check } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface Step2Props {
  post: Partial<MemorialPost>;
  updatePost: (data: Partial<MemorialPost>) => void;
}

const inputClass = 'w-full p-4 border border-stone-200 rounded-sm focus:outline-none focus:border-stone-900 transition-colors bg-white font-light text-stone-800 h-14';
const labelClass = 'text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-2 block';
const textareaClass = 'w-full p-4 border border-stone-200 rounded-sm focus:outline-none focus:border-stone-900 transition-colors bg-white font-light text-stone-800 leading-relaxed resize-none';

export const Step2: React.FC<Step2Props> = ({ post, updatePost }) => {
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'birthYear') {
      const numValue = value ? parseInt(value, 10) : undefined;
      updatePost({ [name]: numValue });
    } else {
      updatePost({ [name]: value });
    }
  };

  // Unified HH:MM formatter
  const formatTimeInput = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (!digits) return '';
    if (digits.length >= 3) {
      return digits.slice(0, 2) + ':' + digits.slice(2);
    }
    return digits;
  };

  const handleTimeBlur = (fieldName: keyof MemorialPost) => (e: React.FocusEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (!digits) return;
    
    let hh = '00', mm = '00';
    if (digits.length === 1) hh = `0${digits}`;
    else if (digits.length === 2) hh = digits;
    else if (digits.length === 3) { hh = `0${digits[0]}`; mm = digits.slice(1); }
    else if (digits.length === 4) { hh = digits.slice(0, 2); mm = digits.slice(2); }
    
    let hNum = Math.min(23, parseInt(hh));
    let mNum = Math.min(59, parseInt(mm));
    const finalTime = `${hNum.toString().padStart(2, '0')}:${mNum.toString().padStart(2, '0')}`;
    updatePost({ [fieldName]: finalTime });
  };

  const handleRefine = async () => {
    if (!post.mainText?.trim()) return;
    setIsRefining(true);
    setError(null);
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    if (!apiKey) {
      setError('AI системот моментално не е достапен.');
      setIsRefining(false);
      return;
    }
    const prompt = `Напиши достоен, формален и емотивно смирен текст за меморијално известување на македонски јазик. Тип: ${post.type}. Починат: ${post.fullName}. Оригинален текст: "${post.mainText}"`;
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({ model: 'gemini-1.5-flash', contents: prompt });
      const refinedText = response.text?.trim();
      if (refinedText) updatePost({ aiRefinedText: refinedText });
      else throw new Error('Empty response');
    } catch (err) {
      setError('Настана грешка при обработка на текстот.');
    } finally { setIsRefining(false); }
  };

  const required = <span className="text-red-300 ml-1">*</span>;

  const renderSectionTitle = (title: string) => (
    <div className="mb-8 pb-4 border-b border-stone-100">
      <h3 className="text-xl font-serif text-stone-800">{title}</h3>
    </div>
  );

  // 1. ТАЖНА ВЕСТ
  if (post.type === 'ТАЖНА ВЕСТ') {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {renderSectionTitle('Податоци за тажна вест')}
        
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <label className={labelClass}>Име и презиме на починатото лице {required}</label>
              <input type="text" name="fullName" value={post.fullName || ''} onChange={handleChange} placeholder="пр. Петар Петровски" className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Град {required}</label>
              <select name="city" value={post.city || ''} onChange={handleChange} className={inputClass}>
                <option value="">Изберете град</option>
                {CITIES.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <label className={labelClass}>Година на раѓање</label>
              <input type="number" name="birthYear" value={post.birthYear || ''} onChange={handleChange} placeholder="пр. 1945" className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Датум на смрт {required}</label>
              <input type="date" name="dateOfDeath" value={post.dateOfDeath || ''} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <label className={labelClass}>Датум на погреб {required}</label>
              <input type="date" name="dateOfFuneral" value={post.dateOfFuneral || ''} onChange={handleChange} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Време на погреб {required}</label>
              <input 
                type="text" 
                inputMode="numeric" 
                name="timeOfFuneral" 
                value={post.timeOfFuneral || ''} 
                onChange={(e) => updatePost({ timeOfFuneral: formatTimeInput(e.target.value) })}
                onBlur={handleTimeBlur('timeOfFuneral')}
                placeholder="пр. 13:00" 
                className={inputClass} 
              />
              <p className="text-[9px] text-stone-400 font-light text-right">Внесете само бројки, системот автоматски ќе го форматира времето.</p>
            </div>
          </div>

          <div className="space-y-1">
            <label className={labelClass}>Локација на погреб {required}</label>
            <input type="text" name="placeOfFuneral" value={post.placeOfFuneral || ''} onChange={handleChange} placeholder="пр. Градски гробишта Бутел" className={inputClass} />
          </div>

          <div className="space-y-8 pt-4">
            <div className="space-y-2">
              <label className={labelClass}>Вовед во објавата {required}</label>
              <textarea 
                name="introText" 
                value={post.introText || ''} 
                onChange={handleChange} 
                className={`${textareaClass} h-24`} 
                placeholder="пр. Со длабока тага ве известуваме дека нè напушти нашиот сакан..."
              />
              <p className="text-[9px] text-stone-400 font-light">Краток воведен дел кој се појавува над фотографијата.</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className={labelClass}>Содржина на објавата {required}</label>
                <button onClick={handleRefine} disabled={isRefining || !post.mainText?.trim()} className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-all disabled:opacity-30 group mb-2">
                  {isRefining ? <Loader2 className="animate-spin" size={12} /> : <Sparkles size={12} className="text-stone-400 group-hover:text-[var(--color-gold)]" />} ПОДОБРИ СО AI
                </button>
              </div>
              <textarea 
                name="mainText" 
                value={post.mainText || ''} 
                onChange={handleChange} 
                className={`${textareaClass} h-40`} 
                placeholder="пр. Ќе остане засекогаш во нашите срца, спомени и молитви. Неговиот лик, добрина и љубов ќе ги паметиме вечно." 
              />
              <p className="text-[9px] text-stone-400 font-light">Овде внесете главна порака на сеќавање, почит и последен поздрав.</p>
              {post.aiRefinedText && (
                <div className="bg-stone-50 border border-stone-200 p-6 rounded-sm space-y-4 animate-in zoom-in-95 duration-500">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2"><Sparkles size={14} className="text-[var(--color-gold)]" /><h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-900">AI Подобрена верзија</h4></div>
                      <button onClick={() => updatePost({ aiRefinedText: undefined })} className="text-stone-400 hover:text-red-700 text-[10px] font-bold uppercase tracking-widest">Откажи</button>
                   </div>
                   <p className="text-stone-800 leading-relaxed font-light text-sm">{post.aiRefinedText}</p>
                   <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-stone-400 font-bold"><Check size={10} className="text-green-500" /> Достоинствено • Граматички точно</div>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className={labelClass}>Ожалостени (опционално)</label>
              <textarea 
                name="familyNote" 
                value={post.familyNote || ''} 
                onChange={handleChange} 
                rows={2} 
                placeholder="пр. Сопругата Марија, синот Никола со семејството, ќерката Елена со семејството и останатите роднини и пријатели." 
                className={`${textareaClass} h-24`} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-stone-100 pt-10">
            <div className="space-y-1">
              <label className={labelClass}>Дизајн на рамка</label>
              <select name="selectedFrameStyle" value={post.selectedFrameStyle || ''} onChange={handleChange} className={inputClass}>
                <option value="">Стандардна (Чиста)</option>
                <option value="elegant">Елеганција (Црна лента)</option>
                <option value="orthodox">Православна (Крст)</option>
                <option value="catholic">Католичка (Крст)</option>
                <option value="muslim">Муслиманска (Полумесечина)</option>
                <option value="star">Давидова ѕвезда</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div className="space-y-1"><label className={labelClass}>Контакт мејл</label><input type="email" name="email" value={post.email || ''} onChange={handleChange} placeholder="пр. kontakt@email.com" className={inputClass} /></div>
            <div className="space-y-1"><label className={labelClass}>Телефон</label><input type="tel" name="phone" value={post.phone || ''} onChange={handleChange} placeholder="пр. 07X XXX XXX" className={inputClass} /></div>
          </div>
        </div>
      </div>
    );
  }

  // 2. ПОСЛЕДЕН ПОЗДРАВ
  if (post.type === 'ПОСЛЕДЕН ПОЗДРАВ') {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {renderSectionTitle('Податоци за последен поздрав')}
        
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <label className={labelClass}>Име и презиме на починатото лице {required}</label>
              <input type="text" name="fullName" value={post.fullName || ''} onChange={handleChange} placeholder="пр. Петар Петровски" className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Град</label>
              <select name="city" value={post.city || ''} onChange={handleChange} className={inputClass}>
                <option value="">Изберете град</option>
                {CITIES.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className={labelClass}>Наслов на пораката</label>
            <input type="text" name="farewellTitle" value={post.farewellTitle || ''} onChange={handleChange} placeholder="пр. Последен поздрав од семејството" className={inputClass} />
          </div>
          <div className="space-y-4 pt-4">
            <div className="flex justify-between items-end">
              <label className={labelClass}>Текст на последниот поздрав {required}</label>
              <button onClick={handleRefine} disabled={isRefining || !post.mainText?.trim()} className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-all disabled:opacity-30 group mb-2">
                <Sparkles size={12} /> ПОДОБРИ СО AI
              </button>
            </div>
            <textarea name="mainText" value={post.mainText || ''} onChange={handleChange} className={`${textareaClass} h-40`} placeholder="Те испраќаме со неизмерна тага и благодарност за љубовта, добрината и спомените што ни ги остави. Ќе останеш засекогаш во нашите срца." />
            <p className="text-[10px] text-stone-400 font-light">Напишете достоинствени последни зборови и потпишете се.</p>
          </div>
          <div className="space-y-1">
            <label className={labelClass}>Од (вашето име или семејство) {required}</label>
            <input type="text" name="senderName" value={post.senderName || ''} onChange={handleChange} placeholder="пр. Од сопругата, децата и внуците" className={inputClass} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-stone-100 pt-10">
            <div className="space-y-1">
              <label className={labelClass}>Дизајн на рамка</label>
              <select name="selectedFrameStyle" value={post.selectedFrameStyle || ''} onChange={handleChange} className={inputClass}>
                <option value="">Стандардна (Чиста)</option>
                <option value="elegant">Елеганција (Црна лента)</option>
                <option value="orthodox">Православна (Крст)</option>
                <option value="catholic">Католичка (Крст)</option>
                <option value="muslim">Муслиманска (Полумесечина)</option>
                <option value="star">Давидова ѕвезда</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div className="space-y-1"><label className={labelClass}>Контакт мејл</label><input type="email" name="email" value={post.email || ''} onChange={handleChange} placeholder="пр. kontakt@email.com" className={inputClass} /></div>
            <div className="space-y-1"><label className={labelClass}>Телефон</label><input type="tel" name="phone" value={post.phone || ''} onChange={handleChange} placeholder="пр. 07X XXX XXX" className={inputClass} /></div>
          </div>
        </div>
      </div>
    );
  }

  // 3. СОЧУВСТВО
  if (post.type === 'СОЧУВСТВО') {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {renderSectionTitle('Податоци за сочувство')}
        
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <label className={labelClass}>Име и презиме на починатото лице {required}</label>
              <input type="text" name="fullName" value={post.fullName || ''} onChange={handleChange} placeholder="пр. Петар Петровски" className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>До кого е пораката</label>
              <input type="text" name="condolenceFamily" value={post.condolenceFamily || ''} onChange={handleChange} placeholder="пр. До семејството Петровски" className={inputClass} />
            </div>
          </div>
          <div className="space-y-1">
            <label className={labelClass}>Град</label>
            <select name="city" value={post.city || ''} onChange={handleChange} className={inputClass}>
              <option value="">Изберете град</option>
              {CITIES.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className={labelClass}>Текст на сочувството {required}</label>
            <textarea name="mainText" value={post.mainText || ''} onChange={handleChange} className={`${textareaClass} h-40`} placeholder="Во овие тешки моменти изразуваме искрено сочувство до семејството и најблиските. Нека споменот за покојниот биде вечен." />
            <p className="text-[10px] text-stone-400 font-light">Изразете сочувство со достоинствена порака. (Сликата се додава во следен чекор)</p>
          </div>
          <div className="space-y-1">
            <label className={labelClass}>Од {required}</label>
            <input type="text" name="senderName" value={post.senderName || ''} onChange={handleChange} placeholder="пр. Од семејството Јовановски" className={inputClass} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-stone-100 pt-10">
            <div className="space-y-1">
              <label className={labelClass}>Дизајн на рамка</label>
              <select name="selectedFrameStyle" value={post.selectedFrameStyle || ''} onChange={handleChange} className={inputClass}>
                <option value="">Стандардна (Чиста)</option>
                <option value="elegant">Елеганција (Црна лента)</option>
                <option value="orthodox">Православна (Крст)</option>
                <option value="catholic">Католичка (Крст)</option>
                <option value="muslim">Муслиманска (Полумесечина)</option>
                <option value="star">Давидова ѕвезда</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div className="space-y-1"><label className={labelClass}>Контакт мејл</label><input type="email" name="email" value={post.email || ''} onChange={handleChange} placeholder="пр. kontakt@email.com" className={inputClass} /></div>
            <div className="space-y-1"><label className={labelClass}>Телефон</label><input type="tel" name="phone" value={post.phone || ''} onChange={handleChange} placeholder="пр. 07X XXX XXX" className={inputClass} /></div>
          </div>
        </div>
      </div>
    );
  }

  // 4. ПОМЕН
  if (post.type === 'ПОМЕН') {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {renderSectionTitle('Податоци за помен')}
        
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <label className={labelClass}>Име и презиме на починатото лице {required}</label>
              <input type="text" name="fullName" value={post.fullName || ''} onChange={handleChange} placeholder="пр. Петар Петровски" className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Град {required}</label>
              <select name="city" value={post.city || ''} onChange={handleChange} className={inputClass}>
                <option value="">Изберете град</option>
                {CITIES.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <label className={labelClass}>Тип на помен {required}</label>
              <select name="pomenSubtype" value={post.pomenSubtype || ''} onChange={handleChange} className={inputClass}>
                <option value="">Изберете тип на помен</option>
                <option value="40 дена">40 дена</option>
                <option value="6 месеци">6 месеци</option>
                <option value="1 година">1 година</option>
                <option value="Сеќавање">Сеќавање</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Датум на помен {required}</label>
              <input type="date" name="pomenDate" value={post.pomenDate || ''} onChange={handleChange} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <label className={labelClass}>Време на помен {required}</label>
              <input 
                type="text" 
                inputMode="numeric" 
                name="pomenTime" 
                value={post.pomenTime || ''} 
                onChange={(e) => updatePost({ pomenTime: formatTimeInput(e.target.value) })}
                onBlur={handleTimeBlur('pomenTime')}
                placeholder="пр. 13:00" 
                className={inputClass} 
              />
              <p className="text-[9px] text-stone-400 font-light text-right">Внесете само бројки, системот автоматски ќе го форматира времето.</p>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Локација {required}</label>
              <input type="text" name="pomenPlace" value={post.pomenPlace || ''} onChange={handleChange} placeholder="пр. Црква Св. Богородица, Градски гробишта Бутел" className={inputClass} />
            </div>
          </div>
          <div className="space-y-1">
            <label className={labelClass}>Порака за сеќавање</label>
            <textarea name="mainText" value={post.mainText || ''} onChange={handleChange} className={`${textareaClass} h-40`} placeholder="Со љубов и тага те споменуваме и по 40 дена од твоето заминување. Засекогаш ќе живееш во нашите мисли и молитви." />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>Ожалостени (опционално)</label>
            <input type="text" name="familyNote" value={post.familyNote || ''} onChange={handleChange} placeholder="пр. Сопругата, децата, внуците и роднините" className={inputClass} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-stone-100 pt-10">
            <div className="space-y-1">
              <label className={labelClass}>Дизајн на рамка</label>
              <select name="selectedFrameStyle" value={post.selectedFrameStyle || ''} onChange={handleChange} className={inputClass}>
                <option value="">Стандардна (Чиста)</option>
                <option value="elegant">Елеганција (Црна лента)</option>
                <option value="orthodox">Православна (Крст)</option>
                <option value="catholic">Католичка (Крст)</option>
                <option value="muslim">Муслиманска (Полумесечина)</option>
                <option value="star">Давидова ѕвезда</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div className="space-y-1"><label className={labelClass}>Контакт мејл</label><input type="email" name="email" value={post.email || ''} onChange={handleChange} placeholder="пр. kontakt@email.com" className={inputClass} /></div>
            <div className="space-y-1"><label className={labelClass}>Телефон</label><input type="tel" name="phone" value={post.phone || ''} onChange={handleChange} placeholder="пр. 07X XXX XXX" className={inputClass} /></div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
