import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const name    = searchParams.get('name')    || 'Вечен Спомен';
  const years   = searchParams.get('years')   || '';
  const city    = searchParams.get('city')    || '';
  const family  = searchParams.get('family')  || '';
  const photo   = searchParams.get('photo')   || '';
  const message = searchParams.get('msg')     || '';

  // Load Noto Serif with Cyrillic glyphs from jsDelivr (@fontsource)
  let fontNormal = null;
  let fontBold   = null;
  try {
    [fontNormal, fontBold] = await Promise.all([
      fetch('https://cdn.jsdelivr.net/npm/@fontsource/noto-serif/files/noto-serif-cyrillic-400-normal.woff2')
        .then(r => r.arrayBuffer()),
      fetch('https://cdn.jsdelivr.net/npm/@fontsource/noto-serif/files/noto-serif-cyrillic-700-normal.woff2')
        .then(r => r.arrayBuffer()),
    ]);
  } catch (e) {
    console.error('[og-image] font load failed:', e.message);
  }

  const fonts = [];
  if (fontNormal) fonts.push({ name: 'Noto Serif', data: fontNormal, weight: 400, style: 'normal' });
  if (fontBold)   fonts.push({ name: 'Noto Serif', data: fontBold,   weight: 700, style: 'normal' });

  const serif = fonts.length ? 'Noto Serif' : 'Georgia, serif';

  return new ImageResponse(
    <div
      style={{
        background: '#ffffff',
        width: '100%',
        height: '100%',
        display: 'flex',
        fontFamily: serif,
        position: 'relative',
        overflow: 'hidden',
        padding: '40px',
        boxSizing: 'border-box',
      }}
    >
      {/* Outer stone border */}
      <div
        style={{
          position: 'absolute',
          inset: '40px',
          border: '14px solid #f5f5f4',
          display: 'flex',
          pointerEvents: 'none',
        }}
      />

      {/* Corner accents */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: 120, height: 120, background: '#fafaf9', transform: 'rotate(45deg) translate(60px,-60px)', display: 'flex', opacity: 0.7 }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: 120, height: 120, background: '#fafaf9', transform: 'rotate(45deg) translate(-60px,60px)', display: 'flex', opacity: 0.7 }} />

      {/* Inner content area */}
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          padding: '40px 60px',
          boxSizing: 'border-box',
        }}
      >
        {/* Left — photo (38%) */}
        <div
          style={{
            width: '38%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingRight: '48px',
          }}
        >
          <div style={{ position: 'relative', display: 'flex' }}>
            {/* Subtle shadow layer */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(28,25,23,0.06)',
                transform: 'rotate(1deg) scale(1.04)',
                display: 'flex',
              }}
            />
            {photo ? (
              <img
                src={photo}
                style={{
                  width: 280,
                  height: 380,
                  objectFit: 'cover',
                  border: '10px solid #ffffff',
                  boxShadow: '0 25px 60px -10px rgba(0,0,0,0.25)',
                  display: 'flex',
                  position: 'relative',
                }}
              />
            ) : (
              <div
                style={{
                  width: 280,
                  height: 380,
                  background: '#f5f5f4',
                  border: '10px solid #ffffff',
                  boxShadow: '0 25px 60px -10px rgba(0,0,0,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <div style={{ width: 64, height: 64, background: '#e7e5e4', borderRadius: '50%', display: 'flex' }} />
              </div>
            )}
          </div>
        </div>

        {/* Vertical divider */}
        <div style={{ width: 1, background: '#e7e5e4', margin: '20px 0', display: 'flex' }} />

        {/* Right — content (62%) */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingLeft: '52px',
            gap: 0,
          }}
        >
          {/* Label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
            <div style={{ width: 40, height: 2, background: '#d6d3d1', display: 'flex' }} />
            <span
              style={{
                fontSize: 11,
                letterSpacing: 5,
                color: '#a8a29e',
                textTransform: 'uppercase',
                fontFamily: serif,
                fontWeight: 400,
              }}
            >
              Во Вечен Спомен
            </span>
          </div>

          {/* Name */}
          <div
            style={{
              fontSize: 58,
              color: '#1c1917',
              lineHeight: 1.1,
              fontWeight: 400,
              marginBottom: 10,
              fontFamily: serif,
            }}
          >
            {name}
          </div>

          {/* Years */}
          {years ? (
            <div
              style={{
                fontSize: 22,
                color: '#78716c',
                letterSpacing: 6,
                marginBottom: city ? 6 : 20,
                fontFamily: serif,
                fontWeight: 300,
                display: 'flex',
              }}
            >
              {years}
            </div>
          ) : null}

          {/* City */}
          {city ? (
            <div
              style={{
                fontSize: 12,
                letterSpacing: 3,
                color: '#a8a29e',
                textTransform: 'uppercase',
                marginBottom: 20,
                fontFamily: serif,
                display: 'flex',
              }}
            >
              {city}
            </div>
          ) : null}

          {/* Divider */}
          <div style={{ width: '100%', height: 1, background: '#e7e5e4', marginBottom: 18, display: 'flex' }} />

          {/* Message */}
          {message ? (
            <div
              style={{
                fontSize: 20,
                color: '#57534e',
                fontStyle: 'italic',
                lineHeight: 1.5,
                marginBottom: 18,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                overflow: 'hidden',
                fontFamily: serif,
              }}
            >
              „{message}"
            </div>
          ) : null}

          {/* Bottom row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginTop: 'auto',
            }}
          >
            {family ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span
                  style={{
                    fontSize: 10,
                    letterSpacing: 3,
                    color: '#a8a29e',
                    textTransform: 'uppercase',
                    fontFamily: serif,
                    display: 'flex',
                  }}
                >
                  Со љубов и почит од:
                </span>
                <span
                  style={{
                    fontSize: 24,
                    color: '#1c1917',
                    fontFamily: serif,
                    fontWeight: 400,
                    display: 'flex',
                  }}
                >
                  {family}
                </span>
              </div>
            ) : <div style={{ display: 'flex' }} />}

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
              <span style={{ fontSize: 10, letterSpacing: 2, color: '#a8a29e', textTransform: 'uppercase', display: 'flex' }}>
                Објавено на
              </span>
              <span
                style={{
                  fontSize: 18,
                  color: '#292524',
                  letterSpacing: 1,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  fontFamily: serif,
                  display: 'flex',
                }}
              >
                VECENSPOMEN.MK
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts,
    }
  );
}
