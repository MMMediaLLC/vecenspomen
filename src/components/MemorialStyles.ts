export type StyleVariant = 'pravoslaven' | 'katolicki' | 'muslimanski' | 'socijalisticki' | 'klasicen' | 'emotiven';

export interface StyleConfig {
  id: StyleVariant;
  label: string;
  symbol: string;
  className: string;      // Base class for outer layout or specific container overrides
  borderClass: string;    // Classes for the main border / card edge
  ornamentType: 'orthodox' | 'catholic' | 'arabesque' | 'star' | 'floral' | 'floral-soft';
  colorTheme: 'gold' | 'stone' | 'red' | 'neutral';
  fontTheme: string;
}

export const MEMORIAL_STYLES: Record<StyleVariant, StyleConfig> = {
  pravoslaven: {
    id: 'pravoslaven',
    label: 'Православен',
    symbol: '☦',
    className: 'variant-pravoslaven',
    borderClass: 'border-2 border-[var(--color-gold-muted, #B89C6F)]',
    ornamentType: 'orthodox',
    colorTheme: 'gold',
    fontTheme: 'font-serif',
  },
  katolicki: {
    id: 'katolicki',
    label: 'Латински католички',
    symbol: '✝',
    className: 'variant-katolicki',
    borderClass: 'border border-stone-800',
    ornamentType: 'catholic',
    colorTheme: 'stone',
    fontTheme: 'font-serif',
  },
  muslimanski: {
    id: 'muslimanski',
    label: 'Муслимански',
    symbol: '☾',
    className: 'variant-muslimanski',
    borderClass: 'border-[1px] border-stone-600',
    ornamentType: 'arabesque',
    colorTheme: 'stone',
    fontTheme: 'font-serif',
  },
  socijalisticki: {
    id: 'socijalisticki',
    label: 'Социјалистички',
    symbol: '★',
    className: 'variant-socijalisticki',
    borderClass: 'border border-stone-800',
    ornamentType: 'star',
    colorTheme: 'red',
    fontTheme: 'font-serif',
  },
  klasicen: {
    id: 'klasicen',
    label: 'Класичен',
    symbol: '', // No symbol
    className: 'variant-klasicen',
    borderClass: 'border border-stone-400',
    ornamentType: 'floral',
    colorTheme: 'neutral',
    fontTheme: 'font-serif',
  },
  emotiven: {
    id: 'emotiven',
    label: 'Емотивен',
    symbol: '', // No symbol
    className: 'variant-emotiven',
    borderClass: 'border-[0.5px] border-stone-300',
    ornamentType: 'floral-soft',
    colorTheme: 'neutral',
    fontTheme: 'font-serif',
  }
};

export const STYLE_VARIANTS_ARRAY = Object.values(MEMORIAL_STYLES);

// Helper for mapping legacy selectedFrameStyle to the new variants
export const mapLegacyStyleToVariant = (legacyStyle?: string): StyleVariant => {
  switch (legacyStyle) {
    case 'orthodox':
      return 'pravoslaven';
    case 'catholic':
    case 'latin':
      return 'katolicki';
    case 'muslim':
      return 'muslimanski';
    case 'star':
    case 'socialist':
      return 'socijalisticki';
    case 'elegant':
      return 'klasicen';
    case 'clean':
    default:
      return 'klasicen';
  }
};
