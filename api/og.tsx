import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug    = searchParams.get('slug')    || 'NO SLUG';
  const name    = searchParams.get('name')    || 'Вечен Спомен';
  const bYear   = searchParams.get('birthYear') || '';
  const dYear   = searchParams.get('deathYear') || '';
  const city    = searchParams.get('city')    || '';
  const message = searchParams.get('message') || '';
  const photo   = searchParams.get('photo')   || '';
  const style   = searchParams.get('style')   || 'elegant';
  const pkg     = searchParams.get('package') || 'Основен';

  const years = [bYear, dYear].filter(Boolean).join(' – ');
  const isPremium = pkg !== 'Основен';

  // Symbol Mapping
  const symbols: Record<string, string> = {
    orthodox: '☦',
    catholic: '✝',
    muslim: '☾',
    star: '★',
    elegant: '',
    clean: ''
  };
  const symbol = symbols[style] || '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          background: '#1c1917', // Dark stone
          color: '#ffffff',
          padding: '80px',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'serif',
        }}
      >
        {/* 1. Subtle Floral Watermark Background */}
        <div style={{ position: 'absolute', right: '-50px', top: '100px', opacity: 0.1, display: 'flex' }}>
           <svg width="400" height="600" viewBox="0 0 100 300" fill="#B08D57">
              <path d="M90 50 C80 100, 60 150, 40 250 C50 200, 70 150, 95 100 Z" />
              <path d="M80 80 Q60 50 65 30 Q75 60 85 85 Z" />
              <path d="M70 130 Q40 100 30 80 Q50 115 75 135 Z" />
           </svg>
        </div>

        {/* 2. Premium Frame Decorations */}
        <div style={{ position: 'absolute', inset: '40px', border: '1px solid rgba(176, 141, 87, 0.3)', pointerEvents: 'none', display: 'flex' }} />
        
        {/* Corner Accents for Elegant/Orthodox Styles */}
        {['elegant', 'orthodox', 'catholic'].includes(style) && (
          <>
            <div style={{ position: 'absolute', top: '30px', left: '30px', width: '30px', height: '30px', borderTop: '2px solid #B08D57', borderLeft: '2px solid #B08D57', display: 'flex' }} />
            <div style={{ position: 'absolute', top: '30px', right: '30px', width: '30px', height: '30px', borderTop: '2px solid #B08D57', borderRight: '2px solid #B08D57', display: 'flex' }} />
            <div style={{ position: 'absolute', bottom: '30px', left: '30px', width: '30px', height: '30px', borderBottom: '2px solid #B08D57', borderLeft: '2px solid #B08D57', display: 'flex' }} />
            <div style={{ position: 'absolute', bottom: '30px', right: '30px', width: '30px', height: '30px', borderBottom: '2px solid #B08D57', borderRight: '2px solid #B08D57', display: 'flex' }} />
          </>
        )}

        {/* 3. Top Symbol (Centered at top border) */}
        {symbol && (
          <div style={{ 
            position: 'absolute', top: '15px', left: '50%', transform: 'translateX(-50%)', 
            background: '#1c1917', padding: '0 20px', display: 'flex' 
          }}>
            <span style={{ fontSize: '40px', color: '#B08D57', lineHeight: 1 }}>{symbol}</span>
          </div>
        )}

        {/* 4. Main Content Layout */}
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: '20px', zIndex: 10 }}>
          {/* Header Line */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '50px' }}>
            <div style={{ width: '50px', height: '1px', background: '#B08D57', marginRight: '20px', display: 'flex' }} />
            <span style={{ fontSize: '18px', letterSpacing: '8px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
              Во Вечен Спомен
            </span>
          </div>

          {/* Deceased Details */}
          <div style={{ display: 'flex', flexDirection: 'column', width: '650px' }}>
            <h1 style={{ fontSize: '80px', fontWeight: 'bold', color: '#B08D57', margin: '0 0 10px 0', lineHeight: 1.1, display: 'flex' }}>
              {name}
            </h1>
            <div style={{ fontSize: '36px', color: 'rgba(255,255,255,0.7)', letterSpacing: '4px', margin: '10px 0', display: 'flex' }}>
              {years}
            </div>
            {city && (
              <div style={{ fontSize: '20px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '3px', marginTop: '5px', display: 'flex' }}>
                од {city}
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={{ width: '400px', height: '1px', background: 'rgba(176, 141, 87, 0.2)', margin: '50px 0', display: 'flex' }} />

          {/* Message Block */}
          <div style={{ 
            fontSize: '26px', 
            fontStyle: 'italic', 
            color: 'rgba(255,255,255,0.9)', 
            lineHeight: '1.6',
            maxWidth: '650px',
            display: 'flex',
          }}>
            "{message || 'Почивај во мир.'}"
          </div>
        </div>

        {/* 5. Photo Section (Restored with premium border) */}
        <div style={{
          position: 'absolute',
          right: '80px',
          top: '90px',
          width: '320px',
          height: '420px',
          display: 'flex',
          background: '#292524',
          boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
          padding: '10px',
          zIndex: 20,
        }}>
          {photo ? (
            <img 
              src={photo} 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex',
              }} 
            />
          ) : (
            <div style={{ 
              width: '100%', 
              height: '100%', 
              background: '#44403c', 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex' }} />
            </div>
          )}
        </div>

        {/* 6. Branded Footer */}
        <div style={{ 
          position: 'absolute', 
          bottom: '50px', 
          left: '80px', 
          display: 'flex', 
          alignItems: 'center'
        }}>
           <div style={{ width: '30px', height: '1px', background: 'rgba(176, 141, 87, 0.5)', marginRight: '15px' }} />
           <span style={{ fontSize: '14px', letterSpacing: '4px', color: 'rgba(176, 141, 87, 0.6)', textTransform: 'uppercase' }}>
             vecenspomen.mk
           </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
