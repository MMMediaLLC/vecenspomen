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
 */
function safeDecodeSlug(raw) {
  if (!raw) return raw;
  try {
    const once = decodeURIComponent(raw);
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

  if (!db) {
    console.warn('[Preview API] Firebase unavailable — serving generic fallback');
    return serveGenericMeta(rawSlug, baseUrl, res);
  }

  const slug = safeDecodeSlug(rawSlug);
  console.log('[Preview API] slug raw=%s decoded=%s', rawSlug, slug);

  try {
    const postsRef = db.collection('posts');

    let q = await postsRef.where('slug', '==', slug).limit(1).get();

    if (q.empty && rawSlug !== slug) {
      console.log('[Preview API] Querying: slug == %s (raw)', rawSlug);
      q = await postsRef.where('slug', '==', rawSlug).limit(1).get();
    }

    if (q.empty) {
      console.log('[Preview API] Not found by field, checking doc ID: %s', slug);
      const docSnap = await postsRef.doc(slug).get();
      if (!docSnap.exists) {
        console.warn('[Preview API] Post not found for slug/ID:', slug);
        return serveGenericMeta(slug, baseUrl, res);
      }
      return serveMeta(docSnap.id, docSnap.data(), baseUrl, res);
    }

    const postDoc = q.docs[0];
    console.log('[Preview API] Found: %s status=%s fullName=%s', postDoc.id, postDoc.data().status, postDoc.data().fullName);
    return serveMeta(postDoc.id, postDoc.data(), baseUrl, res);

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
  const url = slug ? `${baseUrl}/spomen/${slug}` : baseUrl;

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

  // FIX: Truncate message and intro to 200 chars to prevent oversized URLs
  const rawMessage = post.aiRefinedText || post.mainText || '';
  const rawIntro = post.introText || '';

  const image = ogImageUrl(baseUrl, {
    slug: post.slug || id,
    name: post.fullName,
    birthYear: post.birthYear,
    deathYear: post.deathYear || (post.dateOfDeath ? new Date(post.dateOfDeath).getFullYear() : ''),
    city: post.city,
    lovedBy: post.familyNote || post.senderName,
    style: post.selectedFrameStyle || 'elegant',
    package: post.package || 'Основен',
    message: rawMessage.slice(0, 200),
    photo: post.photoUrl || '',
    type: post.type || 'ТАЖНА ВЕСТ',
    intro: rawIntro.slice(0, 200),
  });

  const url = `${baseUrl}/spomen/${post.slug || id}`;

  const html = buildHtml(title, description, image, url);
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 'public, max-age=300');
  return res.status(200).send(html);
}

function buildHtml(title, description, image, url) {
  const esc = (s) => String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return `<!DOCTYPE html>
<html lang="mk">
<head>
  <meta charset="UTF-8">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${esc(url)}">

  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Вечен Спомен">
  <meta property="og:url" content="${esc(url)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:image" content="${esc(image)}">
  <meta property="og:image:secure_url" content="${esc(image)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale" content="mk_MK">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${esc(url)}">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${esc(image)}">

  <meta http-equiv="refresh" content="0; url=${esc(url)}">
</head>
<body>
  <p>Ве пренасочуваме... <a href="${esc(url)}">Кликнете овде</a></p>
  <script>window.location.href="${esc(url)}";</script>
</body>
</html>`;
}