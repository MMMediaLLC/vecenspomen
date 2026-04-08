import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useHead } from '@unhead/react';
import { MemorialPost } from '../types';
import { MemorialTemplate } from '../components/MemorialTemplate';
import { OGImageTemplate } from '../components/OGImageTemplate';
import { Guestbook } from '../components/Guestbook';
import { getRelatedPosts, getPostById, getPostBySlug, addGuestbookEntry } from '../lib/posts';
import { format } from 'date-fns';
import { mk } from 'date-fns/locale';
import {
  Facebook, Link as LinkIcon, Download, MessageCircle,
  ArrowLeft, Check, Loader2, AlertCircle, Home
} from 'lucide-react';
import * as htmlToImage from 'html-to-image';

export const SinglePost: React.FC = () => {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<MemorialPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<MemorialPost[]>([]);

  const ogImageRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useHead({
    title: post ? `Вечен Спомен — ${post.fullName}` : 'Вечен Спомен',
    meta: post ? [
      { name: 'description', content: `Последен поздрав и вечен спомен за ${post.fullName}${post.city ? ` од ${post.city}` : ''}. ${post.introText?.substring(0, 150)}...` },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: `Вечен Спомен | ${post.fullName}` },
      { property: 'og:description', content: `Достоинствено меморијално известување за ${post.fullName}. Прочитајте повеќе и оставете порака во книгата на сочувство.` },
      ...(post.shareImageUrl ? [{ property: 'og:image', content: post.shareImageUrl }] : []),
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: `Вечен Спомен | ${post.fullName}` },
      { name: 'twitter:description', content: `Последен поздрав за ${post.fullName}.` },
      ...(post.shareImageUrl ? [{ name: 'twitter:image', content: post.shareImageUrl }] : [])
    ] : []
  });

  useEffect(() => {
    if (post?.id) {
      const fetchRelated = async () => {
        const related = await getRelatedPosts(post.id);
        setRelatedPosts(related);
      };
      fetchRelated();
    }
  }, [post]);

  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true);
      try {
        let data: MemorialPost | null = null;
        if (slug) {
          data = await getPostBySlug(slug);
          if (!data) {
            data = await getPostById(slug);
          }
        } else if (id) {
          data = await getPostById(id);
          if (!data) {
            data = await getPostBySlug(id);
          }
        }

        if (data) {
          setPost(data);
        } else {
          setError('Објавата не е пронајдена.');
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Настана грешка при вчитување на објавата.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
    window.scrollTo(0, 0);
  }, [id, slug]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadImage = async () => {
    if (!ogImageRef.current || isDownloading || !post) return;
    setIsDownloading(true);
    try {
      const dataUrl = await htmlToImage.toJpeg(ogImageRef.current, {
        quality: 0.95,
        backgroundColor: '#fafaf9',
      });
      const link = document.createElement('a');
      link.download = `vechen-spomen-${post.fullName.replace(/\s+/g, '-').toLowerCase()}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error generating image', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleFacebookShare = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'noopener');
  };

  const handleViberShare = () => {
    if (!post) return;
    const text = encodeURIComponent(`${post.fullName} — Вечен Спомен\n${window.location.href}`);
    window.open(`viber://forward?text=${text}`, '_blank');
  };

  const handleAddGuestbookEntry = async (entry: { senderName: string; text: string }) => {
    if (!post) return;
    const newEntry = {
      id: `g-${Date.now()}`,
      senderName: entry.senderName,
      text: entry.text,
      status: 'pending' as const,
      createdAt: new Date().toISOString()
    };
    try {
      await addGuestbookEntry(post.id, newEntry);
    } catch (err) {
      console.error('Error adding guestbook entry:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-stone-400 bg-stone-50 animate-pulse">
        <Loader2 className="animate-spin w-10 h-10 mb-4" />
        <p className="font-serif text-lg">Се вчитува споменот...</p>
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
    <div className="bg-stone-50 border-t border-stone-100/80 min-h-screen pb-32 relative">
      {/* Background */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ backgroundImage: `url('/background.webp')` }}
      />
      <div className="fixed inset-0 z-0 bg-white/60 backdrop-blur-[1px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-16 relative z-10">

        {/* Top bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4 md:mb-10 no-print animate-in fade-in slide-in-from-top-4 duration-1000">

          {/* Navigation */}
          <div className="flex items-center gap-4 order-2 md:order-1">
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 text-stone-400 hover:text-stone-900 transition-all text-[10px] font-bold uppercase tracking-widest"
              aria-label="Назад"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Назад
            </button>
            <span className="w-1 h-1 bg-stone-300 rounded-full" />
            <span className="text-stone-400 text-[10px] uppercase tracking-[0.2em] font-bold">{post.city}</span>
          </div>

          {/* Share Action Bar */}
          <div className="flex flex-row flex-nowrap items-center justify-center md:justify-end gap-[4px] md:gap-[8px] text-stone-500 font-sans order-1 md:order-2 w-full md:w-auto mb-2 md:mb-0 overflow-x-auto hide-scrollbar py-1">
            <button
              onClick={handleFacebookShare}
              className="flex items-center justify-center gap-1 h-7 px-1.5 bg-white border border-stone-200 rounded-[6px] text-[9px] md:text-xs font-medium text-stone-500 hover:border-stone-300 hover:text-stone-700 transition-all shadow-sm flex-shrink-0"
              aria-label="Сподели на Facebook"
            >
              <Facebook size={11} /> <span>Facebook</span>
            </button>
            <button
              onClick={handleViberShare}
              className="flex items-center justify-center gap-1 h-7 px-1.5 bg-white border border-stone-200 rounded-[6px] text-[9px] md:text-xs font-medium text-stone-500 hover:border-stone-300 hover:text-stone-700 transition-all shadow-sm flex-shrink-0"
              aria-label="Сподели на Viber"
            >
              <MessageCircle size={11} /> <span>Viber</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-1 h-7 px-1.5 bg-white border border-stone-200 rounded-[6px] text-[9px] md:text-xs font-medium text-stone-500 hover:border-stone-300 hover:text-stone-700 transition-all shadow-sm flex-shrink-0"
              aria-label="Копирај линк"
            >
              {copied ? <Check size={11} className="text-green-600" /> : <LinkIcon size={11} />}
              <span>{copied ? 'Ископирано' : 'Линк'}</span>
            </button>
            <button
              onClick={handleDownloadImage}
              disabled={isDownloading}
              className="flex items-center justify-center gap-1 h-7 px-1.5 bg-white border border-stone-200 rounded-[6px] text-[9px] md:text-xs font-medium text-stone-500 hover:border-stone-300 hover:text-stone-700 transition-all shadow-sm disabled:opacity-50 flex-shrink-0"
              aria-label="Преземи слика"
            >
              <Download size={11} />
              <span>{isDownloading ? '...' : 'Слика'}</span>
            </button>
          </div>
        </div>

        {/* Memorial card + action buttons as one flush unit */}
        <div className="animate-in fade-in zoom-in-95 duration-1000">
          <MemorialTemplate post={post} />

          {post.type === 'ТАЖНА ВЕСТ' && (
            <div className="max-w-2xl mx-auto mt-5 flex gap-3">
              <Link
                to={`/objavi?type=СОЧУВСТВО&fullName=${encodeURIComponent(post.fullName)}&relId=${post.id}&relSlug=${post.slug}`}
                className="flex-1 flex items-center justify-center py-3.5 bg-white/80 border border-stone-200/60 font-serif text-[10px] font-semibold uppercase tracking-normal text-stone-400 hover:bg-white hover:border-stone-300 hover:text-stone-600 transition-all duration-[1200ms] ease-in-out"
              >
                Изрази сочувство
              </Link>
              <Link
                to={`/objavi?type=ПОСЛЕДЕН ПОЗДРАВ&fullName=${encodeURIComponent(post.fullName)}&relId=${post.id}&relSlug=${post.slug}`}
                className="flex-1 flex items-center justify-center py-3.5 bg-white/80 border border-stone-200/60 font-serif text-[10px] font-semibold uppercase tracking-normal text-stone-400 hover:bg-white hover:border-stone-300 hover:text-stone-600 transition-all duration-[1200ms] ease-in-out"
              >
                Последен поздрав
              </Link>
            </div>
          )}
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-20 space-y-16">
            {relatedPosts.filter(p => p.type === 'ПОСЛЕДЕН ПОЗДРАВ').length > 0 && (
              <div className="animate-in fade-in duration-1000">
                <h3 className="text-xl font-serif text-stone-900 mb-8 border-b border-stone-100 pb-4">Последни поздрави</h3>
                <div className="space-y-12">
                  {relatedPosts
                    .filter(p => p.type === 'ПОСЛЕДЕН ПОЗДРАВ')
                    .map((relPost, idx, arr) => (
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
                        {idx < arr.length - 1 && <div className="h-px bg-stone-50 mt-12 w-1/3" />}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {relatedPosts.filter(p => p.type === 'СОЧУВСТВО').length > 0 && (
              <div className="animate-in fade-in duration-1000">
                <h3 className="text-xl font-serif text-stone-900 mb-8 border-b border-stone-100 pb-4">Сочувства</h3>
                <div className="space-y-12">
                  {relatedPosts
                    .filter(p => p.type === 'СОЧУВСТВО')
                    .map((relPost, idx, arr) => (
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
                        {idx < arr.length - 1 && <div className="h-px bg-stone-50 mt-12 w-1/3" />}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Guestbook */}
        <Guestbook
          entries={post.guestbookEntries || []}
          onAddComment={handleAddGuestbookEntry}
          isEnabled={post.guestbookEnabled}
        />
      </div>

      {/* Hidden OG image for download */}
      <div className="overflow-hidden h-0 w-0 absolute pointer-events-none opacity-0">
        <div ref={ogImageRef}>
          <OGImageTemplate post={post} />
        </div>
      </div>
    </div>
  );
};
