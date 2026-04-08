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
          width: 1200, height: 630, display: 'flex',
          fontFamily: serif, position: 'relative', overflow: 'hidden',
          background: '#ffffff', // base fallback
        }}>
          {/* Diagnostic Overlay (Top-Left) */}
          <div style={{
            position: 'absolute', top: 35, left: 35, zIndex: 100,
            background: 'rgba(0,0,0,0.85)', color: '#fff', padding: '10px 15px',
            fontSize: 12, display: 'flex', flexDirection: 'column', gap: 2,
            border: '1px solid #B08D57',
          }}>
            <div style={{ display: 'flex' }}>DEBUG: ACTIVE</div>
            <div style={{ display: 'flex' }}>PKGR: {pkg}</div>
            <div style={{ display: 'flex' }}>STAT: {status || 'N/A'}</div>
            <div style={{ display: 'flex' }}>STYL: {styleKey}</div>
          </div>

          <Frame />

          <div style={{
            display: 'flex', width: '100%', height: '100%',
            padding: '70px 80px', boxSizing: 'border-box',
          }}>
            {/* ── LEFT: Photo ── */}
            <div style={{
              width: '35%', height: '100%', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <div style={{ position: 'relative', display: 'flex' }}>
                <div style={{
                  position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.05)',
                  transform: 'rotate(2deg) scale(1.05)', display: 'flex',
                }} />
                {photo ? (
                  <img
                    src={photo}
                    style={{
                      width: 250, height: 350, objectFit: 'cover',
                      border: '10px solid #ffffff', boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                      display: 'flex', position: 'relative',
                    }}
                  />
                ) : (
                  <div style={{
                    width: 250, height: 350, background: STONE_100,
                    border: '10px solid #ffffff', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{ width: 60, height: 60, background: STONE_200, borderRadius: '50%', display: 'flex' }} />
                  </div>
                )}
              </div>
            </div>

            {/* Vertical Divider */}
            <div style={{ width: 1, background: STONE_100, margin: '20px 60px', display: 'flex' }} />

            {/* ── RIGHT: Content ── */}
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              justifyContent: 'center', minWidth: 0,
            }}>
              {/* Header Label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 20 }}>
                <div style={{ width: 40, height: 2, background: style.symbol ? style.borderColor : STONE_200, display: 'flex' }} />
                <span style={{ fontSize: 13, letterSpacing: 5, color: STONE_400, textTransform: 'uppercase' }}>
                  Во Вечен Спомен
                </span>
              </div>

              {/* Personal Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{
                  fontSize: name.length > 20 ? 44 : 54,
                  color: STONE_900, lineHeight: 1.1, fontWeight: 700, display: 'flex',
                }}>
                  {name || 'Вечен Спомен'}
                </div>
                
                {years && (
                  <div style={{ fontSize: 24, color: STONE_500, letterSpacing: 6, fontWeight: 400, display: 'flex' }}>
                    {years}
                  </div>
                )}
                
                {city && (
                  <div style={{ fontSize: 12, color: STONE_400, letterSpacing: 4, textTransform: 'uppercase', display: 'flex' }}>
                    {city}
                  </div>
                )}
              </div>

              {/* Message Section */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: 30, gap: 12, minHeight: 0 }}>
                <div style={{ height: 1, background: STONE_100, width: '100%', display: 'flex' }} />
                
                {message ? (
                  <div style={{
                    fontSize: message.length > 140 ? 16 : 19,
                    color: STONE_900, fontFamily: serif, fontStyle: 'italic',
                    lineHeight: 1.5, flex: 1, overflow: 'hidden', display: 'flex',
                  }}>
                    "{message.slice(0, 240)}{message.length > 240 ? '...' : ''}"
                  </div>
                ) : <div style={{ flex: 1, display: 'flex' }} />}

                {/* Footer Attribution */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 10 }}>
                  {lovedBy && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 10, letterSpacing: 2, color: STONE_400, textTransform: 'uppercase', display: 'flex' }}>
                        Со љубов и почит од:
                      </span>
                      <span style={{ fontSize: 20, color: STONE_900, fontWeight: 400, display: 'flex' }}>
                        {lovedBy.slice(0, 35)}{lovedBy.length > 35 ? '...' : ''}
                      </span>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                     <span style={{ fontSize: 9, letterSpacing: 1, color: STONE_400, display: 'flex' }}>ОБЈАВЕНО НА</span>
                     <span style={{ fontSize: 18, fontWeight: 700, color: STONE_900, letterSpacing: 1, display: 'flex' }}>VECENSPOMEN.MK</span>
                  </div>
                </div>
              </div>
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
