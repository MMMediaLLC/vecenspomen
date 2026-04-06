import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export const PaymentCancel: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const postId = searchParams.get('postId');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-stone-50 min-h-screen py-20 font-sans text-stone-900">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        <div className="bg-white p-8 md:p-16 rounded-sm border border-stone-200 shadow-sm text-center space-y-8 animate-in zoom-in-95 duration-700">
          <div className="w-24 h-24 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle size={48} strokeWidth={1.5} />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-serif tracking-tight">Плаќањето не беше завршено</h1>
            <p className="text-stone-500 leading-relaxed font-light text-lg">
              Вашата објава е зачувана во системот. Можете повторно да се обидете со плаќање за да ја објавите.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/podnesi')}
              className="w-full py-4 bg-stone-900 text-white rounded-sm font-medium hover:bg-stone-800 transition-colors shadow-lg uppercase tracking-widest text-sm"
            >
              Обиди се повторно
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-4 bg-stone-100 text-stone-600 rounded-sm font-medium hover:bg-stone-200 transition-colors uppercase tracking-widest text-sm"
            >
              Врати се на почетна
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
