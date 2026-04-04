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
    package: 'Стандард'
  } as unknown as MemorialPost;

  const cityFilters = ['Сите', 'Скопје', 'Гостивар', 'Тетово', 'Битола', 'Охрид'];
  
  const filteredPosts = selectedCity === 'Сите' 
    ? posts 
    : posts.filter(p => p.city === selectedCity);
    
  const latestPosts = filteredPosts.slice(0, 8);

  return (
    <div className="relative pb-24 md:pb-0"> {/* Padding bottom for mobile sticky CTA */}

      {/* 1) PREMIUM HERO SECTION */}
      <section className="relative pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left side text */}
            <div className="space-y-8 animate-in fade-in duration-1000 slide-in-from-bottom-4">
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif text-stone-900 leading-[1.1] tracking-tight">
                Достоинствено место за тажни вести и вечни спомени
              </h1>
              <p className="text-lg md:text-xl text-stone-600 leading-relaxed max-w-lg font-light">
                Брзо и достоинствено поднесете тажна вест, помен, сочувство или последен поздрав за цела Македонија. Без регистрација, со преглед пред објава и админ одобрување.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={onNavigateSubmit}
                  className="bg-stone-900 text-white px-8 py-4 text-base font-medium transition-all hover:bg-stone-800 flex items-center justify-center gap-2"
                >
                  Поднеси објава <ArrowRight size={18} />
                </button>
                <button
                  onClick={scrollToLatest}
                  className="bg-transparent text-stone-900 border border-stone-200 px-8 py-4 text-base font-medium transition-all hover:border-stone-400 flex items-center justify-center"
                >
                  Погледни пример
                </button>
              </div>
            </div>

            {/* Right side preview card */}
            <div className="hidden lg:block relative ml-auto w-full max-w-md animate-in fade-in duration-1000 delay-300 slide-in-from-right-8">
              <div className="absolute -inset-10 bg-stone-50 rounded-[3rem] -z-10 blur-xl opacity-70"></div>
              <div 
                className="bg-white p-2 border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transform rotate-1 hover:rotate-0 transition-transform duration-700 overflow-hidden max-h-[580px]"
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

      {/* 2) LATEST MEMORIALS */}
      <section id="latest-memorials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif text-stone-900 mb-6">
              Последни објави низ Македонија
            </h2>
            <div className="w-12 h-[1px] bg-[var(--color-gold)] mx-auto mb-10 opacity-60"></div>
            
            {/* Horizontal scrollable pills for mobile */}
            <div className="flex overflow-x-auto pb-4 snap-x hide-scrollbar justify-start md:justify-center gap-2">
              {cityFilters.map(city => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`snap-start whitespace-nowrap px-6 py-2 text-sm font-medium transition-all duration-300 border ${
                    selectedCity === city 
                      ? 'bg-stone-900 text-white border-stone-900' 
                      : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {latestPosts.map(post => (
              <div key={post.id} className="h-full">
                <PostCard post={post} onClick={onPostClick} />
              </div>
            ))}
          </div>
          
          {latestPosts.length === 0 && (
            <div className="text-center text-stone-500 py-12 font-serif italic">
              Нема пронајдено објави за овој град.
            </div>
          )}

          <div className="text-center mt-12">
            <button
              onClick={() => { navigate('/pochinati'); window.scrollTo(0, 0); }}
              className="text-stone-500 hover:text-stone-900 text-sm font-medium uppercase tracking-widest transition-colors"
            >
              Види ги сите починати
            </button>
          </div>
        </div>
      </section>

      {/* 3) PREMIUM BOTTOM CTA */}
      <section className="bg-stone-900 py-32 mt-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-serif text-white mb-6 leading-tight">
            Достоинствено објавете вест за починато лице
          </h2>
          <p className="text-stone-400 text-sm md:text-base font-light mb-12 max-w-xl mx-auto leading-relaxed">
            Поднесете објава за неколку минути, а нашиот тим ќе ја провери пред објавување.
          </p>
          <button
            onClick={onNavigateSubmit}
            className="bg-white text-stone-900 px-10 py-4 text-base font-medium transition-all hover:bg-stone-100 inline-flex items-center justify-center gap-2"
          >
            Поднесете објава <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* 4) MOBILE STICKY CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-stone-200 z-50 animate-in slide-in-from-bottom-full duration-500">
        <button
          onClick={onNavigateSubmit}
          className="w-full bg-stone-900 text-white py-4 rounded-sm text-sm font-medium tracking-wide shadow-lg flex justify-center items-center gap-2"
        >
          Поднеси објава <ArrowRight size={16} />
        </button>
      </div>

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
