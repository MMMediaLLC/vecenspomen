export const config = {
  matcher: ['/spomen/:slug*'],
};

export default async function middleware(request) {
  const ua = request.headers.get('user-agent') || '';
  const isBot = /facebookexternalhit|Twitterbot|LinkedInBot|WhatsApp|Pinterest|Viber|viber-bot|ViberBot|com\.viber|Slackbot|TelegramBot/i.test(ua);

  if (!isBot) return; // pass through - vercel.json serves index.html → React SPA

  const { pathname, origin } = new URL(request.url);
  const rawSlug = pathname.replace('/spomen/', '');
  const slug = decodeURIComponent(rawSlug);

  // Proxy the response directly so bots like Viber (which don't follow redirects)
  // still receive the correct OG HTML at the original /spomen/:slug URL.
  try {
    const previewUrl = `${origin}/api/share-preview?slug=${encodeURIComponent(slug)}`;
    const previewRes = await fetch(previewUrl);
    const html = await previewRes.text();
    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch {
    return Response.redirect(
      `${origin}/api/share-preview?slug=${encodeURIComponent(slug)}`,
      302
    );
  }
}
