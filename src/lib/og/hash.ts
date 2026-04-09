import { MemorialPost } from '../../types';

/**
 * Calculates a deterministic hash of only the fields that affect the visual
 * representation of the Open Graph share image.
 */
export function calculatePostVisualHash(post: MemorialPost): string {
  const visualFields = {
    fullName: post.fullName || '',
    birthYear: post.birthYear || '',
    deathYear: post.deathYear || '',
    photoUrl: post.photoUrl || '',
    selectedFrameStyle: post.selectedFrameStyle || 'klasicen',
    mainText: post.aiRefinedText || post.mainText || '',
    type: post.type || 'ТАЖНА ВЕСТ',
    city: post.city || '',
    footerSignature: post.familyNote || post.senderName || '',
    introText: post.introText || '',
  };

  const str = JSON.stringify(visualFields);
  
  // Simple fast hash (djb2)
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}
