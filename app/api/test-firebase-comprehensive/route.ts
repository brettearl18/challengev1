import { NextResponse } from 'next/server'
import { db, auth, storage } from '@/src/lib/firebase.client'
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { ref, uploadString, deleteObject } from 'firebase/storage'

export async function GET() {
  try {
    const results: any = {
      timestamp: new Date().toISOString(),
      tests: {}
    }

    // Test 1: Firestore Write
    try {
      const testCollection = collection(db, 'test')
      const testDoc = await addDoc(testCollection, {
        message: 'Firebase connection test',
        timestamp: new Date().toISOString(),
        testId: Math.random().toString(36).substring(7)
      })
      results.tests.firestoreWrite = { success: true, docId: testDoc.id }
      
      // Test 2: Firestore Read
      const querySnapshot = await getDocs(testCollection)
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      results.tests.firestoreRead = { success: true, count: docs.length, docs }
      
      // Clean up test data
      await deleteDoc(doc(db, 'test', testDoc.id))
      results.tests.firestoreCleanup = { success: true }
    } catch (error: any) {
      results.tests.firestore = { success: false, error: error.message }
    }

    // Test 3: Storage Write
    try {
      const testRef = ref(storage, 'test/test-file.txt')
      await uploadString(testRef, 'Firebase Storage test content')
      results.tests.storageWrite = { success: true }
      
      // Clean up storage test
      await deleteObject(testRef)
      results.tests.storageCleanup = { success: true }
    } catch (error: any) {
      results.tests.storage = { success: false, error: error.message }
    }

    // Test 4: Auth Status
    try {
      const currentUser = auth.currentUser
      results.tests.auth = { 
        success: true, 
        currentUser: currentUser ? currentUser.uid : null,
        isConnected: true
      }
    } catch (error: any) {
      results.tests.auth = { success: false, error: error.message }
    }

    // Overall success
    const allTestsPassed = Object.values(results.tests).every((test: any) => test.success)
    results.success = allTestsPassed
    results.message = allTestsPassed ? 'All Firebase tests passed!' : 'Some Firebase tests failed'

    return NextResponse.json(results)
  } catch (error: any) {
    console.error('Comprehensive Firebase test failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 