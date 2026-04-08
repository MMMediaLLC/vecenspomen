import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'nodejs' };

export default function handler() {
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
        OG WORKS
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
