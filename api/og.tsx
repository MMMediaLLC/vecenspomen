import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

// ── Design Tokens ───────────────────────────────────────────────────────────
const GOLD        = '#B08D57'; // Consistent with index.css
const CREAM       = '#F7F4EB';
const STONE_900   = '#1c1917';
const STONE_800   = '#292524';
const STONE_500   = '#78716c';
const STONE_400   = '#a8a29e';
const STONE_200   = '#e7e5e4';
const STONE_100   = '#f5f5f4';

interface StyleDef {
  symbol:      string;
  borderColor: string;
  bg:          string;
  symbolColor: string;
  double:      boolean;  // double-line border
  dashed:      boolean;  // inner dashed ring
  arcs:        boolean;  // rounded corner arcs
  diamonds:    boolean;  // rotated-square corner diamonds
  squares:     boolean;  // rotated square corner badges
}

const STYLES: Record<string, StyleDef> = {
  elegant:  { symbol: '',  borderColor: STONE_900, bg: '#ffffff', symbolColor: '',        double: true,  dashed: false, arcs: false, diamonds: false, squares: false },
  orthodox: { symbol: '☦', borderColor: STONE_800, bg: CREAM,     symbolColor: STONE_800, double: false, dashed: false, arcs: true,  diamonds: false, squares: false },
  catholic: { symbol: '✝', borderColor: STONE_800, bg: '#ffffff', symbolColor: STONE_800, double: true,  dashed: false, arcs: false, diamonds: true,  squares: false },
  muslim:   { symbol: '☾', borderColor: STONE_800, bg: '#ffffff', symbolColor: STONE_800, double: false, dashed: false, arcs: false, diamonds: false, squares: true  },
  star:     { symbol: '★', borderColor: STONE_800, bg: '#ffffff', symbolColor: STONE_800, double: false, dashed: true,  arcs: false, diamonds: false, squares: false },
  clean:    { symbol: '',  borderColor: STONE_400, bg: '#ffffff', symbolColor: '',        double: false, dashed: false, arcs: false, diamonds: false, squares: false },
};

async function fetchWithTimeout(url: string, timeout = 2000): Promise<ArrayBuffer | null> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch (e) {
    clearTimeout(id);
    return null;
  }
}

export default async function handler(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const name      = searchParams.get('name')      || '';
    const birthYear = searchParams.get('birthYear') || '';
    const deathYear = searchParams.get('deathYear') || '';
    const city      = searchParams.get('city')      || '';
    const photo     = searchParams.get('photo')     || '';
    const lovedBy   = searchParams.get('lovedBy')   || '';
    const pkg       = searchParams.get('package')   || 'Основен';
    const message   = searchParams.get('message')   || '';
    const status    = searchParams.get('status')    || '';
    const styleKeyParam = searchParams.get('style') || '';
    const isTest    = searchParams.get('test') === 'true' || name === 'TEST OG' || name === 'Вечен Спомен';

    console.log('[og] handler started. name=%s pkg=%s status=%s', name, pkg, status);

    // ── Pre-fetch Test Mode Render (Garanteed Visible) ───────────────────
    if (isTest && name === 'TEST OG') {
      return new ImageResponse(
        (
          <div style={{
            width: 1200, height: 630, background: '#1c1917', border: '20px solid #B08D57',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ffffff',
          }}>
            <h1 style={{ fontSize: 120, margin: 0 }}>TEST OG</h1>
            <p style={{ fontSize: 40, color: '#B08D57' }}>RENDER TREE IS ALIVE</p>
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    // fallback style logic
    let styleKey = styleKeyParam || 'clean';
    if (pkg === 'Основен') styleKey = 'clean';
    if (styleKey === 'klasicen') styleKey = 'elegant';
    const style = STYLES[styleKey] ?? STYLES.clean;

    // ── Load Fonts ──────────────────────────────────────────────────────────
    const [fontNormal, fontBold] = await Promise.all([
      fetchWithTimeout('https://cdn.jsdelivr.net/npm/@fontsource/noto-serif/files/noto-serif-cyrillic-400-normal.woff2'),
      fetchWithTimeout('https://cdn.jsdelivr.net/npm/@fontsource/noto-serif/files/noto-serif-cyrillic-700-normal.woff2'),
    ]);

    const fonts: ConstructorParameters<typeof ImageResponse>[1]['fonts'] = [];
    if (fontNormal) fonts.push({ name: 'NotoSerif', data: fontNormal, weight: 400, style: 'normal' });
    if (fontBold)   fonts.push({ name: 'NotoSerif', data: fontBold,   weight: 700, style: 'normal' });

    const serif = fonts.length ? 'NotoSerif' : 'serif';
    const years = [birthYear, deathYear].filter(Boolean).join(' – ');

    // ── Components ──────────────────────────────────────────────────────────
    const Frame = () => {
      const bc = style.borderColor;
      const GAP = 24;
      const INN = GAP + 6;

      return (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', pointerEvents: 'none' }}>
          {/* Main Content Background */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: style.bg, display: 'flex' }} />
          
          {/* Primary border */}
          <div style={{
            position: 'absolute', top: GAP, left: GAP, right: GAP, bottom: GAP,
            border: `${style.double ? '2.5px' : '1.5px'} solid ${bc}${style.symbol ? '' : '80'}`,
            display: 'flex',
          }} />

          {/* Arcs (Orthodox) */}
          {style.arcs && (
            <div style={{ position: 'absolute', inset: GAP, display: 'flex' }}>
              <div style={{ position: 'absolute', top: 8, left: 8, width: 44, height: 44, borderTop: `2px solid ${bc}`, borderLeft: `2px solid ${bc}`, borderTopLeftRadius: 44, display: 'flex' }} />
              <div style={{ position: 'absolute', top: 8, right: 8, width: 44, height: 44, borderTop: `2px solid ${bc}`, borderRight: `2px solid ${bc}`, borderTopRightRadius: 44, display: 'flex' }} />
              <div style={{ position: 'absolute', bottom: 8, left: 8, width: 44, height: 44, borderBottom: `2px solid ${bc}`, borderLeft: `2px solid ${bc}`, borderBottomLeftRadius: 44, display: 'flex' }} />
              <div style={{ position: 'absolute', bottom: 8, right: 8, width: 44, height: 44, borderBottom: `2px solid ${bc}`, borderRight: `2px solid ${bc}`, borderBottomRightRadius: 44, display: 'flex' }} />
            </div>
          )}

          {/* Top Center Symbol */}
          {style.symbol && (
            <div style={{
              position: 'absolute', top: GAP - 24, left: '50%', transform: 'translateX(-50%)',
              background: style.bg, paddingLeft: 20, paddingRight: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 42, color: style.symbolColor, fontFamily: serif, lineHeight: 1 }}>
                {style.symbol}
              </span>
            </div>
          )}
        </div>
      );
    };

    return new ImageResponse(
      (
        <div style={{
          width: 1200, height: 630, display: 'flex', flexDirection: 'row',
          fontFamily: serif, position: 'relative', overflow: 'hidden',
          background: '#1c1917', color: '#ffffff', // Dark debug background
        }}>
          {/* ── LEFT: PHOTO PLACEHOLDER ── */}
          <div style={{
            width: 400, height: 630, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRight: '2px solid #B08D57', background: '#292524',
          }}>
            <div style={{
              width: 250, height: 350, border: '5px solid #ffffff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', color: '#B08D57',
            }}>
              <span style={{ fontSize: 24, fontWeight: 'bold' }}>PHOTO</span>
              <span style={{ fontSize: 16 }}>PLACEHOLDER</span>
            </div>
          </div>

          {/* ── RIGHT: DATA RENDER ── */}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            justifyContent: 'center', padding: '0 60px',
          }}>
            <h1 style={{ fontSize: 80, margin: '0 0 20px 0', color: '#ffffff', display: 'flex' }}>
              FOUND POST
            </h1>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 32 }}>
               <div style={{ display: 'flex' }}>
                  <span style={{ color: '#B08D57', marginRight: 20 }}>NAME:</span> {name || 'N/A'}
               </div>
               <div style={{ display: 'flex' }}>
                  <span style={{ color: '#B08D57', marginRight: 20 }}>SLUG:</span> {searchParams.get('slug') || 'asda'}
               </div>
               <div style={{ display: 'flex' }}>
                  <span style={{ color: '#B08D57', marginRight: 20 }}>STATUS:</span> {status || 'N/A'}
               </div>
               <div style={{ display: 'flex' }}>
                  <span style={{ color: '#B08D57', marginRight: 20 }}>STYLE:</span> {styleKey}
               </div>
            </div>

            <div style={{ 
              marginTop: 60, padding: 20, border: '1px solid #B08D57', 
              fontSize: 20, color: '#B08D57', display: 'flex' 
            }}>
              MINIMAL RENDER MODE: ALL ADVANCED CSS DISABLED
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630, fonts }
    );
  } catch (err) {
     console.error('[og] handler critical failure:', err);
     // Ultimate fallback: branded card, never blank
     return new ImageResponse(
       <div style={{ 
         width: 1200, height: 630, background: CREAM, border: `12px solid ${GOLD}`,
         display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
         fontFamily: 'serif', padding: 80, boxSizing: 'border-box'
       }}>
         <div style={{ width: 100, height: 2, background: GOLD, marginBottom: 40, display: 'flex' }} />
         <h1 style={{ fontSize: 80, color: STONE_800, margin: 0, textAlign: 'center' }}>Вечен Спомен</h1>
         <p style={{ fontSize: 24, color: STONE_500, letterSpacing: 4, marginTop: 20 }}>МЕМОРИЈАЛЕН ПОРТАЛ</p>
         <div style={{ flex: 1, display: 'flex' }} />
         <span style={{ fontSize: 20, fontWeight: 'bold', color: STONE_800 }}>VECENSPOMEN.MK</span>
       </div>,
       { width: 1200, height: 630 }
     );
  }
}
