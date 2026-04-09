import React from 'react';
import { MemorialPost } from '../types';
import { generateHorizontalOGLayout } from '../lib/og/layout';

interface HorizontalOGProps {
  post: MemorialPost;
}

/**
 * Frontend React wrapper for the shared horizontal OG layout.
 * This is used for live previews in the admin dashboard or share dialogs.
 */
const HorizontalOG: React.FC<HorizontalOGProps> = ({ post }) => {
  // The layout helper returns a React elements tree using React.createElement
  const layout = generateHorizontalOGLayout(post);
  
  return (
    <div style={{ 
      width: '1200px', 
      height: '630px', 
      overflow: 'hidden',
      zoom: 0.5, // Scale down for preview if needed
      borderRadius: '8px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    }}>
      {layout}
    </div>
  );
};

export default HorizontalOG;
