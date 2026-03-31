export const config = {
  matcher: ['/properties/:id*'],
};

const CRAWLERS = [
  'facebookexternalhit',
  'facebot',
  'twitterbot',
  'linkedinbot',
  'whatsapp',
  'slackbot',
  'telegrambot',
  'redditbot',
  'applebot',
  'googlebot',
  'bingbot',
  'discordbot',
  'embedly',
  'vkshare',
  'w3c_validator',
  'preview',
  'crawler',
  'spider',
];

const SUPABASE_URL = 'https://ictrsuazzgdkepswytwc.supabase.co';
const SITE_URL = 'https://westernproperties.in';

function isCrawler(ua: string): boolean {
  const lower = ua.toLowerCase();
  return CRAWLERS.some((bot) => lower.includes(bot));
}

export default async function middleware(request: Request) {
  const ua = request.headers.get('user-agent') || '';

  if (!isCrawler(ua)) {
    return;
  }

  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const id = pathParts[pathParts.length - 1];

  if (!id) return;

  const canonicalUrl = `${SITE_URL}/properties/${id}`;
  const proxyUrl = `${SUPABASE_URL}/functions/v1/og-meta?id=${encodeURIComponent(id)}&url=${encodeURIComponent(canonicalUrl)}`;

  const ogRes = await fetch(proxyUrl);
  const html = await ogRes.text();

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
