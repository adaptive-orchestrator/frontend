/**
 * Stripe API Client
 * Handles communication with API Gateway Stripe endpoints
 */

import Cookies from 'js-cookie';

// Get API URL from environment - Use API Gateway instead of direct payment service
const getApiUrl = () => {
  return import.meta.env.VITE_API_BASE || 'http://localhost:3000';
};

export interface CheckoutLineItem {
  productId: string;
  name: string;
  price: number; // Price in cents (smallest currency unit)
  quantity: number;
}

export interface CreateCheckoutSessionRequest {
  lineItems: CheckoutLineItem[];
  orderId: string;
  customerId: string;
  successUrl?: string;
  cancelUrl?: string;
  currency?: string;
}

export interface CreateSubscriptionCheckoutRequest {
  customerId: string;
  email: string;
  priceId: string;
  subscriptionId?: string;
  planName?: string;
  stripeCustomerId?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface PaymentIntentRequest {
  amount: number;
  currency?: string;
  orderId?: string;
  customerId?: string;
}

export interface PaymentIntentResponse {
  paymentIntentId: string;
  clientSecret: string;
  status: string;
}

export interface RefundRequest {
  paymentIntentId: string;
  orderId: string;
  amount?: number;
  reason?: string;
}

export interface RefundResponse {
  refundId: string;
  amount: number;
  status: string;
}

/**
 * Create a Stripe Checkout Session for one-time payment
 */
export async function createStripeCheckoutSession(
  data: CreateCheckoutSessionRequest
): Promise<CheckoutSessionResponse> {
  const token = Cookies.get('token');

  const response = await fetch(`${getApiUrl()}/payments/stripe/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      orderId: data.orderId,
      items: data.lineItems,
      successUrl: data.successUrl,
      cancelUrl: data.cancelUrl,
      currency: data.currency || 'usd',
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to create checkout session');
  }

  const result = await response.json();
  // API Gateway returns { sessionId, checkoutUrl, success }
  // Normalize to { sessionId, url } format
  return {
    sessionId: result.sessionId,
    url: result.checkoutUrl || result.url,
  };
}

/**
 * Create a Stripe Checkout Session for subscription
 */
export async function createStripeSubscriptionCheckout(
  data: CreateSubscriptionCheckoutRequest
): Promise<CheckoutSessionResponse> {
  const token = Cookies.get('token');

  const response = await fetch(`${getApiUrl()}/payments/stripe/subscription-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to create subscription checkout session');
  }

  const result = await response.json();
  return {
    sessionId: result.sessionId,
    url: result.checkoutUrl || result.url,
  };
}

/**
 * Create a Payment Intent for custom checkout flows
 */
export async function createStripePaymentIntent(
  data: PaymentIntentRequest
): Promise<PaymentIntentResponse> {
  const token = Cookies.get('token');

  const response = await fetch(`${getApiUrl()}/payments/stripe/payment-intent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to create payment intent');
  }

  return response.json();
}

/**
 * Create a refund
 */
export async function createStripeRefund(data: RefundRequest): Promise<RefundResponse> {
  const token = Cookies.get('token');

  const response = await fetch(`${getApiUrl()}/payments/stripe/refund`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to create refund');
  }

  return response.json();
}

/**
 * Get Stripe Billing Portal URL
 */
export async function getStripeBillingPortalUrl(
  stripeCustomerId: string,
  returnUrl?: string
): Promise<{ url: string }> {
  const token = Cookies.get('token');

  const response = await fetch(`${getApiUrl()}/payments/stripe/billing-portal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      stripeCustomerId,
      returnUrl,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to create billing portal session');
  }

  const result = await response.json();
  return {
    url: result.portalUrl || result.url,
  };
}

/**
 * Get Stripe Checkout Session details
 */
export async function getStripeSessionDetails(sessionId: string) {
  const token = Cookies.get('token');

  const response = await fetch(`${getApiUrl()}/payments/stripe/session/${sessionId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to get session details');
  }

  return response.json();
}

/**
 * Convert cart items to Stripe line items
 * Price should be in cents (multiply by 100 for USD)
 */
export function cartItemsToStripeLineItems(
  items: Array<{ product: { id: string; name: string; price: number }; quantity: number }>,
  _currency: string = 'usd'
): CheckoutLineItem[] {
  return items.map((item) => ({
    productId: item.product.id,
    name: item.product.name,
    // Convert to cents (Stripe uses smallest currency unit)
    price: Math.round(item.product.price * 100),
    quantity: item.quantity,
  }));
}
