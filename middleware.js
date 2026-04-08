export const config = {
  matcher: ['/spomen/:slug*'],
};

export default function middleware(request) {
  const ua = request.headers.get('user-agent') || '';
  const isBot = /facebookexternalhit|Twitterbot|LinkedInBot|WhatsApp|Pinterest|Viber|Slackbot|TelegramBot/i.test(ua);

  if (!isBot) return; // pass through — vercel.json serves index.html → React SPA

  const { pathname, origin } = new URL(request.url);
  const slug = pathname.replace('/spomen/', '');
  return Response.redirect(
    `${origin}/api/share-preview?slug=${encodeURIComponent(slug)}`,
    302
  );
}
