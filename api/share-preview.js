// api/share-preview.js
// Called by middleware.js for social media bots visiting /spomen/:slug
// Returns HTML with proper OG meta tags so Facebook/Viber/etc. pick up the preview image

export default async function handler(req, res) {
  const slug = req.query.slug;
  if (!slug) return res.status(400).send('Missing slug');

  const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
  const apiKey    = process.env.VITE_FIREBASE_API_KEY;
  const baseUrl   = (process.env.VITE_APP_URL || 'https://vecenspomen.mk').replace(/\/$/, '');

  let post = null;

  try {
    // Query Firestore REST API — find post by slug where status == Објавено
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery?key=${apiKey}`;
    const body = {
      structuredQuery: {
        from: [{ collectionId: 'posts' }],
        where: {
          compositeFilter: {
            op: 'AND',
            filters: [
              { fieldFilter: { field: { fieldPath: 'slug' }, op: 'EQUAL', value: { stringValue: slug } } },
              { fieldFilter: { field: { fieldPath: 'status' }, op: 'EQUAL', value: { stringValue: 'Објавено' } } },
            ],
          },
        },
        limit: 1,
      },
    };

    const firestoreRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const results = await firestoreRes.json();
    const doc = results?.[0]?.document;

    if (doc?.fields) {
      const f = doc.fields;
      // Extract postId from the Firestore document name: .../documents/posts/{postId}
      const postId = doc.name?.split('/').pop() || null;
      post = {
        fullName:  f.fullName?.stringValue  || '',
        type:      f.type?.stringValue      || '',
        city:      f.city?.stringValue      || '',
        birthYear: f.birthYear?.integerValue || '',
        deathYear: f.deathYear?.integerValue || '',
        mainText:  f.mainText?.stringValue  || '',
        slug:      f.slug?.stringValue      || slug,
        // Construct OG image URL from postId — no token, requires public Storage rules
        ogImageUrl: postId
          ? `https://firebasestorage.googleapis.com/v0/b/${projectId}.firebasestorage.app/o/og-images%2F${postId}.png?alt=media`
          : (f.ogImageUrl?.stringValue || null),
      };
    }
  } catch (err) {
    console.error('[share-preview] Firestore error:', err);
  }

  const pageUrl = `${baseUrl}/spomen/${encodeURIComponent(slug)}`;
  const title   = post ? `Во спомен на ${post.fullName}, почивај во мир.` : 'Вечен Спомен';
  const desc    = post
    ? `${post.type} · ${post.city}${post.birthYear ? ` · ${post.birthYear}–${post.deathYear}` : ''}`
    : 'Меморијал на vecenspomen.mk';
  const image   = post?.ogImageUrl || `${baseUrl}/og-default.png`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(`<!DOCTYPE html>
<html lang="mk">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <meta property="og:type"        content="article" />
  <meta property="og:url"         content="${pageUrl}" />
  <meta property="og:title"       content="${title}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:image"       content="${image}" />
  <meta property="og:image:width"  content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:locale"      content="mk_MK" />
  <meta property="og:site_name"   content="Вечен Спомен" />
  <meta name="twitter:card"       content="summary_large_image" />
  <meta name="twitter:image"      content="${image}" />
  <meta http-equiv="refresh"      content="0; url=${pageUrl}" />
</head>
<body>
  <a href="${pageUrl}">${title}</a>
</body>
</html>`);
}
