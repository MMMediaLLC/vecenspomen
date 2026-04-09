import { ImageResponse } from '@vercel/og';
import admin from 'firebase-admin';
import { generateHorizontalOGLayout } from '../src/lib/og/layout.js';

export const config = { runtime: 'nodejs' };

// --- Firebase Admin Lazy Singleton ---
let _db = null;
let _bucket = null;

function initFirebase() {
  if (_db) return { db: _db, bucket: _bucket };

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set');

  try {
    const serviceAccount = JSON.parse(raw.replace(/\\n/g, '\n'));
    
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: `${serviceAccount.project_id}.firebasestorage.app`
      });
      console.log('[OG API] Firebase Admin initialized:', serviceAccount.project_id);
    }

    _db = admin.firestore();
    _bucket = admin.storage().bucket();
    return { db: _db, bucket: _bucket };
  } catch (err) {
    console.error('[OG API] Firebase initialization failed:', err.message);
    throw err;
  }
}

export default async function handler(req) {
  console.log('[OG Trace 1] Request received');
  
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { postId } = await req.json();
    if (!postId) {
      return new Response(JSON.stringify({ success: false, error: 'postId is required' }), { status: 400 });
    }

    const { db, bucket } = initFirebase();
    const postRef = db.collection('posts').doc(postId);
    const snap = await postRef.get();

    if (!snap.exists) {
      return new Response(JSON.stringify({ success: false, error: 'Post not found' }), { status: 404 });
    }

    const post = snap.data();
    const slug = post.slug || postId;

    console.log('[OG Trace 2] Generating image for:', slug);

    // 1. Prepare Layout
    const layout = generateHorizontalOGLayout(post);

    // 2. Render to ImageResponse (Vercel OG)
    // Note: We're using standard node-js runtime but @vercel/og provides a compatible ImageResponse
    const imageResponse = new ImageResponse(layout, {
      width: 1200,
      height: 630,
    });

    // 3. Convert to Buffer
    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Upload to Firebase Storage
    const fileName = `og-previews/${slug}.png`;
    const file = bucket.file(fileName);

    console.log('[OG Trace 3] Uploading to Storage:', fileName);
    
    await file.save(buffer, {
      contentType: 'image/png',
      metadata: {
        cacheControl: 'public, max-age=31536000',
      }
    });

    // 5. Make it public so social scrapers can see it
    await file.makePublic();

    // 6. Generate stable public URL with cache busting
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}?v=${Date.now()}`;

    // 7. Update Firestore
    console.log('[OG Trace 4] Updating Firestore status');
    await postRef.update({
      ogStatus: 'ready',
      shareImageUrl: publicUrl,
      ogGeneratedAt: admin.firestore.FieldValue.serverTimestamp(),
      ogError: null
    });

    return new Response(JSON.stringify({ 
      success: true, 
      shareImageUrl: publicUrl 
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('[OG API Error]', err);
    
    // Attempt to log failure to Firestore if we have a postId
    try {
      const { postId } = await req.json().catch(() => ({}));
      if (postId) {
        const { db } = initFirebase();
        await db.collection('posts').doc(postId).update({
          ogStatus: 'failed',
          ogError: err.message
        });
      }
    } catch (ignore) {}

    return new Response(JSON.stringify({ 
      success: false, 
      error: err.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
