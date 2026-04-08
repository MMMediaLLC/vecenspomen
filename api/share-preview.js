import admin from 'firebase-admin';

// ─── Firebase Admin lazy singleton ───────────────────────────────────────────
let _db = null;

function getDb() {
  if (_db) return _db;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    console.error('[Preview API/FB] FIREBASE_SERVICE_ACCOUNT is not set');
    return null;
  }

  try {
    const serviceAccount = JSON.parse(raw.replace(/\\n/g, '\n'));

    if (!serviceAccount.project_id) {
      console.error('[Preview API/FB] Service account missing project_id');
      return null;
    }

    if (!admin.apps.length) {
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
      console.log('[Preview API/FB] Admin SDK initialized:', serviceAccount.project_id);
    }

    _db = admin.firestore();
    return _db;
  } catch (err) {
    console.error('[Preview API/FB] Init failed:', err.message);
    return null;
  }
}

/**
 * Safely decode a slug that may have been percent-encoded once or twice.
 * After migration all slugs are plain Latin, but this handles legacy URLs.
 */
function safeDecodeSlug(raw) {
  if (!raw) return raw;
  try {
    const once = decodeURIComponent(raw);
    // If the result still looks percent-encoded (legacy double-encode), decode again
    if (once !== raw && /%[0-9A-Fa-f]{2}/.test(once)) {
      try { return decodeURIComponent(once); } catch { return once; }
    }
    return once;
  } catch {
    return raw;
  }
}

export default async function handler(req, res) {
  const { slug: rawSlug } = req.query;
  const baseUrl = getBaseUrl(req);

  console.log('[Preview API] Collection: posts');
  
  if (!rawSlug) {
    console.log('[Preview API] No slug provided, serving generic meta');
    return serveGenericMeta(null, baseUrl, res);
  }

  const db = getDb();

  // If Firebase is unavailable, serve a generic fallback so Facebook
  // at least gets a 200 with valid OG tags instead of a 500.
  if (!db) {
    console.warn('[Preview API] Firebase unavailable — serving generic fallback');
    return serveGenericMeta(rawSlug, baseUrl, res);
  }

  const slug = safeDecodeSlug(rawSlug);
  console.log('[Preview API] slug raw=%s decoded=%s', rawSlug, slug);

  try {
    const postsRef = db.collection('posts');

    // 1. Exact slug field match (handles both Latin and legacy Cyrillic slugs)
    console.log('[Preview API] Querying: slug == %s', slug);
    let q = await postsRef.where('slug', '==', slug).limit(1).get();

    // 2. Try the raw value too in case decoding changed something unexpectedly
    if (q.empty && rawSlug !== slug) {
      console.log('[Preview API] Querying: slug == %s (raw)', rawSlug);
      q = await postsRef.where('slug', '==', rawSlug).limit(1).get();
    }

    // 3. Fall back to Firestore doc ID
    if (q.empty) {
      console.log('[Preview API] Not found by field, checking doc ID: %s', slug);
      const docSnap = await postsRef.doc(slug).get();
      if (!docSnap.exists) {
        console.warn('[Preview API] Post not found for slug/ID:', slug);
        return serveGenericMeta(slug, baseUrl, res);
      }
      
      const postData = docSnap.data();
      console.log('[Preview API] Found by doc ID: %s, data status: %s', docSnap.id, postData.status);
      return serveMeta(docSnap.id, postData, baseUrl, res);
    }

    const postDoc = q.docs[0];
    const postData = postDoc.data();
    console.log('[Preview API] Found by slug field: %s, data status: %s, fullName: %s', postDoc.id, postData.status, postData.fullName);
    
    return serveMeta(postDoc.id, postData, baseUrl, res);

  } catch (err) {
    console.error('[Preview API] Error fetching post:', err);
    return serveGenericMeta(slug, baseUrl, res);
  }
}

function getBaseUrl(req) {
  if (process.env.PUBLIC_SITE_URL) {
    return process.env.PUBLIC_SITE_URL.replace(/\/$/, '');
  }
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers.host;
  return `${protocol}://${host}`;
}

function ogImageUrl(baseUrl, params = {}) {
  const base = `${baseUrl}/api/og`;
  const qs = Object.entries(params)
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');
  return qs ? `${base}?${qs}` : base;
}

function serveGenericMeta(slug, baseUrl, res) {
  const title = 'Вечен Спомен — Меморијален портал';
  const description = 'Достоинствени меморијални објави за починати. Последни поздрави, сочувства и пригодни пораки.';
  const image = ogImageUrl(baseUrl, { name: 'Вечен Спомен' });
  const url = slug
    ? `${baseUrl}/spomen/${slug}`
    : `${baseUrl}`;

  const html = buildHtml(title, description, image, url);
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 'public, max-age=60');
  return res.status(200).send(html);
}

function serveMeta(id, post, baseUrl, res) {
  const years = [post.birthYear, post.deathYear].filter(Boolean).join(' – ');
  const yearsPart = years ? ` (${years})` : '';
  const cityPart = post.city ? ` од ${post.city}` : '';
  const title = `Во Вечен Спомен — ${post.fullName}${yearsPart}`;
  const description = post.introText
    || `Меморијална објава за ${post.fullName}${cityPart}. ${post.mainText || ''}`.trim();

  // Always generate the OG image via /api/og with the post's actual data.
  const image = ogImageUrl(baseUrl, {
    name:      post.fullName,
    birthYear: post.birthYear,
    deathYear: post.deathYear || (post.dateOfDeath ? new Date(post.dateOfDeath).getFullYear() : ''),
    city:      post.city,
    lovedBy:   post.familyNote || post.senderName,
    photo:     post.photoUrl || '',
    style:     post.selectedFrameStyle || 'elegant',
    package:   post.package || 'Основен',
    message:   post.aiRefinedText || post.mainText || '',
    status:    post.status || '',
  });

  const url = `${baseUrl}/spomen/${post.slug || id}`;

  const html = buildHtml(title, description, image, url);
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 'public, max-age=300');
  return res.status(200).send(html);
}

function buildHtml(title, description, image, url) {
  return `<!DOCTYPE html>
<html lang="mk">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${url}">
  
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Вечен Спомен">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:secure_url" content="${image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale" content="mk_MK">
  
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${url}">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">
  
  <meta http-equiv="refresh" content="0; url=${url}">
</head>
<body>
  <p>Ве пренасочуваме... <a href="${url}">Кликнете овде</a></p>
  <script>window.location.href="${url}";</script>
</body>
</html>`;
}
