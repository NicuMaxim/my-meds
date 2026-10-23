import { sessionCookieOptions } from '../../session-cookie';
export async function POST(req: Request) {
  if (req.headers.get('origin') !== new URL(req.url).origin) return new Response('Недопустимый запрос', { status: 403 });
  const cookie = sessionCookieOptions(new URL(req.url).host);
  return new Response(null, { status: 303, headers: {
    Location: '/login', 'Cache-Control': 'no-store',
    'Set-Cookie': `${cookie.name}=; ${cookie.attributes}; Max-Age=0`,
  } });
}
