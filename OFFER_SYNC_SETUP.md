# Publish Offer Popups on Every Device

The Admin panel originally stored offers in the browser only. This setup enables
one public active offer through the existing Cloudflare Worker, so the same popup
is shown to visitors on mobile and desktop.

## 1. Deploy the Worker update

Deploy the `worker/google-reviews.js` update to the existing Worker. The Worker
continues to serve `/api/google-reviews` and now also serves `/api/offer`.

## 2. Create a Workers KV namespace

In Cloudflare Dashboard:

1. Go to **Workers & Pages** > **KV**.
2. Create a namespace named `clara-offers`.
3. Open your Worker (`clara-google-reviews`) > **Settings** > **Bindings**.
4. Add a **KV Namespace** binding.
5. Set **Variable name** to exactly `OFFERS`.
6. Select `clara-offers`, then click **Deploy**.

## 3. Add the private publishing token

1. Go to the same Worker > **Settings** > **Variables and Secrets**.
2. Add a new **Secret** named exactly `OFFER_ADMIN_TOKEN`.
3. Use a long, random value that only you know. Do not put this token in GitHub,
   `data.js`, `map-config.js`, or chat.
4. Click **Deploy**.

## 4. Deploy the website files

Publish these website files with your regular GitHub/Cloudflare deployment:

- `admin.html`
- `admin.css`
- `admin.js`
- `script.js`
- `worker/google-reviews.js`

## 5. Publish an offer

1. Open `admin.html` and log in.
2. Open **Offer Popups**.
3. Enter the value of `OFFER_ADMIN_TOKEN` in **Cloudflare offer-sync token**.
4. Click **Save Token**. The token lasts only for the current browser session.
5. Add/edit an offer and enable it, or click **Publish Active Offer**.

When an offer is disabled or deleted, the public popup is removed from every
device. It may take a brief moment for Cloudflare KV changes to propagate.
