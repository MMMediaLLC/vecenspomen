/**
 * Local preview server for OG/Facebook share testing.
 * Serves /api/og and /api/share-preview without needing vercel dev.
 *
 * Usage:
 *   node scripts/preview-server.mjs
 *
 * Then open:
 *   http://localhost:3001/api/og?name=Петар+Петровски&birthYear=1954&deathYear=2024&city=Скопје&style=orthodox&package=Основен
 *   http://localhost:3001/api/share-preview?slug=some-slug
 *   http://localhost:3001/preview  ← visual test page with all style variants
 */

import http from 'http';
import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import path from 'path';
import { execSync } from 'child_process';
import fs from 'fs';

const PORT = 3001;
const ROOT = process.cwd();

// ─── Compile api/og.tsx on the fly ───────────────────────────────────────────
// We use tsx to run it in a child process for each request (simple, no bundling).
async function handleOg(reqUrl) {
  const url = `http://localhost${reqUrl}`;
  const script = `
import handler from './api/og.tsx';
const res = await handler({ url: ${JSON.stringify(url)} });
const buf = Buffer.from(await res.arrayBuffer());
process.stdout.write(JSON.stringify({
  status: res.status,
  contentType: res.headers.get('content-type') || 'image/png',
  body: buf.toString('base64')
}));
`;
  const tmpFile = path.join(ROOT, 'scripts', '_og_tmp.mts');
  fs.writeFileSync(tmpFile, script);
  try {
    const out = execSync(`npx tsx ${tmpFile}`, { cwd: ROOT, maxBuffer: 4 * 1024 * 1024 });
    fs.unlinkSync(tmpFile);
    const result = JSON.parse(out.toString());
    return {
      status: result.status,
      contentType: result.contentType,
      body: Buffer.from(result.body, 'base64'),
    };
  } catch (e) {
    try { fs.unlinkSync(tmpFile); } catch {}
    console.error('[OG] Error:', e.stderr?.toString() || e.message);
    return { status: 500, contentType: 'text/plain', body: Buffer.from('OG render error: ' + e.message) };
  }
}

// ─── share-preview handler (plain ESM) ───────────────────────────────────────
// Mock res object to capture the response
function mockRes() {
  const r = { _headers: {}, _status: 200, _body: '' };
  r.setHeader = (k, v) => { r._headers[k] = v; return r; };
  r.status = (s) => { r._status = s; return r; };
  r.send = (b) => { r._body = b; return r; };
  return r;
}

async function handleSharePreview(reqUrl) {
  const { searchParams } = new URL(`http://localhost${reqUrl}`);
  const req = {
    query: Object.fromEntries(searchParams.entries()),
    headers: {
      'x-forwarded-proto': 'http',
      host: `localhost:${PORT}`,
    },
  };
  const res = mockRes();

  // Dynamic import with cache-bust
  const mod = await import(
    pathToFileURL(path.join(ROOT, 'api', 'share-preview.js')).href +
    '?v=' + Date.now()
  );
  await mod.default(req, res);
  return { status: res._status, contentType: res._headers['Content-Type'] || 'text/html', body: res._body };
}

// ─── Visual preview page ──────────────────────────────────────────────────────
const PHOTO = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400';
const STYLES = ['elegant', 'orthodox', 'catholic', 'muslim', 'star', 'clean'];
const NAMES  = [
  'Петар Петровски',
  'Александар Константиновски-Богдановски',
  'Ана',
];

function buildPreviewPage() {
  const base = `http://localhost:${PORT}`;

  const cards = STYLES.flatMap(style =>
    NAMES.map(name => {
      const params = new URLSearchParams({
        name,
        type:      'ТАЖНА ВЕСТ',
        birthYear: '1954',
        deathYear: '2024',
        city:      'Скопје',
        style,
        package:   name.length > 20 ? 'Истакнат' : 'Основен',
        photo:     PHOTO,
        message:   'Со длабока тага ве известуваме за заминувањето на нашиот сакан.',
        intro:     name.length > 10 ? 'Семејството со тага соопштува:' : '',
      });
      const imgUrl = `${base}/api/og?${params}`;
      return `
        <div class="card">
          <div class="label">${style} · ${name.length > 20 ? 'Истакнат' : 'Основен'}</div>
          <div class="name">${name}</div>
          <img src="${imgUrl}" loading="lazy" alt="${style}" />
          <a href="${imgUrl}" target="_blank">Open image ↗</a>
        </div>`;
    })
  );

  // No-photo variants
  const noPhotoCards = STYLES.map(style => {
    const params = new URLSearchParams({ name: 'Без Фотографија', style, package: 'Основен', birthYear: '1960', deathYear: '2023' });
    const imgUrl = `${base}/api/og?${params}`;
    return `
      <div class="card">
        <div class="label">${style} · no photo</div>
        <img src="${imgUrl}" loading="lazy" alt="${style}" />
      </div>`;
  });

  return `<!DOCTYPE html>
<html lang="mk">
<head>
  <meta charset="UTF-8">
  <title>OG Image Preview — Вечен Спомен</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: #1a1a1a; color: #eee; padding: 24px; }
    h1 { margin-bottom: 8px; font-size: 20px; }
    h2 { margin: 32px 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 3px; color: #888; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 24px; }
    .card { background: #2a2a2a; border-radius: 8px; overflow: hidden; padding: 12px; }
    .card img { width: 100%; border-radius: 4px; display: block; margin: 8px 0; border: 1px solid #333; }
    .label { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #B08D57; }
    .name  { font-size: 13px; color: #ccc; margin: 4px 0; }
    a { font-size: 11px; color: #888; text-decoration: none; }
    a:hover { color: #fff; }
    .share-box { background: #2a2a2a; border-radius: 8px; padding: 16px; margin-top: 16px; }
    .share-box pre { font-size: 11px; overflow: auto; color: #8fb; white-space: pre-wrap; word-break: break-all; }
    input { width: 100%; padding: 8px; background: #333; border: 1px solid #444; color: #fff; border-radius: 4px; font-size: 13px; margin-bottom: 8px; }
    button { padding: 8px 16px; background: #B08D57; border: none; color: #fff; border-radius: 4px; cursor: pointer; font-size: 13px; }
  </style>
</head>
<body>
  <h1>OG Image Preview — Вечен Спомен</h1>
  <p style="color:#888; font-size:13px; margin-top:4px">Images are rendered server-side. First load may be slow (font init).</p>

  <h2>Custom preview</h2>
  <div class="share-box">
    <input id="nameInput" value="Петар Петровски" placeholder="Ime" />
    <input id="introInput" value="Семејството со тага соопштува:" placeholder="Intro (опционо)" />
    <input id="msgInput" value="Со длабока тага ве известуваме за заминувањето на нашиот сакан татко." placeholder="Порака" />
    <input id="photoInput" value="${PHOTO}" placeholder="Фото URL (https://...)" />
    <select id="styleInput" style="padding:8px;background:#333;border:1px solid #444;color:#fff;border-radius:4px;font-size:13px;margin-bottom:8px;width:100%">
      ${STYLES.map(s => `<option value="${s}">${s}</option>`).join('')}
    </select>
    <label style="font-size:12px;color:#888;display:block;margin-bottom:8px">
      <input type="checkbox" id="premiumInput"> Истакнат (premium)
    </label>
    <button onclick="updatePreview()">Preview</button>
    <div style="margin-top:12px">
      <img id="customImg" src="" style="width:100%;border-radius:4px;border:1px solid #333;display:none" />
      <a id="customLink" href="#" target="_blank" style="display:none;margin-top:4px;display:block;font-size:11px;color:#888"></a>
    </div>
  </div>

  <h2>All style variants</h2>
  <div class="grid">${cards.join('')}</div>

  <h2>No photo variants</h2>
  <div class="grid">${noPhotoCards.join('')}</div>

  <h2>share-preview HTML output</h2>
  <div class="share-box">
    <input id="slugInput" value="petar-petrovski-2024" placeholder="slug" />
    <button onclick="fetchPreview()">Fetch</button>
    <pre id="previewOut" style="margin-top:12px;color:#8fb"></pre>
  </div>

  <script>
    function updatePreview() {
      const p = new URLSearchParams({
        name:      document.getElementById('nameInput').value,
        intro:     document.getElementById('introInput').value,
        message:   document.getElementById('msgInput').value,
        photo:     document.getElementById('photoInput').value,
        style:     document.getElementById('styleInput').value,
        package:   document.getElementById('premiumInput').checked ? 'Истакнат' : 'Основен',
        type:      'ТАЖНА ВЕСТ',
        birthYear: '1954', deathYear: '2024', city: 'Скопје',
      });
      const url = '/api/og?' + p;
      const img = document.getElementById('customImg');
      img.src = url + '&t=' + Date.now();
      img.style.display = 'block';
      const lnk = document.getElementById('customLink');
      lnk.href = url; lnk.textContent = 'Open full size ↗'; lnk.style.display = 'block';
    }
    async function fetchPreview() {
      const slug = document.getElementById('slugInput').value;
      const res  = await fetch('/api/share-preview?slug=' + encodeURIComponent(slug));
      const html = await res.text();
      document.getElementById('previewOut').textContent = html;
    }
    updatePreview();
  </script>
</body>
</html>`;
}

// ─── HTTP Server ──────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const url = req.url || '/';
  console.log(`[${new Date().toISOString().slice(11,19)}] ${req.method} ${url}`);

  try {
    if (url.startsWith('/api/og')) {
      const result = await handleOg(url);
      res.writeHead(result.status, { 'Content-Type': result.contentType });
      res.end(result.body);

    } else if (url.startsWith('/api/share-preview')) {
      const result = await handleSharePreview(url);
      res.writeHead(result.status, { 'Content-Type': result.contentType });
      res.end(result.body);

    } else if (url === '/' || url === '/preview') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(buildPreviewPage());

    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found. Try /preview, /api/og?..., or /api/share-preview?slug=...');
    }
  } catch (e) {
    console.error(e);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Server error: ' + e.message);
  }
});

server.listen(PORT, () => {
  console.log(`\n✓ Preview server running at http://localhost:${PORT}`);
  console.log(`\n  Visual test page:   http://localhost:${PORT}/preview`);
  console.log(`  OG image:           http://localhost:${PORT}/api/og?name=Петар+Петровски&style=orthodox&birthYear=1954&deathYear=2024`);
  console.log(`  Share-preview HTML: http://localhost:${PORT}/api/share-preview?slug=test-slug`);
  console.log(`\n  Note: First OG render is slow (font init). Subsequent renders are faster.\n`);
});
