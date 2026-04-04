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
    <div className="mt-24 max-w-3xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h3 className="text-3xl font-serif text-stone-900 italic">Книга на сочувство</h3>
        <div className="w-12 h-[1px] bg-[var(--color-gold)] mx-auto opacity-40" />
        <p className="text-stone-500 text-sm font-light">Споделете спомен или изразете сочувство до семејството.</p>
      </div>

      {/* Form */}
      <div className="bg-white p-8 md:p-10 border border-stone-100 shadow-sm rounded-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Од кого</label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Вашето име и презиме"
              className="w-full p-3 border-b border-stone-200 focus:outline-none focus:border-stone-900 transition-colors text-sm font-light"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Порака</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder="Напишете ги вашите зборови овде..."
              className="w-full p-4 bg-stone-50 border border-stone-100 focus:outline-none focus:border-stone-400 transition-all text-sm font-light leading-relaxed resize-none"
              required
            />
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] text-stone-400 uppercase tracking-widest italic">
              * Пораките се модерирани и ќе бидат јавно видливи по одобрување.
            </p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto bg-stone-900 text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
              Испрати
            </button>
          </div>
        </form>

        {showSuccess && (
          <div className="mt-6 p-4 bg-green-50 border border-green-100 text-green-700 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle size={14} />
            Вашата порака е испратена на ревизија и наскоро ќе биде објавена.
          </div>
        )}
      </div>

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
                <p className="text-sm text-stone-600 font-light leading-relaxed italic">
                  „{entry.text}“
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 border-t border-stone-100 border-dashed">
            <MessageSquare className="mx-auto text-stone-200 mb-4" size={40} />
            <p className="text-stone-400 text-sm font-serif italic">Сè уште нема запишани пораки.</p>
          </div>
        )}
      </div>
    </div>
  );
};
