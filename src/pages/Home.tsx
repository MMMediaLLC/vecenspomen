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

  const cityFilters = ['Сите', 'Скопје', 'Гостивар', 'Тетово', 'Битола', 'Охрид'];
  
  const filteredPosts = selectedCity === 'Сите' 
    ? posts 
    : posts.filter(p => p.city === selectedCity);
    
  const latestPosts = filteredPosts.slice(0, 8);

  return (
    <div className="relative pb-24 md:pb-0"> {/* Padding bottom for mobile sticky CTA */}

      {/* 1) PREMIUM HERO SECTION */}
      <section className="relative pt-14 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        <div 
          className="absolute inset-0 -z-10 opacity-[0.35] transition-opacity duration-1000"
          style={{ 
            backgroundImage: `url('/bg-hero.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 40%',
            maskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)'
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left side text */}
            <div className="space-y-8 animate-in fade-in duration-1000 slide-in-from-bottom-4">
              <h1 className="text-5xl md:text-6xl lg:text-6xl font-serif text-stone-900 leading-[1.05] tracking-tight font-normal">
                Со достоинство, во спомен на оние што ги сакаме.
              </h1>
              <p className="text-lg md:text-xl text-stone-600 leading-relaxed max-w-lg font-light">
                Во мигови на тишина и тага, споделете тажна вест, последен поздрав, сочувство или помен со почит и љубов.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={onNavigateSubmit}
                  className="bg-stone-900 text-white px-8 py-4 text-base font-semibold font-sans transition-all hover:bg-stone-800 flex items-center justify-center gap-2"
                >
                  Поднеси објава <ArrowRight size={18} />
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
      <div className="h-14 bg-gradient-to-b from-white to-stone-50" />

      {/* 2) LATEST MEMORIALS */}
      <section id="latest-memorials" className="py-24 relative overflow-hidden bg-stone-50">
        <div 
          className="absolute inset-0 -z-10 opacity-[0.14] grayscale-[0.2]"
          style={{ 
            backgroundImage: `url('/bg-marble.png')`,
            backgroundSize: '800px',
            backgroundRepeat: 'repeat'
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-6">
            <h2 className="text-3xl md:text-4xl font-serif text-stone-900 mb-4">
              Последни објави низ Македонија
            </h2>
            <div className="w-8 h-[1px] bg-stone-300 mx-auto mb-10 opacity-70"></div>
            
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

          <div className="flex items-center justify-center gap-6 mt-16">
            <div className="h-[1px] w-8 bg-stone-200" />
            <button
              onClick={() => { navigate('/pochinati'); window.scrollTo(0, 0); }}
              className="text-stone-600 hover:text-stone-900 text-sm font-normal tracking-wide transition-colors font-sans"
            >
              Види ги сите починати
            </button>
            <div className="h-[1px] w-8 bg-stone-200" />
          </div>
        </div>
      </section>

      {/* 3) PREMIUM BOTTOM CTA */}
      <section className="relative overflow-hidden bg-[#111111] py-24 mt-0">
        <div 
          className="absolute inset-0 z-0 transition-opacity duration-1000"
          style={{ 
            backgroundImage: `url('/bg-hero-memorial.png')`,
            backgroundSize: '110%',
            backgroundPosition: '75% 70%',
          }}
        />
        {/* Dark Gradient Overlay */}
        <div 
          className="absolute inset-0 z-10"
          style={{
            background: 'linear-gradient(to right, rgba(17, 17, 17, 0.95) 0%, rgba(17, 17, 17, 0.8) 40%, rgba(17, 17, 17, 0.3) 100%)'
          }}
        />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-20">
          <h2 className="text-4xl md:text-5xl font-serif text-white mb-6 leading-tight">
            Информирајте ги пријателите и семејството за тажната вест.
          </h2>
          <p className="text-stone-400 text-sm md:text-base font-light mb-12 max-w-xl mx-auto leading-relaxed">
            Поднесете објава за неколку минути, а нашиот тим ќе ја провери пред објавување.
          </p>
          <button
            onClick={onNavigateSubmit}
            className="bg-white text-stone-900 px-10 py-4 text-base font-bold font-sans transition-all hover:bg-stone-100 inline-flex items-center justify-center gap-2 uppercase tracking-normal"
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
