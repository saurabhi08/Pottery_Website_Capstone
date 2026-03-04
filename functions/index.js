/**
 * Firebase Cloud Functions - Stripe Checkout for Mumbaa Ceramic Studio
 *
 * Setup:
 * 1. Install: cd functions && npm install
 * 2. Set Stripe secret: firebase functions:config:set stripe.secret="sk_test_..."
 * 3. Deploy: firebase deploy --only functions
 *
 * Requires Blaze (pay-as-you-go) plan for Cloud Functions.
 */
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(functions.config().stripe?.secret || process.env.STRIPE_SECRET_KEY);

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Callable: createStripeCheckoutSession
 * Body: { orderId, amountPaise, currency, customerEmail, successUrl, cancelUrl }
 * Returns: { url } (Stripe Checkout URL to redirect the user)
 */
exports.createStripeCheckoutSession = functions.https.onCall(async (data, context) => {
  const { orderId, amountPaise, currency, customerEmail, successUrl, cancelUrl } = data || {};

  if (!orderId || amountPaise == null || amountPaise < 1) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing orderId or invalid amount.');
  }

  const amount = Math.round(Number(amountPaise));
  const curr = (currency || 'inr').toLowerCase();
  const baseUrl = functions.config().stripe?.success_origin || process.env.STRIPE_SUCCESS_ORIGIN || 'https://your-site.web.app';
  const success = successUrl || `${baseUrl}/confirmation.html?orderId=${encodeURIComponent(orderId)}`;
  const cancel = cancelUrl || `${baseUrl}/checkout.html`;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: curr,
            product_data: {
              name: 'Order #' + orderId,
              description: 'Mumbaa Ceramic Studio – your order',
              images: [],
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: success,
      cancel_url: cancel,
      client_reference_id: orderId,
      customer_email: customerEmail || undefined,
      metadata: { orderId },
    });

    return { url: session.url };
  } catch (err) {
    console.error('Stripe session error:', err);
    throw new functions.https.HttpsError('internal', err.message || 'Failed to create checkout session.');
  }
});

/**
 * Callable: confirmStripePayment
 * Call this from the confirmation page with orderId + session_id from Stripe redirect.
 * Verifies the session with Stripe and marks the order as paid.
 * Body: { orderId, sessionId }
 */
exports.confirmStripePayment = functions.https.onCall(async (data, context) => {
  const { orderId, sessionId } = data || {};
  if (!orderId || !sessionId) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing orderId or sessionId.');
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid' || (session.client_reference_id && session.client_reference_id !== orderId)) {
      return { ok: false, reason: 'Payment not completed or order mismatch.' };
    }
    await db.collection('orders').doc(orderId).update({
      status: 'paid',
      stripeSessionId: sessionId,
      paidAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { ok: true };
  } catch (err) {
    console.error('confirmStripePayment error:', err);
    throw new functions.https.HttpsError('internal', err.message || 'Failed to confirm payment.');
  }
});
