import { ImageResponse } from '@vercel/og';

// ── REVERT TO EDGE: Optimized for speed and zero cold-start crashes ──────────
export const config = { runtime: 'edge' };

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
}

const STYLES: Record<string, StyleDef> = {
  elegant:  { symbol: '',  borderColor: STONE_900, bg: '#ffffff', symbolColor: '' },
  orthodox: { symbol: '☦', borderColor: STONE_800, bg: CREAM,     symbolColor: STONE_800 },
  catholic: { symbol: '✝', borderColor: STONE_800, bg: '#ffffff', symbolColor: STONE_800 },
  muslim:   { symbol: '☾', borderColor: STONE_800, bg: '#ffffff', symbolColor: STONE_800 },
  star:     { symbol: '★', borderColor: STONE_800, bg: '#ffffff', symbolColor: STONE_800 },
  clean:    { symbol: '',  borderColor: STONE_400, bg: '#ffffff', symbolColor: '' },
};

async function fetchWithTimeout(url: string, options: any = {}, timeout = 3000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

// ── Helper: Extract string from Firestore REST format ──────────────────────
const fsVal = (path: string, doc: any) => {
  const val = doc?.fields?.[path];
  if (!val) return '';
  return val.stringValue || val.integerValue || '';
};

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug') || '';
  const mode = searchParams.get('mode') || '';

  console.log('[og] Edge handler started. slug=%s', slug);

  // ── TEST MODE ─────────────────────────────────────────────────────────────
  if (slug === 'test-render' || searchParams.get('test') === 'true') {
     return new ImageResponse(
       <div style={{ width: 1200, height: 630, background: '#1c1917', border: '10px solid #B08D57', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
         <h1 style={{ fontSize: 80 }}>EDGE TEST SUCCESS</h1>
       </div>
     );
  }

  try {
    // ── 1. Get Project ID ──
    const saRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
    let projectId = '';
    if (saRaw) {
      try { projectId = JSON.parse(saRaw.replace(/\\n/g, '\n')).project_id; } catch {}
    }
    if (!projectId) projectId = 'tazna-vest'; // Hardcoded fallback based on file paths seen

    // ── 2. Firestore REST Fetch ──
    console.log('[og] REST FETCH START: %s', slug);
    const queryUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
    
    const queryBody = {
      structuredQuery: {
        from: [{ collectionId: 'posts' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'slug' },
            op: 'EQUAL',
            value: { stringValue: slug }
          }
        },
        limit: 1
      }
    };

    const fsRes = await fetchWithTimeout(queryUrl, {
      method: 'POST',
      body: JSON.stringify(queryBody),
      headers: { 'Content-Type': 'application/json' }
    });

    if (!fsRes.ok) {
      const errText = await fsRes.text();
      throw new Error(`Firestore REST Error: ${fsRes.status} ${errText}`);
    }

    const fsData = await fsRes.json();
    console.log('[og] REST DATA RECEIVED: records=%s', fsData?.length);

    const postDoc = fsData[0]?.document;
    if (!postDoc) {
      // Try ID fallback
       const idUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/posts/${slug}`;
       const idRes = await fetchWithTimeout(idUrl);
       if (idRes.ok) {
          const idData = await idRes.json();
          if (idData?.fields) postDoc.fields = idData.fields; // simplified merging for debug
       }
    }

    if (mode === 'trace' && postDoc) {
      return new Response(`TRACE SUCCESS: Document fields follow -> ${JSON.stringify(postDoc.fields)}`, { status: 200 });
    }

    // ── 3. Data Extraction ──
    const name      = fsVal('fullName', postDoc) || 'Вечен Спомен';
    const status    = fsVal('status', postDoc);
    const styleKey  = fsVal('selectedFrameStyle', postDoc) || 'clean';
    const pkg       = fsVal('package', postDoc) || 'Основен';
    const msg       = fsVal('aiRefinedText', postDoc) || fsVal('mainText', postDoc);

    // ── 4. Font Loading (Same as before) ──
    const [f1, f2] = await Promise.all([
      fetch('https://cdn.jsdelivr.net/npm/@fontsource/noto-serif/files/noto-serif-cyrillic-400-normal.woff2').then(r => r.arrayBuffer()),
      fetch('https://cdn.jsdelivr.net/npm/@fontsource/noto-serif/files/noto-serif-cyrillic-700-normal.woff2').then(r => r.arrayBuffer()),
    ]);

    const fonts: any[] = [
      { name: 'NotoSerif', data: f1, weight: 400, style: 'normal' },
      { name: 'NotoSerif', data: f2, weight: 700, style: 'normal' }
    ];

    // ── 5. Minimal Render ──
    return new ImageResponse(
      (
        <div style={{
          width: 1200, height: 630, display: 'flex', background: '#1c1917', color: '#fff',
          fontFamily: 'NotoSerif', padding: '0 60px', alignItems: 'center'
        }}>
           <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
             <h1 style={{ fontSize: 80, margin: 0, color: GOLD }}>{postDoc ? 'FOUND POST' : 'NOT FOUND'}</h1>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 32, marginTop: 20 }}>
               <div style={{ display: 'flex' }}><span style={{ width: 150, color: STONE_400 }}>NAME:</span> {name}</div>
               <div style={{ display: 'flex' }}><span style={{ width: 150, color: STONE_400 }}>SLUG:</span> {slug}</div>
               <div style={{ display: 'flex' }}><span style={{ width: 150, color: STONE_400 }}>STATUS:</span> {status || 'N/A'}</div>
               <div style={{ display: 'flex' }}><span style={{ width: 150, color: STONE_400 }}>PKG:</span> {pkg}</div>
             </div>
           </div>
           
           <div style={{
             width: 300, height: 400, border: '5px solid #fff', display: 'flex',
             alignItems: 'center', justifyContent: 'center', background: '#292524'
           }}>
             <span style={{ color: GOLD, fontSize: 30 }}>PHOTO</span>
           </div>
        </div>
      ),
      { width: 1200, height: 630, fonts }
    );

  } catch (err: any) {
    console.error('[og] CRITICAL ERROR:', err.message);
    return new Response(`OG CRITICAL ERROR: ${err.message}`, { status: 500 });
  }
}
