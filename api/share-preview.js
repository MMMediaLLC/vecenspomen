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

  if (!rawSlug) {
    return serveGenericMeta(null, res);
  }

  const db = getDb();

  // If Firebase is unavailable, serve a generic fallback so Facebook
  // at least gets a 200 with valid OG tags instead of a 500.
  if (!db) {
    console.warn('[Preview API] Firebase unavailable — serving generic fallback');
    return serveGenericMeta(rawSlug, res);
  }

  const slug = safeDecodeSlug(rawSlug);
  console.log('[Preview API] slug raw=%s decoded=%s', rawSlug, slug);

  try {
    const postsRef = db.collection('posts');

    // 1. Exact slug field match (handles both Latin and legacy Cyrillic slugs)
    let q = await postsRef.where('slug', '==', slug).limit(1).get();

    // 2. Try the raw value too in case decoding changed something unexpectedly
    if (q.empty && rawSlug !== slug) {
      q = await postsRef.where('slug', '==', rawSlug).limit(1).get();
    }

    // 3. Fall back to Firestore doc ID
    if (q.empty) {
      const docSnap = await postsRef.doc(slug).get();
      if (!docSnap.exists) {
        console.warn('[Preview API] Post not found for slug:', slug);
        return serveGenericMeta(slug, res);
      }
      return serveMeta(docSnap.id, docSnap.data(), res);
    }

    return serveMeta(q.docs[0].id, q.docs[0].data(), res);

  } catch (err) {
    console.error('[Preview API] Error fetching post:', err);
    return serveGenericMeta(slug, res);
  }
}

function ogImageUrl(params = {}) {
  const base = 'https://vecenspomen.mk/api/og';
  const qs = Object.entries(params)
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');
  return qs ? `${base}?${qs}` : base;
}

function serveGenericMeta(slug, res) {
  const title = 'Вечен Спомен — Меморијален портал';
  const description = 'Достоинствени меморијални објави за починати. Последни поздрави, сочувства и пригодни пораки.';
  const image = ogImageUrl({ name: 'Вечен Спомен' });
  const url = slug
    ? `https://vecenspomen.mk/spomen/${slug}`
    : 'https://vecenspomen.mk';

  const html = buildHtml(title, description, image, url);
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 'public, max-age=60');
  return res.status(200).send(html);
}

function serveMeta(id, post, res) {
  const years = [post.birthYear, post.deathYear].filter(Boolean).join(' – ');
  const yearsPart = years ? ` (${years})` : '';
  const cityPart = post.city ? ` од ${post.city}` : '';
  const title = `Во Вечен Спомен — ${post.fullName}${yearsPart}`;
  const description = post.introText
    || `Меморијална објава за ${post.fullName}${cityPart}. ${post.mainText || ''}`.trim();

  // Always generate the OG image via /api/og with the post's actual data.
  // Stored shareImageUrl / photoUrl are used as fallbacks only when og endpoint might fail.
  const image = ogImageUrl({
    name:      post.fullName,
    birthYear: post.birthYear,
    deathYear: post.deathYear || (post.dateOfDeath ? new Date(post.dateOfDeath).getFullYear() : ''),
    city:      post.city,
    lovedBy:   post.familyNote || post.senderName,
    photo:     post.photoUrl || '',
    style:     post.selectedFrameStyle || 'klasicen',
  });

  const url = `https://vecenspomen.mk/spomen/${post.slug || id}`;

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
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Вечен Спомен">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">
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
