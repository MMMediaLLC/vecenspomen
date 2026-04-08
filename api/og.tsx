import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug') || 'NO SLUG';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#111111',
          color: '#ffffff',
          fontSize: '64px',
          fontWeight: '700',
        }}
      >
        {slug}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
