import React, { useState, useEffect } from 'react';
import { MemorialPost } from '../types';

interface OGImageTemplateProps {
  post: MemorialPost;
}

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const months = [
    'јануари', 'февруари', 'март', 'април', 'мај', 'јуни',
    'јули', 'август', 'септември', 'октомври', 'ноември', 'декември',
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

const typeLabel = (post: MemorialPost): string => {
  if (post.type === 'ПОМЕН') {
    if (post.pomenSubtype === '40 дена') return 'Четриесетдневен помен';
    if (post.pomenSubtype === '6 месеци') return 'Шестмесечен помен';
    if (post.pomenSubtype === '1 година') return 'Годишен помен';
    if (post.pomenSubtype === 'Сеќавање') return 'Сеќавање';
    return 'Помен';
  }
  if (post.type === 'ТАЖНА ВЕСТ') return 'Тажна вест';
  if (post.type === 'ПОСЛЕДЕН ПОЗДРАВ') return 'Последен поздрав';
  if (post.type === 'СОЧУВСТВО') return 'Сочувство';
  return post.type;
};

type FrameStyle = 'elegant' | 'orthodox' | 'catholic' | 'muslim' | 'star' | 'clean';

interface FrameConfig {
  borderStyle: string;  // CSS border shorthand
  symbol: string | null;
  cornerSymbol: string | null; // for catholic ◆ corners
  pointedCorners: boolean;     // for muslim
}

const FRAME: Record<FrameStyle, FrameConfig> = {
  elegant: { borderStyle: '2px dashed #c7c3bd', symbol: null,  cornerSymbol: null, pointedCorners: false },
  orthodox: { borderStyle: '1px solid #c7c3bd', symbol: '†',   cornerSymbol: null, pointedCorners: false },
  catholic: { borderStyle: '1px solid #c7c3bd', symbol: '✝',   cornerSymbol: '◆',  pointedCorners: false },
  muslim:   { borderStyle: '1px solid #b5c4b1', symbol: '☽',   cornerSymbol: null, pointedCorners: true  },
  star:     { borderStyle: '2px dashed #c7c3bd', symbol: '★',  cornerSymbol: null, pointedCorners: false },
  clean:    { borderStyle: '1px solid #c7c3bd', symbol: null,  cornerSymbol: null, pointedCorners: false },
};

const BG = '#faf9f7';
const INSET = 16; // px inset from right-panel edge

const Frame: React.FC<{ style: FrameStyle; children: React.ReactNode }> = ({ style, children }) => {
  const cfg = FRAME[style];

  // Muslim pointed corners: clip the corners with a rotated square overlay
  const pointedCornerStyle = (corner: 'tl' | 'tr' | 'bl' | 'br'): React.CSSProperties => {
    const size = 14;
    const pos: React.CSSProperties = { position: 'absolute', width: size, height: size };
    if (corner === 'tl') { pos.top = INSET - size / 2; pos.left = INSET - size / 2; }
    if (corner === 'tr') { pos.top = INSET - size / 2; pos.right = INSET - size / 2; }
    if (corner === 'bl') { pos.bottom = INSET - size / 2; pos.left = INSET - size / 2; }
    if (corner === 'br') { pos.bottom = INSET - size / 2; pos.right = INSET - size / 2; }
    return {
      ...pos,
      background: BG,
      transform: 'rotate(45deg)',
      border: cfg.borderStyle,
      zIndex: 2,
    };
  };

  return (
    <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Decorative inner border */}
      <div style={{
        position: 'absolute',
        inset: INSET,
        border: cfg.borderStyle,
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* Top-center symbol — white bg breaks the border */}
      {cfg.symbol && (
        <div style={{
          position: 'absolute',
          top: INSET - 13,
          left: '50%',
          transform: 'translateX(-50%)',
          background: BG,
          padding: '0 10px',
          fontSize: '22px',
          lineHeight: 1,
          color: '#78716c',
          zIndex: 3,
          whiteSpace: 'nowrap',
        }}>
          {cfg.symbol}
        </div>
      )}

      {/* Catholic corner ◆ decorations */}
      {cfg.cornerSymbol && (['tl', 'tr', 'bl', 'br'] as const).map(corner => {
        const pos: React.CSSProperties = { position: 'absolute', fontSize: '10px', color: '#a8a29e', zIndex: 3, lineHeight: 1 };
        if (corner === 'tl') { pos.top = INSET - 7; pos.left = INSET - 6; }
        if (corner === 'tr') { pos.top = INSET - 7; pos.right = INSET - 6; }
        if (corner === 'bl') { pos.bottom = INSET - 7; pos.left = INSET - 6; }
        if (corner === 'br') { pos.bottom = INSET - 7; pos.right = INSET - 6; }
        return (
          <div key={corner} style={{ ...pos, background: BG, padding: '0 2px' }}>
            {cfg.cornerSymbol}
          </div>
        );
      })}

      {/* Muslim pointed corners — rotated squares that cap the border corners */}
      {cfg.pointedCorners && (['tl', 'tr', 'bl', 'br'] as const).map(corner => (
        <div key={corner} style={pointedCornerStyle(corner)} />
      ))}

      {children}
    </div>
  );
};

// Rendered off-screen at exactly 1200x630 for html2canvas capture
export const OGImageTemplate = React.forwardRef<HTMLDivElement, OGImageTemplateProps>(
  ({ post }, ref) => {
    const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);

    useEffect(() => {
      if (!post.photoUrl) return;
      fetch(post.photoUrl)
        .then(res => {
          console.log('Photo fetch status:', res.status, res.ok);
          return res.blob();
        })
        .then(blob => {
          console.log('Blob size:', blob.size);
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        })
        .then(dataUrl => setPhotoDataUrl(dataUrl))
        .catch(err => {
          console.error('Photo fetch failed:', err);
          setPhotoDataUrl(post.photoUrl);
        });
    }, [post.photoUrl]);

    const displayText = post.aiRefinedText || post.mainText;
    const years = post.birthYear && (post.deathYear || post.dateOfDeath)
      ? `${post.birthYear} – ${post.deathYear || new Date(post.dateOfDeath!).getFullYear()}`
      : null;

    const frameStyle = post.selectedFrameStyle as FrameStyle | undefined;
    const hasFrame = frameStyle && frameStyle in FRAME;

    // Content padding — extra top padding when frame has a symbol (needs room)
    const symbolStyles = hasFrame && FRAME[frameStyle!].symbol;
    const contentPadding = hasFrame
      ? `${symbolStyles ? 52 : 40}px 56px 36px ${56 + INSET}px`
      : '48px 56px 40px 56px';

    const ContentInner = (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: contentPadding,
        position: 'relative',
        zIndex: 0,
      }}>
        {/* Type label */}
        <div>
          <div style={{
            fontSize: '11px',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: '#a8a29e',
            marginBottom: '20px',
            fontFamily: 'Georgia, serif',
          }}>
            {typeLabel(post)}
          </div>

          {/* Name */}
          <div style={{
            fontSize: '46px',
            fontWeight: 'normal',
            color: '#1c1917',
            lineHeight: 1.1,
            marginBottom: '14px',
            letterSpacing: '-0.5px',
          }}>
            {post.fullName}
          </div>

          {/* Years */}
          {years && (
            <div style={{
              fontSize: '18px',
              color: '#78716c',
              marginBottom: '28px',
              letterSpacing: '0.15em',
            }}>
              {years}
            </div>
          )}

          {/* Divider */}
          <div style={{ width: '40px', height: '1px', background: '#d6d3d1', marginBottom: '24px' }} />

          {/* Funeral info */}
          {post.type === 'ТАЖНА ВЕСТ' && (post.dateOfFuneral || post.placeOfFuneral) && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#a8a29e', marginBottom: '6px' }}>Погреб</div>
              <div style={{ fontSize: '17px', color: '#1c1917', lineHeight: 1.4 }}>
                {post.dateOfFuneral && formatDate(post.dateOfFuneral)}
                {post.timeOfFuneral && ` во ${post.timeOfFuneral} часот`}
              </div>
              {post.placeOfFuneral && (
                <div style={{ fontSize: '14px', color: '#78716c', marginTop: '4px' }}>{post.placeOfFuneral}</div>
              )}
            </div>
          )}

          {/* Pomen info */}
          {post.type === 'ПОМЕН' && post.pomenDate && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#a8a29e', marginBottom: '6px' }}>
                {post.pomenSubtype === 'Сеќавање' ? 'Сеќавање' : 'Парастос'}
              </div>
              <div style={{ fontSize: '17px', color: '#1c1917', lineHeight: 1.4 }}>
                {formatDate(post.pomenDate)}
                {post.pomenTime && ` во ${post.pomenTime} часот`}
              </div>
              {post.pomenPlace && (
                <div style={{ fontSize: '14px', color: '#78716c', marginTop: '4px' }}>{post.pomenPlace}</div>
              )}
            </div>
          )}

          {/* Text excerpt */}
          {displayText && (
            <div style={{
              fontSize: '15px',
              color: '#57534e',
              lineHeight: 1.5,
              fontStyle: 'italic',
              overflow: 'hidden',
              maxHeight: '48px',
              maxWidth: '580px',
            }}>
              "{displayText}"
            </div>
          )}
        </div>

        {/* Bottom: sender + logo */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#a8a29e', marginBottom: '6px' }}>
              {post.type === 'СОЧУВСТВО' ? 'Искрено сочувство' :
               post.type === 'ПОСЛЕДЕН ПОЗДРАВ' ? 'Последен поздрав од' :
               'Со почит од:'}
            </div>
            <div style={{ fontSize: '18px', color: '#1c1917' }}>
              {post.familyNote || post.senderName}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', letterSpacing: '0.15em', color: '#a8a29e', textTransform: 'uppercase' }}>Вечен Спомен</div>
            <div style={{ fontSize: '11px', color: '#c7c3bd', marginTop: '2px' }}>vechen-spomen.mk</div>
          </div>
        </div>
      </div>
    );

    return (
      <div
        ref={ref}
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          fontFamily: 'Georgia, "Times New Roman", serif',
          background: BG,
          overflow: 'hidden',
          position: 'relative',
          // undefined/basic — само box-shadow, без рамка
          boxShadow: !hasFrame ? 'inset 0 0 0 1px rgba(0,0,0,0.06)' : 'none',
        }}
      >
        {/* Left — photo panel */}
        <div style={{
          width: '420px',
          height: '630px',
          flexShrink: 0,
          position: 'relative',
          background: '#1c1917',
        }}>
          {photoDataUrl ? (
            <img
              src={photoDataUrl}
              alt={post.fullName}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.85,
                filter: 'grayscale(10%) contrast(1.05)',
                display: 'block',
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              background: '#292524',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{ color: '#57534e', fontSize: '13px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Фотографија</span>
            </div>
          )}
          {/* gradient bottom */}
          <div style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            height: '160px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
          }} />
          {/* city */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '24px',
            color: 'rgba(255,255,255,0.6)',
            fontSize: '11px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}>
            {post.city}
          </div>
        </div>

        {/* Right — content panel, with or without frame */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: BG, position: 'relative' }}>
          {hasFrame ? (
            <Frame style={frameStyle!}>
              {ContentInner}
            </Frame>
          ) : ContentInner}
        </div>
      </div>
    );
  }
);
