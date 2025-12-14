/**
 * Stripe API Client
 * Handles communication with payment-svc Stripe endpoints
 */

// Get API URL from environment
const getPaymentServiceUrl = () => {
  return import.meta.env.VITE_PAYMENT_SVC_URL || 'http://localhost:3013';
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
  const response = await fetch(`${getPaymentServiceUrl()}/payments/stripe/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to create checkout session');
  }

  return response.json();
}

/**
 * Create a Stripe Checkout Session for subscription
 */
export async function createStripeSubscriptionCheckout(
  data: CreateSubscriptionCheckoutRequest
): Promise<CheckoutSessionResponse> {
  const response = await fetch(`${getPaymentServiceUrl()}/payments/stripe/checkout/subscription`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to create subscription checkout session');
  }

  return response.json();
}

/**
 * Create a Payment Intent for custom checkout flows
 */
export async function createStripePaymentIntent(
  data: PaymentIntentRequest
): Promise<PaymentIntentResponse> {
  const response = await fetch(`${getPaymentServiceUrl()}/payments/stripe/payment-intent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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
  const response = await fetch(`${getPaymentServiceUrl()}/payments/stripe/refund`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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
  const response = await fetch(`${getPaymentServiceUrl()}/payments/stripe/billing-portal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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

  return response.json();
}

/**
 * Get Stripe Checkout Session details
 */
export async function getStripeSessionDetails(sessionId: string) {
  const response = await fetch(`${getPaymentServiceUrl()}/payments/stripe/session/${sessionId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
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
