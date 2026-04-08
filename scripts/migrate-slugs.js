/**
 * migrate-slugs.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Rewrites all Firestore posts that have Cyrillic (non-ASCII-safe) slugs to
 * clean Latin slugs, and updates any relatedToSlug references pointing to the
 * old slugs.
 *
 * Usage:
 *   FIREBASE_SERVICE_ACCOUNT='<json>' node scripts/migrate-slugs.js
 *
 *   Or put FIREBASE_SERVICE_ACCOUNT in a .env file and run:
 *   node --env-file=.env scripts/migrate-slugs.js
 *
 * The script is idempotent — running it twice is safe.
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore }                  from 'firebase-admin/firestore';

// ─── Transliteration map (mirrors src/pages/SubmitPost.tsx) ──────────────────
const CYR_MAP = {
  'а':'a','б':'b','в':'v','г':'g','д':'d','ѓ':'gj','е':'e','ж':'zh',
  'з':'z','ѕ':'dz','и':'i','ј':'j','к':'k','л':'l','љ':'lj','м':'m',
  'н':'n','њ':'nj','о':'o','п':'p','р':'r','с':'s','т':'t','ќ':'kj',
  'у':'u','ф':'f','х':'h','ц':'c','ч':'ch','џ':'dj','ш':'sh',
  'А':'a','Б':'b','В':'v','Г':'g','Д':'d','Ѓ':'gj','Е':'e','Ж':'zh',
  'З':'z','Ѕ':'dz','И':'i','Ј':'j','К':'k','Л':'l','Љ':'lj','М':'m',
  'Н':'n','Њ':'nj','О':'o','П':'p','Р':'r','С':'s','Т':'t','Ќ':'kj',
  'У':'u','Ф':'f','Х':'h','Ц':'c','Ч':'ch','Џ':'dj','Ш':'sh',
};

function cyrillicToLatin(str) {
  return str.split('').map(ch => CYR_MAP[ch] ?? ch).join('');
}

function generateSlug(fullName, deathYear) {
  const base = cyrillicToLatin(fullName)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return deathYear ? `${base}-${deathYear}` : base;
}

function isLatinSlug(slug) {
  return /^[a-z0-9-]+$/.test(slug);
}

// ─── Firebase Admin init ──────────────────────────────────────────────────────
function initAdmin() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    console.error('ERROR: FIREBASE_SERVICE_ACCOUNT env var is not set.');
    console.error('Run:  FIREBASE_SERVICE_ACCOUNT=\'<json>\' node scripts/migrate-slugs.js');
    process.exit(1);
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(raw.replace(/\\n/g, '\n'));
  } catch (e) {
    console.error('ERROR: Could not parse FIREBASE_SERVICE_ACCOUNT JSON:', e.message);
    process.exit(1);
  }

  if (!getApps().length) {
    initializeApp({ credential: cert(serviceAccount) });
  }

  return getFirestore();
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function run() {
  const db = initAdmin();
  const postsRef = db.collection('posts');

  console.log('Fetching all posts from Firestore…');
  const snapshot = await postsRef.get();
  const posts = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  console.log(`Found ${posts.length} posts.`);

  // ── Pass 1: build slug mapping ────────────────────────────────────────────
  // Key: old slug → new Latin slug (only for posts that need migration)
  const slugMap = {};       // oldSlug → newSlug
  const usedSlugs = new Set();

  // Pre-populate with slugs that are already Latin (they own their slug)
  for (const post of posts) {
    if (post.slug && isLatinSlug(post.slug)) {
      usedSlugs.add(post.slug);
    }
  }

  // Compute new slugs for posts with non-Latin slugs
  for (const post of posts) {
    if (!post.slug || isLatinSlug(post.slug)) continue;

    const base = generateSlug(post.fullName || 'memorial', post.deathYear);
    let candidate = base;
    let counter = 2;
    while (usedSlugs.has(candidate)) {
      candidate = `${base}-${counter}`;
      counter++;
    }

    slugMap[post.slug] = candidate;
    usedSlugs.add(candidate);
    console.log(`  [MAP] "${post.slug}" → "${candidate}" (${post.fullName})`);
  }

  const toMigrate = Object.keys(slugMap).length;
  if (toMigrate === 0) {
    console.log('\nAll slugs are already Latin. Nothing to do.');
    return;
  }

  console.log(`\n${toMigrate} post(s) need slug migration.`);

  // ── Pass 2: update posts with new slugs ───────────────────────────────────
  console.log('\nUpdating post slugs…');
  for (const post of posts) {
    if (!post.slug || !slugMap[post.slug]) continue;

    const newSlug = slugMap[post.slug];
    await postsRef.doc(post.id).update({ slug: newSlug });
    console.log(`  [UPDATE] ${post.id}: slug="${newSlug}"`);
  }

  // ── Pass 3: update relatedToSlug references ───────────────────────────────
  console.log('\nUpdating relatedToSlug references…');
  let refCount = 0;
  for (const post of posts) {
    if (!post.relatedToSlug || !slugMap[post.relatedToSlug]) continue;

    const newRef = slugMap[post.relatedToSlug];
    await postsRef.doc(post.id).update({ relatedToSlug: newRef });
    console.log(`  [REF]    ${post.id}: relatedToSlug="${newRef}"`);
    refCount++;
  }

  console.log(`\nDone. Migrated ${toMigrate} slug(s), updated ${refCount} relatedToSlug reference(s).`);
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
