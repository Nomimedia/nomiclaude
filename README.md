# Nomi Media — 30-Day Content Plan System (Landing Page + Application Funnel)

A static, black/pink/white-themed landing page and 3-step application funnel:

```
Ad click → index.html (landing)
        → step1.html  (Name, WhatsApp, Email, Industry, social links)
        → step2.html  (Monthly budget, main marketing goal)
        → step3.html  (Stripe payment)
        → thank-you.html (after successful payment only)
```

No build tools, frameworks, or Node server required — plain HTML/CSS/JS, so you
can upload the whole folder straight into Hostinger's `public_html` via File
Manager or FTP.

## File structure

```
index.html            Landing page
step1.html             Step 1: contact + social details
step2.html             Step 2: budget + goal
step3.html             Step 3: payment
thank-you.html         Post-payment thank-you page
assets/css/style.css   All styling (black background, pink/white theme)
assets/js/config.js    <-- YOUR SETTINGS GO HERE (Stripe link, WhatsApp, webhook URL)
assets/js/form.js      Shared form/validation/storage logic
apps-script/Code.gs    Google Apps Script — saves leads into a Google Sheet in your Drive
content-plan-template/ Sample 30-day content calendar template your team can customize per client
```

## 1. Configure the site — `assets/js/config.js`

Open this file and replace the three placeholder values:

```js
window.CONFIG = {
  STRIPE_PAYMENT_LINK: "...",       // see step 2 below
  WHATSAPP_LINK: "...",             // https://wa.me/<countrycode+number>, e.g. https://wa.me/60123456789
  GOOGLE_SHEETS_WEBHOOK_URL: "...", // see step 3 below
};
```

## 2. Set up Stripe payment

1. In your Stripe Dashboard, go to **Payment Links** > **Create payment link**.
2. Set your product/price for the content plan package.
3. Under the link's **"After payment"** settings, choose **"Redirect customers to your website"** and enter your live `thank-you.html` URL, e.g.:
   `https://yourdomain.com/thank-you.html`
   This is what guarantees customers only land on the thank-you page **after** they've actually paid.
4. Copy the payment link URL (looks like `https://buy.stripe.com/xxxxxxxx`) into `STRIPE_PAYMENT_LINK` in `config.js`.

## 3. Set up lead storage to Google Drive (via Google Sheets)

1. Create a new Google Sheet (e.g. "Nomi Media Leads") — it lives in your Google Drive automatically.
2. In the sheet: **Extensions > Apps Script**.
3. Delete the placeholder code and paste in the contents of `apps-script/Code.gs`.
4. Click **Deploy > New deployment** → type **Web app** → Execute as **Me** → Who has access **Anyone**.
5. Deploy, authorize the permissions Google asks for, then copy the generated **Web app URL**.
6. Paste that URL into `GOOGLE_SHEETS_WEBHOOK_URL` in `config.js`.

Every time someone completes Step 2, their full application (name, WhatsApp,
email, industry, social links, budget, goal) is appended as a new row in the
"Leads" sheet — so you have a record even if they don't complete payment.

## 4. Set your WhatsApp link

Replace `WHATSAPP_LINK` in `config.js` with your real WhatsApp link, format:
`https://wa.me/60123456789` (country code + number, no spaces, no `+` or leading `0`).

This link is used on the thank-you page's "Chat With Us on WhatsApp" button.

## 5. Deploy to Hostinger

1. Log into hPanel → **File Manager** (or use FTP).
2. Upload the entire contents of this folder into `public_html` (or a subfolder if this isn't your root domain).
3. Make sure `index.html`, `step1.html`, `step2.html`, `step3.html`, `thank-you.html`, and the `assets/` folder are all at the same level.
4. Visit your domain — the funnel is live.

No `.htaccess`, PHP, or database setup is required.

## Notes on the flow

- Lead data is kept in the browser's `sessionStorage` while the user moves
  between steps, so nothing is lost if they go back. It's cleared when they
  click "Apply for Another Application" on the thank-you page.
- If a user opens `step2.html` or `step3.html` directly without completing the
  earlier step, they're automatically redirected back to the right step.
- The thank-you page message tells customers our team will reach out via
  WhatsApp or email within 24 hours, and that their custom plan will be ready
  within 3 working days.
- Because this is a static site, there's no automated way to verify payment
  success beyond Stripe's own redirect — reconcile actual payments in your
  Stripe Dashboard. If you later want automatic payment confirmation (e.g. to
  auto-tag a lead as "Paid" in the sheet), that requires a small backend to
  receive Stripe webhooks — let me know if you'd like that added later.

## Content plan template

`content-plan-template/30-Day-Content-Plan-Template.csv` is a starter 30-day
content calendar (day, platform, content type, theme, caption idea, CTA, goal
alignment) your team can duplicate and customize for each paying client based
on their industry and stated goal.
