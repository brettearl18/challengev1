import { NextResponse } from 'next/server'
import { db, auth } from '@/src/lib/firebase.client'
import { collection, getDocs } from 'firebase/firestore'

export async function GET() {
  try {
    // Test Firestore connection
    const testCollection = collection(db, 'test')
    await getDocs(testCollection)
    
    // Test Auth connection
    const currentUser = auth.currentUser
    
    return NextResponse.json({
      success: true,
      message: 'Firebase connection successful',
      firestore: 'Connected',
      auth: 'Connected',
      currentUser: currentUser ? currentUser.uid : null,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Firebase connection test failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 