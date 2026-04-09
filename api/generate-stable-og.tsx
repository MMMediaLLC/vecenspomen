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
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const { postId } = await req.json();
  if (!postId) return new Response('Missing postId', { status: 400 });

  try {
    const { db, storage } = initFirebase();
    const postRef = db.collection('posts').doc(postId);
    const postSnap = await postRef.get();

    if (!postSnap.exists) {
      return new Response('Post Not Found', { status: 404 });
    }

    const post = postSnap.data() as any;
    const slug = post.slug || postId;

    // Update status to pending
    await postRef.update({
      ogStatus: 'pending',
      ogError: null
    });

    const fonts = getFonts();

    // 1. Generate Image using @vercel/og (Satori)
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

    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Upload to Firebase Storage (slug-based)
    const bucket = storage.bucket();
    const fileName = `og-previews/${slug}.png`;
    const file = bucket.file(fileName);

    await file.save(buffer, {
      metadata: {
        contentType: 'image/png',
        cacheControl: 'public, max-age=31536000',
      },
      public: true, // Only this file is public, as requested
    });

    // On some Firebase projects, you might need to manually set it public if the bucket isn't auto-public
    try { await file.makePublic(); } catch (e) { console.warn('makePublic failed - might be already public', e); }

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}?v=${Date.now()}`;

    // 3. Update Firestore
    await postRef.update({
      shareImageUrl: publicUrl,
      ogStatus: 'ready',
      ogGeneratedAt: admin.firestore.FieldValue.serverTimestamp(),
      ogError: null
    });

    return new Response(JSON.stringify({ success: true, url: publicUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error('[OG Generation API] Error:', err);
    
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
