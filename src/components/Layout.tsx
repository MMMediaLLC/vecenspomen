import React from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
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
      <nav id="main-nav" className="sticky top-0 z-50 shadow-[0_2px_12px_rgba(0,0,0,0.35)]" style={{ background: '#141414', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-12">
            {/* Logo */}
            <div className="flex items-center">
              <Link
                to="/"
                onClick={handleLogoClick}
                className="flex items-center gap-3 group"
                aria-label="Почетна — Вечен Спомен"
                title="Почетна"
              >
                <div className="flex items-center justify-center transition-transform group-hover:scale-105">
                  <img src="/logo.png" alt="Вечен Спомен" className="h-[44px] w-auto object-contain mix-blend-screen" />
                </div>
                <div className="flex items-center ml-1 text-white">
                  <span className="text-[17px]" style={{ fontFamily: "'Gabriela', serif" }}>ВЕЧЕН СПОМЕН</span>
                </div>
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLink('Почетна', '/')}
              {navLink('Спомени', '/spomeni')}
              {navLink('Цени', '/ceni')}
              <Link
                to="/objavi"
                onClick={() => { window.scrollTo(0, 0); }}
                className="bg-white text-stone-900 px-6 py-2.5 rounded-[3px] text-[13px] font-bold font-sans uppercase tracking-[0.05em] hover:bg-stone-200 transition-all shadow-sm"
                aria-label="Поднеси нова објава"
              >
                Објави спомен
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
              to="/spomeni"
              onClick={() => { setIsMenuOpen(false); }}
              className="block w-full text-left px-4 py-2.5 text-white/90 font-medium rounded-sm hover:bg-white/10"
            >
              Спомени
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
              className="block w-full text-center bg-white text-stone-900 py-3 rounded-[3px] font-medium font-sans uppercase tracking-[0.05em] text-[13px] mt-2"
            >
              Објави спомен
            </Link>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main key={location.pathname} className="flex-grow fade-in pb-[72px] md:pb-0">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#f8f6f3] border-t border-stone-200/70 text-stone-500 pt-4 pb-8 md:py-12 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">

            {/* Brand Minimal - Centered on Mobile */}
            <div className="flex flex-col items-center gap-3">
              <img src="/logo.png" alt="Вечен Спомен" className="h-[48px] w-auto object-contain invert mix-blend-multiply" />
              <div className="flex items-center">
                <span className="text-[14px] text-stone-900" style={{ fontFamily: "'Gabriela', serif" }}>ВЕЧЕН СПОМЕН</span>
              </div>
            </div>

            {/* Right side: links + payment cards */}
            <div className="flex flex-col items-center md:items-end gap-4 md:order-last">
              {/* Editorial Links */}
              <ul className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 text-[12px] font-semibold font-sans uppercase tracking-wider">
                <li><Link to="/kako-raboti" onClick={() => window.scrollTo(0, 0)} className="hover:text-stone-900 transition-colors">Како работи</Link></li>
                <li><button className="hover:text-stone-900 transition-colors">Контакт</button></li>
                <li><Link to="/politika-na-privatnost" onClick={() => window.scrollTo(0, 0)} className="hover:text-stone-900 transition-colors">Политика на приватност</Link></li>
                <li><Link to="/uslovi" onClick={() => window.scrollTo(0, 0)} className="hover:text-stone-900 transition-colors">Услови</Link></li>
              </ul>
              {/* Payment card icons */}
              <div className="flex flex-col items-center md:items-end gap-1.5">
              <span className="text-[9px] font-semibold uppercase tracking-widest text-stone-400">Безбедно плаќање со:</span>
              <div className="flex items-center gap-1.5">
                {/* Visa */}
                <div className="flex items-center justify-center bg-white border border-stone-200 rounded shadow-sm px-1.5 py-0.5 md:px-2 md:py-1" style={{ minWidth: 36, height: 22 }}>
                  <svg viewBox="0 0 48 16" width="30" height="10" className="md:w-[38px] md:h-[13px]" aria-label="Visa">
                    <text x="0" y="13" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="14" fill="#1a1f71" letterSpacing="-0.5">VISA</text>
                  </svg>
                </div>
                {/* Mastercard */}
                <div className="flex items-center justify-center bg-white border border-stone-200 rounded shadow-sm px-1 py-0.5 md:px-1.5 md:py-1" style={{ minWidth: 36, height: 22 }}>
                  <svg viewBox="0 0 38 24" width="26" height="17" className="md:w-[34px] md:h-[22px]" aria-label="Mastercard">
                    <circle cx="14" cy="12" r="10" fill="#EB001B"/>
                    <circle cx="24" cy="12" r="10" fill="#F79E1B"/>
                    <path d="M19 5.27A10 10 0 0 1 23.73 12 10 10 0 0 1 19 18.73 10 10 0 0 1 14.27 12 10 10 0 0 1 19 5.27z" fill="#FF5F00"/>
                  </svg>
                </div>
                {/* Maestro */}
                <div className="flex items-center justify-center bg-white border border-stone-200 rounded shadow-sm px-1 py-0.5 md:px-1.5 md:py-1" style={{ minWidth: 36, height: 22 }}>
                  <svg viewBox="0 0 38 24" width="26" height="17" className="md:w-[34px] md:h-[22px]" aria-label="Maestro">
                    <circle cx="14" cy="12" r="10" fill="#0099DF"/>
                    <circle cx="24" cy="12" r="10" fill="#ED1C24" opacity="0.85"/>
                    <path d="M19 5.27A10 10 0 0 1 23.73 12 10 10 0 0 1 19 18.73 10 10 0 0 1 14.27 12 10 10 0 0 1 19 5.27z" fill="#6C2C91" opacity="0.7"/>
                  </svg>
                </div>
                {/* American Express */}
                <div className="flex items-center justify-center bg-[#007bc1] border border-stone-200 rounded shadow-sm px-1 py-0.5 md:px-1.5 md:py-1" style={{ minWidth: 36, height: 22 }}>
                  <svg viewBox="0 0 44 16" width="28" height="10" className="md:w-[36px] md:h-[13px]" aria-label="American Express">
                    <text x="1" y="12" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="10" fill="white" letterSpacing="0.3">AMEX</text>
                  </svg>
                </div>
                {/* PayPal */}
                <div className="flex items-center justify-center bg-white border border-stone-200 rounded shadow-sm px-1.5 py-0.5 md:px-2 md:py-1" style={{ minWidth: 36, height: 22 }}>
                  <svg viewBox="0 0 60 20" width="36" height="12" className="md:w-[46px] md:h-[15px]" aria-label="PayPal">
                    <text x="0" y="14" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="13" fill="#003087">Pay</text>
                    <text x="22" y="14" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="13" fill="#009cde">Pal</text>
                  </svg>
                </div>
              </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-stone-400">
            © {new Date().getFullYear()} Вечен Спомен. Сите права се задржани.
          </div>
        </div>
      </footer>
      {/* Global mobile sticky CTA */}
      <div className="mobile-sticky-cta md:hidden fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/95 backdrop-blur-md border-t border-stone-200">
        <Link
          to="/objavi"
          onClick={() => window.scrollTo(0, 0)}
          className="w-full bg-stone-900 text-white py-4 rounded-sm text-sm font-medium tracking-wide shadow-lg flex justify-center items-center gap-2"
        >
          Објави спомен <ArrowRight size={16} />
        </Link>
      </div>

    </div>
  );
};
