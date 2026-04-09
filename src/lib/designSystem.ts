export type StyleVariant = 
  | 'pravoslaven'
  | 'katolicki'
  | 'muslimanski'
  | 'socijalisticki'
  | 'klasicen'
  | 'emotiven';

export interface StyleConfig {
  symbol: string;
  internalStyle: 'elegant' | 'orthodox' | 'catholic' | 'muslim' | 'star' | 'clean';
  borderColor: string;
  accentColor: string;
}

export const STYLE_MAP: Record<StyleVariant, StyleConfig> = {
  pravoslaven: {
    symbol: '☦',
    internalStyle: 'orthodox',
    borderColor: '#1c1917',
    accentColor: '#B08D57',
  },
  katolicki: {
    symbol: '✝',
    internalStyle: 'catholic',
    borderColor: '#1c1917',
    accentColor: '#B08D57',
  },
  muslimanski: {
    symbol: '☾',
    internalStyle: 'muslim',
    borderColor: '#1c1917',
    accentColor: '#B08D57',
  },
  socijalisticki: {
    symbol: '★',
    internalStyle: 'star',
    borderColor: '#1c1917',
    accentColor: '#B08D57',
  },
  klasicen: {
    symbol: '',
    internalStyle: 'elegant',
    borderColor: '#1c1917',
    accentColor: '#B08D57',
  },
  emotiven: {
    symbol: '',
    internalStyle: 'clean',
    borderColor: '#1c1917',
    accentColor: '#B08D57',
  },
};

export const COLORS = {
  stone50: '#fafaf9',
  stone100: '#f5f5f4',
  stone200: '#e7e5e4',
  stone300: '#d6d3d1',
  stone400: '#a8a29e',
  stone500: '#78716c',
  stone600: '#57534e',
  stone700: '#44403c',
  stone800: '#292524',
  stone900: '#1c1917',
  gold: '#B08D57',
};
