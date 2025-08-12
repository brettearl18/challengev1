import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/src/lib/firebase.client'
import { doc, updateDoc, setDoc, collection } from 'firebase/firestore'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.payment_status === 'paid') {
          // Extract metadata
          const challengeId = session.metadata?.challengeId
          const email = session.customer_details?.email
          const name = session.customer_details?.name
          const phone = session.customer_details?.phone
          
          if (challengeId && email) {
            // Create or update user
            const userRef = doc(db, 'users', email)
            await setDoc(userRef, {
              email,
              displayName: name || email,
              phone: phone || '',
              role: 'user',
              createdAt: Date.now(),
              updatedAt: Date.now()
            }, { merge: true })

            // Create enrolment
            const enrolmentRef = doc(collection(db, 'enrolments'))
            await setDoc(enrolmentRef, {
              userId: email,
              challengeId,
              paymentStatus: 'paid',
              stripeSessionId: session.id,
              amount: session.amount_total,
              currency: session.currency,
              createdAt: Date.now()
            })

            console.log(`Payment completed for challenge ${challengeId} by ${email}`)
          }
        }
        break

      case 'payment_intent.payment_failed':
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        // Update enrolment status to failed
        if (paymentIntent.metadata?.enrolmentId) {
          const enrolmentRef = doc(db, 'enrolments', paymentIntent.metadata.enrolmentId)
          await updateDoc(enrolmentRef, {
            paymentStatus: 'failed',
            updatedAt: Date.now()
          })
        }
        break

      case 'charge.refunded':
        const charge = event.data.object as Stripe.Charge
        
        // Update enrolment status to refunded
        if (charge.metadata?.enrolmentId) {
          const enrolmentRef = doc(db, 'enrolments', charge.metadata.enrolmentId)
          await updateDoc(enrolmentRef, {
            paymentStatus: 'refunded',
            updatedAt: Date.now()
          })
        }
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
} 