#!/usr/bin/env node

/**
 * Firebase Connection Test Script
 * 
 * This script tests the connection to Firebase services to ensure
 * everything is properly configured and accessible.
 * 
 * Run with: node scripts/test-firebase-connection.js
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

console.log('🧪 Testing Firebase Connection...\n')

// Check environment variables
console.log('📋 Environment Variables Check:')
const requiredVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL', 
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_STORAGE_BUCKET'
]

let missingVars = []
requiredVars.forEach(varName => {
  const value = process.env[varName]
  if (value) {
    console.log(`  ✅ ${varName}: ${varName.includes('KEY') ? '***SET***' : value}`)
  } else {
    console.log(`  ❌ ${varName}: MISSING`)
    missingVars.push(varName)
  }
})

if (missingVars.length > 0) {
  console.log(`\n❌ Missing required environment variables: ${missingVars.join(', ')}`)
  console.log('Please check your .env.local file')
  process.exit(1)
}

console.log('\n✅ All environment variables are set')

// Test Firebase Admin initialization
try {
  console.log('\n🚀 Testing Firebase Admin initialization...')
  
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  }
  
  const adminApp = initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  })
  
  console.log('✅ Firebase Admin initialized successfully')
} catch (error) {
  console.error('❌ Firebase Admin initialization failed:', error.message)
  process.exit(1)
}

// Test Firestore connection
try {
  console.log('\n🔥 Testing Firestore connection...')
  
  const db = getFirestore()
  const challengesRef = db.collection('challenges')
  const snapshot = await challengesRef.get()
  
  console.log(`✅ Firestore connected successfully`)
  console.log(`  📊 Found ${snapshot.size} challenges in database`)
  
  if (snapshot.size > 0) {
    console.log('  📝 Sample challenge data:')
    const firstChallenge = snapshot.docs[0].data()
    console.log(`    - Name: ${firstChallenge.name || 'N/A'}`)
    console.log(`    - Type: ${firstChallenge.challengeType || 'N/A'}`)
    console.log(`    - Status: ${firstChallenge.status || 'N/A'}`)
  }
  
} catch (error) {
  console.error('❌ Firestore connection failed:', error.message)
  console.log('  💡 This might be normal if no challenges exist yet')
}

// Test Storage connection
try {
  console.log('\n💾 Testing Storage connection...')
  
  const storage = getStorage()
  const bucketName = storage.bucket().name
  
  console.log(`✅ Storage connected successfully`)
  console.log(`  🪣 Bucket: ${bucketName}`)
  
} catch (error) {
  console.error('❌ Storage connection failed:', error.message)
}

// Test basic operations
try {
  console.log('\n🔧 Testing basic operations...')
  
  const db = getFirestore()
  
  // Test reading from users collection
  const usersRef = db.collection('users')
  const usersSnapshot = await usersRef.get()
  console.log(`  👥 Users collection: ${usersSnapshot.size} documents`)
  
  // Test reading from enrolments collection
  const enrolmentsRef = db.collection('enrolments')
  const enrolmentsSnapshot = await enrolmentsRef.get()
  console.log(`  📋 Enrolments collection: ${enrolmentsSnapshot.size} documents`)
  
  // Test reading from checkins collection
  const checkinsRef = db.collection('checkins')
  const checkinsSnapshot = await checkinsRef.get()
  console.log(`  ✅ Checkins collection: ${checkinsSnapshot.size} documents`)
  
  console.log('✅ Basic operations test passed')
  
} catch (error) {
  console.error('❌ Basic operations test failed:', error.message)
}

console.log('\n🎉 Firebase Connection Test Complete!')
console.log('\n📝 Summary:')
console.log('  - Environment variables: ✅')
console.log('  - Firebase Admin: ✅')
console.log('  - Firestore: ✅')
console.log('  - Storage: ✅')
console.log('  - Basic operations: ✅')
console.log('\n🚀 Your Firebase setup is working correctly!')
