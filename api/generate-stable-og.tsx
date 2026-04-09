import { ImageResponse } from '@vercel/og';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

export const config = { runtime: 'nodejs' };

// --- Self-Contained Design Tokens (to avoid import issues in Vercel Node runtime) ---
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

const STYLE_MAP: any = {
  pravoslaven: { symbol: '☦', internalStyle: 'orthodox', borderColor: '#1c1917', accentColor: '#B08D57' },
  katolicki: { symbol: '✝', internalStyle: 'catholic', borderColor: '#1c1917', accentColor: '#B08D57' },
  muslimanski: { symbol: '☾', internalStyle: 'muslim', borderColor: '#1c1917', accentColor: '#B08D57' },
  socijalisticki: { symbol: '★', internalStyle: 'star', borderColor: '#1c1917', accentColor: '#B08D57' },
  klasicen: { symbol: '', internalStyle: 'elegant', borderColor: '#1c1917', accentColor: '#B08D57' },
  emotiven: { symbol: '', internalStyle: 'clean', borderColor: '#1c1917', accentColor: '#B08D57' },
};

// --- Inlined HorizontalOG Component ---
const HorizontalOG = ({ post }: { post: any }) => {
  const selectedStyle = post.selectedFrameStyle || 'klasicen';
  const styleConfig = STYLE_MAP[selectedStyle] || STYLE_MAP.klasicen;
  const isPremium = post.package === 'Истакнат';
  const typeLabel = post.type || 'ТАЖНА ВЕСТ';
  const years = [post.birthYear, post.deathYear].filter(Boolean).join(' – ');
  const message = (post.aiRefinedText || post.mainText || 'Почивај во мир.').slice(0, 200);

  return (
    <div style={{
      width: '1200px', height: '630px', display: 'flex', background: COLORS.stone50,
      fontFamily: '"Lora"', position: 'relative', padding: '40px', boxSizing: 'border-box',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'white', opacity: 0.5, display: 'flex' }} />
      <div style={{
        width: '1120px', height: '550px', background: 'white', display: 'flex',
        border: `1px solid ${COLORS.stone200}`, boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          width: '35%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '40px', background: COLORS.stone50,
        }}>
          <div style={{ width: '320px', height: '440px', display: 'flex', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.1)', transform: 'rotate(2deg) scale(1.05)', display: 'flex' }} />
            <div style={{ width: '100%', height: '100%', background: 'white', padding: '8px', border: `1px solid ${COLORS.stone200}`, display: 'flex', position: 'relative' }}>
              {post.photoUrl ? (
                <img src={post.photoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: COLORS.stone100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: COLORS.stone300, fontSize: '24px', letterSpacing: '8px' }}>ТИШИНА</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={{
          width: '65%', height: '100%', display: 'flex', flexDirection: 'column',
          padding: '60px 60px 60px 20px', justifyContent: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ width: '40px', height: '2px', background: COLORS.gold, marginRight: '15px' }} />
            <span style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '5px', color: COLORS.stone500, textTransform: 'uppercase' }}>{typeLabel}</span>
          </div>
          <h1 style={{ fontSize: isPremium ? '64px' : '56px', fontWeight: isPremium ? 700 : 400, color: COLORS.stone900, margin: '0 0 10px 0', lineHeight: 1.1 }}>{post.fullName}</h1>
          <div style={{ fontSize: '24px', letterSpacing: '4px', color: COLORS.stone500, marginBottom: '30px', display: 'flex' }}>{years}</div>
          <div style={{ fontSize: '22px', fontStyle: 'italic', color: COLORS.stone700, lineHeight: 1.5, marginBottom: '40px', maxWidth: '100%', display: 'flex' }}>„{message}“</div>
          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: `1px solid ${COLORS.stone100}`, paddingTop: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: COLORS.stone400, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '5px' }}>Со љубов и почит од:</span>
              <span style={{ fontSize: '22px', color: COLORS.stone900, fontWeight: 700 }}>{post.familyNote || post.senderName || 'Најблиските'}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
               <span style={{ fontSize: '18px', fontWeight: 900, color: COLORS.stone900, opacity: 0.8, letterSpacing: '-1px' }}>VECENSPOMEN.MK</span>
            </div>
          </div>
        </div>
        {styleConfig.symbol && (
          <div style={{ position: 'absolute', top: '20px', right: '25px', fontSize: '40px', color: COLORS.gold, display: 'flex' }}>{styleConfig.symbol}</div>
        )}
        {isPremium && (
          <div style={{ position: 'absolute', inset: '15px', border: `1px solid ${COLORS.gold}44`, pointerEvents: 'none', display: 'flex' }}>
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

export default async function handler(req: any) {
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
