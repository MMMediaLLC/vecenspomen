import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MemorialPost } from '../types';
import { getPostById, getPostBySlug } from '../lib/posts';
import { MemorialTemplate } from '../components/MemorialTemplate';
import { Guestbook } from '../components/Guestbook';
import { getRelatedPosts } from '../lib/posts';
import { format } from 'date-fns';
import { mk } from 'date-fns/locale';
import { 
  ArrowLeft, Share2, Printer, Heart, 
  MessageSquare, Calendar, ChevronRight, 
  Facebook, Twitter, Link as LinkIcon,
  Loader2, AlertCircle, Home
} from 'lucide-react';

export const SinglePost: React.FC = () => {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<MemorialPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState<MemorialPost[]>([]);

  useEffect(() => {
    if (post?.id || post?.slug) {
      const fetchRelated = async () => {
        const idToUse = post.id || post.slug;
        const related = await getRelatedPosts(idToUse);
        setRelatedPosts(related);
      };
      fetchRelated();
    }
  }, [post]);

  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true);
      try {
        let foundPost: MemorialPost | null = null;
        if (slug) {
          foundPost = await getPostBySlug(slug);
        } else if (id) {
          foundPost = await getPostById(id);
        }

        if (foundPost) {
          setPost(foundPost);
        } else {
          setError('Објавата не е пронајдена.');
        }
      } catch (err) {
        console.error(err);
        setError('Настана грешка при вчитување на објавата.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
    window.scrollTo(0, 0);
  }, [id, slug]);

  const shareUrl = window.location.href;
  const shareTitle = post ? `Вечен Спомен | ${post.fullName}` : 'Вечен Спомен';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="animate-spin text-stone-400 mb-4" size={40} />
        <p className="font-serif text-stone-500 uppercase tracking-widest text-[10px] font-black">Вчитување на вечниот спомен...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-12 border border-stone-200 text-center shadow-sm">
          <AlertCircle className="mx-auto text-stone-300 mb-6" size={48} />
          <h2 className="text-2xl font-serif text-stone-900 mb-4">Објавата не е пронајдена</h2>
          <p className="text-stone-500 mb-8 font-light">Ве молиме проверете ја адресата или вратете се на почетната страница.</p>
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-stone-900 text-white font-black uppercase tracking-widest text-[11px] hover:bg-stone-800 transition-all"
          >
            <Home size={14} /> Назад на почетна
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Вечен Спомен — {post.fullName}</title>
        <meta name="description" content={`Последен поздрав и вечен спомен за ${post.fullName}${post.city ? ` од ${post.city}` : ''}. ${post.introText?.substring(0, 150)}...`} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`Вечен Спомен | ${post.fullName}`} />
        <meta property="og:description" content={`Достоинствено меморијално известување за ${post.fullName}. Прочитајте повеќе и оставете порака во книгата на сочувство.`} />
        {post.shareImageUrl && <meta property="og:image" content={post.shareImageUrl} />}
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Вечен Спомен | ${post.fullName}`} />
        <meta name="twitter:description" content={`Последен поздрав за ${post.fullName}.`} />
        {post.shareImageUrl && <meta name="twitter:image" content={post.shareImageUrl} />}
      </Helmet>

      <div className="border-t border-stone-100/80 min-h-screen pb-32 relative" style={{ 
        backgroundColor: '#f0ede8',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Crect x='27' y='10' width='6' height='40' fill='%231c1917' opacity='0.06'/%3E%3Crect x='10' y='22' width='40' height='6' fill='%231c1917' opacity='0.06'/%3E%3Crect x='27' y='16' width='6' height='8' fill='%231c1917' opacity='0.06'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '60px 60px'
      }}>
        {/* Background Image Setup */}
        <div 
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed transform-gpu"
          style={{ backgroundImage: `url('/background.webp')` }}
        />
        
        {/* Soft overlay over the background image to ensure the card pops */}
        <div className="fixed inset-0 z-0 backdrop-blur-[1px]" style={{ backgroundColor: 'rgba(240, 237, 232, 0.7)' }} />

        <div className="max-w-5xl mx-auto px-4 pt-4 md:pt-12 relative z-10">
          {/* Breadcrumbs / Navigation */}
          <div className="hidden md:flex items-center gap-2 mb-8 text-[10px] font-black uppercase tracking-widest text-stone-400">
            <Link to="/" className="hover:text-stone-900 transition-colors">Почетна</Link>
            <ChevronRight size={10} className="text-stone-300" />
            <Link to="/pochinati" className="hover:text-stone-900 transition-colors">Починати</Link>
            <ChevronRight size={10} className="text-stone-300" />
            <span className="text-stone-900">{post.fullName}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-24">
            
            {/* Left Sidebar - Actions (Desktop Only) */}
            <aside className="hidden lg:flex lg:col-span-1 flex-col gap-4 sticky top-12">
              <Link
                to="/pochinati"
                className="w-12 h-12 flex items-center justify-center bg-white border border-stone-200 text-stone-400 hover:text-stone-900 hover:border-stone-900 transition-all rounded-sm shadow-sm group"
                title="Назад"
              >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              </Link>
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className={`w-12 h-12 flex items-center justify-center border transition-all rounded-sm shadow-sm ${
                  showShareMenu ? 'bg-stone-900 border-stone-900 text-white' : 'bg-white border-stone-200 text-stone-400 hover:text-stone-900'
                }`}
                title="Сподели"
              >
                <Share2 size={20} />
              </button>
              <button
                onClick={handlePrint}
                className="w-12 h-12 flex items-center justify-center bg-white border border-stone-200 text-stone-400 hover:text-stone-900 hover:border-stone-900 transition-all rounded-sm shadow-sm"
                title="Печати"
              >
                <Printer size={20} />
              </button>
            </aside>

            {/* Mobile Top Navigation */}
            <div className="lg:hidden flex items-center justify-between mb-0 px-2">
               <Link to="/pochinati" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-400">
                <ArrowLeft size={14} /> Назад
              </Link>
              <div className="flex gap-2">
                 <button 
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="w-10 h-10 flex items-center justify-center bg-white border border-stone-100 text-stone-400 rounded-full"
                >
                  <Share2 size={16} />
                </button>
                <button 
                  onClick={handlePrint}
                  className="w-10 h-10 flex items-center justify-center bg-white border border-stone-100 text-stone-400 rounded-full"
                >
                  <Printer size={16} />
                </button>
              </div>
            </div>

            {/* Main Content - Memorial Card */}
            <div className="lg:col-span-11 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              
              {/* Share Menu Dropdown (Simplified) */}
              {showShareMenu && (
                <div className="bg-white border border-stone-200 p-3 md:p-6 shadow-2xl relative z-50 animate-in zoom-in-95 duration-300">
                   <div className="flex flex-row flex-wrap items-center gap-2 md:gap-4">
                    <a 
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2 px-3 md:py-3 md:px-4 bg-[#1877F2] text-white text-[10px] md:text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all overflow-hidden"
                    >
                      <Facebook size={14} className="shrink-0" /> <span className="truncate">Facebook</span>
                    </a>
                    <button 
                      onClick={handleCopyLink}
                      className="flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2 px-3 md:py-3 md:px-4 bg-stone-100 text-stone-600 text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-stone-200 transition-all overflow-hidden"
                    >
                      <LinkIcon size={14} className="shrink-0" /> <span className="truncate">{copySuccess ? 'Копирано' : 'Копирај линк'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* The Actual Memorial Template Card */}
              <div className="shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
                <MemorialTemplate post={post} />
              </div>

              {/* Action Buttons - Only for ТАЖНА ВЕСТ */}
              {post.type === 'ТАЖНА ВЕСТ' && (
                <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
                  <Link
                    to={`/objavi?type=СОЧУВСТВО&fullName=${encodeURIComponent(post.fullName)}&relId=${post.id}&relSlug=${post.slug}`}
                    className="flex-1 max-w-xs mx-auto sm:mx-0 flex items-center justify-center gap-2 py-4 px-6 border border-stone-800 text-stone-800 text-[11px] font-black uppercase tracking-widest hover:bg-stone-800 hover:text-white transition-all duration-300"
                  >
                    <Heart size={14} /> Изрази сочувство
                  </Link>
                  <Link
                    to={`/objavi?type=ПОСЛЕДЕН ПОЗДРАВ&fullName=${encodeURIComponent(post.fullName)}&relId=${post.id}&relSlug=${post.slug}`}
                    className="flex-1 max-w-xs mx-auto sm:mx-0 flex items-center justify-center gap-2 py-4 px-6 border border-stone-800 text-stone-800 text-[11px] font-black uppercase tracking-widest hover:bg-stone-800 hover:text-white transition-all duration-300"
                  >
                    <MessageSquare size={14} /> Испрати Последен поздрав
                  </Link>
                </div>
              )}

              {/* Related Posts Section (Condolences & Farewells) */}
              {relatedPosts.length > 0 && (
                <div className="mt-20 space-y-16">
                  {/* Last Farewells Group */}
                  {relatedPosts.filter(p => p.type === 'ПОСЛЕДЕН ПОЗДРАВ').length > 0 && (
                    <div className="animate-in fade-in duration-1000">
                      <h3 className="text-xl font-serif text-stone-900 mb-8 border-b border-stone-100 pb-4">Последни поздрави</h3>
                      <div className="space-y-12">
                        {relatedPosts
                          .filter(p => p.type === 'ПОСЛЕДЕН ПОЗДРАВ')
                          .map((relPost, idx) => (
                            <div key={relPost.id} className="relative pl-0 md:pl-8 group">
                              <div className="absolute left-0 top-0 bottom-0 w-px bg-stone-100 group-hover:bg-stone-300 transition-colors hidden md:block" />
                              <div className="space-y-4">
                                <p className="text-stone-700 font-light leading-relaxed italic text-lg">"{relPost.mainText}"</p>
                                <div className="flex flex-col gap-1">
                                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-900">{relPost.senderName}</span>
                                  <span className="text-[9px] uppercase tracking-widest text-stone-400 font-bold">
                                    {format(new Date(relPost.createdAt), 'dd MMMM yyyy', { locale: mk })}
                                  </span>
                                </div>
                              </div>
                              {idx < relatedPosts.filter(p => p.type === 'ПОСЛЕДЕН ПОЗДРАВ').length - 1 && (
                                <div className="h-px bg-stone-50 mt-12 w-1/3" />
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Condolences Group */}
                  {relatedPosts.filter(p => p.type === 'СОЧУВСТВО').length > 0 && (
                    <div className="animate-in fade-in duration-1000">
                      <h3 className="text-xl font-serif text-stone-900 mb-8 border-b border-stone-100 pb-4">Сочувства</h3>
                      <div className="space-y-12">
                        {relatedPosts
                          .filter(p => p.type === 'СОЧУВСТВО')
                          .map((relPost, idx) => (
                            <div key={relPost.id} className="relative pl-0 md:pl-8 group">
                              <div className="absolute left-0 top-0 bottom-0 w-px bg-stone-100 group-hover:bg-stone-300 transition-colors hidden md:block" />
                              <div className="space-y-4">
                                <p className="text-stone-700 font-light leading-relaxed text-lg">"{relPost.mainText}"</p>
                                <div className="flex flex-col gap-1">
                                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-900">{relPost.senderName}</span>
                                  <span className="text-[9px] uppercase tracking-widest text-stone-400 font-bold">
                                    {format(new Date(relPost.createdAt), 'dd MMMM yyyy', { locale: mk })}
                                  </span>
                                </div>
                              </div>
                              {idx < relatedPosts.filter(p => p.type === 'СОЧУВСТВО').length - 1 && (
                                <div className="h-px bg-stone-50 mt-12 w-1/3" />
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

               {/* Guestbook / Condolences Section */}
              <div className="mt-20">
                <Guestbook postId={post.id} entries={post.guestbookEntries} ownerName={post.fullName} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};
