import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
})

export async function POST(req: NextRequest) {
  try {
    const { challengeId, email, name, phone } = await req.json()

    if (!challengeId) {
      return NextResponse.json(
        { error: 'Missing challengeId' }, 
        { status: 400 }
      )
    }

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      )
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID_CHALLENGE!,
          quantity: 1,
        },
      ],
      customer_email: email,
      metadata: {
        challengeId,
        customerName: name,
        customerPhone: phone || '',
      },
      success_url: `${process.env.APP_URL || 'http://localhost:3000'}/dashboard?success=true&challenge=${challengeId}`,
      cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/challenge/${challengeId}`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'AU', 'GB'],
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
} 