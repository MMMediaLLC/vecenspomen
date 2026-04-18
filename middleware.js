export const config = {
  matcher: ['/spomen/:slug*'],
};

export default function middleware(request) {
  const ua = request.headers.get('user-agent') || '';
  const isBot = /facebookexternalhit|Twitterbot|LinkedInBot|WhatsApp|Pinterest|Viber|viber-bot|ViberBot|com\.viber|Slackbot|TelegramBot/i.test(ua);

  if (!isBot) return; // pass through — vercel.json serves index.html → React SPA

  const { pathname, origin } = new URL(request.url);
  // The path segment may already be percent-encoded by the browser (Cyrillic URLs).
  // Decode it first so we always encode exactly once into the query string.
  const rawSlug = pathname.replace('/spomen/', '');
  const slug = decodeURIComponent(rawSlug);
  return Response.redirect(
    `${origin}/api/share-preview?slug=${encodeURIComponent(slug)}`,
    302
  );
}
