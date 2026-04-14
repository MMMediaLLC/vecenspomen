import React, { useState } from 'react';
import { GuestbookEntry } from '../types';
import { MessageSquare, Send, CheckCircle, Loader2 } from 'lucide-react';

interface GuestbookProps {
  entries: GuestbookEntry[];
  onAddComment: (comment: { senderName: string; text: string }) => void;
  isEnabled: boolean;
}

export const Guestbook: React.FC<GuestbookProps> = ({ entries, onAddComment, isEnabled }) => {
  const [senderName, setSenderName] = useState('');
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    // Simulate API delay
    setTimeout(() => {
      onAddComment({ senderName, text });
      setSenderName('');
      setText('');
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }, 1000);
  };

  const approvedEntries = entries.filter(e => e.status === 'approved');

  if (!isEnabled) return null;

  return (
    <div className="mt-16 max-w-2xl mx-auto space-y-10">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-serif text-stone-700">Книга на сочувство</h3>
        <div className="w-8 h-[1px] bg-stone-300 mx-auto" />
        <p className="text-stone-400 text-xs font-light">Споделете спомен или изразете сочувство до семејството.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Од кого</label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Вашето име и презиме"
              className="w-full py-2 bg-transparent border-b border-stone-200 focus:outline-none focus:border-stone-500 transition-colors text-sm font-light placeholder:text-stone-300"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Порака</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={2}
              placeholder="Напишете ги вашите зборови овде..."
              className="w-full py-2 bg-transparent border-b border-stone-200 focus:outline-none focus:border-stone-500 transition-colors text-sm font-light leading-relaxed resize-none placeholder:text-stone-300"
              required
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 pt-1">
          <p className="text-[9px] text-stone-300 uppercase tracking-widest">
            * Пораките се модерирани и ќе бидат видливи по одобрување.
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto border border-stone-300 text-stone-600 px-6 py-2 text-[11px] font-semibold uppercase tracking-widest hover:border-stone-600 hover:text-stone-900 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={12} /> : <Send size={12} />}
            Испрати
          </button>
        </div>

        {showSuccess && (
          <div className="p-3 bg-green-50 border border-green-100 text-green-600 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle size={12} />
            Вашата порака е испратена на ревизија и наскоро ќе биде објавена.
          </div>
        )}
      </form>

      {/* Entries List */}
      <div className="space-y-8 pb-12">
        {approvedEntries.length > 0 ? (
          approvedEntries.map((entry) => (
            <div key={entry.id} className="relative group animate-in fade-in duration-700">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-stone-100 group-hover:bg-[var(--color-gold)] transition-colors" />
              <div className="pl-8 space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                  <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wider">{entry.senderName}</h4>
                  <span className="text-[10px] text-stone-400 font-medium">
                    {new Date(entry.createdAt).toLocaleDateString('mk-MK')}
                  </span>
                </div>
                <p className="text-sm text-stone-600 font-light leading-relaxed">
                  „{entry.text}“
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 border-t border-stone-100 border-dashed">
            <MessageSquare className="mx-auto text-stone-200 mb-4" size={40} />
            <p className="text-stone-400 text-sm font-serif">Сè уште нема запишани пораки.</p>
          </div>
        )}
      </div>
    </div>
  );
};
