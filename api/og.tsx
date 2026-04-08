import { ImageResponse } from '@vercel/og';
import admin from 'firebase-admin';

// ── Runtime Config: nodejs is required for firebase-admin execution tracing ──
export const config = { runtime: 'nodejs' };

// ── Firebase Admin lazy singleton ───────────────────────────────────────────
let _db: admin.firestore.Firestore | null = null;

function getDb() {
  try {
    if (_db) return _db;
    
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) {
      console.error('[og] FIREBASE_SERVICE_ACCOUNT is NOT defined in environment');
      throw new Error('Missing FIREBASE_SERVICE_ACCOUNT');
    }

    console.log('[og] Found FIREBASE_SERVICE_ACCOUNT. Attempting JSON parse...');
    
    // Normalize newlines in private key
    const normalizedRaw = raw.replace(/\\n/g, '\n');
    const serviceAccount = JSON.parse(normalizedRaw);
    
    console.log('[og] Parse SUCCESS. Project ID: %s', serviceAccount.project_id);

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('[og] Firebase Admin Initialized SUCCESS');
    }

    _db = admin.firestore();
    return _db;
  } catch (err: any) {
    console.error('[og] CRITICAL INIT ERROR:', err.message);
    throw err; // Propagate to handler
  }
}

// ── Design Tokens ───────────────────────────────────────────────────────────
const GOLD        = '#B08D57';
const CREAM       = '#F7F4EB';
const STONE_900   = '#1c1917';
const STONE_800   = '#292524';
const STONE_500   = '#78716c';
const STONE_400   = '#a8a29e';
const STONE_200   = '#e7e5e4';
const STONE_100   = '#f5f5f4';

interface StyleDef {
  symbol:      string;
  borderColor: string;
  bg:          string;
  symbolColor: string;
  double:      boolean;
  dashed:      boolean;
  arcs:        boolean;
  diamonds:    boolean;
  squares:     boolean;
}

const STYLES: Record<string, StyleDef> = {
  elegant:  { symbol: '',  borderColor: STONE_900, bg: '#ffffff', symbolColor: '',        double: true,  dashed: false, arcs: false, diamonds: false, squares: false },
  orthodox: { symbol: '☦', borderColor: STONE_800, bg: CREAM,     symbolColor: STONE_800, double: false, dashed: false, arcs: true,  diamonds: false, squares: false },
  catholic: { symbol: '✝', borderColor: STONE_800, bg: '#ffffff', symbolColor: STONE_800, double: true,  dashed: false, arcs: false, diamonds: true,  squares: false },
  muslim:   { symbol: '☾', borderColor: STONE_800, bg: '#ffffff', symbolColor: STONE_800, double: false, dashed: false, arcs: false, diamonds: false, squares: true  },
  star:     { symbol: '★', borderColor: STONE_800, bg: '#ffffff', symbolColor: STONE_800, double: false, dashed: true,  arcs: false, diamonds: false, squares: false },
  clean:    { symbol: '',  borderColor: STONE_400, bg: '#ffffff', symbolColor: '',        double: false, dashed: false, arcs: false, diamonds: false, squares: false },
};

async function fetchWithTimeout(url: string, timeout = 2500): Promise<ArrayBuffer | null> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch (e) {
    clearTimeout(id);
    return null;
  }
}

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug') || '';
  const mode = searchParams.get('mode') || ''; // e.g. 'trace'
  const isHardcodedTest = searchParams.get('test') === 'true' || searchParams.get('name') === 'TEST OG';

  console.log('[og] handler started. slug=%s mode=%s', slug, mode);

  // ── Hardcoded Test Path (Zero dependencies, bypasses fetch) ───────────────
  if (isHardcodedTest) {
    console.log('[og] Returning hardcoded TEST OG');
    return new ImageResponse(
      (
        <div style={{
          width: 1200, height: 630, background: '#1c1917', border: '20px solid #B08D57',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ffffff',
        }}>
          <h1 style={{ fontSize: 120, margin: 0 }}>TEST OG</h1>
          <p style={{ fontSize: 40, color: '#B08D57' }}>RENDER TREE IS ALIVE (Hardcoded)</p>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  try {
    // ── 1. Firestore Fetch Phase ───────────────────────────────────────────
    let db;
    try {
      db = getDb();
      if (!db) throw new Error('Firestore connection failed (Admin Init returned null)');
    } catch (initErr: any) {
      console.error('[og] Handler: Firebase Init Crash:', initErr.message);
      return new Response(`CRITICAL INIT FAILURE: ${initErr.message}`, { status: 500 });
    }

    let post: any = null;
    let traceData = { found: false, source: 'none', status: '' };

    try {
      if (slug) {
        console.log('[og] FETCH START: collection=posts slug=%s', slug);
        const q = await db.collection('posts').where('slug', '==', slug).limit(1).get();
        console.log('[og] SNAPSHOT RECEIVED: empty=%s docs=%s', q.empty, q.docs.length);
        
        if (!q.empty) {
          post = q.docs[0].data();
          traceData = { found: true, source: 'slug_field', status: post.status };
        } else {
          console.log('[og] Not found by slug field, trying doc ID...');
          const docSnap = await db.collection('posts').doc(slug).get();
          if (docSnap.exists) {
            post = docSnap.data();
            traceData = { found: true, source: 'doc_id', status: post.status };
          }
        }
      }
    } catch (fetchErr: any) {
      console.error('[og] Handler: Firebase Fetch Crash:', fetchErr.message);
      return new Response(`FETCH FAILURE: ${fetchErr.message}`, { status: 500 });
    }

    console.log('[og] DOCUMENT VALIDATION: %j', traceData);

    // ── 2. Forced Trace Return Branch ──────────────────────────────────────
    if (mode === 'trace' && post) {
      console.log('[og] TRACE SUCCESS branch triggered');
      return new ImageResponse(
        (
          <div style={{
            width: 1200, height: 630, background: '#000000',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00ff00',
          }}>
            <h1 style={{ fontSize: 100 }}>FETCH SUCCESS</h1>
            <p style={{ fontSize: 30 }}>Status: {post.status} | Slug: {slug}</p>
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    // ── 3. Data Extraction (Watch for silent errors) ───────────────────────
    const name      = post?.fullName || 'Вечен Спомен';
    const birthYear = post?.birthYear || '';
    const deathYear = post?.deathYear || '';
    const city      = post?.city || '';
    const lovedBy   = post?.familyNote || post?.senderName || '';
    const pkg       = post?.package || 'Основен';
    const message   = post?.aiRefinedText || post?.mainText || '';
    const status    = post?.status || '';
    const styleKey  = (pkg === 'Основен' ? 'clean' : post?.selectedFrameStyle) || 'clean';
    
    // ── 4. Font Loading Phase ──────────────────────────────────────────────
    console.log('[og] FONT FETCH START');
    const [fontNormal, fontBold] = await Promise.all([
      fetchWithTimeout('https://cdn.jsdelivr.net/npm/@fontsource/noto-serif/files/noto-serif-cyrillic-400-normal.woff2'),
      fetchWithTimeout('https://cdn.jsdelivr.net/npm/@fontsource/noto-serif/files/noto-serif-cyrillic-700-normal.woff2'),
    ]);
    console.log('[og] FONT FETCH DONE: normal=%s bold=%s', !!fontNormal, !!fontBold);

    const fonts: any[] = [];
    if (fontNormal) fonts.push({ name: 'NotoSerif', data: fontNormal, weight: 400, style: 'normal' });
    if (fontBold)   fonts.push({ name: 'NotoSerif', data: fontBold,   weight: 700, style: 'normal' });
    const serif = fonts.length ? 'NotoSerif' : 'serif';

    // ── 5. Minimal Data Render (No complex CSS, No transforms) ─────────────
    console.log('[og] FINAL RENDER START');
    return new ImageResponse(
      (
        <div style={{
          width: 1200, height: 630, display: 'flex', flexDirection: 'row',
          fontFamily: serif, position: 'relative', overflow: 'hidden',
          background: '#1c1917', color: '#ffffff',
        }}>
          {/* Diagnostic Overlay */}
          <div style={{
            position: 'absolute', top: 20, right: 20, background: 'rgba(0,255,0,0.1)',
            padding: '5px 10px', fontSize: 12, border: '1px solid #00ff00', color: '#00ff00',
            display: 'flex'
          }}>
            SYSTEM: NODEJS | TRACE: ACTIVE
          </div>

          {/* LEFT: Placeholder */}
          <div style={{
            width: 400, height: 630, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRight: '2px solid #B08D57', background: '#292524',
          }}>
            <div style={{
              width: 250, height: 350, border: '5px solid #ffffff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', color: '#B08D57',
            }}>
              <span style={{ fontSize: 24, fontWeight: 'bold' }}>PHOTO</span>
              <span style={{ fontSize: 16 }}>PLACEHOLDER</span>
            </div>
          </div>

          {/* RIGHT: Content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 60px' }}>
            <h1 style={{ fontSize: 80, margin: '0 0 10px 0', display: 'flex' }}>
              {post ? 'FOUND POST' : 'POST NOT FOUND'}
            </h1>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 32 }}>
               <div style={{ display: 'flex' }}><span style={{ color: GOLD, width: 140 }}>NAME:</span> {name}</div>
               <div style={{ display: 'flex' }}><span style={{ color: GOLD, width: 140 }}>SLUG:</span> {slug}</div>
               <div style={{ display: 'flex' }}><span style={{ color: GOLD, width: 140 }}>STATUS:</span> {status || 'N/A'}</div>
               <div style={{ display: 'flex' }}><span style={{ color: GOLD, width: 140 }}>STYLE:</span> {styleKey}</div>
            </div>

            {post && (
               <div style={{ marginTop: 40, borderTop: `1px solid ${STONE_800}`, paddingTop: 20, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 16, color: STONE_500, textTransform: 'uppercase', letterSpacing: 2 }}>Trace Metadata</span>
                  <span style={{ fontSize: 14, color: STONE_400 }}>Source: {traceData.source} | Package: {pkg}</span>
               </div>
            )}
          </div>
        </div>
      ),
      { width: 1200, height: 630, fonts }
    );

  } catch (err: any) {
    console.error('[og] CRITICAL ERROR:', err.message);
    return new ImageResponse(
      (
        <div style={{
          width: 1200, height: 630, background: '#ff0000',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: '#ffffff', padding: 60, textAlign: 'center'
        }}>
          <h1 style={{ fontSize: 100, margin: 0 }}>OG ERROR</h1>
          <p style={{ fontSize: 32, marginTop: 20, maxWidth: 1000 }}>{err.message}</p>
          <div style={{ marginTop: 40, fontSize: 18, color: 'rgba(255,255,255,0.7)' }}>
            Stack: {err.stack?.split('\n')[0]}
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
}
