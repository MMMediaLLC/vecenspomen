/**
 * Local QA script for Facebook share preview pipeline.
 * Run: node scripts/qa-og.mjs
 * Requires: vercel dev running on port 3000 (or VERCEL_DEV_PORT env var)
 */

const BASE = `http://localhost:${process.env.VERCEL_DEV_PORT || 3000}`;
const PASS = '\x1b[32m✓\x1b[0m';
const FAIL = '\x1b[31m✗\x1b[0m';
const WARN = '\x1b[33m⚠\x1b[0m';

let totalPass = 0, totalFail = 0, totalWarn = 0;

function pass(msg)  { console.log(`  ${PASS} ${msg}`); totalPass++; }
function fail(msg)  { console.log(`  ${FAIL} ${msg}`); totalFail++; }
function warn(msg)  { console.log(`  ${WARN} ${msg}`); totalWarn++; }
function section(t) { console.log(`\n\x1b[1m${t}\x1b[0m`); }

// ─── helpers ──────────────────────────────────────────────────────────────────

async function get(path) {
  const res = await fetch(`${BASE}${path}`, { redirect: 'follow' });
  return res;
}

function checkMeta(html, property, label) {
  const re = new RegExp(`<meta[^>]+(property|name)="${escapeRe(property)}"[^>]*content="([^"]*)"`, 'i');
  const m  = re.exec(html) || (new RegExp(`content="([^"]*)"[^>]*(property|name)="${escapeRe(property)}"`, 'i')).exec(html);
  if (!m) { fail(`Missing: ${label || property}`); return null; }
  const val = m[2] || m[1];
  pass(`${label || property}: "${val.slice(0, 80)}${val.length > 80 ? '…' : ''}"`);
  return val;
}

function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function buildOgUrl(params) {
  const qs = new URLSearchParams(params).toString();
  return `/api/og?${qs}`;
}

// ─── TEST 1: /api/og image rendering ─────────────────────────────────────────

async function testOgImage(label, params) {
  const url = buildOgUrl(params);
  try {
    const res = await get(url);
    const ct  = res.headers.get('content-type') || '';
    if (res.status !== 200)       { fail(`[${label}] HTTP ${res.status}`); return; }
    if (!ct.startsWith('image/')) { fail(`[${label}] Wrong content-type: ${ct}`); return; }
    const buf  = await res.arrayBuffer();
    const size = buf.byteLength;
    if (size < 5000) { fail(`[${label}] Response too small (${size}b) — likely fallback`); }
    else             { pass(`[${label}] ${ct}, ${(size/1024).toFixed(0)}KB`); }
  } catch (e) {
    fail(`[${label}] Fetch error: ${e.message}`);
  }
}

async function runOgTests() {
  section('1. /api/og — Image rendering');

  const photo = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400';

  // Standard case
  await testOgImage('standard', {
    name: 'Петар Петровски', type: 'ТАЖНА ВЕСТ',
    birthYear: '1954', deathYear: '2024', city: 'Скопје',
    style: 'elegant', package: 'Основен', photo,
    message: 'Со длабока тага ве известуваме дека почина нашиот сакан татко.',
    intro: 'Семејството Петровски со тага соопштува:'
  });

  // Premium
  await testOgImage('premium + orthodox', {
    name: 'Мариjа Јовановска', type: 'ТАЖНА ВЕСТ',
    birthYear: '1948', deathYear: '2024', city: 'Битола',
    style: 'orthodox', package: 'Истакнат', photo,
    message: 'Почивај во мир во Господа.'
  });

  // All style variants
  for (const style of ['orthodox','catholic','muslim','star','elegant','clean']) {
    await testOgImage(`style:${style}`, { name: 'Тест Тестовски', style, package: 'Основен', photo });
  }

  // Long name (overflow risk)
  await testOgImage('long name (32 chars)', {
    name: 'Александар Константиновски-Богдановски',
    style: 'elegant', package: 'Основен'
  });

  // Very long name
  await testOgImage('very long name (45 chars)', {
    name: 'Константин Александар Петровски-Михајловски',
    style: 'elegant', package: 'Основен'
  });

  // No years
  await testOgImage('no years', {
    name: 'Без Датуми', type: 'ТАЖНА ВЕСТ', style: 'elegant', package: 'Основен', photo
  });

  // No intro
  await testOgImage('no intro', {
    name: 'Петар Петровски', birthYear: '1960', deathYear: '2024',
    style: 'elegant', package: 'Основен', photo,
    message: 'Почивај во мир.'
  });

  // No photo
  await testOgImage('no photo', {
    name: 'Без Фотографија', birthYear: '1955', deathYear: '2023',
    style: 'orthodox', package: 'Основен'
  });

  // Long message (truncation check)
  await testOgImage('long message (300 chars)', {
    name: 'Петар Петровски', style: 'elegant', package: 'Основен', photo,
    message: 'Со длабока болка и тага ве известуваме за заминувањето на нашиот татко, дедо, сопруг и пријател кој беше светлина за сите кои го познаваа. Неговата доброта, мудрост и топлина засекогаш ќе останат во нашите срца. Починатиот беше човек со широко срце.'
  });

  // Non-HTTPS photo (should fall back to placeholder, not crash)
  await testOgImage('non-https photo (fallback)', {
    name: 'Тест', style: 'elegant', package: 'Основен',
    photo: 'http://insecure.example.com/photo.jpg'
  });

  // Empty params (fallback render)
  await testOgImage('empty params (site fallback)', {});

  // Cyrillic-only name
  await testOgImage('all-cyrillic name', {
    name: 'Ѓорѓи Ќупевски', style: 'elegant', package: 'Основен',
    birthYear: '1940', deathYear: '2020'
  });

  // Sochuvstvo type
  await testOgImage('type:СОЧУВСТВО', {
    name: 'Мариjа Иванова', type: 'СОЧУВСТВО', style: 'clean', package: 'Основен', photo
  });

  // Pomen type
  await testOgImage('type:ПОМЕН', {
    name: 'Благоjа Стефановски', type: 'ПОМЕН', style: 'orthodox', package: 'Основен', photo,
    message: 'Годишен помен.'
  });
}

// ─── TEST 2: /api/share-preview HTML + OG tags ───────────────────────────────

async function runSharePreviewTests() {
  section('2. /api/share-preview — HTML & OG tags');

  const REQUIRED_OG = [
    'og:title', 'og:type', 'og:url',
    'og:image', 'og:image:width', 'og:image:height', 'og:image:alt',
    'twitter:image', 'twitter:image:alt'
  ];

  // No-slug fallback
  try {
    const res  = await get('/api/share-preview');
    const html = await res.text();
    section('  2a. Generic fallback (no slug)');
    if (res.status !== 200) { fail(`HTTP ${res.status}`); }
    else pass('HTTP 200');
    for (const tag of REQUIRED_OG) checkMeta(html, tag);
    // og:image must point to /api/og
    const img = html.match(/og:image"[^>]*content="([^"]*)"/)?.[1]
              || html.match(/content="([^"]*)"[^>]*og:image"/)?.[1]
              || html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"/)?.[1];
    if (img && img.includes('/api/og')) pass('og:image points to /api/og');
    else fail(`og:image URL unexpected: ${img}`);
  } catch (e) {
    fail(`Generic fallback fetch error: ${e.message}`);
  }

  // Existing slug from live Firestore (generic fallback expected since we won't have a real slug)
  try {
    const res  = await get('/api/share-preview?slug=test-nonexistent-slug-qa');
    const html = await res.text();
    section('  2b. Non-existent slug (generic fallback expected)');
    if (res.status !== 200) { fail(`HTTP ${res.status}`); }
    else pass('HTTP 200 (falls back gracefully)');
    const hasTitle = /<title>[^<]+<\/title>/.test(html);
    hasTitle ? pass('Has <title>') : fail('Missing <title>');
    for (const tag of REQUIRED_OG) checkMeta(html, tag);
  } catch (e) {
    fail(`Non-existent slug fetch error: ${e.message}`);
  }

  // Verify no twitter:image:alt missing (was bug before fix)
  section('  2c. twitter:image:alt presence check');
  try {
    const res  = await get('/api/share-preview?slug=anything');
    const html = await res.text();
    const hasTwitterAlt = html.includes('twitter:image:alt');
    // share-preview.js currently doesn't have twitter:image:alt — check if present
    if (hasTwitterAlt) pass('twitter:image:alt present in share-preview output');
    else warn('twitter:image:alt missing from share-preview.js (only in SinglePost.tsx — not crawler-visible)');
  } catch (e) {
    fail(`Fetch error: ${e.message}`);
  }

  // og:image URL param completeness check
  section('  2d. og:image URL param check (generic fallback)');
  try {
    const res  = await get('/api/share-preview');
    const html = await res.text();
    const m = html.match(/property="og:image"\s+content="([^"]*)"/);
    const imageUrl = m ? m[1] : null;
    if (!imageUrl) { fail('Could not extract og:image URL'); return; }
    pass(`og:image URL: ${decodeURIComponent(imageUrl).slice(0, 100)}…`);
    const decoded = decodeURIComponent(imageUrl);
    if (!decoded.includes('/api/og')) fail('og:image not pointing to /api/og');
  } catch (e) {
    fail(`Fetch error: ${e.message}`);
  }
}

// ─── TEST 3: /spomen/:slug SPA route ─────────────────────────────────────────

async function runSpaRouteTests() {
  section('3. /spomen/:slug — SPA HTML (index.html)');

  try {
    const res  = await get('/spomen/test-slug');
    const html = await res.text();
    if (res.status !== 200) { fail(`HTTP ${res.status}`); return; }
    pass('HTTP 200');

    // SPA serves index.html — meta tags are injected by React at runtime
    // Bots are intercepted by middleware BEFORE reaching here
    const isIndexHtml = html.includes('<div id="root">') || html.includes('id="root"');
    if (isIndexHtml) {
      pass('Serves React SPA (index.html) for human visitors');
      warn('OG tags NOT in static HTML — correct, bots are handled by middleware before this');
    } else {
      warn('Unexpected response (not index.html)');
    }

    // Confirm no og:image in static SPA shell (bots should never reach here)
    const hasStaticOg = html.includes('og:image');
    if (!hasStaticOg) pass('No static og:image in SPA shell — bots redirected by middleware');
    else warn('og:image found in SPA shell — check if server-side rendering is active');
  } catch (e) {
    fail(`SPA route fetch error: ${e.message}`);
  }
}

// ─── TEST 4: middleware bot simulation ───────────────────────────────────────

async function runMiddlewareTests() {
  section('4. Middleware — bot UA simulation');

  const BOT_UAS = [
    ['facebookexternalhit/1.1', 'Facebook'],
    ['Twitterbot/1.0', 'Twitter'],
    ['WhatsApp/2.0', 'WhatsApp'],
    ['TelegramBot (like TwitterBot)', 'Telegram'],
    ['Slackbot-LinkExpanding 1.0', 'Slack'],
    ['LinkedInBot/1.0', 'LinkedIn'],
  ];

  for (const [ua, name] of BOT_UAS) {
    try {
      // Middleware runs at edge — vercel dev should honor it
      const res = await fetch(`${BASE}/spomen/test-slug`, {
        redirect: 'manual',
        headers: { 'User-Agent': ua }
      });
      if (res.status === 302 || res.status === 301) {
        const loc = res.headers.get('location') || '';
        if (loc.includes('/api/share-preview')) {
          pass(`[${name}] Redirected → ${loc.replace(BASE, '')}`);
        } else {
          fail(`[${name}] Redirected but wrong target: ${loc}`);
        }
      } else if (res.status === 200) {
        warn(`[${name}] Got 200 instead of redirect (middleware may not run in vercel dev)`);
      } else {
        fail(`[${name}] HTTP ${res.status}`);
      }
    } catch (e) {
      fail(`[${name}] Error: ${e.message}`);
    }
  }

  // Human UA should NOT be redirected
  try {
    const res = await fetch(`${BASE}/spomen/test-slug`, {
      redirect: 'manual',
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    if (res.status === 200) pass('[Human browser] Passes through — gets SPA');
    else if (res.status === 302) fail('[Human browser] Got redirect — middleware too aggressive');
    else warn(`[Human browser] HTTP ${res.status}`);
  } catch (e) {
    fail(`Human UA check error: ${e.message}`);
  }
}

// ─── TEST 5: Edge cases — URL encoding ───────────────────────────────────────

async function runUrlEncodingTests() {
  section('5. Edge cases — URL encoding & special chars');

  // Cyrillic slug
  await testOgImage('cyrillic in name param', {
    name: 'Ѓорѓи Ќупевски-Богдановски',
    city: 'Штип', style: 'orthodox', package: 'Основен'
  });

  // Quotes in message (XSS/HTML injection check)
  try {
    const url = buildOgUrl({
      name: 'Test User',
      message: 'He said "hello" & <goodbye>',
      style: 'elegant', package: 'Основен'
    });
    const res = await get(url);
    if (res.status === 200) pass('Special chars in message — no crash');
    else fail(`Special chars crashed renderer: HTTP ${res.status}`);
  } catch (e) {
    fail(`Special chars error: ${e.message}`);
  }

  // Double-encoded Cyrillic slug in share-preview
  try {
    const res = await get('/api/share-preview?slug=%D0%BF%D0%B5%D1%82%D0%B0%D1%80-%D0%BF%D0%B5%D1%82%D1%80%D0%BE%D0%B2%D1%81%D0%BA%D0%B8');
    if (res.status === 200) pass('Percent-encoded Cyrillic slug — HTTP 200');
    else fail(`Percent-encoded slug: HTTP ${res.status}`);
  } catch (e) {
    fail(`Encoded slug error: ${e.message}`);
  }

  // No params at all to share-preview
  try {
    const res = await get('/api/share-preview?slug=');
    if (res.status === 200) pass('Empty slug param — HTTP 200 (generic fallback)');
    else fail(`Empty slug: HTTP ${res.status}`);
  } catch (e) {
    fail(`Empty slug error: ${e.message}`);
  }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n\x1b[1mOG Share Preview QA — ${BASE}\x1b[0m`);
  console.log('─'.repeat(60));

  // Check server is up
  try {
    const ping = await fetch(BASE, { signal: AbortSignal.timeout(3000) });
    console.log(`Server: HTTP ${ping.status} — OK\n`);
  } catch {
    console.error(`\x1b[31mServer not reachable at ${BASE}\x1b[0m`);
    console.error('Start vercel dev first: run  ! vercel dev  in the terminal');
    process.exit(1);
  }

  await runOgTests();
  await runSharePreviewTests();
  await runSpaRouteTests();
  await runMiddlewareTests();
  await runUrlEncodingTests();

  console.log('\n' + '─'.repeat(60));
  console.log(`\x1b[1mResults: \x1b[32m${totalPass} passed\x1b[0m  \x1b[31m${totalFail} failed\x1b[0m  \x1b[33m${totalWarn} warnings\x1b[0m\n`);

  if (totalFail > 0) process.exit(1);
}

main().catch(e => { console.error(e); process.exit(1); });
