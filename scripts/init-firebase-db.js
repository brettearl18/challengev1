#!/usr/bin/env node

/**
 * Firebase Database Initialization Script
 * 
 * This script ensures all required collections, indexes, and data structures
 * are properly created in Firebase Firestore.
 * 
 * Run with: node scripts/init-firebase-db.js
 */

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Configure dotenv
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '..', '.env.local') })

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
}

if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
  console.error('❌ Missing Firebase Admin credentials in .env.local')
  console.error('Please set: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY')
  process.exit(1)
}

const adminApp = initializeApp({
  credential: cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
})

const db = getFirestore(adminApp)
const storage = getStorage(adminApp)

console.log('🚀 Initializing Firebase Database...')

// Sample data structures for collections
const sampleData = {
  challenges: {
    sample_challenge: {
      id: 'sample_challenge',
      name: 'Sample Fitness Challenge',
      description: 'A sample challenge for testing',
      challengeType: 'fitness',
      status: 'draft',
      startDate: null,
      endDate: null,
      durationDays: 30,
      priceCents: 0,
      currency: 'AUD',
      maxParticipants: 100,
      currentParticipants: 0,
      scoring: {
        checkinPoints: 10,
        workoutPoints: 20,
        nutritionPoints: 15,
        stepsBuckets: [5000, 8000, 10000],
        consistencyBonus: 50,
        streakMultiplier: 1.5
      },
      timezone: 'Australia/Perth',
      requirements: {
        minAge: 18,
        fitnessLevel: 'beginner',
        equipment: [],
        medicalClearance: false
      },
      tags: ['sample', 'fitness'],
      termsAndConditions: 'Sample terms and conditions',
      privacyPolicy: 'Sample privacy policy',
      habits: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1
    }
  },
  users: {
    sample_user: {
      uid: 'sample_user',
      displayName: 'Sample User',
      email: 'sample@example.com',
      role: 'participant',
      timezone: 'Australia/Perth',
      createdAt: Date.now(),
      preferences: {
        notifications: true,
        emailUpdates: true,
        privacyLevel: 'public'
      },
      stats: {
        totalChallenges: 0,
        totalCheckins: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalPoints: 0
      }
    }
  },
  enrolments: {
    sample_enrolment: {
      id: 'sample_enrolment',
      userId: 'sample_user',
      challengeId: 'sample_challenge',
      status: 'active',
      totalScore: 0,
      createdAt: Date.now(),
      progress: {
        daysCompleted: 0,
        totalDays: 30,
        currentStreak: 0,
        longestStreak: 0
      }
    }
  },
  checkins: {
    sample_checkin: {
      id: 'sample_checkin',
      userId: 'sample_user',
      challengeId: 'sample_challenge',
      date: new Date().toISOString().split('T')[0],
      autoScore: 10,
      coachScore: null,
      notes: 'Sample check-in',
      createdAt: Date.now()
    }
  }
}

async function initializeCollections() {
  try {
    console.log('📚 Creating collections and sample data...')
    
    for (const [collectionName, documents] of Object.entries(sampleData)) {
      console.log(`  Creating collection: ${collectionName}`)
      
      for (const [docId, docData] of Object.entries(documents)) {
        try {
                const docRef = db.collection(collectionName).doc(docId)
      await docRef.set(docData, { merge: true })
          console.log(`    ✅ Created document: ${docId}`)
        } catch (error) {
          console.log(`    ⚠️  Document ${docId} already exists or error: ${error.message}`)
        }
      }
    }
    
    console.log('✅ Collections initialized successfully!')
  } catch (error) {
    console.error('❌ Error initializing collections:', error)
  }
}

async function verifyCollections() {
  try {
    console.log('\n🔍 Verifying collections...')
    
    for (const collectionName of Object.keys(sampleData)) {
      try {
        const snapshot = await db.collection(collectionName).get()
        console.log(`  📊 ${collectionName}: ${snapshot.size} documents`)
      } catch (error) {
        console.log(`  ❌ ${collectionName}: Error - ${error.message}`)
      }
    }
  } catch (error) {
    console.error('❌ Error verifying collections:', error)
  }
}

async function checkIndexes() {
  try {
    console.log('\n📋 Checking Firestore indexes...')
    console.log('  Note: Indexes are managed via firestore.indexes.json')
    console.log('  Run "firebase deploy --only firestore:indexes" to deploy indexes')
  } catch (error) {
    console.error('❌ Error checking indexes:', error)
  }
}

async function main() {
  try {
    await initializeCollections()
    await verifyCollections()
    await checkIndexes()
    
    console.log('\n🎉 Firebase Database initialization complete!')
    console.log('\n📝 Next steps:')
    console.log('  1. Deploy Firestore indexes: firebase deploy --only firestore:indexes')
    console.log('  2. Deploy Firestore rules: firebase deploy --only firestore:rules')
    console.log('  3. Deploy Storage rules: firebase deploy --only storage')
    console.log('  4. Test your application!')
    
  } catch (error) {
    console.error('❌ Initialization failed:', error)
    process.exit(1)
  }
}

// Run the initialization
if (require.main === module) {
  main()
}

export { initializeCollections, verifyCollections, checkIndexes }
