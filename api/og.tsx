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

  const years = [bYear, dYear].filter(Boolean).join(' – ');

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          background: '#1c1917', // Darker stone background
          color: '#ffffff',
          padding: '80px',
          fontFamily: 'serif', // System fallback
        }}
      >
        {/* Header Section */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
          <div style={{ width: '40px', height: '2px', background: '#B08D57', marginRight: '20px', display: 'flex' }} />
          <span style={{ fontSize: '16px', letterSpacing: '6px', color: '#78716c', textTransform: 'uppercase' }}>
            Во Вечен Спомен
          </span>
        </div>

        {/* Name & Years */}
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '30px' }}>
           <div style={{ fontSize: '72px', fontWeight: 'bold', color: '#B08D57', marginBottom: '10px', display: 'flex' }}>
              {name}
           </div>
           <div style={{ fontSize: '32px', color: '#a8a29e', letterSpacing: '4px', display: 'flex' }}>
              {years}
           </div>
           <div style={{ fontSize: '18px', color: '#78716c', marginTop: '5px', textTransform: 'uppercase', letterSpacing: '2px', display: 'flex' }}>
              од {city}
           </div>
        </div>

        {/* Divider */}
        <div style={{ width: '100%', height: '1px', background: '#292524', marginBottom: '40px', display: 'flex' }} />

        {/* Message */}
        <div style={{ 
          fontSize: '24px', 
          fontStyle: 'italic', 
          color: '#e7e5e4', 
          lineHeight: '1.6',
          maxWidth: '800px',
          display: 'flex',
        }}>
          "{message}"
        </div>

        {/* Footer (Trace Info) */}
        <div style={{ 
          position: 'absolute', 
          bottom: '80px', 
          right: '80px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'flex-end',
          gap: '5px'
        }}>
           <span style={{ fontSize: '12px', color: '#44403c', letterSpacing: '2px' }}>PHASE 3: STATIC UI TEST</span>
           <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#B08D57' }}>SLUG: {slug}</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
