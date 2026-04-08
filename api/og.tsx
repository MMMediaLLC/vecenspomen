import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

const GOLD        = '#B89C6F';
const GOLD_ALPHA  = 'rgba(184,156,111,0.35)';
const CREAM       = '#F7F4EB';

interface StyleDef {
  symbol:      string;
  borderColor: string;
  bg:          string;
  symbolColor: string;
  double:      boolean;  // double-line border
  dashed:      boolean;  // inner dashed ring (socialist)
  arcs:        boolean;  // rounded corner arcs (orthodox)
  diamonds:    boolean;  // rotated-square corner diamonds (catholic/muslim)
}

const STYLES: Record<string, StyleDef> = {
  pravoslaven:    { symbol: '☦', borderColor: GOLD,      bg: CREAM,     symbolColor: GOLD,      double: false, dashed: false, arcs: true,  diamonds: false },
  katolicki:      { symbol: '✝', borderColor: '#1c1917', bg: '#ffffff', symbolColor: '#1c1917', double: true,  dashed: false, arcs: false, diamonds: true  },
  muslimanski:    { symbol: '☾', borderColor: '#292524', bg: '#ffffff', symbolColor: '#292524', double: false, dashed: false, arcs: false, diamonds: true  },
  socijalisticki: { symbol: '★', borderColor: '#1c1917', bg: '#ffffff', symbolColor: '#7f1d1d', double: false, dashed: true,  arcs: false, diamonds: false },
  klasicen:       { symbol: '',  borderColor: '#a8a29e', bg: '#ffffff', symbolColor: '',        double: true,  dashed: false, arcs: false, diamonds: false },
  emotiven:       { symbol: '',  borderColor: '#d6d3d1', bg: '#ffffff', symbolColor: '',        double: false, dashed: false, arcs: false, diamonds: false },
};

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const name      = searchParams.get('name')      || 'Вечен Спомен';
  const birthYear = searchParams.get('birthYear') || '';
  const deathYear = searchParams.get('deathYear') || '';
  const city      = searchParams.get('city')      || '';
  const photo     = searchParams.get('photo')     || '';
  const lovedBy   = searchParams.get('lovedBy')   || '';
  const styleKey  = searchParams.get('style')     || 'klasicen';

  const style = STYLES[styleKey] ?? STYLES.klasicen;

  // ── Load Noto Serif with Cyrillic glyphs ────────────────────────────────
  let fontNormal: ArrayBuffer | null = null;
  let fontBold:   ArrayBuffer | null = null;
  try {
    [fontNormal, fontBold] = await Promise.all([
      fetch('https://cdn.jsdelivr.net/npm/@fontsource/noto-serif/files/noto-serif-cyrillic-400-normal.woff2')
        .then(r => r.arrayBuffer()),
      fetch('https://cdn.jsdelivr.net/npm/@fontsource/noto-serif/files/noto-serif-cyrillic-700-normal.woff2')
        .then(r => r.arrayBuffer()),
    ]);
  } catch (e) {
    console.error('[og] font fetch failed:', (e as Error).message);
  }

  const fonts: ConstructorParameters<typeof ImageResponse>[1]['fonts'] = [];
  if (fontNormal) fonts.push({ name: 'NotoSerif', data: fontNormal, weight: 400, style: 'normal' });
  if (fontBold)   fonts.push({ name: 'NotoSerif', data: fontBold,   weight: 700, style: 'normal' });

  const serif  = fonts.length ? 'NotoSerif' : 'serif';
  const years  = [birthYear, deathYear].filter(Boolean).join(' – ');

  // ── Helpers ──────────────────────────────────────────────────────────────

  /** Inset border box with optional inner ring */
  const Frame = () => {
    const bc  = style.borderColor;
    const GAP = 22;          // inset from card edge
    const INN = GAP + 6;     // second ring inset

    return (
      <>
        {/* Primary border */}
        <div style={{
          position: 'absolute', top: GAP, left: GAP, right: GAP, bottom: GAP,
          border: `${style.double ? '2.5px' : '1.5px'} solid ${style.symbol ? bc : bc + '99'}`,
          display: 'flex', pointerEvents: 'none',
        }} />

        {/* Second ring (double / dashed) */}
        {style.double && (
          <div style={{
            position: 'absolute', top: INN, left: INN, right: INN, bottom: INN,
            border: `0.8px solid ${bc}55`,
            display: 'flex', pointerEvents: 'none',
          }} />
        )}
        {style.dashed && (
          <div style={{
            position: 'absolute', top: INN, left: INN, right: INN, bottom: INN,
            border: `1px dashed ${bc}40`,
            display: 'flex', pointerEvents: 'none',
          }} />
        )}

        {/* Orthodox arc corners */}
        {style.arcs && (
          <>
            <div style={{ position: 'absolute', top: GAP + 8, left: GAP + 8, width: 36, height: 36, borderTop: `2px solid ${bc}`, borderLeft: `2px solid ${bc}`, borderTopLeftRadius: 36, display: 'flex' }} />
            <div style={{ position: 'absolute', top: GAP + 8, right: GAP + 8, width: 36, height: 36, borderTop: `2px solid ${bc}`, borderRight: `2px solid ${bc}`, borderTopRightRadius: 36, display: 'flex' }} />
            <div style={{ position: 'absolute', bottom: GAP + 8, left: GAP + 8, width: 36, height: 36, borderBottom: `2px solid ${bc}`, borderLeft: `2px solid ${bc}`, borderBottomLeftRadius: 36, display: 'flex' }} />
            <div style={{ position: 'absolute', bottom: GAP + 8, right: GAP + 8, width: 36, height: 36, borderBottom: `2px solid ${bc}`, borderRight: `2px solid ${bc}`, borderBottomRightRadius: 36, display: 'flex' }} />
          </>
        )}

        {/* Diamond corner squares */}
        {style.diamonds && (
          <>
            <div style={{ position: 'absolute', top: GAP - 6, left: GAP - 6, width: 12, height: 12, background: bc, transform: 'rotate(45deg)', display: 'flex' }} />
            <div style={{ position: 'absolute', top: GAP - 6, right: GAP - 6, width: 12, height: 12, background: bc, transform: 'rotate(45deg)', display: 'flex' }} />
            <div style={{ position: 'absolute', bottom: GAP - 6, left: GAP - 6, width: 12, height: 12, background: bc, transform: 'rotate(45deg)', display: 'flex' }} />
            <div style={{ position: 'absolute', bottom: GAP - 6, right: GAP - 6, width: 12, height: 12, background: bc, transform: 'rotate(45deg)', display: 'flex' }} />
          </>
        )}

        {/* Symbol badge at top-center */}
        {style.symbol && (
          <div style={{
            position: 'absolute', top: GAP - 22, left: '50%', transform: 'translateX(-50%)',
            background: style.bg, paddingLeft: 14, paddingRight: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 34, color: style.symbolColor, fontFamily: serif, lineHeight: 1 }}>
              {style.symbol}
            </span>
          </div>
        )}
      </>
    );
  };

  return new ImageResponse(
    (
      <div
        style={{
          background: style.bg,
          width: '100%',
          height: '100%',
          display: 'flex',
          fontFamily: serif,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative frame */}
        <Frame />

        {/* Content row */}
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            padding: '50px 56px 50px 50px',
            boxSizing: 'border-box',
            gap: 0,
          }}
        >
          {/* ── LEFT: Photo (37%) ── */}
          <div
            style={{
              width: '37%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingRight: 44,
              flexShrink: 0,
            }}
          >
            {/* Shadow layer */}
            <div style={{ position: 'relative', display: 'flex' }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(28,25,23,0.07)',
                transform: 'rotate(1.5deg) scale(1.05)',
                display: 'flex',
              }} />
              {photo ? (
                <img
                  src={photo}
                  style={{
                    width: 260,
                    height: 360,
                    objectFit: 'cover',
                    border: '9px solid #ffffff',
                    boxShadow: '0 20px 50px -8px rgba(0,0,0,0.22)',
                    position: 'relative',
                    display: 'flex',
                  }}
                />
              ) : (
                <div style={{
                  width: 260,
                  height: 360,
                  background: styleKey === 'pravoslaven' ? '#ede9dc' : '#f5f5f4',
                  border: '9px solid #ffffff',
                  boxShadow: '0 20px 50px -8px rgba(0,0,0,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}>
                  <div style={{ width: 56, height: 56, background: '#e7e5e4', borderRadius: '50%', display: 'flex' }} />
                </div>
              )}
            </div>
          </div>

          {/* Vertical divider */}
          <div style={{ width: 1, background: '#e7e5e4', margin: '18px 0', display: 'flex', flexShrink: 0 }} />

          {/* ── RIGHT: Content (63%) ── */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              paddingLeft: 52,
              minWidth: 0,
            }}
          >
            {/* Label row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <div style={{ width: 38, height: 2, background: style.symbol ? style.borderColor + '99' : '#d6d3d1', display: 'flex', flexShrink: 0 }} />
              <span style={{
                fontSize: 11,
                letterSpacing: 5,
                color: '#a8a29e',
                textTransform: 'uppercase',
                fontFamily: serif,
                fontWeight: 400,
              }}>
                Во Вечен Спомен
              </span>
            </div>

            {/* Name */}
            <div style={{
              fontSize: name.length > 24 ? 46 : 56,
              color: '#1c1917',
              lineHeight: 1.08,
              fontWeight: 400,
              marginBottom: 12,
              fontFamily: serif,
              display: 'flex',
            }}>
              {name}
            </div>

            {/* Years */}
            {years ? (
              <div style={{
                fontSize: 22,
                color: '#78716c',
                letterSpacing: 6,
                marginBottom: city ? 6 : 22,
                fontFamily: serif,
                fontWeight: 300,
                display: 'flex',
              }}>
                {years}
              </div>
            ) : null}

            {/* City */}
            {city ? (
              <div style={{
                fontSize: 11,
                letterSpacing: 3,
                color: '#a8a29e',
                textTransform: 'uppercase',
                marginBottom: 22,
                fontFamily: serif,
                display: 'flex',
              }}>
                {city}
              </div>
            ) : null}

            {/* Divider */}
            <div style={{ width: '100%', height: 1, background: '#e7e5e4', marginBottom: 20, display: 'flex' }} />

            {/* Spacer pushes bottom row down */}
            <div style={{ flex: 1, display: 'flex' }} />

            {/* Bottom row: family + branding */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              {lovedBy ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <span style={{
                    fontSize: 10,
                    letterSpacing: 3,
                    color: '#a8a29e',
                    textTransform: 'uppercase',
                    fontFamily: serif,
                    fontWeight: 400,
                    display: 'flex',
                  }}>
                    Со љубов и почит од:
                  </span>
                  <span style={{
                    fontSize: lovedBy.length > 30 ? 20 : 24,
                    color: '#1c1917',
                    fontFamily: serif,
                    fontWeight: 400,
                    display: 'flex',
                  }}>
                    {lovedBy}
                  </span>
                </div>
              ) : <div style={{ display: 'flex' }} />}

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                <span style={{ fontSize: 10, letterSpacing: 2, color: '#a8a29e', textTransform: 'uppercase', display: 'flex' }}>
                  Објавено на
                </span>
                <span style={{
                  fontSize: 17,
                  color: '#292524',
                  letterSpacing: 1,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  fontFamily: serif,
                  display: 'flex',
                }}>
                  VECENSPOMEN.MK
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts,
    }
  );
}
