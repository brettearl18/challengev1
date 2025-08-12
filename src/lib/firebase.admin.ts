import admin from 'firebase-admin'
import { getApps } from 'firebase-admin/app'

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  }

  // Validate required environment variables
  if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
    throw new Error('Missing required Firebase Admin environment variables')
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    projectId: process.env.FIREBASE_PROJECT_ID
  })
}

// Export admin services
export const adminDb = admin.firestore()
export const adminAuth = admin.auth()
export const adminStorage = admin.storage()

// Enhanced admin utilities
export const createCustomToken = async (uid: string, claims?: any): Promise<string> => {
  try {
    return await adminAuth.createCustomToken(uid, claims)
  } catch (error) {
    console.error('Error creating custom token:', error)
    throw new Error('Failed to create custom token')
  }
}

export const setUserClaims = async (uid: string, claims: any): Promise<void> => {
  try {
    await adminAuth.setCustomUserClaims(uid, claims)
  } catch (error) {
    console.error('Error setting user claims:', error)
    throw new Error('Failed to set user claims')
  }
}

export const getUserByEmail = async (email: string) => {
  try {
    return await adminAuth.getUserByEmail(email)
  } catch (error) {
    console.error('Error getting user by email:', error)
    throw new Error('Failed to get user by email')
  }
}

export const deleteUser = async (uid: string): Promise<void> => {
  try {
    await adminAuth.deleteUser(uid)
  } catch (error) {
    console.error('Error deleting user:', error)
    throw new Error('Failed to delete user')
  }
}

// Firestore admin utilities
export const runTransaction = async <T>(
  updateFunction: (transaction: admin.firestore.Transaction) => Promise<T>
): Promise<T> => {
  try {
    return await adminDb.runTransaction(updateFunction)
  } catch (error) {
    console.error('Transaction failed:', error)
    throw new Error('Transaction failed')
  }
}

export const batchWrite = async (operations: admin.firestore.WriteBatch[]): Promise<void> => {
  try {
    const batch = adminDb.batch()
    operations.forEach(op => op.commit())
    await batch.commit()
  } catch (error) {
    console.error('Batch write failed:', error)
    throw new Error('Batch write failed')
  }
}

// Storage admin utilities
export const getSignedUrl = async (
  bucketName: string,
  filePath: string,
  expiresIn: number = 3600
): Promise<string> => {
  try {
    const bucket = adminStorage.bucket(bucketName)
    const file = bucket.file(filePath)
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + expiresIn * 1000
    })
    return url
  } catch (error) {
    console.error('Error generating signed URL:', error)
    throw new Error('Failed to generate signed URL')
  }
}

export const deleteFile = async (bucketName: string, filePath: string): Promise<void> => {
  try {
    const bucket = adminStorage.bucket(bucketName)
    const file = bucket.file(filePath)
    await file.delete()
  } catch (error) {
    console.error('Error deleting file:', error)
    throw new Error('Failed to delete file')
  }
}

// Export admin app for advanced usage
export const adminApp = admin.app() 