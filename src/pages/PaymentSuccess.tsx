import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check } from 'lucide-react';

export const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const postId = searchParams.get('postId');

  useEffect(() => {
    window.scrollTo(0, 0);

    // If mock=true is present, manually move the post to 'Чека одобрување' 
    // to simulate the webhook for developer testing.
    const isMockPayment = searchParams.get('mock') === 'true';
    if (isMockPayment && postId) {
      import('../lib/posts').then(async m => {
        const post = await m.getPostById(postId);
        if (post && post.paymentStatus !== 'paid') {
          console.log('Simulating successful payment for postId:', postId);
          await m.markPostPaid(postId, 'MOCK_ORDER_ID');
        } else if (post?.paymentStatus === 'paid') {
          console.log('Post is already paid, skipping mock update.');
        } else {
          console.warn('Mock payment simulation: post not found:', postId);
        }
      });
    }
  }, [postId, searchParams]);

  return (
    <div className="bg-stone-50 min-h-screen py-20 font-sans text-stone-900">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        <div className="bg-white p-8 md:p-16 rounded-sm border border-stone-200 shadow-sm text-center space-y-8 animate-in zoom-in-95 duration-700">
          <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <Check size={48} strokeWidth={1.5} />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-serif tracking-tight">Успешно ја примивме вашата уплата</h1>
            <p className="text-stone-500 leading-relaxed font-light text-lg">
              Вашата објава сега чека уредничка проверка и ќе биде објавена наскоро.
            </p>
          </div>

          {postId && (
            <div className="bg-stone-50 border border-stone-100 rounded-sm p-4 text-sm text-stone-500">
              ID на објава: <span className="font-mono text-stone-900">#{postId.substring(0, 8)}</span>
            </div>
          )}

          <button
            onClick={() => navigate('/')}
            className="w-full py-4 bg-stone-900 text-white rounded-sm font-medium hover:bg-stone-800 transition-colors shadow-lg uppercase tracking-widest text-sm"
          >
            Врати се на почетна
          </button>
        </div>
      </div>
    </div>
  );
};
