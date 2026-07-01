/**
 * Central config — replace the placeholder values below with your real details.
 * See README.md for step-by-step setup instructions for each one.
 */
window.CONFIG = {
  // 1. Stripe Payment Link (Stripe Dashboard > Payment Links > Create).
  //    Set its "After payment" redirect to your thank-you.html page URL.
  STRIPE_PAYMENT_LINK: "https://buy.stripe.com/3cIcN40vFePV6KR4Dq4c800",

  // 2. WhatsApp link. Format: https://wa.me/<countrycode><number> (no spaces, no +)
  WHATSAPP_LINK: "https://www.whas.me/3ERhdlkvgY",

  // 3. Google Apps Script Web App URL (see apps-script/Code.gs + README.md).
  GOOGLE_SHEETS_WEBHOOK_URL: "https://script.google.com/macros/s/REPLACE_WITH_YOUR_DEPLOYMENT_ID/exec",

  // Brand name shown in the header/footer.
  BRAND_NAME: "Nomi Media",
};
