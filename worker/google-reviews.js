const API_PATH = '/api/google-reviews';
const CACHE_SECONDS = 21600; // 6 hours

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': `public, max-age=300, s-maxage=${CACHE_SECONDS}`,
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

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname !== API_PATH) return new Response('Not found', { status: 404 });
    if (request.method !== 'GET') return json({ error: 'method_not_allowed' }, 405);

    if (!env.GOOGLE_PLACES_API_KEY || !env.GOOGLE_PLACE_ID) {
      return json({ error: 'not_configured' }, 503);
    }

    const cacheKey = new Request(`${url.origin}${API_PATH}`);
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
