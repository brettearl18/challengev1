import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'
import { getMessaging, Messaging, isSupported } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
}

// Initialize Firebase
export const app: FirebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)

// Initialize services
export const auth: Auth = getAuth(app)
export const db: Firestore = getFirestore(app)
export const storage = getStorage(app)

// Initialize messaging conditionally
export const messaging = (async () => {
  if (await isSupported()) {
    return getMessaging(app)
  }
  return null
})()

// Connect to emulators in development
if (process.env.NODE_ENV === 'development') {
  const useEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true'
  
  if (useEmulator) {
    try {
      connectAuthEmulator(auth, 'http://localhost:9099')
      connectFirestoreEmulator(db, 'localhost', 8080)
      connectStorageEmulator(storage, 'localhost', 9199)
      console.log('Connected to Firebase emulators')
    } catch (error) {
      console.warn('Failed to connect to emulators:', error)
    }
  }
}

// Error handling utilities
export const handleFirebaseError = (error: any): string => {
  if (error.code) {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'User not found. Please check your credentials.'
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.'
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.'
      case 'auth/weak-password':
        return 'Password is too weak. Please choose a stronger password.'
      case 'auth/invalid-email':
        return 'Invalid email address. Please check your email.'
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.'
      case 'permission-denied':
        return 'You do not have permission to perform this action.'
      case 'unavailable':
        return 'Service temporarily unavailable. Please try again.'
      default:
        return error.message || 'An unexpected error occurred.'
    }
  }
  return error.message || 'An unexpected error occurred.'
}

// Firestore helpers
export const createTimestamp = () => new Date()

export const serverTimestamp = () => {
  // This will be replaced by Firestore server timestamp
  return new Date()
}

// Storage helpers
import { ref } from 'firebase/storage'

export const getStorageRef = (path: string) => {
  return ref(storage, path)
}

export const generateStoragePath = (folder: string, filename: string): string => {
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 15)
  const extension = filename.split('.').pop()
  return `${folder}/${timestamp}-${randomId}.${extension}`
}

// Auth state helpers
export const getCurrentUser = () => {
  return auth.currentUser
}

export const isAuthenticated = () => {
  return !!auth.currentUser
}

export const getUserId = (): string | null => {
  return auth.currentUser?.uid || null
}

// Export for use in components
export { app as firebaseApp } 