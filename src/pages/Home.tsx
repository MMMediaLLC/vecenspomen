import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MemorialPost } from '../types';
import { PostCard } from '../components/PostCard';
import { MemorialTemplate } from '../components/MemorialTemplate';
import { ArrowRight } from 'lucide-react';

interface HomeProps {
  posts: MemorialPost[];
}

export const Home: React.FC<HomeProps> = ({ posts }) => {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState<string>('Сите');

  const onNavigateSubmit = () => { navigate('/objavi'); window.scrollTo(0, 0); };
  const scrollToLatest = () => {
    const el = document.getElementById('latest-memorials');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const onPostClick = (target: string) => {
    // Navigate to /spomen/slug if it contains a hyphen (slug style), otherwise /objava/id
    if (target.includes('-')) {
      navigate(`/spomen/${target}`);
      window.scrollTo(0, 0);
    } else {
      navigate(`/objava/${target}`);
      window.scrollTo(0, 0);
    }
  };

  // Provide a dummy featured post to use as preview if no posts exist
  const featuredPost = posts.find(p => p.isFeatured) ?? posts[0] ?? {
    id: 'demo',
    createdAt: new Date().toISOString(),
    fullName: 'Петар Петровски',
    city: 'Скопје',
    type: 'ТАЖНА ВЕСТ',
    status: 'Објавено',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    birthYear: 1954,
    deathYear: 2026,
    introText: 'Со длабока тага ве известуваме дека почина нашиот сакан татко, дедо и сопруг.',
    mainText: 'Погребот ќе се изврши на Градските гробишта Бутел. Вечен спомен.',
    dateOfFuneral: new Date().toISOString(),
    timeOfFuneral: '13:00',
    placeOfFuneral: 'Градски гробишта Бутел',
    familyNote: 'Засекогаш во нашите срца',
    senderName: 'Семејството',
    package: 'Истакнат'
  } as unknown as MemorialPost;

  // Dynamic City Tabs: Get Top 5 cities with most 'Објавено' posts
  const cityCounts = posts
    .filter(p => p.status === 'Објавено')
    .reduce((acc, p) => {
      acc[p.city] = (acc[p.city] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const dynamicCities = Object.entries(cityCounts)
    .sort((a: [string, number], b: [string, number]) => {
      if (b[1] !== a[1]) return b[1] - a[1]; // Sort by count descending
      return a[0].localeCompare(b[0]); // Then alphabetically
    })
    .slice(0, 5)
    .map(entry => entry[0]);

  const cityFilters = ['Сите', ...dynamicCities];
  
  const filteredPosts = selectedCity === 'Сите' 
    ? posts 
    : posts.filter(p => p.city === selectedCity);
    
  const latestPosts = [...filteredPosts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  return (
    <div className="relative"> {/* Removed pb-24 as it was causing a white gap on mobile */}

      {/* 1) PREMIUM HERO SECTION */}
      <section className="relative pt-6 pb-8 md:pt-20 md:pb-28 overflow-hidden">
        <div 
          className="absolute inset-0 z-0 opacity-[0.4] transition-opacity duration-1000"
          style={{ 
            backgroundImage: `url('/bg-hero.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 40%',
            maskImage: 'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)'
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left side text */}
            <div className="space-y-8 animate-in fade-in duration-1000 slide-in-from-bottom-4 text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl lg:text-6xl font-serif text-stone-900 leading-[1.1] tracking-tight font-normal mx-auto lg:mx-0 max-w-sm lg:max-w-none">
                Со достоинство, во спомен на оние што ги сакаме.
              </h1>
              <p className="text-base md:text-xl text-stone-600 leading-relaxed max-w-sm lg:max-w-lg mx-auto lg:mx-0 font-light">
                Во мигови на тишина и тага, споделете тажна вест, последен поздрав, сочувство или помен со почит и љубов.
              </p>

              <div className="hidden sm:flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={onNavigateSubmit}
                  className="bg-stone-900 text-white px-8 py-4 text-base font-semibold font-sans transition-all hover:bg-stone-800 flex items-center justify-center gap-2"
                >
                  Објави тажна вест <ArrowRight size={18} />
                </button>
              </div>
            </div>

            {/* Right side preview card */}
            <div className="hidden lg:block relative ml-auto w-full max-w-lg animate-in fade-in duration-1000 delay-300 slide-in-from-right-8">
              <div 
                className="bg-white p-2 border border-stone-200/60 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] transform rotate-1 hover:rotate-0 transition-transform duration-700 overflow-hidden max-h-[580px] paper-texture"
                style={{ 
                  maskImage: 'linear-gradient(to bottom, black 75%, transparent 100%)', 
                  WebkitMaskImage: 'linear-gradient(to bottom, black 75%, transparent 100%)' 
                }}
              >
                <MemorialTemplate post={featuredPost} isPreview={true} />
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Soft visual bridge */}
      <div className="h-4 md:h-14 bg-gradient-to-b from-white to-stone-50" />

      {/* 2) LATEST MEMORIALS */}
      <section id="latest-memorials" className="pt-4 pb-6 md:pt-12 md:pb-24 relative overflow-hidden bg-stone-50">
        <div 
          className="absolute inset-0 z-0 opacity-[0.12] grayscale-[0.3] contrast-[0.95]"
          style={{ 
            backgroundImage: `url('/background.webp')`,
            backgroundSize: '1200px',
            backgroundRepeat: 'repeat'
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-4xl font-serif text-stone-900 mb-4">
              Последни спомени и посвети
            </h2>
            <div className="w-8 h-[1px] bg-stone-300 mx-auto mb-6 md:mb-10 opacity-70"></div>
            
            {/* Horizontal scrollable pills for mobile */}
            <div className="flex overflow-x-auto pb-4 snap-x hide-scrollbar justify-start md:justify-center gap-2">
              {cityFilters.map(city => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`snap-start whitespace-nowrap px-5 py-2 text-[12px] font-medium font-sans transition-all duration-300 border uppercase tracking-wide rounded-sm ${
                    selectedCity === city 
                      ? 'bg-stone-800 text-stone-50 border-stone-800 shadow-sm' 
                      : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
            {latestPosts.map(post => (
              <div key={post.id} className="h-full">
                <PostCard post={post} onClick={onPostClick} showImageShadow={true} />
              </div>
            ))}
          </div>
          
          {latestPosts.length === 0 && (
            <div className="text-center text-stone-500 py-12 font-serif">
              Нема пронајдено објави за овој град.
            </div>
          )}

          <div className="flex items-center justify-center gap-6 mt-8 md:mt-16">
            <div className="h-[1px] w-8 bg-stone-200" />
            <button
              onClick={() => { navigate('/spomeni'); window.scrollTo(0, 0); }}
              className="text-stone-600 hover:text-stone-900 text-sm font-normal tracking-wide transition-colors font-sans"
            >
              Види ги сите спомени
            </button>
            <div className="h-[1px] w-8 bg-stone-200" />
          </div>
        </div>
      </section>

      {/* 3) PREMIUM BOTTOM CTA */}
      <section className="relative overflow-hidden pt-12 pb-10 md:py-24 mt-0 bg-transparent">
        {/* Base Layer Color */}
        <div className="absolute inset-0 bg-[#0a0a0a] -z-20" />
        
        {/* Background Image Layer */}
        <div 
          className="absolute inset-0 z-0 opacity-70 transform-gpu"
          style={{ 
            backgroundImage: "url('/bg-hero-memorial.webp')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        {/* Gradient Overlay for Readability */}
        <div className="absolute inset-0 z-10 bg-black/40 md:bg-transparent md:bg-gradient-to-r md:from-black/90 md:via-black/40 md:to-transparent" />
        
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-20">
          <h2 className="text-2xl md:text-5xl font-serif text-white mb-2 md:mb-8 tracking-tight">
            Известете ги семејството и пријателите за тажната вест
          </h2>
          <p className="text-stone-400 text-sm md:text-xl font-light mb-6 md:mb-12 max-w-xl mx-auto leading-relaxed">
            Поднесете објава за неколку минути, нашиот тим ќе ја провери и одобри.
          </p>
          <button
            onClick={onNavigateSubmit}
            className="bg-white text-stone-900 px-7 py-3 md:px-10 md:py-4 text-sm md:text-base font-bold font-sans transition-all hover:bg-stone-100 inline-flex items-center justify-center gap-2 uppercase tracking-normal"
          >
            Објави Тажна вест <ArrowRight size={18} />
          </button>
        </div>
      </section>
 

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

    </div>
  );
};
