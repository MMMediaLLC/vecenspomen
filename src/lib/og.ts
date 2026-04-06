import * as htmlToImage from 'html-to-image';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, isMock } from './firebase';
import { MemorialPost } from '../types';

/**
 * Generates an OG share image (1200x630) from a hidden DOM element
 * and uploads it to Firebase Storage.
 * @param post The post object to name the file
 * @param elementId The ID of the DOM element to capture
 * @returns The public download URL of the uploaded image
 */
export const generateAndUploadOGImage = async (
  post: Partial<MemorialPost>,
  elementId: string = 'og-image-container'
): Promise<string | null> => {
  if (isMock) {
    console.log('[OG Generator] Mock mode: Skipping upload, returning placeholder');
    return 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1200&h=630';
  }

  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`[OG Generator] Element with ID "${elementId}" not found.`);
    return null;
  }

  try {
    // 1. Capture the element as a Blob
    // We wait a bit to ensure fonts and images are loaded
    // html-to-image usually handles this but a small delay helps
    const blob = await htmlToImage.toBlob(element, {
      pixelRatio: 1, // We want exactly 1200x630
      cacheBust: true,
      backgroundColor: '#ffffff',
    });

    if (!blob) throw new Error('Failed to generate image blob');

    // 2. Prepare Storage Reference
    // Path: posts/share-images/[postId].jpg
    const fileRef = ref(storage, `posts/share-images/${post.id || Date.now()}-og.jpg`);

    // 3. Upload to Firebase Storage
    const metadata = {
      contentType: 'image/jpeg',
      customMetadata: {
        postId: post.id || '',
        generatedAt: new Date().toISOString(),
      }
    };

    const snapshot = await uploadBytes(fileRef, blob, metadata);
    
    // 4. Get and return the public URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;

  } catch (err) {
    console.error('[OG Generator] Error generating or uploading OG image:', err);
    return null;
  }
};
