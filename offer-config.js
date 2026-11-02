/*
 * Public endpoint for the separate Cloudflare Worker that publishes the
 * currently enabled offer to every visitor, on desktop and mobile.
 * This URL is public by design. Never put OFFER_ADMIN_TOKEN in this file.
 */
window.CLARA_OFFER_API_URL = 'https://clara-offers-api.rutvik-rushkar.workers.dev/api/offer';
