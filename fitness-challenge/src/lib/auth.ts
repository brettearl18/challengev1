import { User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from './firebase.client'
import { UserProfile, Role } from '../types'
import { useEffect, useState } from 'react'

export const signIn = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return { user: result.user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

export const signUp = async (email: string, password: string, displayName: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    
    // Create user profile
    const userProfile: UserProfile = {
      uid: result.user.uid,
      displayName,
      email,
      role: 'participant',
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
    
    await setDoc(doc(db, 'users', result.user.uid), userProfile)
    
    return { user: result.user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

export const logout = () => signOut(auth)

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'users', uid)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile
    }
    return null
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  try {
    const docRef = doc(db, 'users', uid)
    await updateDoc(docRef, { ...updates, updatedAt: Date.now() })
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        const profile = await getUserProfile(user.uid)
        setProfile(profile)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return { user, profile, loading }
} 