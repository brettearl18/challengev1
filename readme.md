# Fitness Challenge Starter (Next.js + Firebase)

Below is a minimal file tree and copy‑pasteable stubs to get you live fast in Cursor. It uses Next.js (App Router), Firebase (Auth, Firestore, Storage, Functions), Stripe Checkout, and scheduled jobs.

---

## File tree (monorepo style)
```
fitness-challenge/
├─ app/                      # Next.js app
│  ├─ (marketing)/
│  │  └─ page.tsx
│  ├─ challenges/
│  │  └─ page.tsx
│  ├─ challenge/
│  │  └─ [id]/page.tsx
│  ├─ join/
│  │  └─ [id]/page.tsx
│  ├─ dashboard/page.tsx
│  ├─ checkin/page.tsx
│  ├─ leaderboard/
│  │  └─ [id]/page.tsx
│  ├─ api/
│  │  └─ auth/
│  │     └─ [..nextauth]/route.ts  # (optional if you add NextAuth)
│  ├─ layout.tsx
│  └─ globals.css
├─ src/
│  ├─ lib/firebase.client.ts
│  ├─ lib/firebase.admin.ts
│  ├─ lib/stripe.ts
│  ├─ server/firestore.ts
│  ├─ server/scoring.ts
│  ├─ server/leaderboard.ts
│  ├─ types.ts
│  └─ zod.ts
├─ public/
│  └─ logo.svg
├─ .env.local.example
├─ next.config.mjs
├─ package.json
├─ tsconfig.json
├─ postcss.config.js
├─ tailwind.config.ts
├─ firebase.json
├─ firestore.indexes.json
├─ firestore.rules
├─ storage.rules
├─ functions/
│  ├─ package.json
│  ├─ tsconfig.json
│  └─ src/index.ts
└─ README.md
```

---

## package.json (root)
```json
{
  "name": "fitness-challenge",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "emulators": "firebase emulators:start",
    "deploy": "firebase deploy"
  },
  "dependencies": {
    "firebase": "^10.12.3",
    "firebase-admin": "^12.5.0",
    "next": "^14.2.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "stripe": "^16.0.0",
    "zod": "^3.23.8",
    "tailwindcss": "^3.4.7",
    "@tanstack/react-query": "^5.51.0",
    "clsx": "^2.1.1"
  },
  "devDependencies": {
    "@types/node": "^20.12.12",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "typescript": "^5.5.4",
    "eslint": "^8.57.0",
    "postcss": "^8.4.40",
    "autoprefixer": "^10.4.19"
  }
}
```

---

## .env.local.example (copy → .env.local)
```
# Firebase (client)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (server)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PRICE_ID_CHALLENGE=
STRIPE_WEBHOOK_SECRET=

# App
APP_URL=http://localhost:3000
DEFAULT_TIMEZONE=Australia/Perth
```

---

## next.config.mjs
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { allowedOrigins: [process.env.APP_URL || "http://localhost:3000"] }
  }
};
export default nextConfig;
```

---

## Tailwind setup
### tailwind.config.ts
```ts
import type { Config } from 'tailwindcss'
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: { extend: {} },
  plugins: [],
}
export default config
```

### postcss.config.js
```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### app/globals.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## src/types.ts (data model)
```ts
export type Role = 'participant' | 'coach' | 'admin'

export interface UserProfile {
  uid: string
  displayName?: string
  photoURL?: string
  email?: string
  role: Role
  timezone?: string
  createdAt: number // ms epoch
}

export interface Challenge {
  id: string
  name: string
  description?: string
  bannerUrl?: string
  startDate?: string // ISO; used when cohort has fixed start
  endDate?: string
  durationDays?: number // alternative to fixed dates
  priceCents: number
  currency: 'AUD' | 'USD'
  scoring: {
    checkinPoints: number
    workoutPoints: number
    nutritionPoints: number
    stepsBuckets: number[] // e.g. [5000, 8000, 10000]
  }
  timezone: string // cohort timezone
  status: 'draft' | 'published' | 'archived'
  createdAt: number
}

export interface Enrolment {
  id: string
  userId: string
  challengeId: string
  paymentStatus: 'pending' | 'paid' | 'refunded'
  createdAt: number
}

export interface Checkin {
  id: string
  enrolmentId: string
  challengeId: string
  period: 'daily' | 'weekly'
  date: string // yyyy-mm-dd in challenge timezone
  weightKg?: number
  steps?: number
  workouts?: number
  nutritionScore?: number // 0-10 self-report
  photos?: string[] // storage paths
  autoScore?: number
  coachScore?: number
  createdAt: number
}
```

---

## src/zod.ts (validation)
```ts
import { z } from 'zod'

export const CheckinSchema = z.object({
  enrolmentId: z.string().min(1),
  challengeId: z.string().min(1),
  period: z.enum(['daily', 'weekly']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  weightKg: z.number().min(0).max(500).optional(),
  steps: z.number().int().min(0).max(100000).optional(),
  workouts: z.number().int().min(0).max(10).optional(),
  nutritionScore: z.number().int().min(0).max(10).optional(),
  photos: z.array(z.string()).max(4).optional(),
})
export type CheckinInput = z.infer<typeof CheckinSchema>
```

---

## src/lib/firebase.client.ts (client SDK)
```ts
import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
}

export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
```

---

## src/lib/firebase.admin.ts (admin SDK for server actions)
```ts
import admin from 'firebase-admin'

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  })
}

export const adminDb = admin.firestore()
export const adminAuth = admin.auth()
export const adminStorage = admin.storage()
```

---

## src/server/scoring.ts (pure function)
```ts
export function computeScore(input: {
  checkinPoints: number
  workoutPoints: number
  nutritionPoints: number
  stepsBuckets: number[]
  steps?: number
  workouts?: number
  nutritionScore?: number
}) {
  const { checkinPoints, workoutPoints, nutritionPoints, stepsBuckets, steps, workouts, nutritionScore } = input
  let score = checkinPoints
  if (typeof workouts === 'number') score += Math.min(workouts, 2) * workoutPoints
  if (typeof nutritionScore === 'number') score += Math.round((nutritionScore / 10) * nutritionPoints)
  if (typeof steps === 'number') {
    const bucket = stepsBuckets.filter(b => steps >= b).length
    score += bucket * 2
  }
  return score
}
```

---

## Minimal pages
### app/(marketing)/page.tsx
```tsx
export default function Page() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-3xl font-bold">Join the 30‑Day Fitness Challenge</h1>
      <p className="mt-4 text-muted-foreground">Cohort‑based accountability, daily check‑ins, and prizes. Starts monthly.</p>
      <a className="mt-6 inline-block rounded bg-black px-4 py-2 text-white" href="/challenges">See Challenges</a>
    </main>
  )
}
```

### app/challenges/page.tsx
```tsx
'use client'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/src/lib/firebase.client'
import { useEffect, useState } from 'react'

export default function Page() {
  const [items, setItems] = useState<any[]>([])
  useEffect(() => {
    const run = async () => {
      const q = query(collection(db, 'challenges'), where('status', '==', 'published'))
      const snap = await getDocs(q)
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }
    run()
  }, [])

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-semibold">Available Challenges</h1>
      <ul className="mt-6 space-y-4">
        {items.map(ch => (
          <li key={ch.id} className="rounded border p-4">
            <h2 className="text-xl font-medium">{ch.name}</h2>
            <p className="text-sm opacity-80">{ch.description}</p>
            <a className="mt-3 inline-block underline" href={`/challenge/${ch.id}`}>View</a>
          </li>
        ))}
      </ul>
    </main>
  )
}
```

### app/challenge/[id]/page.tsx
```tsx
'use client'
import { useEffect, useState } from 'react'
import { db } from '@/src/lib/firebase.client'
import { doc, getDoc } from 'firebase/firestore'

export default function Page({ params }: { params: { id: string } }) {
  const [ch, setCh] = useState<any>()
  useEffect(() => { (async () => {
    const ref = doc(db, 'challenges', params.id)
    const snap = await getDoc(ref)
    setCh({ id: snap.id, ...snap.data() })
  })() }, [params.id])

  if (!ch) return <div className="p-8">Loading...</div>
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-3xl font-bold">{ch.name}</h1>
      <p className="mt-2 opacity-80">{ch.description}</p>
      <a className="mt-6 inline-block rounded bg-black px-4 py-2 text-white" href={`/join/${ch.id}`}>Join for {(ch.priceCents/100).toFixed(2)} {ch.currency}</a>
    </main>
  )
}
```

### app/join/[id]/page.tsx (client → server action call)
```tsx
'use client'
import { useState, useTransition } from 'react'

export default function Page({ params }: { params: { id: string } }) {
  const [loading, startTransition] = useTransition()
  const [err, setErr] = useState<string | null>(null)

  const checkout = async () => {
    setErr(null)
    startTransition(async () => {
      const res = await fetch('/api/checkout', { method: 'POST', body: JSON.stringify({ challengeId: params.id }) })
      const json = await res.json()
      if (json.url) window.location.href = json.url
      else setErr(json.error || 'Checkout failed')
    })
  }

  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="text-2xl font-semibold">Secure Checkout</h1>
      <button onClick={checkout} disabled={loading} className="mt-6 rounded bg-black px-4 py-2 text-white">{loading ? 'Redirecting…' : 'Pay with Stripe'}</button>
      {err && <p className="mt-3 text-red-600">{err}</p>}
    </main>
  )
}
```

### app/checkin/page.tsx (bare-bones)
```tsx
'use client'
import { useState } from 'react'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db, storage } from '@/src/lib/firebase.client'
import { CheckinSchema } from '@/src/zod'

export default function Page() {
  const [state, setState] = useState({ steps: 0, workouts: 0, nutritionScore: 7 })
  const [uploading, setUploading] = useState(false)

  const submit = async () => {
    const date = new Date().toISOString().slice(0,10)
    const input = { enrolmentId: 'TODO', challengeId: 'TODO', period: 'daily' as const, date, ...state }
    const parsed = CheckinSchema.safeParse(input)
    if (!parsed.success) return alert('Invalid input')
    await addDoc(collection(db, 'checkins'), { ...input, createdAt: Date.now(), _serverTime: serverTimestamp() })
    alert('Saved')
  }

  const uploadPhoto = async (file: File) => {
    setUploading(true)
    const path = `checkins/tmp/${Date.now()}-${file.name}`
    const task = uploadBytesResumable(ref(storage, path), file, { cacheControl: 'public,max-age=3600' })
    await task
    const url = await getDownloadURL(task.snapshot.ref)
    setUploading(false)
    alert('Uploaded: ' + url)
  }

  return (
    <main className="mx-auto max-w-xl p-8 space-y-4">
      <h1 className="text-2xl font-semibold">Daily Check‑in</h1>
      <label className="block">Steps<input type="number" className="mt-1 w-full border p-2" value={state.steps} onChange={e=>setState(s=>({...s, steps: +e.target.value}))}/></label>
      <label className="block">Workouts<input type="number" className="mt-1 w-full border p-2" value={state.workouts} onChange={e=>setState(s=>({...s, workouts: +e.target.value}))}/></label>
      <label className="block">Nutrition (0-10)<input type="number" className="mt-1 w-full border p-2" value={state.nutritionScore} onChange={e=>setState(s=>({...s, nutritionScore: +e.target.value}))}/></label>
      <input type="file" accept="image/*" onChange={e=> e.target.files && uploadPhoto(e.target.files[0])} />
      <button onClick={submit} disabled={uploading} className="rounded bg-black px-4 py-2 text-white">Submit</button>
    </main>
  )
}
```

---

## Minimal API route for Stripe Checkout (Next server)
> You can also do checkout entirely via Cloud Functions; this keeps it inside Next for speed.

Create: `app/api/checkout/route.ts`
```ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const { challengeId } = await req.json()
  if (!challengeId) return NextResponse.json({ error: 'Missing challengeId' }, { status: 400 })

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: process.env.STRIPE_PRICE_ID_CHALLENGE!, quantity: 1 }],
    success_url: `${process.env.APP_URL}/dashboard?c=${challengeId}`,
    cancel_url: `${process.env.APP_URL}/challenge/${challengeId}`,
    metadata: { challengeId }
  })
  return NextResponse.json({ url: session.url })
}
```

---

## Firebase config
### firebase.json
```json
{
  "functions": {
    "source": "functions",
    "ignore": ["node_modules", ".git", "firebase-debug.log", "**/node_modules/**" ]
  },
  "emulators": {
    "functions": { "port": 5001 },
    "firestore": { "port": 8080 },
    "hosting": { "port": 5000 },
    "ui": { "enabled": true }
  }
}
```

### firestore.rules (lock it down)
```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function isAdmin() { return isSignedIn() && request.auth.token.role == 'admin'; }

    match /users/{uid} {
      allow read: if isSignedIn() && request.auth.uid == uid;
      allow write: if isSignedIn() && request.auth.uid == uid;
    }

    match /challenges/{id} {
      allow read: if true; // public
      allow write: if isAdmin();
    }

    match /enrolments/{id} {
      allow read, write: if isSignedIn() && request.auth.uid == request.resource.data.userId;
      allow update: if isAdmin();
    }

    match /checkins/{id} {
      allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
      allow read: if isSignedIn() && (resource.data.userId == request.auth.uid || isAdmin());
      allow update, delete: if isAdmin();
    }

    match /leaderboards/{id} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /{document=**} {
      allow read, write: if false; // default deny
    }
  }
}
```

### storage.rules
```rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function isSignedIn() { return request.auth != null; }
    function isAdmin() { return isSignedIn() && request.auth.token.role == 'admin'; }

    match /checkins/{allPaths=**} {
      allow read: if isAdmin() || resource.metadata.userId == request.auth.uid;
      allow write: if isSignedIn();
    }

    match /public/{allPaths=**} { allow read: if true; }
  }
}
```

### firestore.indexes.json (placeholder)
```json
{
  "indexes": [
    { "collectionGroup": "checkins", "queryScope": "COLLECTION", "fields": [
      { "fieldPath": "challengeId", "order": "ASCENDING" },
      { "fieldPath": "date", "order": "DESCENDING" }
    ]}
  ],
  "fieldOverrides": []
}
```

---

## Cloud Functions stubs (TypeScript)
### functions/package.json
```json
{
  "name": "functions",
  "main": "lib/index.js",
  "scripts": {
    "build": "tsc -p .",
    "serve": "npm run build && firebase emulators:start --only functions",
    "deploy": "npm run build && firebase deploy --only functions"
  },
  "dependencies": {
    "firebase-admin": "^12.5.0",
    "firebase-functions": "^5.0.1",
    "stripe": "^16.0.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "typescript": "^5.5.4"
  }
}
```

### functions/tsconfig.json
```json
{
  "compilerOptions": {
    "lib": ["es2021"],
    "module": "commonjs",
    "target": "es2021",
    "outDir": "lib",
    "rootDir": "src",
    "strict": true
  },
  "include": ["src"]
}
```

### functions/src/index.ts
```ts
import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import Stripe from 'stripe'
import { z } from 'zod'

admin.initializeApp()
const db = admin.firestore()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

// 1) Stripe webhook → create enrolment
type StripeSession = {
  id: string
  status: string | null
  metadata?: { challengeId?: string, userId?: string }
  customer_email?: string | null
}

export const onStripeWebhook = functions.https.onRequest(async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'] as string
    const event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET as string)

    if (event.type === 'checkout.session.completed') {
      const s = event.data.object as unknown as StripeSession
      const challengeId = s.metadata?.challengeId
      const userId = s.metadata?.userId
      if (challengeId && userId) {
        await db.collection('enrolments').add({
          userId, challengeId, paymentStatus: 'paid', createdAt: Date.now()
        })
      }
    }
    res.json({ received: true })
  } catch (e: any) {
    console.error(e)
    res.status(400).send(`Webhook Error: ${e.message}`)
  }
})

// 2) Score on check-in write
const Checkin = z.object({
  challengeId: z.string(),
  enrolmentId: z.string(),
  date: z.string(),
  steps: z.number().optional(),
  workouts: z.number().optional(),
  nutritionScore: z.number().optional()
})

export const onCheckinWrite = functions.firestore
  .document('checkins/{id}')
  .onCreate(async (snap) => {
    const data = snap.data()
    const parsed = Checkin.safeParse(data)
    if (!parsed.success) return

    const chRef = db.collection('challenges').doc(parsed.data.challengeId)
    const chSnap = await chRef.get()
    if (!chSnap.exists) return
    const scoring = chSnap.get('scoring') || { checkinPoints: 5, workoutPoints: 3, nutritionPoints: 5, stepsBuckets: [5000,8000,10000] }

    const score = computeScore({
      checkinPoints: scoring.checkinPoints,
      workoutPoints: scoring.workoutPoints,
      nutritionPoints: scoring.nutritionPoints,
      stepsBuckets: scoring.stepsBuckets,
      steps: parsed.data.steps,
      workouts: parsed.data.workouts,
      nutritionScore: parsed.data.nutritionScore
    })

    await snap.ref.update({ autoScore: score })

    // denormalised leaderboard update
    const lbRef = db.collection('leaderboards').doc(parsed.data.challengeId)
    await db.runTransaction(async (tx) => {
      const lb = await tx.get(lbRef)
      const current = lb.exists ? lb.data() as any : { totals: {} }
      current.totals[parsed.data.enrolmentId] = (current.totals[parsed.data.enrolmentId] || 0) + score
      tx.set(lbRef, current, { merge: true })
    })
  })

function computeScore({ checkinPoints, workoutPoints, nutritionPoints, stepsBuckets, steps, workouts, nutritionScore }:{
  checkinPoints:number, workoutPoints:number, nutritionPoints:number, stepsBuckets:number[], steps?:number, workouts?:number, nutritionScore?:number
}){
  let score = checkinPoints
  if (typeof workouts === 'number') score += Math.min(workouts,2)*workoutPoints
  if (typeof nutritionScore === 'number') score += Math.round((nutritionScore/10)*nutritionPoints)
  if (typeof steps === 'number') score += stepsBuckets.filter(b => steps >= b).length * 2
  return score
}

// 3) Daily reminders (Cloud Scheduler → HTTPS)
export const remindersJob = functions.https.onRequest(async (_req, res) => {
  // Query active challenges and send emails/FCM (pseudo)
  const active = await db.collection('challenges').where('status','==','published').get()
  for (const doc of active.docs) {
    const challengeId = doc.id
    const enrols = await db.collection('enrolments').where('challengeId','==',challengeId).get()
    // TODO: loop enrols, send email/push via your provider
  }
  res.json({ ok: true })
})
```

---

## README.md (quick start)
```md
# Fitness Challenge Starter

## Prereqs
- Node 18+
- Firebase CLI: `npm i -g firebase-tools`
- Stripe account & Price

## Setup
1. `npm i` (root) and `cd functions && npm i`
2. Create Firebase project; add Web App; fill `.env.local`.
3. `firebase init` (choose Firestore, Functions, Emulators). Replace rules with the provided ones.
4. `npm run dev` to start Next. `npm run emulators` to run Firebase locally.
5. Create a `challenges` doc manually in Firestore with `status='published'` and a `scoring` object to see it on `/challenges`.
6. Configure Stripe price id in `.env.local` and webhook → point to your deployed `onStripeWebhook` function.

## Deploy
- `firebase deploy` (Functions)
- Host Next on Vercel; set env vars.
