import { ImageResponse } from '@vercel/og';
import fs from 'fs';
import path from 'path';

// ── 1. RUNTIME CONFIGURATION ────────────────────────────────────────────────
export const config = { runtime: 'nodejs' };

// ── 2. FONT CACHE (module-level) ──────────────────────────────────────────────
let _loraRegular: Buffer | null = null;
let _loraBold: Buffer | null = null;

function getFonts() {
  if (!_loraRegular || !_loraBold) {
    const fontsDir = path.join(process.cwd(), 'public', 'fonts');
    _loraRegular = fs.readFileSync(path.join(fontsDir, 'lora-400.ttf'));
    _loraBold    = fs.readFileSync(path.join(fontsDir, 'lora-700.ttf'));
  }
  return { regular: _loraRegular, bold: _loraBold };
}

// ── 3. FALLBACK IMAGE ─────────────────────────────────────────────────────────
function fallbackResponse(fonts: { regular: Buffer; bold: Buffer }) {
  return new ImageResponse(
    (
      <div style={{
        width: '1200px',
        height: '630px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fafaf9',
        fontFamily: '"Lora"',
      }}>
        <span style={{ fontSize: '36px', color: '#1c1917', letterSpacing: '2px' }}>Вечен Спомен</span>
        <span style={{ fontSize: '14px', color: '#78716c', marginTop: '16px', letterSpacing: '4px' }}>vecenspomen.mk</span>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Lora', data: fonts.regular, style: 'normal', weight: 400 },
        { name: 'Lora', data: fonts.bold,    style: 'normal', weight: 700 },
      ],
    }
  );
}

// ── 4. MAIN HANDLER ───────────────────────────────────────────────────────────
export default async function handler(req: any) {
  let fonts: { regular: Buffer; bold: Buffer };

  try {
    fonts = getFonts();
  } catch (err) {
    console.error('[OG] Critical Font Load Error:', err);
    return new Response('Internal Server Error (Font Load Failed)', { status: 500 });
  }

  try {
    const { searchParams } = new URL(req.url || '');

    const type    = searchParams.get('type')      || 'ТАЖНА ВЕСТ';
    const name    = searchParams.get('name')      || 'Вечен Спомен';
    const bYear   = searchParams.get('birthYear') || '';
    const dYear   = searchParams.get('deathYear') || '';
    const city    = searchParams.get('city')      || '';
    const message = (searchParams.get('message')  || '').slice(0, 160);
    const intro   = (searchParams.get('intro')    || '').slice(0, 120);
    const style   = searchParams.get('style')     || 'elegant';
    const pkg     = searchParams.get('package')   || 'Основен';

    // Only accept absolute HTTPS photo URLs
    const rawPhoto = searchParams.get('photo') || '';
    const photo = /^https?:\/\/.+/.test(rawPhoto) ? rawPhoto : '';

    const years     = [bYear, dYear].filter(Boolean).join(' – ');
    const isPremium = pkg !== 'Основен';

    // Correct mapping: matches selectedFrameStyle values in types.ts
    const styleSymbols: Record<string, string> = {
      orthodox: '☦',
      catholic: '✝',
      muslim:   '☾',
      star:     '★',
      elegant:  '',
      clean:    '',
    };
    const symbol    = styleSymbols[style] ?? '';
    const goldColor = '#B08D57';
    const stone900  = '#1c1917';
    const stone600  = '#57534e';
    const stone500  = '#78716c';
    const stone300  = '#d6d3d1';

    // Shorten name font size if long
    const nameFontSize = name.length > 28 ? 40 : name.length > 20 ? 48 : 56;

    return new ImageResponse(
      (
        <div
          style={{
            width: '1200px',
            height: '630px',
            display: 'flex',
            fontFamily: '"Lora"',
          }}
        >
          {/* ── LEFT PANEL — photo ──────────────────────────────────────── */}
          <div
            style={{
              width: '400px',
              height: '630px',
              background: '#f0ede8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              position: 'relative',
            }}
          >
            {/* Premium border inset */}
            {isPremium && (
              <div
                style={{
                  position: 'absolute',
                  inset: '18px',
                  border: `1px solid ${goldColor}44`,
                  display: 'flex',
                }}
              />
            )}

            {/* Photo frame */}
            <div
              style={{
                width: '270px',
                height: '350px',
                background: '#ffffff',
                padding: '7px',
                border: '1px solid rgba(0,0,0,0.07)',
                boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
                display: 'flex',
                position: 'relative',
              }}
            >
              {/* Subtle shadow twin behind */}
              <div
                style={{
                  position: 'absolute',
                  inset: '0',
                  background: 'rgba(0,0,0,0.06)',
                  transform: 'rotate(2deg) scale(1.04)',
                  zIndex: -1,
                  display: 'flex',
                }}
              />
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
                    background: '#e7e3dd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: '11px', color: stone300, letterSpacing: '6px' }}>ТИШИНА</span>
                </div>
              )}
            </div>

            {/* Religious/style symbol at bottom of left panel */}
            {symbol && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '28px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                }}
              >
                <span style={{ fontSize: '28px', color: goldColor }}>{symbol}</span>
              </div>
            )}
          </div>

          {/* ── RIGHT PANEL — content ────────────────────────────────────── */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '56px 72px 56px 64px',
              background: '#ffffff',
              position: 'relative',
            }}
          >
            {/* Premium corner accents top-right */}
            {isPremium && (
              <>
                <div
                  style={{
                    position: 'absolute',
                    top: '22px',
                    right: '22px',
                    width: '18px',
                    height: '18px',
                    borderTop: `2px solid ${goldColor}`,
                    borderRight: `2px solid ${goldColor}`,
                    display: 'flex',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '22px',
                    right: '22px',
                    width: '18px',
                    height: '18px',
                    borderBottom: `2px solid ${goldColor}`,
                    borderRight: `2px solid ${goldColor}`,
                    display: 'flex',
                  }}
                />
              </>
            )}

            {/* Type label */}
            <div style={{ display: 'flex', marginBottom: '14px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '4px',
                  color: stone500,
                  textTransform: 'uppercase',
                }}
              >
                {type}
              </span>
            </div>

            {/* Gold rule */}
            <div
              style={{
                width: '36px',
                height: '1px',
                background: goldColor,
                opacity: 0.6,
                marginBottom: '22px',
                display: 'flex',
              }}
            />

            {/* Intro */}
            {intro ? (
              <div style={{ display: 'flex', marginBottom: '18px' }}>
                <span
                  style={{
                    fontSize: '15px',
                    fontStyle: 'italic',
                    color: stone500,
                    lineHeight: 1.5,
                    maxWidth: '480px',
                  }}
                >
                  {intro}
                </span>
              </div>
            ) : null}

            {/* Name — hero element */}
            <div style={{ display: 'flex', marginBottom: '14px' }}>
              <span
                style={{
                  fontSize: `${nameFontSize}px`,
                  fontWeight: 400,
                  color: stone900,
                  lineHeight: 1.1,
                  maxWidth: '540px',
                }}
              >
                {name}
              </span>
            </div>

            {/* Years */}
            {years ? (
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '26px' }}>
                <div
                  style={{
                    width: '24px',
                    height: '1px',
                    background: stone300,
                    marginRight: '12px',
                    display: 'flex',
                  }}
                />
                <span style={{ fontSize: '14px', letterSpacing: '5px', color: stone500 }}>
                  {years}
                </span>
                <div
                  style={{
                    width: '24px',
                    height: '1px',
                    background: stone300,
                    marginLeft: '12px',
                    display: 'flex',
                  }}
                />
              </div>
            ) : (
              <div style={{ marginBottom: '26px', display: 'flex' }} />
            )}

            {/* Message */}
            {(message || 'Почивај во мир.') ? (
              <div
                style={{
                  borderLeft: `2px solid ${goldColor}55`,
                  paddingLeft: '18px',
                  display: 'flex',
                  maxWidth: '460px',
                }}
              >
                <span
                  style={{
                    fontSize: '16px',
                    fontStyle: 'italic',
                    color: stone600,
                    lineHeight: 1.6,
                  }}
                >
                  „{message || 'Почивај во мир.'}"
                </span>
              </div>
            ) : null}

            {/* Bottom row: city + branding */}
            <div
              style={{
                position: 'absolute',
                bottom: '28px',
                left: '64px',
                right: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {city ? (
                <span
                  style={{
                    fontSize: '10px',
                    letterSpacing: '3px',
                    color: stone300,
                    textTransform: 'uppercase',
                  }}
                >
                  {city}
                </span>
              ) : (
                <span style={{ display: 'flex' }} />
              )}
              <span
                style={{
                  fontSize: '10px',
                  letterSpacing: '4px',
                  color: stone300,
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
          { name: 'Lora', data: fonts.regular, style: 'normal', weight: 400 },
          { name: 'Lora', data: fonts.bold,    style: 'normal', weight: 700 },
        ],
      }
    );
  } catch (err) {
    console.error('[OG] Render error:', err);
    return fallbackResponse(fonts!);
  }
}
