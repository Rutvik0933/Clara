const REVIEWS_API_PATH = '/api/google-reviews';
const OFFER_API_PATH = '/api/offer';
const CACHE_SECONDS = 21600; // 6 hours

function json(payload, status = 200, cacheControl = `public, max-age=300, s-maxage=${CACHE_SECONDS}`) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': cacheControl,
      'x-content-type-options': 'nosniff'
    }
  });
}

function reviewText(value) {
  return typeof value === 'object' && value ? (value.text || '') : (value || '');
}

function reviewDate(value) {
  if (!value) return 'Google review';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Google review';
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

function normalizeReview(review) {
  const author = review.authorAttribution || {};
  return {
    author: author.displayName || 'Google customer',
    authorUri: author.uri || review.googleMapsUri || '',
    authorPhotoUri: author.photoUri || '',
    rating: Math.max(1, Math.min(5, Number(review.rating) || 5)),
    text: reviewText(review.originalText) || 'Shared a rating on Google.',
    date: review.relativePublishTimeDescription || reviewDate(review.publishTime),
    googleMapsUri: review.googleMapsUri || '',
    flagContentUri: review.flagContentUri || ''
  };
}

function validOfferLink(value) {
  // Allow normal absolute URLs, root/hash links, and safe local asset paths
  // such as "images/clara-200ml-splash-no-logo.png".
  return /^(https?:\/\/|\/|#|[a-z0-9][a-z0-9._/-]*)/i.test(value || '');
}

function text(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function normalizeOffer(input) {
  if (!input || typeof input !== 'object') return null;
  const title = text(input.title, 160);
  if (!title) return null;

  const buttonLink = text(input.buttonLink, 2048) || '#products';
  if (!validOfferLink(buttonLink)) return null;

  const image = text(input.image, 2048);
  if (image && !validOfferLink(image)) return null;

  return {
    id: text(String(input.id || 'active-offer'), 120),
    title,
    description: text(input.description, 1000),
    buttonText: text(input.buttonText, 80) || 'Explore Products',
    buttonLink,
    image,
    enabled: true,
    updatedAt: Number(input.updatedAt) || Date.now()
  };
}

function isOfferAdmin(request, env) {
  const expected = env.OFFER_ADMIN_TOKEN;
  const authorization = request.headers.get('authorization') || '';
  const received = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  return Boolean(expected && received && received === expected);
}

async function handleOffer(request, env) {
  if (request.method === 'GET') {
    if (!env.OFFERS) return json({ error: 'offer_sync_not_configured' }, 503, 'no-store');
    const offer = await env.OFFERS.get('active_offer', 'json');
    return json({ offer: offer || null }, 200, 'no-store');
  }

  if (request.method !== 'PUT') return json({ error: 'method_not_allowed' }, 405, 'no-store');
  if (!env.OFFERS || !env.OFFER_ADMIN_TOKEN) return json({ error: 'offer_sync_not_configured' }, 503, 'no-store');
  if (!isOfferAdmin(request, env)) return json({ error: 'unauthorized' }, 401, 'no-store');

  let body;
  try { body = await request.json(); }
  catch { return json({ error: 'invalid_json' }, 400, 'no-store'); }

  if (body && body.offer === null) {
    await env.OFFERS.delete('active_offer');
    return json({ offer: null }, 200, 'no-store');
  }

  const offer = normalizeOffer(body && body.offer);
  if (!offer) return json({ error: 'invalid_offer' }, 400, 'no-store');
  await env.OFFERS.put('active_offer', JSON.stringify(offer));
  return json({ offer }, 200, 'no-store');
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === OFFER_API_PATH) return handleOffer(request, env);
    if (url.pathname !== REVIEWS_API_PATH) return new Response('Not found', { status: 404 });
    if (request.method !== 'GET') return json({ error: 'method_not_allowed' }, 405);

    if (!env.GOOGLE_PLACES_API_KEY || !env.GOOGLE_PLACE_ID) {
      return json({ error: 'not_configured' }, 503);
    }

    const cacheKey = new Request(`${url.origin}${REVIEWS_API_PATH}`);
    const cache = caches.default;
    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    try {
      const placeResponse = await fetch(
        `https://places.googleapis.com/v1/places/${encodeURIComponent(env.GOOGLE_PLACE_ID)}`,
        {
          headers: {
            'X-Goog-Api-Key': env.GOOGLE_PLACES_API_KEY,
            'X-Goog-FieldMask': 'rating,userRatingCount,reviews.rating,reviews.originalText,reviews.authorAttribution,reviews.publishTime,reviews.relativePublishTimeDescription,reviews.googleMapsUri,reviews.flagContentUri'
          }
        }
      );

      if (!placeResponse.ok) {
        throw new Error(`Google Places API returned ${placeResponse.status}`);
      }

      const place = await placeResponse.json();
      const payload = {
        source: 'google-places',
        averageRating: Number(place.rating) || 0,
        totalReviewCount: Number(place.userRatingCount) || 0,
        reviews: Array.isArray(place.reviews) ? place.reviews.slice(0, 5).map(normalizeReview) : []
      };
      const response = json(payload);
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
      return response;
    } catch (error) {
      console.error('Google reviews request failed:', error.message);
      return json({ error: 'reviews_unavailable' }, 502);
    }
  }
};
