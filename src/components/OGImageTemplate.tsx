import React, { useState, useEffect } from 'react';
import { MemorialPost } from '../types';

interface OGImageTemplateProps {
  post: MemorialPost;
  onReady?: () => void;
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
    if (post.pomenSubtype === '7 дена')   return 'Седумдневен помен';
    if (post.pomenSubtype === '40 дена')  return 'Четириесетдневен помен';
    if (post.pomenSubtype === '6 месеци') return 'Шестмесечен помен';
    if (post.pomenSubtype === '1 година') return 'Годишен помен';
    if (post.pomenSubtype === '2 години') return 'Двегодишен помен';
    if (post.pomenSubtype === '5 години') return 'Петгодишен помен';
    if (post.pomenSubtype === '10 години') return 'Десетгодишен помен';
    if (post.pomenSubtype === 'Сеќавање') return 'Сеќавање';
    return 'Помен';
  }
  if (post.type === 'ТАЖНА ВЕСТ')      return 'Тажна вест';
  if (post.type === 'ПОСЛЕДЕН ПОЗДРАВ') return 'Последен поздрав';
  if (post.type === 'СОЧУВСТВО')        return 'Сочувство';
  return post.type;
};

const senderLabel = (post: MemorialPost): string => {
  if (post.type === 'СОЧУВСТВО')        return 'Искрено сочувство од';
  if (post.type === 'ПОСЛЕДЕН ПОЗДРАВ') return 'Последен поздрав од';
  return 'Со почит од';
};

type FrameStyle = 'elegant' | 'orthodox' | 'catholic' | 'muslim' | 'star' | 'clean';

interface FrameConfig {
  borderStyle: string;
  symbol: string | null;
  cornerSymbol: string | null;
  pointedCorners: boolean;
}

const FRAME: Record<FrameStyle, FrameConfig> = {
  elegant:  { borderStyle: '2px dashed #c7c3bd', symbol: null,  cornerSymbol: null, pointedCorners: false },
  orthodox: { borderStyle: '1px solid #c7c3bd',  symbol: '†',   cornerSymbol: null, pointedCorners: false },
  catholic: { borderStyle: '1px solid #c7c3bd',  symbol: '✝',   cornerSymbol: '◆',  pointedCorners: false },
  muslim:   { borderStyle: '1px solid #b5c4b1',  symbol: '☽',   cornerSymbol: null, pointedCorners: true  },
  star:     { borderStyle: '2px dashed #c7c3bd', symbol: '★',   cornerSymbol: null, pointedCorners: false },
  clean:    { borderStyle: '1px solid #c7c3bd',  symbol: null,  cornerSymbol: null, pointedCorners: false },
};

const BG = '#faf9f7';
const INSET = 16;

const Frame: React.FC<{ style: FrameStyle; children: React.ReactNode }> = ({ style, children }) => {
  const cfg = FRAME[style];

  const pointedCornerStyle = (corner: 'tl' | 'tr' | 'bl' | 'br'): React.CSSProperties => {
    const size = 14;
    const pos: React.CSSProperties = { position: 'absolute', width: size, height: size };
    if (corner === 'tl') { pos.top = INSET - size / 2;    pos.left  = INSET - size / 2; }
    if (corner === 'tr') { pos.top = INSET - size / 2;    pos.right = INSET - size / 2; }
    if (corner === 'bl') { pos.bottom = INSET - size / 2; pos.left  = INSET - size / 2; }
    if (corner === 'br') { pos.bottom = INSET - size / 2; pos.right = INSET - size / 2; }
    return { ...pos, background: BG, transform: 'rotate(45deg)', border: cfg.borderStyle, zIndex: 2 };
  };

  return (
    <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{
        position: 'absolute',
        inset: INSET,
        border: cfg.borderStyle,
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {cfg.symbol && (
        <div style={{
          position: 'absolute',
          top: INSET - 13,
          left: '50%',
          transform: `translateX(-50%)${style === 'muslim' ? ' scaleX(-1)' : ''}`,
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

      {cfg.cornerSymbol && (['tl', 'tr', 'bl', 'br'] as const).map(corner => {
        const pos: React.CSSProperties = { position: 'absolute', fontSize: '10px', color: '#a8a29e', zIndex: 3, lineHeight: 1 };
        if (corner === 'tl') { pos.top = INSET - 7;    pos.left  = INSET - 6; }
        if (corner === 'tr') { pos.top = INSET - 7;    pos.right = INSET - 6; }
        if (corner === 'bl') { pos.bottom = INSET - 7; pos.left  = INSET - 6; }
        if (corner === 'br') { pos.bottom = INSET - 7; pos.right = INSET - 6; }
        return (
          <div key={corner} style={{ ...pos, background: BG, padding: '0 2px' }}>
            {cfg.cornerSymbol}
          </div>
        );
      })}

      {cfg.pointedCorners && (['tl', 'tr', 'bl', 'br'] as const).map(corner => (
        <div key={corner} style={pointedCornerStyle(corner)} />
      ))}

      {children}
    </div>
  );
};

export const OGImageTemplate = React.forwardRef<HTMLDivElement, OGImageTemplateProps>(
  ({ post, onReady }, ref) => {
    const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);

    useEffect(() => {
      if (!post.photoUrl) {
        onReady?.();
        return;
      }
      fetch(post.photoUrl)
        .then(res => res.blob())
        .then(blob => new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        }))
        .then(dataUrl => setPhotoDataUrl(dataUrl))
        .catch(() => onReady?.());
    }, [post.photoUrl]);

    const displayText = post.aiRefinedText || post.mainText;
    const years = post.birthYear && (post.deathYear || post.dateOfDeath)
      ? `${post.birthYear} – ${post.deathYear || new Date(post.dateOfDeath!).getFullYear()}`
      : null;

    const frameStyle = post.selectedFrameStyle as FrameStyle | undefined;
    const hasFrame = frameStyle && frameStyle in FRAME;
    const hasSymbol = hasFrame && !!FRAME[frameStyle!].symbol;

    const contentPadding = hasFrame
      ? `${hasSymbol ? 54 : 42}px 52px 36px ${INSET + 40}px`
      : '52px 56px 40px 56px';

    const ContentInner = (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: contentPadding,
        position: 'relative',
        zIndex: 0,
      }}>

        {/* ── ГОРЕН ДЕЛ: повод + ime + години ── */}
        <div style={{ marginBottom: 'auto' }}>

          <div style={{
            fontSize: '11px',
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: '#a8a29e',
            marginBottom: '18px',
            fontFamily: 'Georgia, serif',
          }}>
            {typeLabel(post)}
          </div>

          <div style={{
            fontSize: '52px',
            fontWeight: 'normal',
            color: '#1c1917',
            lineHeight: 1.05,
            marginBottom: '12px',
            letterSpacing: '-0.3px',
            fontFamily: 'Georgia, "Times New Roman", serif',
          }}>
            {post.fullName}
          </div>

          {years && (
            <div style={{
              fontSize: '16px',
              color: '#78716c',
              letterSpacing: '0.18em',
              fontFamily: 'Georgia, serif',
            }}>
              {years}
            </div>
          )}
        </div>

        {/* ── СРЕДИНА: разделник ── */}
        <div style={{
          width: '40px',
          height: '1px',
          background: '#d6d3d1',
          margin: '28px 0 24px',
          flexShrink: 0,
        }} />

        {/* ── СРЕДНО-ДОЛЕН ДЕЛ: детали + цитат ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>

          {post.type === 'ТАЖНА ВЕСТ' && (post.dateOfFuneral || post.placeOfFuneral) && (
            <div style={{ marginBottom: '18px' }}>
              <div style={{
                fontSize: '10px',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#a8a29e',
                marginBottom: '5px',
                fontFamily: 'Georgia, serif',
              }}>
                Погреб
              </div>
              <div style={{ fontSize: '16px', color: '#1c1917', lineHeight: 1.4, fontFamily: 'Georgia, serif' }}>
                {post.dateOfFuneral && formatDate(post.dateOfFuneral)}
                {post.timeOfFuneral && ` во ${post.timeOfFuneral} часот`}
              </div>
              {post.placeOfFuneral && (
                <div style={{ fontSize: '13px', color: '#78716c', marginTop: '3px', fontFamily: 'Georgia, serif' }}>
                  {post.placeOfFuneral}
                </div>
              )}
            </div>
          )}

          {post.type === 'ПОМЕН' && post.pomenDate && (
            <div style={{ marginBottom: '18px' }}>
              <div style={{
                fontSize: '10px',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#a8a29e',
                marginBottom: '5px',
                fontFamily: 'Georgia, serif',
              }}>
                {post.pomenSubtype === 'Сеќавање' ? 'Сеќавање' : 'Парастос'}
              </div>
              <div style={{ fontSize: '16px', color: '#1c1917', lineHeight: 1.4, fontFamily: 'Georgia, serif' }}>
                {formatDate(post.pomenDate)}
                {post.pomenTime && ` во ${post.pomenTime} часот`}
              </div>
              {post.pomenPlace && (
                <div style={{ fontSize: '13px', color: '#78716c', marginTop: '3px', fontFamily: 'Georgia, serif' }}>
                  {post.pomenPlace}
                </div>
              )}
            </div>
          )}

          {displayText && (
            <div style={{
              fontSize: '13.5px',
              color: '#57534e',
              lineHeight: 1.65,
              fontStyle: 'italic',
              borderLeft: '2px solid #d6d3d1',
              paddingLeft: '14px',
              overflow: 'hidden',
              maxHeight: '88px',
              fontFamily: 'Georgia, serif',
            }}>
              „{displayText}"
            </div>
          )}
        </div>

        {/* ── FOOTER: испраќач + бренд ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          borderTop: '0.5px solid #e7e5e4',
          paddingTop: '16px',
          marginTop: '20px',
          flexShrink: 0,
        }}>
          <div>
            <div style={{
              fontSize: '10px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#a8a29e',
              marginBottom: '4px',
              fontFamily: 'Georgia, serif',
            }}>
              {senderLabel(post)}
            </div>
            <div style={{
              fontSize: '16px',
              color: '#1c1917',
              fontFamily: 'Georgia, serif',
            }}>
              {post.familyNote || post.senderName}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: '12px',
              letterSpacing: '0.18em',
              color: '#a8a29e',
              textTransform: 'uppercase',
              fontFamily: 'Georgia, serif',
            }}>
              Вечен Спомен
            </div>
            <div style={{
              fontSize: '11px',
              color: '#c7c3bd',
              marginTop: '2px',
              fontFamily: 'Georgia, serif',
            }}>
              vecenspomen.mk
            </div>
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
        }}
      >
        {/* ── ЛЕВО: фото панел 440px ── */}
        <div style={{
          width: '440px',
          height: '630px',
          flexShrink: 0,
          overflow: 'hidden',
          position: 'relative',
          background: '#1c1917',
        }}>
          {photoDataUrl ? (
            <img
              src={photoDataUrl}
              alt={post.fullName}
              onLoad={() => onReady?.()}
              onError={() => onReady?.()}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center top',
                opacity: 0.9,
                filter: 'grayscale(10%) contrast(1.05)',
                display: 'block',
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                background: '#292524',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              ref={el => { if (el) onReady?.(); }}
            >
              <span style={{
                color: '#57534e',
                fontSize: '13px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}>
                Фотографија
              </span>
            </div>
          )}

          <div style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            height: '140px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)',
            pointerEvents: 'none',
          }} />

          {post.city && (
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '22px',
              color: 'rgba(255,255,255,0.55)',
              fontSize: '11px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontFamily: 'Georgia, serif',
            }}>
              {post.city}
            </div>
          )}
        </div>

        {/* ── ДЕСНО: текст панел (760px) ── */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: BG,
          position: 'relative',
        }}>
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

OGImageTemplate.displayName = 'OGImageTemplate';
