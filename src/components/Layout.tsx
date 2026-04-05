import React from 'react';
import { Heart, Menu, X, Facebook, Instagram, Twitter } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  const handleLogoClick = () => {
    setIsMenuOpen(false);
  };

  const navLink = (label: string, path: string) => (
    <Link
      to={path}
      onClick={() => setIsMenuOpen(false)}
      className="relative group text-[13px] font-semibold font-sans uppercase tracking-[0.05em] transition-all text-white/80 hover:text-white"
    >
      {label}
      <span className={`absolute -bottom-1 left-0 w-full h-[1px] bg-white transform origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100 ${
        currentPath === path ? 'scale-x-100' : ''
      }`} />
    </Link>
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50" style={{ background: '#141414', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link
                to="/"
                onClick={handleLogoClick}
                className="flex items-center gap-3 group"
                aria-label="Почетна — Вечен Спомен"
                title="Почетна"
              >
                <div className="w-10 h-10 bg-white/5 rounded-sm flex items-center justify-center text-white transition-transform group-hover:scale-110">
                  <Heart size={20} fill="currentColor" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-serif text-xl font-bold tracking-tight text-white">ВЕЧЕН СПОМЕН</span>
                  <span className="text-[10px] uppercase tracking-normal text-stone-400 font-bold mt-0.5 font-sans">Македонија</span>
                </div>
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLink('Почетна', '/')}
              {navLink('Починати', '/pochinati')}
              {navLink('Цени', '/ceni')}
              <Link
                to="/objavi"
                onClick={() => { window.scrollTo(0, 0); }}
                className="bg-white text-stone-900 px-6 py-2.5 rounded-sm text-[13px] font-bold font-sans uppercase tracking-normal hover:bg-stone-200 transition-all shadow-sm"
                aria-label="Поднеси нова објава"
              >
                Поднеси објава
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white p-2"
                aria-label={isMenuOpen ? 'Затвори мени' : 'Отвори мени'}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden p-4 space-y-3 shadow-xl" style={{ background: '#141414', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <Link
              to="/"
              onClick={() => { setIsMenuOpen(false); }}
              className="block w-full text-left px-4 py-2.5 text-white/90 font-medium rounded-sm hover:bg-white/10"
            >
              Почетна
            </Link>
            <Link
              to="/pochinati"
              onClick={() => { setIsMenuOpen(false); }}
              className="block w-full text-left px-4 py-2.5 text-white/90 font-medium rounded-sm hover:bg-white/10"
            >
              Починати
            </Link>
            <Link
              to="/ceni"
              onClick={() => { setIsMenuOpen(false); }}
              className="block w-full text-left px-4 py-2.5 text-white/90 font-medium rounded-sm hover:bg-white/10"
            >
              Цени
            </Link>
            <Link
              to="/objavi"
              onClick={() => { setIsMenuOpen(false); window.scrollTo(0, 0); }}
              className="block w-full text-center bg-white text-stone-900 py-3 rounded-sm font-medium mt-2"
            >
              Поднеси објава
            </Link>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#f8f6f3] border-t border-stone-200/70 text-stone-500 py-12 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            
            {/* Brand Minimal */}
            <div className="flex items-center gap-2">
              <Heart size={14} className="text-stone-900" />
              <span className="font-serif text-lg font-normal tracking-tight text-stone-800">ВЕЧЕН СПОМЕН</span>
            </div>

            {/* Editorial Links */}
            <ul className="flex flex-wrap justify-center gap-6 text-[12px] font-semibold font-sans uppercase tracking-wider">
              <li><button className="hover:text-stone-900 transition-colors">Како работи</button></li>
              <li><button className="hover:text-stone-900 transition-colors">Контакт</button></li>
              <li><button className="hover:text-stone-900 transition-colors">Политика на приватност</button></li>
              <li><button className="hover:text-stone-900 transition-colors">Услови</button></li>
            </ul>
          </div>
          
          <div className="mt-8 text-center text-xs text-stone-400">
            © {new Date().getFullYear()} Вечен Спомен. Сите права се задржани.
          </div>
        </div>
      </footer>
    </div>
  );
};
