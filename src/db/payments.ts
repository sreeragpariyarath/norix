import type { DbEntry } from '../types.js';

export const paymentsEntries: DbEntry[] = [
  { packages: ['stripe'], label: 'Stripe', role: 'payment-processor' },
  { packages: ['paypal-rest-sdk', '@paypal/checkout-server-sdk'], label: 'PayPal', role: 'payment-processor' },
  { packages: ['braintree'], label: 'Braintree', role: 'payment-processor' },
  { packages: ['razorpay'], label: 'Razorpay', role: 'payment-processor' },
  { packages: ['@lemonsqueezy/lemonsqueezy.js'], label: 'Lemon Squeezy', role: 'billing-platform' },
  { packages: ['paddle-js', '@paddle/paddle-js'], label: 'Paddle', role: 'billing-platform' },
];
