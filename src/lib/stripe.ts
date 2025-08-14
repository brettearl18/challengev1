import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export const createCheckoutSession = async (params: {
  challengeId: string
  userId: string
  priceId: string
  successUrl: string
  cancelUrl: string
}) => {
  const { challengeId, userId, priceId, successUrl, cancelUrl } = params

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { challengeId, userId },
    customer_email: undefined, // Will be collected during checkout
  })

  return session
} 