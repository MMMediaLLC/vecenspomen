import React, { useRef, useState, useEffect } from 'react';
import { MemorialPost } from '../types';
import { MemorialTemplate } from '../components/MemorialTemplate';
import { OGImageTemplate } from '../components/OGImageTemplate';
import { Guestbook } from '../components/Guestbook';
import { Printer, Facebook, Link as LinkIcon, Download, MessageCircle, ArrowLeft, Check, Loader2 } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { useParams, useNavigate } from 'react-router-dom';
import { getPostById, getPostBySlug, addGuestbookEntry } from '../lib/posts';

export const SinglePost: React.FC = () => {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<MemorialPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const ogImageRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true);
      try {
        let data: MemorialPost | null = null;
        if (slug) {
          data = await getPostBySlug(slug);
        } else if (id) {
          // Attempt both ID and Slug for /objava/:id route
          data = await getPostById(id);
          if (!data) {
            data = await getPostBySlug(id);
          }
        }
        setPost(data);
      } catch (err) {
        console.error('Error fetching post:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [id, slug]);

  const handlePrint = () => window.print();

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
      // We don't update local state with pending entries, 
      // the Guestbook component shows its own success message.
    } catch (err) {
      console.error('Error adding guestbook entry:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-stone-400 bg-stone-50 animate-pulse">
        <Loader2 className="animate-spin w-10 h-10 mb-4" />
        <p className="font-serif italic text-lg">Се вчитува споменот...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-stone-400 bg-stone-50">
        <p className="font-serif text-2xl text-stone-800 mb-2 italic">Објавата не е пронајдена</p>
        <button onClick={() => navigate('/')} className="text-stone-500 hover:text-stone-900 underline font-light">Врати се на почетна</button>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 min-h-screen pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Top bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-16 no-print animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 text-stone-400 hover:text-stone-900 transition-all text-[10px] font-bold uppercase tracking-widest"
              aria-label="Назад"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Назад
            </button>
            <span className="w-1 h-1 bg-stone-300 rounded-full" />
            <span className="text-stone-400 text-[10px] uppercase tracking-[0.2em] font-bold">{post.city}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleFacebookShare}
              className="flex items-center gap-2 bg-[#1877F2] text-white px-5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-[#166FE5] transition-all shadow-md hover:shadow-lg"
            >
              <Facebook size={14} /> Сподели
            </button>
            <button
              onClick={handleViberShare}
              className="flex items-center gap-2 bg-[#7360F2] text-white px-5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-[#6554D4] transition-all shadow-md hover:shadow-lg"
            >
              <MessageCircle size={14} /> Viber
            </button>
            <button
              onClick={handleCopyLink}
              className="relative flex items-center gap-2 bg-white border border-stone-200 text-stone-600 px-5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-stone-50 transition-all shadow-sm"
            >
              {copied ? <Check size={14} className="text-green-600" /> : <LinkIcon size={14} />}
              {copied ? 'Копирано' : 'Линк'}
            </button>
            <button
              onClick={handleDownloadImage}
              disabled={isDownloading}
              className="flex items-center gap-2 bg-white border border-stone-200 text-stone-600 px-5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-stone-50 transition-all disabled:opacity-50 shadow-sm"
            >
              <Download size={14} />
              {isDownloading ? '...' : 'Слика'}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-white border border-stone-200 text-stone-600 px-5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-stone-50 transition-all shadow-sm"
            >
              <Printer size={14} /> Печати
            </button>
          </div>
        </div>

        {/* Memorial card */}
        <div className="relative animate-in fade-in zoom-in-95 duration-1000">
          <MemorialTemplate post={post} />
        </div>

        {/* Guestbook Section */}
        <Guestbook 
          entries={post.guestbookEntries || []} 
          onAddComment={handleAddGuestbookEntry}
          isEnabled={post.guestbookEnabled}
        />
      </div>

      {/* Hidden OG image template for download */}
      <div className="overflow-hidden h-0 w-0 absolute pointer-events-none opacity-0">
        <div ref={ogImageRef}>
          <OGImageTemplate post={post} />
        </div>
      </div>
    </div>
  );
};
