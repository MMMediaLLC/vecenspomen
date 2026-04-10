import React from 'react';
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

// Rendered off-screen at exactly 1200x630 for html2canvas capture
export const OGImageTemplate = React.forwardRef<HTMLDivElement, OGImageTemplateProps>(
  ({ post }, ref) => {
    const displayText = post.aiRefinedText || post.mainText;
    const years = post.birthYear && (post.deathYear || post.dateOfDeath)
      ? `${post.birthYear} – ${post.deathYear || new Date(post.dateOfDeath!).getFullYear()}`
      : null;

    return (
      <div
        ref={ref}
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          fontFamily: 'Georgia, "Times New Roman", serif',
          background: '#f5f4f0',
          overflow: 'hidden',
          position: 'relative',
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
          {post.photoUrl ? (
            <img
              src={post.photoUrl}
              alt={post.fullName}
              crossOrigin="anonymous"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.85,
                filter: 'grayscale(10%) contrast(1.05)',
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
          {/* dark gradient overlay bottom */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '160px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
          }} />
          {/* city bottom-left */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '24px',
            color: 'rgba(255,255,255,0.6)',
            fontSize: '11px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontFamily: 'Georgia, serif',
          }}>
            {post.city}
          </div>
        </div>

        {/* Right — content panel */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 56px 40px 56px',
          background: '#faf9f7',
          position: 'relative',
        }}>
          {/* Top: type label */}
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
            <div style={{ width: '40px', height: '1px', background: '#d6d3d1', marginBottom: '28px' }} />

            {/* Info block — funeral / pomen / sender */}
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

            {/* Text excerpt (max 2 lines) */}
            {displayText && (
              <div style={{
                fontSize: '15px',
                color: '#57534e',
                lineHeight: 1.5,
                fontStyle: 'italic',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                maxWidth: '600px',
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
              <div style={{ fontSize: '18px', color: '#1c1917', fontWeight: 'normal' }}>
                {post.familyNote || post.senderName}
              </div>
            </div>

            {/* Logo / branding */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', letterSpacing: '0.15em', color: '#a8a29e', textTransform: 'uppercase' }}>Вечен Спомен</div>
              <div style={{ fontSize: '11px', color: '#c7c3bd', marginTop: '2px' }}>vechen-spomen.mk</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
