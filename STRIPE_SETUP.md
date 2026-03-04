# Stripe payments – setup guide

Your checkout uses **Stripe Checkout**: the customer is sent to Stripe’s hosted page to pay, then redirected back to your confirmation page.

## 1. Stripe account and keys

1. Sign up at [stripe.com](https://stripe.com) and open the **Dashboard**.
2. Turn on **Test mode** (toggle in the sidebar) for development.
3. Go to **Developers → API keys** and copy:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`) – not needed for this server-only flow.
   - **Secret key** (starts with `sk_test_` or `sk_live_`) – you’ll use this in the next step.

## 2. Firebase Cloud Functions (backend)

Stripe’s secret key must stay on the server. The project uses **Firebase Cloud Functions** to create a Checkout Session and confirm payment.

### Prerequisites

- Node.js 18+
- Firebase CLI: `npm install -g firebase-tools`
- Log in: `firebase login`
- Your Firebase project must be on the **Blaze (pay-as-you-go)** plan to run Cloud Functions.

### Install and configure

```bash
cd "c:\Humber College\Capstone Project\Capstone Pottery Website"
cd functions
npm install
```

Set your Stripe secret key (use your real key instead of `sk_test_...`):

```bash
firebase functions:config:set stripe.secret="sk_test_YOUR_STRIPE_SECRET_KEY"
```

### Optional: success URL for production

When you deploy to a real domain (e.g. Firebase Hosting), set the origin used in success/cancel URLs:

```bash
firebase functions:config:set stripe.success_origin="https://your-site.web.app"
```

(Your frontend already sends `successUrl` and `cancelUrl` from `window.location`, so this is only needed if you want to override the default.)

### Deploy

From the **project root** (not inside `functions`):

```bash
firebase deploy --only functions
```

You should see URLs for `createStripeCheckoutSession` and `confirmStripePayment`. The Firebase client SDK will call them automatically.

## 3. Flow summary

1. Customer fills checkout form and clicks **Place Order**.
2. An order is created in Firestore with status `pending` (then `pending_payment` when redirecting to Stripe).
3. The frontend calls the **createStripeCheckoutSession** function with order id, amount (in paise), and customer email.
4. The function creates a Stripe Checkout Session and returns the session URL.
5. The browser redirects to Stripe; the customer pays.
6. Stripe redirects to your **confirmation** page with `?orderId=...&session_id=...`.
7. The confirmation page calls **confirmStripePayment** with `orderId` and `sessionId`; the function verifies the payment with Stripe and updates the order to `paid`.

If Cloud Functions are not deployed or Stripe is not configured, checkout still works: the order is created and the customer is sent to the confirmation page without going through Stripe (no payment).

## 4. Testing

- Use **Stripe test cards**: [stripe.com/docs/testing](https://stripe.com/docs/testing) (e.g. `4242 4242 4242 4242`).
- Keep **Test mode** on in the Stripe Dashboard until you’re ready for live payments.
- For live payments, set `stripe.secret` to your **live** secret key and redeploy.

## 5. Going live

- Replace the test secret with your **live** secret key in Firebase config and redeploy functions.
- Ensure your Stripe account is fully activated and verified.
- Use **HTTPS** for your site (e.g. Firebase Hosting) so redirects and callable functions work correctly.
