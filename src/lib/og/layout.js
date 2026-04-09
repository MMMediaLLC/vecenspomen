import React from 'react';

/**
 * SHARED DESIGN TOKENS
 * Mirrors src/lib/designSystem.ts to ensure consistency.
 * We define them here directly or import if safe, but we'll define
 * the visual constants here for zero-dependency serverless execution.
 */
const COLORS = {
  stone50: '#fafaf9',
  stone100: '#f5f5f4',
  stone200: '#e7e5e4',
  stone300: '#d6d3d1',
  stone400: '#a8a29e',
  stone500: '#78716c',
  stone600: '#57534e',
  stone700: '#44403c',
  stone800: '#292524',
  stone900: '#1c1917',
  gold: '#B08D57',
};

const STYLE_MAP = {
  pravoslaven:    { symbol: '☦', accent: COLORS.gold },
  katolicki:      { symbol: '✝', accent: COLORS.gold },
  muslimanski:    { symbol: '☾', accent: COLORS.gold },
  socijalisticki: { symbol: '★', accent: COLORS.gold },
  klasicen:       { symbol: '',  accent: COLORS.gold },
  emotiven:       { symbol: '',  accent: COLORS.gold },
};

/**
 * PURE JAVASCRIPT LAYOUT GENERATOR
 * Uses React.createElement to avoid JSX transform issues in Node.js runtime.
 * Target dimensions: 1200x630
 */
export function generateHorizontalOGLayout(post) {
  const variant = post.selectedFrameStyle || 'klasicen';
  const style = STYLE_MAP[variant] || STYLE_MAP.klasicen;
  
  // 1. Root Container
  return React.createElement('div', {
    style: {
      height: '100%',
      width: '100%',
      display: 'flex',
      backgroundColor: COLORS.stone50,
      backgroundImage: 'radial-gradient(circle at 50% 50%, #f5f5f4 0%, #e7e5e4 100%)',
      padding: '40px',
      boxSizing: 'border-box',
      border: `20px solid ${COLORS.stone900}`,
      position: 'relative',
    }
  }, [
    // 2. Left Column: Portrait
    React.createElement('div', {
      key: 'left',
      style: {
        width: '380px',
        height: '510px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.stone100,
        border: `2px solid ${COLORS.gold}`,
        padding: '10px',
        position: 'relative',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      }
    }, [
      // Image
      post.photoUrl ? React.createElement('img', {
        key: 'photo',
        src: post.photoUrl,
        style: {
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'sepia(20%) contrast(110%)',
        }
      }) : React.createElement('div', {
        key: 'placeholder',
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: COLORS.stone200,
          color: COLORS.stone400,
          fontSize: '100px',
        }
      }, style.symbol || '🕯️')
    ]),

    // 3. Right Column: Content
    React.createElement('div', {
      key: 'right',
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        paddingLeft: '50px',
        justifyContent: 'center',
      }
    }, [
      // Top Symbol
      style.symbol && React.createElement('div', {
        key: 'symbol',
        style: {
          fontSize: '48px',
          color: COLORS.gold,
          marginBottom: '20px',
          fontFamily: 'serif',
        }
      }, style.symbol),

      // Name
      React.createElement('h1', {
        key: 'name',
        style: {
          margin: 0,
          padding: 0,
          fontSize: '64px',
          fontFamily: 'serif',
          color: COLORS.stone900,
          lineHeight: 1.1,
          fontWeight: 'normal',
        }
      }, post.fullName),

      // Years
      React.createElement('div', {
        key: 'years',
        style: {
          fontSize: '32px',
          color: COLORS.stone500,
          marginTop: '5px',
          marginBottom: '30px',
          fontFamily: 'serif',
          letterSpacing: '2px',
        }
      }, `${post.birthYear || ''} — ${post.deathYear || (post.dateOfDeath ? new Date(post.dateOfDeath).getFullYear() : '')}`),

      // Main Message
      React.createElement('div', {
        key: 'message',
        style: {
          fontSize: '28px',
          color: COLORS.stone600,
          fontStyle: 'italic',
          lineHeight: 1.4,
          maxWidth: '650px',
          maxHeight: '160px',
          overflow: 'hidden',
          fontFamily: 'serif',
        }
      }, post.aiRefinedText || post.mainText || ''),

      // Footer divider
      React.createElement('div', {
        key: 'divider',
        style: {
          width: '100px',
          height: '2px',
          backgroundColor: COLORS.gold,
          marginTop: '40px',
          marginBottom: '20px',
        }
      }),

      // Signature / Sender
      React.createElement('div', {
        key: 'signature',
        style: {
          fontSize: '24px',
          color: COLORS.stone500,
          fontFamily: 'serif',
          textTransform: 'uppercase',
          letterSpacing: '3px',
        }
      }, (post.familyNote || post.senderName || '').slice(0, 50))
    ]),

    // 4. Subtle Border Accent
    React.createElement('div', {
      key: 'accent',
      style: {
        position: 'absolute',
        bottom: '30px',
        right: '30px',
        fontSize: '20px',
        color: COLORS.stone400,
        fontFamily: 'sans-serif',
        opacity: 0.5,
      }
    }, 'vecenspomen.mk')
  ]);
}
