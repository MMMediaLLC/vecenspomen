/**
 * Local QA — tests share-preview HTML and og.tsx logic without a running server.
 * Run: node scripts/qa-local.mjs
 */

const PASS = '\x1b[32m✓\x1b[0m';
const FAIL = '\x1b[31m✗\x1b[0m';
const WARN = '\x1b[33m⚠\x1b[0m';
let totalPass = 0, totalFail = 0, totalWarn = 0;

function pass(msg)    { console.log(`  ${PASS} ${msg}`); totalPass++; }
function fail(msg)    { console.log(`  ${FAIL} \x1b[31m${msg}\x1b[0m`); totalFail++; }
function warn(msg)    { console.log(`  ${WARN} ${msg}`); totalWarn++; }
function section(t)   { console.log(`\n\x1b[1m${t}\x1b[0m`); }
function sub(t)       { console.log(`\n  \x1b[2m${t}\x1b[0m`); }

// ─── Load share-preview.js as module ─────────────────────────────────────────
// We extract the buildHtml + ogImageUrl functions by re-implementing them here
// since they are not exported. We replicate them from the source to test the
// exact output format.

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const PARAM_LIMITS = { message: 100, intro: 80, lovedBy: 50, name: 80 };
const OPTIONAL_PARAMS = ['lovedBy', 'intro', 'message', 'photo'];

function ogImageUrl(baseUrl, params = {}) {
  const base = `${baseUrl}/api/og`;
  const pairs = Object.entries(params)
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => [k, encodeURIComponent(String(v).slice(0, PARAM_LIMITS[k] ?? 200))]);

  const build = (ps) => {
    const qs = ps.map(([k, v]) => `${k}=${v}`).join('&');
    return qs ? `${base}?${qs}` : base;
  };

  let url = build(pairs);
  if (url.length <= 1900) return url;

  let filtered = [...pairs];
  for (const drop of OPTIONAL_PARAMS) {
    filtered = filtered.filter(([k]) => k !== drop);
    url = build(filtered);
    if (url.length <= 1900) return url;
  }
  return url;
}

function buildHtml(title, description, image, url, imageAlt) {
  const altText = imageAlt || title;
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
  <meta property="og:image:alt" content="${esc(altText)}">
  <meta property="og:locale" content="mk_MK">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${esc(url)}">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${esc(image)}">
  <meta name="twitter:image:alt" content="${esc(altText)}">

  <meta http-equiv="refresh" content="0; url=${esc(url)}">
</head>
<body>
  <p>Ве пренасочуваме... <a href="${esc(url)}">Кликнете овде</a></p>
  <script>window.location.href="${esc(url)}";</script>
</body>
</html>`;
}

function serveMeta_local(id, post, baseUrl) {
  const years     = [post.birthYear, post.deathYear].filter(Boolean).join(' – ');
  const yearsPart = years ? ` (${years})` : '';
  const cityPart  = post.city ? ` од ${post.city}` : '';

  const title       = `Во Вечен Спомен — ${post.fullName}${yearsPart}`;
  const description = (
    post.introText ||
    `Меморијална објава за ${post.fullName}${cityPart}. ${post.mainText || ''}`.trim()
  ).slice(0, 300);
  const imageAlt    = `Меморијална слика за ${post.fullName}${yearsPart}`;

  const image = ogImageUrl(baseUrl, {
    slug:      post.slug || id,
    name:      post.fullName,
    birthYear: post.birthYear,
    deathYear: post.deathYear || (post.dateOfDeath ? new Date(post.dateOfDeath).getFullYear() : ''),
    city:      post.city,
    lovedBy:   post.familyNote || post.senderName,
    style:     post.selectedFrameStyle || 'elegant',
    package:   post.package || 'Основен',
    message:   post.aiRefinedText || post.mainText || '',
    photo:     post.photoUrl || '',
    type:      post.type || 'ТАЖНА ВЕСТ',
    intro:     post.introText || '',
  });

  const url = `${baseUrl}/spomen/${post.slug || id}`;
  return buildHtml(title, description, image, url, imageAlt);
}

// ─── HTML tag checker ─────────────────────────────────────────────────────────

const REQUIRED_OG_TAGS = [
  'og:title', 'og:type', 'og:url',
  'og:image', 'og:image:width', 'og:image:height', 'og:image:alt',
  'twitter:image', 'twitter:image:alt',
];

function extractMeta(html, property) {
  // og:* use property=, twitter:* use name= — handle both attribute orderings
  const attr = property.startsWith('twitter:') ? 'name' : 'property';
  const esc2 = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // attr first, content second
  let m = html.match(new RegExp(`<meta[^>]+${attr}="${esc2}"[^>]+content="([^"]*)"`, 'i'));
  // content first, attr second
  if (!m) m = html.match(new RegExp(`<meta[^>]+content="([^"]*)"[^>]+${attr}="${esc2}"`, 'i'));
  return m ? m[1] : null;
}

function checkAllOgTags(html, contextLabel) {
  let allOk = true;
  for (const tag of REQUIRED_OG_TAGS) {
    const val = extractMeta(html, tag);
    if (val === null) {
      fail(`[${contextLabel}] Missing: ${tag}`);
      allOk = false;
    } else {
      pass(`[${contextLabel}] ${tag}: "${val.slice(0,70)}${val.length>70?'…':''}"`);
    }
  }
  return allOk;
}

// ─── TEST 1: share-preview HTML generation ────────────────────────────────────

function testSharePreviewHtml() {
  section('1. share-preview.js — HTML generation');

  const BASE = 'https://vecenspomen.mk';

  // Standard post
  sub('Standard post (all fields)');
  const stdPost = {
    fullName: 'Петар Петровски',
    slug: 'petar-petrovski-2024',
    birthYear: 1954,
    deathYear: 2024,
    city: 'Скопје',
    introText: 'Семејството Петровски со тага соопштува:',
    mainText: 'Со длабока тага ве известуваме за заминувањето.',
    selectedFrameStyle: 'elegant',
    package: 'Основен',
    photoUrl: 'https://images.unsplash.com/photo-test.jpg',
    type: 'ТАЖНА ВЕСТ',
    senderName: 'Семејство Петровски',
  };
  const stdHtml = serveMeta_local('doc1', stdPost, BASE);
  checkAllOgTags(stdHtml, 'standard');

  // og:image must include /api/og with key params
  const ogImg = extractMeta(stdHtml, 'og:image') || '';
  const ogImgDecoded = decodeURIComponent(ogImg);
  ['name=', 'style=', 'type=', 'photo=', 'intro='].forEach(p => {
    if (ogImgDecoded.includes(p)) pass(`[standard] og:image contains param: ${p}`);
    else fail(`[standard] og:image missing param: ${p}`);
  });

  // og:image width/height must be numeric 1200 / 630
  const w = extractMeta(stdHtml, 'og:image:width');
  const h = extractMeta(stdHtml, 'og:image:height');
  (w === '1200') ? pass('[standard] og:image:width = 1200') : fail(`[standard] og:image:width = ${w}`);
  (h === '630')  ? pass('[standard] og:image:height = 630') : fail(`[standard] og:image:height = ${h}`);

  // og:url must be canonical spomen/ path
  const url = extractMeta(stdHtml, 'og:url') || '';
  if (url.includes('/spomen/')) pass('[standard] og:url uses /spomen/ path');
  else fail(`[standard] og:url: ${url}`);

  // og:image:alt must mention person name
  const alt = extractMeta(stdHtml, 'og:image:alt') || '';
  if (alt.includes('Петар Петровски')) pass('[standard] og:image:alt contains person name');
  else fail(`[standard] og:image:alt: "${alt}"`);

  // redirect meta present
  if (stdHtml.includes('http-equiv="refresh"')) pass('[standard] <meta http-equiv=refresh> present');
  else fail('[standard] Missing meta refresh redirect');

  // ─ No intro ─
  sub('Post without introText');
  const noIntroPost = { ...stdPost, introText: undefined, slug: 'no-intro' };
  const noIntroHtml = serveMeta_local('doc2', noIntroPost, BASE);
  const descNoIntro = extractMeta(noIntroHtml, 'og:description') || '';
  if (descNoIntro.includes('Петар')) pass('[no-intro] og:description falls back to mainText');
  else fail(`[no-intro] og:description: "${descNoIntro}"`);
  const ogImgNoIntro = decodeURIComponent(extractMeta(noIntroHtml, 'og:image') || '');
  if (!ogImgNoIntro.includes('intro=')) pass('[no-intro] intro param omitted from og:image URL');
  else warn('[no-intro] intro param present but empty');

  // ─ No years ─
  sub('Post without birth/death years');
  const noYearsPost = { ...stdPost, birthYear: undefined, deathYear: undefined, slug: 'no-years' };
  const noYearsHtml = serveMeta_local('doc3', noYearsPost, BASE);
  const titleNoYears = (noYearsHtml.match(/<title>([^<]+)<\/title>/) || [])[1] || '';
  if (!titleNoYears.includes('(')) pass('[no-years] title has no year parentheses');
  else fail(`[no-years] title still contains parentheses: ${titleNoYears}`);
  const altNoYears = extractMeta(noYearsHtml, 'og:image:alt') || '';
  if (!altNoYears.includes('(')) pass('[no-years] og:image:alt has no year parentheses');
  else fail(`[no-years] og:image:alt still has parens: ${altNoYears}`);

  // ─ Long name (overflow in meta content) ─
  sub('Long full name');
  const longNamePost = {
    ...stdPost,
    fullName: 'Александар Константиновски-Богдановски-Михајловски',
    slug: 'long-name',
  };
  const longNameHtml = serveMeta_local('doc4', longNamePost, BASE);
  const titleLong = extractMeta(longNameHtml, 'og:title') || '';
  if (titleLong.includes('Александар')) pass('[long-name] og:title contains full name');
  else fail('[long-name] og:title missing long name');

  // ─ XSS / injection test ─
  sub('HTML injection in post fields');
  const xssPost = {
    ...stdPost,
    fullName: 'Test <script>alert(1)</script> User',
    introText: '"Quoted" & <bold>bold</bold>',
    slug: 'xss-test',
  };
  const xssHtml = serveMeta_local('doc5', xssPost, BASE);
  if (!xssHtml.includes('<script>alert')) pass('[xss] <script> tag is escaped in HTML');
  else fail('[xss] RAW <script> tag found in HTML — XSS risk!');
  if (!xssHtml.includes('"Quoted"')) pass('[xss] Unescaped double quotes not present');
  else warn('[xss] Unescaped double quote in content attr — check esc()');

  // ─ All frame styles ─
  sub('All selectedFrameStyle values');
  const STYLES = ['orthodox','catholic','muslim','star','elegant','clean'];
  for (const style of STYLES) {
    const p = { ...stdPost, selectedFrameStyle: style, slug: `style-${style}` };
    const h = serveMeta_local(`doc-${style}`, p, BASE);
    const imgUrl = decodeURIComponent(extractMeta(h, 'og:image') || '');
    if (imgUrl.includes(`style=${style}`)) pass(`[style:${style}] style param in og:image URL`);
    else fail(`[style:${style}] style param missing from og:image URL`);
  }

  // ─ Premium package ─
  sub('Premium (Истакнат) package');
  const premPost = { ...stdPost, package: 'Истакнат', slug: 'premium' };
  const premHtml = serveMeta_local('doc6', premPost, BASE);
  const premImg = decodeURIComponent(extractMeta(premHtml, 'og:image') || '');
  if (premImg.includes('package=%D0%98%D1%81%D1%82%D0%B0%D0%BA%D0%BD%D0%B0%D1%82') ||
      premImg.includes('package=Истакнат')) {
    pass('[premium] package param in og:image URL');
  } else {
    fail(`[premium] package param missing. Got: ${premImg.slice(0,100)}`);
  }
}

// ─── TEST 2: og.tsx static analysis ──────────────────────────────────────────

import { readFileSync } from 'fs';
import { resolve } from 'path';

function testOgTsxStaticAnalysis() {
  section('2. api/og.tsx — static code analysis');

  const src = readFileSync(resolve('api/og.tsx'), 'utf8');

  // Correct style keys
  const CORRECT_STYLES = ['orthodox','catholic','muslim','star','elegant','clean'];
  const OLD_STYLES     = ['pravoslaven','katolicki','muslimanski','socijalisticki','klasicen','emotiven'];

  sub('Style→symbol mapping keys');
  for (const s of CORRECT_STYLES) {
    // Match both quoted ('orthodox') and unquoted (orthodox:) object keys
    if (src.match(new RegExp(`['"]?${s}['"]?\\s*:`))) pass(`Style key present: ${s}`);
    else fail(`Style key missing: ${s}`);
  }
  for (const s of OLD_STYLES) {
    if (src.match(new RegExp(`['"]?${s}['"]?\\s*:`))) fail(`OLD style key still present: ${s}`);
    else pass(`Old key absent: ${s}`);
  }

  // Horizontal layout: must have left panel width around 400 and right panel flex:1
  sub('Horizontal layout structure');
  if (src.includes('400px') || src.includes("'400'")) pass('Left panel ~400px width found');
  else fail('Left panel width not found — layout may not be horizontal');
  if (src.includes('flex: 1') || src.includes("flex:'1'") || src.includes('flex:1')) pass('Right panel flex:1 found');
  else warn('Right panel flex:1 not found in source — check layout');
  if (src.includes('1200') && src.includes('630')) pass('Canvas dimensions 1200×630 declared');
  else fail('Canvas dimensions missing');

  // Photo is rendered with objectFit:cover
  sub('Photo handling');
  if (src.includes('objectFit') && src.includes('cover')) pass('Photo uses objectFit:cover');
  else fail('Photo missing objectFit:cover — may letterbox');

  // Non-HTTPS photo guard — regex literal in source has escaped slashes
  if (src.includes('https?:') && (src.includes('test(rawPhoto)') || src.includes('test(raw'))) {
    pass('Non-HTTPS photo guard present');
  } else {
    fail('Non-HTTPS photo guard missing — unsafe external URLs possible');
  }

  // Message truncation (overflow protection)
  sub('Text overflow protection');
  const msgMatch = src.match(/message.*slice\(0,\s*(\d+)\)/);
  if (msgMatch) {
    const limit = parseInt(msgMatch[1]);
    if (limit <= 200) pass(`Message truncated to ${limit} chars`);
    else warn(`Message truncated to ${limit} chars — may overflow at narrow widths`);
  } else fail('Message truncation not found — overflow risk!');

  const introMatch = src.match(/intro.*slice\(0,\s*(\d+)\)/);
  if (introMatch) {
    const limit = parseInt(introMatch[1]);
    pass(`Intro truncated to ${limit} chars`);
  } else fail('Intro truncation not found — overflow risk!');

  // Name font size adapts to length
  sub('Name font size adaptation');
  if (src.includes('nameFontSize') || src.match(/name\.length.*\?.*px/)) {
    pass('Name font size adapts to name length');
  } else {
    warn('Name font size is fixed — long names may overflow right panel');
  }

  // Font loading
  sub('Font loading');
  if (src.includes('lora-400.ttf') && src.includes('lora-700.ttf')) pass('Both Lora font weights loaded');
  else fail('Font file references missing');
  if (src.includes('getFonts') && src.includes('_loraRegular')) pass('Font cache (module-level) present');
  else warn('No font cache — fonts reloaded on every request');

  // Fallback response
  sub('Error handling');
  if (src.includes('fallbackResponse')) pass('Fallback response function present');
  else fail('No fallback — renderer crash returns 500 with no image');
  if (src.includes('try') && src.includes('catch')) pass('try/catch around render logic');
  else fail('No try/catch in main handler');
}

// ─── TEST 3: SinglePost.tsx OG params ────────────────────────────────────────

function testSinglePostOgParams() {
  section('3. SinglePost.tsx — OG param completeness');

  const src = readFileSync(resolve('src/pages/SinglePost.tsx'), 'utf8');

  sub('Required OG meta tags');
  const REQUIRED = [
    'og:title', 'og:type', 'og:url', 'og:image',
    'og:image:width', 'og:image:height', 'og:image:alt',
    'twitter:image', 'twitter:image:alt'
  ];
  for (const tag of REQUIRED) {
    if (src.includes(`'${tag}'`) || src.includes(`"${tag}"`)) pass(`Includes: ${tag}`);
    else fail(`Missing: ${tag}`);
  }

  sub('ogParams completeness');
  const PARAMS = ['name', 'type', 'style', 'package', 'message', 'birthYear', 'deathYear', 'city', 'photo', 'intro'];
  for (const p of PARAMS) {
    // Match both quoted ('name':) and unquoted (name:) keys in URLSearchParams object
    if (src.match(new RegExp(`['"]?${p}['"]?\\s*:`))) pass(`Param: ${p}`);
    else fail(`Missing param: ${p}`);
  }

  sub('Share button uses page URL');
  if (src.includes('window.location.href') && src.includes('handleFacebookShare')) {
    pass('Facebook share button uses window.location.href (page URL, not image URL)');
  } else {
    fail('handleFacebookShare not found or does not use window.location.href');
  }

  sub('og:image points to /api/og');
  if (src.includes('/api/og?') || src.includes('`${baseUrl}/api/og')) {
    pass('og:image URL constructed from /api/og endpoint');
  } else {
    fail('og:image may not point to /api/og');
  }

  sub('Dimensions declared');
  if (src.includes("'1200'") && src.includes("'630'")) pass('1200 × 630 declared');
  else fail('Missing image dimension declarations');
}

// ─── TEST 4: middleware.js bot UA patterns ────────────────────────────────────

function testMiddleware() {
  section('4. middleware.js — bot UA coverage & redirect target');

  const src = readFileSync(resolve('middleware.js'), 'utf8');

  const BOTS = ['facebookexternalhit','Twitterbot','LinkedInBot','WhatsApp','Pinterest','Viber','Slackbot','TelegramBot'];
  sub('Bot UA patterns covered');
  for (const bot of BOTS) {
    if (src.includes(bot)) pass(`UA covered: ${bot}`);
    else fail(`UA missing: ${bot}`);
  }

  sub('Redirect target');
  if (src.includes('/api/share-preview')) pass('Redirects to /api/share-preview');
  else fail('Redirect target is not /api/share-preview');

  sub('Path matching');
  if (src.includes("/spomen/")) pass("Middleware matches /spomen/ path");
  else fail("Middleware may not match /spomen/ path");

  sub('Cyrillic slug handling');
  if (src.includes('decodeURIComponent')) pass('decodeURIComponent called on slug before redirect');
  else warn('No decodeURIComponent — Cyrillic slugs may double-encode');

  sub('Non-bot pass-through');
  // middleware returns undefined/nothing for non-bots which means pass-through
  if (src.includes('if (!isBot) return')) pass('Non-bots pass through (no redirect)');
  else warn('Check non-bot pass-through logic');
}

// ─── TEST 5: Edge case — og:image URL length ──────────────────────────────────

function testUrlLength() {
  section('5. og:image URL length — Facebook 2048 char limit');

  const BASE = 'https://vecenspomen.mk';
  const longMsg = 'А'.repeat(200);
  const longName = 'Александар Константиновски-Богдановски';
  const longIntro = 'Семејството со длабока тага и болка соопштува за заминувањето на нашиот.'.repeat(2);

  const url = ogImageUrl(BASE, {
    name:      longName,
    birthYear: 1940,
    deathYear: 2024,
    city:      'Скопје',
    style:     'orthodox',
    package:   'Истакнат',
    message:   longMsg,
    photo:     'https://firebasestorage.googleapis.com/v0/b/example.appspot.com/o/posts%2F1234567890-photo.jpg?alt=media&token=abcdef',
    type:      'ТАЖНА ВЕСТ',
    intro:     longIntro,
    lovedBy:   'Семејство Петровски',
    slug:      'aleksandar-konstantinovski-bogdanovski-2024',
  });

  const len = url.length;
  if (len <= 2000) pass(`URL length: ${len} chars (within Facebook 2048 limit)`);
  else if (len <= 2048) warn(`URL length: ${len} chars (close to Facebook 2048 limit)`);
  else fail(`URL length: ${len} chars — EXCEEDS Facebook 2048 limit!`);
}

// ─── TEST 6: twitter:image:alt missing from share-preview ────────────────────

function testTwitterAltInSharePreview() {
  section('6. twitter:image:alt — share-preview.js gap');

  const src = readFileSync(resolve('api/share-preview.js'), 'utf8');
  if (src.includes('twitter:image:alt')) {
    pass('twitter:image:alt present in share-preview.js');
  } else {
    fail('twitter:image:alt MISSING from share-preview.js — Twitter card won\'t have alt text for bots');
  }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

(async () => {
  console.log('\n\x1b[1mOG Share Preview — Full Local QA\x1b[0m');
  console.log('═'.repeat(55));

  testSharePreviewHtml();
  testOgTsxStaticAnalysis();
  testSinglePostOgParams();
  testMiddleware();
  testUrlLength();
  testTwitterAltInSharePreview();

  console.log('\n' + '═'.repeat(55));
  console.log(`\x1b[1mResults: \x1b[32m${totalPass} passed\x1b[0m  \x1b[31m${totalFail} failed\x1b[0m  \x1b[33m${totalWarn} warnings\x1b[0m\n`);

  if (totalFail > 0) process.exit(1);
})();
