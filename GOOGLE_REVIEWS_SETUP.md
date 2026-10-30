# Cloudflare Worker: live Google reviews

This website now requests `https://pureluxuriouswater.com/api/google-reviews`. A dedicated Cloudflare Worker calls the Google Places API server-side, caches the result for six hours, and returns the current Google rating, rating count, and up to five real Google reviews.

It does **not** require PHP, OAuth Client ID, Client Secret, Refresh Token, Business Profile Account ID, or Business Profile Location ID.

## 1. Get two Google Maps values

Create a Google Cloud project owned by the Google account that manages Pure CLARA.

1. Add billing to the project.
2. Enable **Places API (New)** from APIs & Services > Library.
3. Go to APIs & Services > Credentials > Create credentials > API key.
4. Restrict the key to **Places API (New)**. Do not put the key in `index.html`, `data.js`, GitHub, or the browser.
5. Find the profile's Place ID with Google's [Place ID Finder](https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder). Search for `Pure CLARA – PureLuxurious Water, Huka Gam, Huka, Gujarat 382330` and copy the returned value beginning with `ChIJ`.

## 2. Deploy the Worker

In Cloudflare Dashboard:

1. Open **Workers & Pages** > **Create application** > **Create Worker**.
2. Name it `clara-google-reviews` and deploy the starter Worker.
3. Choose **Edit code**, replace its code with `worker/google-reviews.js`, and deploy.
4. Open the Worker's **Settings** > **Variables and Secrets** > **Add**. Add these as **Secret** values:
   - `GOOGLE_PLACES_API_KEY` — the API key from Google Cloud
   - `GOOGLE_PLACE_ID` — the Place ID beginning with `ChIJ`
5. Deploy the secret changes.
6. Go to **Settings** > **Domains & Routes** > **Add** > **Route** and add:

   ```text
   pureluxuriouswater.com/api/google-reviews*
   ```

   Assign this route to the `clara-google-reviews` Worker.

The existing `clara` Worker remains responsible for the website. This narrow `/api/google-reviews*` route is only for reviews.

The review Worker key is a **server secret**. Do not reuse it in the website's map settings. A browser-visible Google Map needs a separate HTTP-referrer-restricted key.

## 3. Test

Open this URL after deployment:

```text
https://pureluxuriouswater.com/api/google-reviews
```

It should return JSON containing `averageRating`, `totalReviewCount`, and `reviews`. Then refresh the website; the customer review cards will automatically change to Google reviews.

## Safety and policy notes

- Cloudflare Secrets encrypts values and does not show them again after they are saved. Never commit the Google Maps API key to GitHub.
- The website displays Google reviews exactly as supplied. It does not create or modify reviews.
- Do not add self-serving Google-review JSON-LD markup to the homepage; Google does not permit that for LocalBusiness/Organization review snippets.
