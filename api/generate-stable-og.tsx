import { ImageResponse } from '@vercel/og';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { HorizontalOG } from '../src/components/HorizontalOG';

export const config = { runtime: 'nodejs' };

// --- Firebase Admin Init (Lazy) ---
let _db: admin.firestore.Firestore | null = null;
let _storage: any = null;

function initFirebase() {
  if (_db) return { db: _db, storage: _storage };

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT not set');

  const normalized = raw.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t');
  const serviceAccount = JSON.parse(normalized);

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`
    });
  }

  _db = admin.firestore();
  _storage = admin.storage();
  return { db: _db, storage: _storage };
}

// --- Font Loading ---
let _loraRegular: Buffer | null = null;
let _loraBold: Buffer | null = null;

function getFonts() {
  if (!_loraRegular || !_loraBold) {
    const fontsDir = path.join(process.cwd(), 'public', 'fonts');
    _loraRegular = fs.readFileSync(path.join(fontsDir, 'lora-400.ttf'));
    _loraBold    = fs.readFileSync(path.join(fontsDir, 'lora-700.ttf'));
  }
  return { regular: _loraRegular, bold: _loraBold };
}

export default async function handler(req: any, res: any) {
  console.log('[OG Trace 0] Handler started');
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const { postId } = await req.json();
  console.log('[OG Trace 1] Received postId:', postId);
  if (!postId) return new Response('Missing postId', { status: 400 });

  try {
    console.log('[OG Trace 2] Initializing Firebase...');
    const { db, storage } = initFirebase();
    
    console.log('[OG Trace 3] Fetching post from Firestore...');
    const postRef = db.collection('posts').doc(postId);
    const postSnap = await postRef.get();

    if (!postSnap.exists) {
      console.error('[OG Trace 3.1] Post Not Found for ID:', postId);
      return new Response('Post Not Found', { status: 404 });
    }

    const post = postSnap.data() as any;
    const slug = post.slug || postId;
    console.log('[OG Trace 4] Post data loaded for slug:', slug);
    console.log('[OG Trace 4.1] Portrait Image URL:', post.photoUrl);

    // Update status to pending
    await postRef.update({
      ogStatus: 'pending',
      ogError: null
    });

    console.log('[OG Trace 5] Loading fonts...');
    const fonts = getFonts();

    // 1. Generate Image using @vercel/og (Satori)
    console.log('[OG Trace 6] Starting HorizontalOG render...');
    const imageResponse = new ImageResponse(
      (
        <HorizontalOG post={post} />
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          { name: 'Lora', data: fonts.regular, style: 'normal', weight: 400 },
          { name: 'Lora', data: fonts.bold,    style: 'normal', weight: 700 },
        ],
      }
    );

    console.log('[OG Trace 7] Generating PNG buffer...');
    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log('[OG Trace 7.1] Buffer length:', buffer.length);

    // 2. Upload to Firebase Storage (slug-based)
    console.log('[OG Trace 8] Accessing Storage Bucket...');
    const bucket = storage.bucket();
    console.log('[OG Trace 8.1] Bucket Name:', bucket.name);
    
    const fileName = `og-previews/${slug}.png`;
    const file = bucket.file(fileName);
    console.log('[OG Trace 9] Starting file save to:', fileName);

    await file.save(buffer, {
      metadata: {
        contentType: 'image/png',
        cacheControl: 'public, max-age=31536000',
      },
      public: true, // Only this file is public, as requested
    });
    console.log('[OG Trace 10] File saved successfully');

    // On some Firebase projects, you might need to manually set it public if the bucket isn't auto-public
    try { 
      console.log('[OG Trace 11] Explicitly making public...');
      await file.makePublic(); 
    } catch (e) { 
      console.warn('[OG Trace 11.1] makePublic failed - might be already public', e); 
    }

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}?v=${Date.now()}`;
    console.log('[OG Trace 12] Generated Public URL:', publicUrl);

    // 3. Update Firestore
    console.log('[OG Trace 13] Updating Firestore record...');
    await postRef.update({
      shareImageUrl: publicUrl,
      ogStatus: 'ready',
      ogGeneratedAt: admin.firestore.FieldValue.serverTimestamp(),
      ogError: null
    });
    console.log('[OG Trace 14] Firestore update complete');

    return new Response(JSON.stringify({ success: true, url: publicUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error('[OG Generation API] ERROR AT TRACE:', err);
    
    // Try to update error status in DB if possible
    try {
      const { db } = initFirebase();
      await db.collection('posts').doc(postId).update({
        ogStatus: 'failed',
        ogError: err.message
      });
    } catch (dbErr) {
      console.error('Failed to update error status in DB', dbErr);
    }

    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
