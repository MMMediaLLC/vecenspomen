import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Оваа скрипта ги влече сите 'slugs' од Firestore за да знае SSG пререндерерот
 * кои индивидуални страници треба да ги генерира како статичен HTML.
 */
async function getFirestoreRoutes() {
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID || 'vechen-spomen-mk';
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/posts?pageSize=1000`;

  const staticRoutes = [
    '/',
    '/pochinati',
    '/ceni',
    '/kako-raboti',
    '/politika-na-privatnost',
    '/uslovi'
  ];

  try {
    console.log(`[SSG] Влечам податоци од Firestore за проектот: ${projectId}...`);
    const response = await fetch(url);
    const data = await response.json();

    if (!data.documents) {
      console.warn('[SSG] Нема пронајдено документи во Firestore. Проверете ги клучовите.');
      return staticRoutes;
    }

    const dynamicRoutes = data.documents
      .map(doc => {
        const fields = doc.fields || {};
        const status = fields.status?.stringValue;
        const slug = fields.slug?.stringValue;
        
        if (status === 'Објавено' && slug) {
          return `/spomen/${slug}`;
        }
        return null;
      })
      .filter(Boolean);

    const allRoutes = [...staticRoutes, ...dynamicRoutes];
    console.log(`[SSG] Успешно пронајдени ${allRoutes.length} рути за пререндерирање.`);
    
    return allRoutes;
  } catch (err) {
    console.error('[SSG] Грешка при вчитување на Firestore рутите:', err);
    return staticRoutes;
  }
}

export { getFirestoreRoutes };
