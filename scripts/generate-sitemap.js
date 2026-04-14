import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HOSTNAME = 'https://vecenspomen.mk';
const DIST_DIR = path.join(__dirname, '../dist');

async function generateSitemap() {
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID || 'vechen-spomen-mk';
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/posts?pageSize=1000`;

  const staticRoutes = [
    '/',
    '/spomeni',
    '/ceni',
    '/kako-raboti',
    '/politika-na-privatnost',
    '/uslovi'
  ];

  try {
    console.log(`[SEO] Generating sitemap for: ${HOSTNAME}...`);
    const response = await fetch(url);
    const data = await response.json();

    let dynamicRoutes = [];
    if (data.documents) {
      dynamicRoutes = data.documents
        .map(doc => {
          const fields = doc.fields || {};
          const status = fields.status?.stringValue;
          const slug = fields.slug?.stringValue;
          if (status === 'Објавено' && slug) return `/spomen/${slug}`;
          return null;
        })
        .filter(Boolean);
    }

    const allRoutes = [...staticRoutes, ...dynamicRoutes];
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(route => `  <url>
    <loc>${HOSTNAME}${route}</loc>
    <changefreq>daily</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;

    const sitemapPath = path.join(DIST_DIR, 'sitemap.xml');
    
    // Ensure dist exists (it should after build)
    if (!fs.existsSync(DIST_DIR)) {
      fs.mkdirSync(DIST_DIR, { recursive: true });
    }

    fs.writeFileSync(sitemapPath, sitemap);
    console.log(`[SEO] Successfully generated sitemap.xml with ${allRoutes.length} URLs!`);
  } catch (err) {
    console.error('[SEO] Failed to generate sitemap.xml:', err);
  }
}

generateSitemap();
