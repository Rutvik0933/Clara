const OFFER_PATH = '/api/offer';
const ALLOWED_ORIGINS = new Set([
  'https://pureluxuriouswater.com',
  'https://www.pureluxuriouswater.com'
]);

function corsHeaders(request) {
  const origin = request.headers.get('Origin');
  const allowedOrigin = ALLOWED_ORIGINS.has(origin) ? origin : 'https://pureluxuriouswater.com';
  return {
    'access-control-allow-origin': allowedOrigin,
    'access-control-allow-methods': 'GET, PUT, OPTIONS',
    'access-control-allow-headers': 'Authorization, Content-Type, Accept',
    'cache-control': 'no-store',
    'content-type': 'application/json; charset=utf-8',
    'vary': 'Origin',
    'x-content-type-options': 'nosniff'
  };
}

function json(request, payload, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: corsHeaders(request) });
}

function safeText(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function safeLink(value) {
  return /^(https?:\/\/|\/|#|[a-z0-9][a-z0-9._/-]*)/i.test(value || '');
}

function normalizeOffer(input) {
  if (!input || typeof input !== 'object') return null;
  const title = safeText(input.title, 160);
  const buttonLink = safeText(input.buttonLink, 2048) || '#products';
  const image = safeText(input.image, 2048);
  if (!title || !safeLink(buttonLink) || (image && !safeLink(image))) return null;

  return {
    id: safeText(String(input.id || 'active-offer'), 120),
    title,
    description: safeText(input.description, 1000),
    buttonText: safeText(input.buttonText, 80) || 'Explore Products',
    buttonLink,
    image,
    enabled: true,
    updatedAt: Number(input.updatedAt) || Date.now()
  };
}

function isAuthorized(request, env) {
  const header = request.headers.get('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  return Boolean(env.OFFER_ADMIN_TOKEN && token && token === env.OFFER_ADMIN_TOKEN);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(request) });
    if (url.pathname !== OFFER_PATH) return json(request, { error: 'not_found' }, 404);
    if (!env.OFFERS) return json(request, { error: 'offer_storage_not_configured' }, 503);

    if (request.method === 'GET') {
      const offer = await env.OFFERS.get('active_offer', 'json');
      return json(request, { offer: offer || null });
    }

    if (request.method !== 'PUT') return json(request, { error: 'method_not_allowed' }, 405);
    if (!isAuthorized(request, env)) return json(request, { error: 'unauthorized' }, 401);

    let body;
    try { body = await request.json(); }
    catch { return json(request, { error: 'invalid_json' }, 400); }

    if (body && body.offer === null) {
      await env.OFFERS.delete('active_offer');
      return json(request, { offer: null });
    }

    const offer = normalizeOffer(body && body.offer);
    if (!offer) return json(request, { error: 'invalid_offer' }, 400);
    await env.OFFERS.put('active_offer', JSON.stringify(offer));
    return json(request, { offer });
  }
};
