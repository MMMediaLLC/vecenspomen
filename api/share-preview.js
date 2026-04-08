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

export default async function handler(req, res) {
  const { slug } = req.query;

  if (!slug) {
    return serveGenericMeta(null, res);
  }

  const db = getDb();

  // If Firebase is unavailable, serve a generic fallback so Facebook
  // at least gets a 200 with valid OG tags instead of a 500.
  if (!db) {
    console.warn('[Preview API] Firebase unavailable — serving generic fallback');
    return serveGenericMeta(slug, res);
  }

  try {
    const postsRef = db.collection('posts');
    const q = await postsRef.where('slug', '==', slug).limit(1).get();

    if (q.empty) {
      const doc = await postsRef.doc(slug).get();
      if (!doc.exists) return serveGenericMeta(slug, res);
      return serveMeta(doc.id, doc.data(), res);
    }

    return serveMeta(q.docs[0].id, q.docs[0].data(), res);

  } catch (err) {
    console.error('[Preview API] Error fetching post:', err);
    return serveGenericMeta(slug, res);
  }
}

function serveGenericMeta(slug, res) {
  const title = 'Вечен Спомен — Меморијален портал';
  const description = 'Достоинствени меморијални објави за починати. Последни поздрави, сочувства и пригодни пораки.';
  const image = 'https://vecenspomen.mk/og-placeholder.jpg';
  const url = slug
    ? `https://vecenspomen.mk/spomen/${slug}`
    : 'https://vecenspomen.mk';

  const html = buildHtml(title, description, image, url);
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 'public, max-age=60');
  return res.status(200).send(html);
}

function serveMeta(id, post, res) {
  const years = [post.birthYear, post.deathYear].filter(Boolean).join(' - ');
  const yearsPart = years ? ` (${years})` : '';
  const cityPart = post.city ? ` од ${post.city}` : '';
  const title = `Во Вечен Спомен — ${post.fullName}${yearsPart}`;
  const description = post.introText
    || `Меморијална објава за ${post.fullName}${cityPart}. ${post.mainText || ''}`.trim();
  const image = post.shareImageUrl || post.photoUrl || 'https://vecenspomen.mk/og-placeholder.jpg';
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
