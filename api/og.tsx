import { ImageResponse } from '@vercel/og';

// ── 1. RUNTIME CONFIGURATION ────────────────────────────────────────────────
export const config = { runtime: 'edge' };

// ── 2. FONT CACHE (module-level so it persists across warm invocations) ──────
let _loraRegular: ArrayBuffer | null = null;
let _loraBold: ArrayBuffer | null = null;

async function getFonts(): Promise<{ regular: ArrayBuffer; bold: ArrayBuffer }> {
  if (!_loraRegular) {
    _loraRegular = await fetch(
      'https://cdn.jsdelivr.net/npm/@fontsource/lora@5.0.0/files/lora-cyrillic-400-normal.ttf'
    ).then((r) => r.arrayBuffer());
  }
  if (!_loraBold) {
    _loraBold = await fetch(
      'https://cdn.jsdelivr.net/npm/@fontsource/lora@5.0.0/files/lora-cyrillic-700-normal.ttf'
    ).then((r) => r.arrayBuffer());
  }
  return { regular: _loraRegular!, bold: _loraBold! };
}

// ── 3. FALLBACK IMAGE (plain text, no fonts needed) ──────────────────────────
function fallbackResponse() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fafaf9',
        }}
      >
        <span style={{ fontSize: '48px', color: '#1c1917' }}>Вечен Спомен</span>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

export default async function handler(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // ── Data Extraction ──────────────────────────────────────────────────────
    const type = searchParams.get('type') || 'ТАЖНА ВЕСТ';
    const name = searchParams.get('name') || 'Вечен Спомен';
    const bYear = searchParams.get('birthYear') || '';
    const dYear = searchParams.get('deathYear') || '';
    const message = (searchParams.get('message') || '').slice(0, 200);
    const intro = (searchParams.get('intro') || '').slice(0, 200);
    const style = searchParams.get('style') || 'elegant';
    const pkg = searchParams.get('package') || 'Основен';

    // FIX: Validate photo URL — must be absolute http/https, otherwise skip
    const rawPhoto = searchParams.get('photo') || '';
    const photo = /^https?:\/\/.+/.test(rawPhoto) ? rawPhoto : '';

    const years = [bYear, dYear].filter(Boolean).join(' – ');
    const isPremium = pkg !== 'Основен';

    // ── Fonts ────────────────────────────────────────────────────────────────
    const { regular: loraRegularData, bold: loraFontData } = await getFonts();

    // ── Symbol Mapping ───────────────────────────────────────────────────────
    const symbols: Record<string, string> = {
      pravoslaven: '☦',
      katolicki: '✝',
      muslimanski: '☾',
      socijalisticki: '★',
      klasicen: '',
      emotiven: '',
    };
    const symbol = symbols[style] || '';
    const goldColor = '#B08D57';
    const stone900 = '#1c1917';
    const stone500 = '#78716c';

    return new ImageResponse(
      (
        <div
          style={{
            width: '1200px',
            height: '630px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fafaf9',
            padding: '0',
            fontFamily: '"Lora"',
            position: 'relative',
          }}
        >
          {/* ── Card Container ─────────────────────────────────────────────── */}
          <div
            style={{
              width: '560px',
              height: '590px',
              background: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '40px',
              border: '1px solid rgba(0,0,0,0.05)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              position: 'relative',
            }}
          >
            {/* ── Premium Frame ──────────────────────────────────────────── */}
            {isPremium && (
              <div
                style={{
                  position: 'absolute',
                  inset: '10px',
                  border: `1px solid ${goldColor}33`,
                  display: 'flex',
                }}
              >
                <div style={{ position: 'absolute', top: '-5px', left: '-5px', width: '15px', height: '15px', borderTop: `2px solid ${goldColor}`, borderLeft: `2px solid ${goldColor}`, display: 'flex' }} />
                <div style={{ position: 'absolute', top: '-5px', right: '-5px', width: '15px', height: '15px', borderTop: `2px solid ${goldColor}`, borderRight: `2px solid ${goldColor}`, display: 'flex' }} />
                <div style={{ position: 'absolute', bottom: '-5px', left: '-5px', width: '15px', height: '15px', borderBottom: `2px solid ${goldColor}`, borderLeft: `2px solid ${goldColor}`, display: 'flex' }} />
                <div style={{ position: 'absolute', bottom: '-5px', right: '-5px', width: '15px', height: '15px', borderBottom: `2px solid ${goldColor}`, borderRight: `2px solid ${goldColor}`, display: 'flex' }} />
              </div>
            )}

            {/* ── Symbol ─────────────────────────────────────────────────── */}
            {/* FIX: Removed transform: translateX(-50%) — not supported by Satori */}
            {/* Using left:0 right:0 + justifyContent:center instead             */}
            {symbol && (
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  left: '0',
                  right: '0',
                  display: 'flex',
                  justifyContent: 'center',
                  zIndex: 20,
                }}
              >
                <div style={{ background: '#ffffff', padding: '0 15px', display: 'flex' }}>
                  <span style={{ fontSize: '28px', color: goldColor, lineHeight: 1 }}>
                    {symbol}
                  </span>
                </div>
              </div>
            )}

            {/* ── Type Label ─────────────────────────────────────────────── */}
            <div style={{ marginBottom: '20px', display: 'flex' }}>
              <span
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  color: stone900,
                  textTransform: 'uppercase',
                }}
              >
                {type}
              </span>
            </div>

            {/* ── Intro ──────────────────────────────────────────────────── */}
            {intro ? (
              <div
                style={{
                  marginBottom: '15px',
                  maxWidth: '80%',
                  textAlign: 'center',
                  display: 'flex',
                }}
              >
                <span style={{ fontSize: '14px', fontStyle: 'italic', color: stone500, lineHeight: 1.2 }}>
                  {intro}
                </span>
              </div>
            ) : null}

            {/* ── Photo ──────────────────────────────────────────────────── */}
            <div
              style={{
                width: '160px',
                height: '210px',
                background: '#ffffff',
                padding: '6px',
                border: '1px solid rgba(0,0,0,0.05)',
                boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                marginBottom: '20px',
                display: 'flex',
              }}
            >
              {photo ? (
                <img
                  src={photo}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'flex' }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: '#f5f5f4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: '10px', color: '#d6d3d1', letterSpacing: '4px' }}>
                    ТИШИНА
                  </span>
                </div>
              )}
            </div>

            {/* ── Name ───────────────────────────────────────────────────── */}
            <div style={{ textAlign: 'center', marginBottom: '10px', display: 'flex' }}>
              <h1 style={{ fontSize: '38px', fontWeight: 400, color: stone900, margin: 0, lineHeight: 1.1 }}>
                {name}
              </h1>
            </div>

            {/* ── Years ──────────────────────────────────────────────────── */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
              }}
            >
              <div style={{ width: '30px', height: '1px', background: 'rgba(0,0,0,0.15)', marginRight: '15px', display: 'flex' }} />
              <span style={{ fontSize: '16px', letterSpacing: '4px', color: stone500 }}>
                {years}
              </span>
              <div style={{ width: '30px', height: '1px', background: 'rgba(0,0,0,0.15)', marginLeft: '15px', display: 'flex' }} />
            </div>

            {/* ── Message ────────────────────────────────────────────────── */}
            <div
              style={{
                fontSize: '18px',
                fontStyle: 'italic',
                color: '#44403c',
                lineHeight: 1.4,
                textAlign: 'center',
                maxWidth: '100%',
                display: 'flex',
                maxHeight: '80px',
                overflow: 'hidden',
              }}
            >
              "{message || 'Почивај во мир.'}"
            </div>

            {/* ── Branding ───────────────────────────────────────────────── */}
            {/* FIX: Replaced transform: translateX(-50%) with flexbox centering */}
            <div
              style={{
                position: 'absolute',
                bottom: '20px',
                left: '0',
                right: '0',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontSize: '10px',
                  letterSpacing: '4px',
                  color: 'rgba(0,0,0,0.2)',
                  textTransform: 'uppercase',
                }}
              >
                vecenspomen.mk
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          { name: 'Lora', data: loraRegularData, style: 'normal', weight: 400 },
          { name: 'Lora', data: loraFontData, style: 'normal', weight: 700 },
        ],
      }
    );
  } catch (err) {
    // ── Catch-all: return a basic image instead of a 500 ────────────────────
    console.error('[OG] Render error:', err);
    return fallbackResponse();
  }
}