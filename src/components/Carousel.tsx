import React, { useState, useEffect } from 'react';
import { MemorialPost } from '../types';
import { PostCard } from './PostCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CarouselProps {
  posts: MemorialPost[];
  onPostClick: (id: string) => void;
}

export const Carousel: React.FC<CarouselProps> = ({ posts, onPostClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setItemsToShow(4);
      else if (window.innerWidth >= 768) setItemsToShow(2);
      else setItemsToShow(1);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset index when posts change (e.g. city filter)
  useEffect(() => {
    setCurrentIndex(0);
  }, [posts]);

  // Auto-advance
  useEffect(() => {
    if (posts.length <= itemsToShow) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => {
        const max = posts.length - itemsToShow;
        return prev >= max ? 0 : prev + 1;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [posts.length, itemsToShow]);

  if (posts.length === 0) return (
    <div className="text-center py-16 text-stone-400">
      Нема објави за прикажување во овој град.
    </div>
  );

  const maxIndex = Math.max(0, posts.length - itemsToShow);
  const dotCount = maxIndex + 1;

  return (
    <div className="space-y-6">
      <div className="relative group px-4">
        <div className="overflow-hidden">
          <motion.div
            className="flex gap-6"
            animate={{ x: `-${currentIndex * (100 / itemsToShow)}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {posts.map((post) => (
              <div
                key={post.id}
                className="flex-shrink-0"
                style={{ width: `calc(${100 / itemsToShow}% - ${(24 * (itemsToShow - 1)) / itemsToShow}px)` }}
              >
                <PostCard post={post} onClick={onPostClick} />
              </div>
            ))}
          </motion.div>
        </div>

        {maxIndex > 0 && (
          <>
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-stone-400 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all opacity-0 group-hover:opacity-100 z-10"
              aria-label="Претходно"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => setCurrentIndex(prev => Math.min(maxIndex, prev + 1))}
              disabled={currentIndex === maxIndex}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-stone-400 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all opacity-0 group-hover:opacity-100 z-10"
              aria-label="Следно"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>

      {/* Dot indicators */}
      {dotCount > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: dotCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`rounded-full transition-all duration-300 ${
                i === currentIndex ? 'w-6 h-2 bg-stone-900' : 'w-2 h-2 bg-stone-300 hover:bg-stone-500'
              }`}
              aria-label={`Страна ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
