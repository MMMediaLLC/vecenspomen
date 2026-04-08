import { ImageResponse } from '@vercel/og';
import admin from 'firebase-admin';

// ── 1. RUNTIME CONFIGURATION ────────────────────────────────────────────────
export const config = { runtime: 'nodejs' };

// ── 2. FIREBASE ADMIN (SINGLETON-SAFE) ──────────────────────────────────────
let _db: admin.firestore.Firestore | null = null;

function getDb() {
  try {
    if (_db) return _db;

    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) {
      console.error('[og] ERROR: INIT Missing FIREBASE_SERVICE_ACCOUNT');
      throw new Error('INIT FAILED');
    }

    // Normalize private key newlines
    const normalized = raw.replace(/\\n/g, '\n');
    const serviceAccount = JSON.parse(normalized);

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('[og] FIREBASE INIT OK');
    }

    _db = admin.firestore();
    return _db;
  } catch (err: any) {
    console.error('[og] FIREBASE INIT ERROR: %s', err.message);
    throw new Error('INIT FAILED');
  }
}

// ── 3. DATA FETCHING WITH TIMEOUT GUARD ─────────────────────────────────────
async function getPostBySlug(slug: string, timeoutMs = 4000) {
  const db = getDb();
  
  // Custom timeout wrapper
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('FETCH TIMEOUT')), timeoutMs)
  );

  const fetchPromise = (async () => {
    console.log('[og] FETCH START');
    const postsRef = db.collection('posts');
    
    // Attempt 1: slug field query
    let q = await postsRef.where('slug', '==', slug).limit(1).get();
    
    // Attempt 2: doc ID fallback
    if (q.empty) {
      const docSnap = await postsRef.doc(slug).get();
      if (docSnap.exists) {
        console.log('[og] FETCH OK (by ID)');
        return docSnap.data();
      }
      return null;
    }

    console.log('[og] FETCH OK (by slug)');
    return q.docs[0].data();
  })();

  return Promise.race([fetchPromise, timeoutPromise]);
}

// ── 4. RENDERING HELPERS ───────────────────────────────────────────────────

function renderCard(data: any, slug: string) {
  const nameLabel = data.fullName || 'Вечен Спомен';
  const statusLabel = data.status || '';

  return new ImageResponse(
    (
      <div style={{
        width: 1200, height: 630, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', background: '#1c1917',
        color: '#ffffff', padding: 80, textAlign: 'center'
      }}>
        {/* Minimal Stable Design */}
        <h1 style={{ fontSize: 90, margin: 0, fontWeight: 'bold' }}>
          {nameLabel}
        </h1>
        
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 40, gap: 15, fontSize: 32, color: '#B08D57' }}>
          <div style={{ display: 'flex' }}>SLUG: {slug}</div>
          {statusLabel && <div style={{ display: 'flex' }}>STATUS: {statusLabel}</div>}
        </div>

        <div style={{ marginTop: 80, border: '1px solid rgba(255,255,255,0.2)', padding: '10px 20px', fontSize: 20, color: 'rgba(255,255,255,0.5)' }}>
          FOUND POST | VECENSPOMEN.MK
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

function renderErrorCard(errorType: string, message: string) {
  return new ImageResponse(
    (
      <div style={{
        width: 1200, height: 630, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', background: '#292524',
        color: '#ef4444', padding: 80, textAlign: 'center'
      }}>
        <h1 style={{ fontSize: 100, margin: 0 }}>{errorType}</h1>
        <p style={{ fontSize: 32, color: '#ffffff', marginTop: 20 }}>{message}</p>
        
        <div style={{ marginTop: 60, padding: '10px 20px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444' }}>
          DIAGNOSTIC SCREEN
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

// ── 5. MAIN HANDLER (ULTIMATE CATCH-ALL) ───────────────────────────────────

export default async function handler(req: Request) {
  console.log('[og] START');
  let currentSlug = 'none';

  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug') || '';
    currentSlug = slug;
    console.log('[og] SLUG: %s', slug);

    if (!slug) {
      console.log('[og] POST NOT FOUND');
      return renderErrorCard('POST NOT FOUND', 'No slug provided in request');
    }

    // Attempt Fetch with Timeout
    let postData: any = null;
    try {
      postData = await getPostBySlug(slug);
    } catch (fetchErr: any) {
      if (fetchErr.message === 'FETCH TIMEOUT') {
        console.error('[og] ERROR: FETCH TIMEOUT');
        return renderErrorCard('FETCH FAILED', 'Database response timed out (4s)');
      }
      throw fetchErr;
    }

    if (!postData) {
      console.log('[og] POST NOT FOUND');
      return renderErrorCard('POST NOT FOUND', `Slug "${slug}" does not exist`);
    }

    console.log('[og] POST FOUND');
    console.log('[og] RENDER START');
    const response = renderCard(postData, slug);
    console.log('[og] RENDER OK');
    return response;

  } catch (err: any) {
    const stage = err.message === 'INIT FAILED' ? 'INIT FAILED' : 'OG ERROR';
    console.error('[og] ERROR: %s %s', stage, err.message);
    return renderErrorCard(stage, err.message || 'Complete runtime failure');
  }
}
