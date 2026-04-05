import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MemorialPost } from '../types';
import { PostCard } from '../components/PostCard';
import { Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { CITIES } from '../constants';

interface PochinatiProps {
  posts: MemorialPost[];
}

const POSTS_PER_PAGE = 12;

export const Pochinati: React.FC<PochinatiProps> = ({ posts }) => {
  const navigate = useNavigate();
  const { city, subtype } = useParams<{ city?: string; subtype?: string }>();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('Сите');
  const [selectedCity, setSelectedCity] = useState<string>('Сите');
  const [currentPage, setCurrentPage] = useState(1);

  const types = ['Сите', 'ТАЖНА ВЕСТ', 'ПОСЛЕДЕН ПОЗДРАВ', 'СОЧУВСТВО', 'ПОМЕН'];

  // Sync URL params to state
  useEffect(() => {
    if (city) {
      const cityObj = CITIES.find(c => c.slug === city);
      if (cityObj) setSelectedCity(cityObj.name);
    }
    // Handle subtypes or types from URL if needed in future
  }, [city]);

  const onPostClick = (slugOrId: string) => {
    if (slugOrId.includes('-')) {
      navigate(`/spomen/${slugOrId}`);
    } else {
      navigate(`/objava/${slugOrId}`);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType   = selectedType === 'Сите' || post.type === selectedType;
    const matchesCity   = selectedCity === 'Сите' || post.city === selectedCity;
    return matchesSearch && matchesType && matchesCity;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedType, selectedCity]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedType('Сите');
    setSelectedCity('Сите');
    if (city) navigate('/pochinati');
  };

  return (
    <div className="bg-white min-h-screen pb-24 font-light">
      {/* Header */}
      <div className="bg-stone-50 border-b border-stone-100 py-20 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-serif text-stone-900 mb-6">Починати</h1>
          <p className="text-lg text-stone-500 max-w-2xl mx-auto font-light">
            Последни поздрави, сеќавања и тажни вести од цела Македонија.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Filters Section */}
        <div className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end bg-white border-b border-stone-200 pb-12">
            
            {/* Search */}
            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 block px-1">Пребарај по име</label>
              <div className="relative group">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-stone-900 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="Внесете презиме или име..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 bg-transparent border-b border-transparent focus:border-stone-900 transition-all focus:outline-none placeholder:text-stone-300"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 block px-1">Тип на објава</label>
              <div className="relative">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full py-3 bg-transparent border-b border-stone-100 focus:border-stone-900 transition-all focus:outline-none appearance-none cursor-pointer pr-8"
                >
                  {types.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <Filter className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none" size={14} />
              </div>
            </div>

            {/* City Filter */}
            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 block px-1">Град или место</label>
              <div className="relative">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full py-3 bg-transparent border-b border-stone-100 focus:border-stone-900 transition-all focus:outline-none appearance-none cursor-pointer pr-8"
                >
                  <option value="Сите">Сите места</option>
                  {CITIES.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}
                </select>
                <ChevronRight className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-300 rotate-90 pointer-events-none" size={14} />
              </div>
            </div>

          </div>

          <div className="flex items-center justify-between mt-6 px-1">
             <p className="text-stone-400 text-[10px] uppercase tracking-widest font-bold">
              {filteredPosts.length} РЕЗУЛТАТИ {currentPage > 1 && `— СТРАНА ${currentPage}`}
            </p>
            {(searchTerm || selectedType !== 'Сите' || selectedCity !== 'Сите') && (
              <button
                onClick={resetFilters}
                className="text-[10px] font-bold text-stone-400 hover:text-stone-900 border-b border-stone-200 transition-all uppercase tracking-widest"
              >
                Ресетирај филтри
              </button>
            )}
          </div>
        </div>

        {/* Results Grid */}
        {paginatedPosts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
              {paginatedPosts.map(post => (
                <div key={post.id} className="animate-in fade-in duration-700 slide-in-from-bottom-2">
                  <PostCard post={post} onClick={onPostClick} />
                </div>
              ))}
            </div>

            {/* Pagination - Editorial Style */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 mt-24">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-12 h-12 flex items-center justify-center text-stone-400 hover:text-stone-900 disabled:opacity-0 transition-all"
                >
                  <ChevronLeft size={20} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-12 h-12 text-sm transition-all border-b-2 ${
                      page === currentPage
                        ? 'border-stone-900 text-stone-900 font-bold'
                        : 'border-transparent text-stone-400 hover:text-stone-700 hover:border-stone-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-12 h-12 flex items-center justify-center text-stone-400 hover:text-stone-900 disabled:opacity-0 transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-40 border-t border-stone-50">
            <h3 className="font-serif text-2xl text-stone-300 mb-8">Нема пронајдено објави со избраните критериуми.</h3>
            <button
              onClick={resetFilters}
              className="px-8 py-3 border border-stone-200 text-stone-900 text-sm font-medium hover:bg-stone-50 transition-all"
            >
              Прикажи ги сите објави
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
