import { collection, getDocs, getDoc, doc, query, where, orderBy, limit, addDoc, updateDoc } from 'firebase/firestore'
import { db } from './firebase.client'
import { Challenge, Enrolment } from '../types'

export const getChallenges = async (status?: 'published' | 'draft' | 'archived' | 'completed') => {
  try {
    let q = collection(db, 'challenges')
    
    if (status) {
      q = query(q, where('status', '==', status))
    }
    
    q = query(q, orderBy('createdAt', 'desc'))
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Challenge[]
  } catch (error) {
    console.error('Error fetching challenges:', error)
    return []
  }
}

export const getChallenge = async (id: string): Promise<Challenge | null> => {
  try {
    const docRef = doc(db, 'challenges', id)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Challenge
    }
    return null
  } catch (error) {
    console.error('Error fetching challenge:', error)
    return null
  }
}

export const getChallengesByType = async (type: string) => {
  try {
    const q = query(
      collection(db, 'challenges'),
      where('challengeType', '==', type),
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc')
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Challenge[]
  } catch (error) {
    console.error('Error fetching challenges by type:', error)
    return []
  }
}

export const getPopularChallenges = async (limitCount: number = 6) => {
  try {
    const q = query(
      collection(db, 'challenges'),
      where('status', '==', 'published'),
      orderBy('currentParticipants', 'desc'),
      limit(limitCount)
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Challenge[]
  } catch (error) {
    console.error('Error fetching popular challenges:', error)
    return []
  }
}

export const getUserEnrolments = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'enrolments'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Enrolment[]
  } catch (error) {
    console.error('Error fetching user enrolments:', error)
    return []
  }
}

export const createEnrolment = async (enrolment: Omit<Enrolment, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'enrolments'), {
      ...enrolment,
      createdAt: Date.now()
    })
    
    // Update challenge participant count
    const challengeRef = doc(db, 'challenges', enrolment.challengeId)
    await updateDoc(challengeRef, {
      currentParticipants: (await getDoc(challengeRef)).data()?.currentParticipants + 1 || 1
    })
    
    return { id: docRef.id, success: true, error: null }
  } catch (error: any) {
    return { id: null, success: false, error: error.message }
  }
}

export const getChallengeParticipants = async (challengeId: string) => {
  try {
    const q = query(
      collection(db, 'enrolments'),
      where('challengeId', '==', challengeId),
      where('paymentStatus', '==', 'paid')
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Enrolment[]
  } catch (error) {
    console.error('Error fetching challenge participants:', error)
    return []
  }
} 