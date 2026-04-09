import React from 'react';
import { MemorialPost } from '../types';
import { STYLE_MAP, COLORS } from '../lib/designSystem';

interface HorizontalOGProps {
  post: Partial<MemorialPost>;
}

export const HorizontalOG: React.FC<HorizontalOGProps> = ({ post }) => {
  const selectedStyle = (post.selectedFrameStyle as any) || 'klasicen';
  const styleConfig = STYLE_MAP[selectedStyle as keyof typeof STYLE_MAP] || STYLE_MAP.klasicen;
  
  const isPremium = post.package === 'Истакнат';
  const typeLabel = post.type || 'ТАЖНА ВЕСТ';
  
  const years = [post.birthYear, post.deathYear].filter(Boolean).join(' – ');
  const message = (post.aiRefinedText || post.mainText || 'Почивај во мир.').slice(0, 200);

  return (
    <div style={{
      width: '1200px',
      height: '630px',
      display: 'flex',
      background: COLORS.stone50,
      fontFamily: '"Lora"',
      position: 'relative',
      padding: '40px',
      boxSizing: 'border-box',
    }}>
      {/* Background Decor (Blur effect simulation) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'white',
        opacity: 0.5,
        display: 'flex',
      }} />

      {/* Main Content Box */}
      <div style={{
        width: '1120px',
        height: '550px',
        background: 'white',
        display: 'flex',
        border: `1px solid ${COLORS.stone200}`,
        boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        
        {/* Left 35%: Photo Area */}
        <div style={{
          width: '35%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          background: COLORS.stone50,
        }}>
          <div style={{
            width: '320px',
            height: '440px',
            display: 'flex',
            position: 'relative',
          }}>
            {/* Shadow Decor */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.1)',
              transform: 'rotate(2deg) scale(1.05)',
              display: 'flex',
            }} />
            
            <div style={{
              width: '100%',
              height: '100%',
              background: 'white',
              padding: '8px',
              border: `1px solid ${COLORS.stone200}`,
              display: 'flex',
              position: 'relative',
            }}>
              {post.photoUrl ? (
                <img 
                  src={post.photoUrl} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: COLORS.stone100,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <span style={{ color: COLORS.stone300, fontSize: '24px', letterSpacing: '8px' }}>ТИШИНА</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 65%: Text Area */}
        <div style={{
          width: '65%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '60px 60px 60px 20px',
          justifyContent: 'center',
        }}>
          
          {/* Top Label */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ width: '40px', height: '2px', background: COLORS.gold, marginRight: '15px' }} />
            <span style={{ 
              fontSize: '14px', 
              fontWeight: 700, 
              letterSpacing: '5px', 
              color: COLORS.stone500,
              textTransform: 'uppercase'
            }}>
              {typeLabel}
            </span>
          </div>

          {/* Name */}
          <h1 style={{ 
            fontSize: isPremium ? '64px' : '56px', 
            fontWeight: isPremium ? 700 : 400, 
            color: COLORS.stone900,
            margin: '0 0 10px 0',
            lineHeight: 1.1,
          }}>
            {post.fullName}
          </h1>

          {/* Years */}
          <div style={{ 
            fontSize: '24px', 
            letterSpacing: '4px', 
            color: COLORS.stone500,
            marginBottom: '30px',
            display: 'flex',
          }}>
            {years}
          </div>

          {/* Message */}
          <div style={{
            fontSize: '22px',
            fontStyle: 'italic',
            color: COLORS.stone700,
            lineHeight: 1.5,
            marginBottom: '40px',
            maxWidth: '100%',
            display: 'flex',
          }}>
            „{message}“
          </div>

          {/* Bottom Info */}
          <div style={{
            marginTop: 'auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            borderTop: `1px solid ${COLORS.stone100}`,
            paddingTop: '20px',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: COLORS.stone400, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '5px' }}>
                Со љубов и почит од:
              </span>
              <span style={{ fontSize: '22px', color: COLORS.stone900, fontWeight: 700 }}>
                {post.familyNote || post.senderName || 'Најблиските'}
              </span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
               <span style={{ fontSize: '18px', fontWeight: 900, color: COLORS.stone900, opacity: 0.8, letterSpacing: '-1px' }}>
                 VECENSPOMEN.MK
               </span>
            </div>
          </div>
        </div>

        {/* Absolute Accents mapping directly to selected style */}
        {styleConfig.symbol && (
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '25px',
            fontSize: '40px',
            color: COLORS.gold,
            display: 'flex',
          }}>
            {styleConfig.symbol}
          </div>
        )}

        {/* Premium Frame (Simplified for Satori) */}
        {isPremium && (
          <div style={{
            position: 'absolute',
            inset: '15px',
            border: `1px solid ${COLORS.gold}44`,
            pointerEvents: 'none',
            display: 'flex',
          }}>
            <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '20px', height: '20px', borderTop: `3px solid ${COLORS.gold}`, borderLeft: `3px solid ${COLORS.gold}` }} />
            <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '20px', height: '20px', borderTop: `3px solid ${COLORS.gold}`, borderRight: `3px solid ${COLORS.gold}` }} />
            <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '20px', height: '20px', borderBottom: `3px solid ${COLORS.gold}`, borderLeft: `3px solid ${COLORS.gold}` }} />
            <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '20px', height: '20px', borderBottom: `3px solid ${COLORS.gold}`, borderRight: `3px solid ${COLORS.gold}` }} />
          </div>
        )}
      </div>
    </div>
  );
};
