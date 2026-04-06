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
    return res.status(400).send('Missing slug');
  }

  const db = getDb();
  if (!db) return res.status(500).send('Firebase Init Failed');

  try {
    // 1. Fetch post by slug
    const postsRef = db.collection('posts');
    const q = await postsRef.where('slug', '==', slug).limit(1).get();

    if (q.empty) {
      // Fallback: search by ID if it looks like an ID
      const doc = await postsRef.doc(slug).get();
      if (!doc.exists) return res.status(404).send('Post not found');
      return serveMeta(doc.id, doc.data(), res);
    }

    const doc = q.docs[0];
    return serveMeta(doc.id, doc.data(), res);

  } catch (err) {
    console.error('[Preview API] Error fetching post:', err);
    return res.status(500).send('Internal Server Error');
  }
}

function serveMeta(id, post, res) {
  const title = `Во Вечен Спомен — ${post.fullName}`;
  const description = post.introText || post.mainText || 'Меморијална објава на порталот Вечен Спомен.';
  const shareImageUrl = post.shareImageUrl || 'https://vecenspomen.mk/og-placeholder.jpg';
  const publicUrl = `https://vecenspomen.mk/spomen/${post.slug || id}`;

  // We return a simple HTML page with ONLY the meta tags and a redirect.
  // This is what the Facebook Scraper will see.
  const html = `
<!DOCTYPE html>
<html lang="mk">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${publicUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${shareImageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale" content="mk_MK">

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${publicUrl}">
  <meta property="twitter:title" content="${title}">
  <meta property="twitter:description" content="${description}">
  <meta property="twitter:image" content="${shareImageUrl}">

  <!-- Redirect for real users -->
  <meta http-equiv="refresh" content="0; url=${publicUrl}">
</head>
<body>
  <p>Ве пренасочуваме кон објавата... <a href="${publicUrl}">Кликнете овде ако не се случи автоматски.</a></p>
  <script>window.location.href = "${publicUrl}";</script>
</body>
</html>
  `;

  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}
