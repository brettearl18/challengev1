'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { Input } from '@/src/components/ui/Input'
import { collection, query, where, getDocs, orderBy, limit, addDoc, doc, getDoc, deleteDoc, updateDoc, increment } from 'firebase/firestore'
import { db } from '@/src/lib/firebase.client'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/src/lib/firebase.client'
import { Challenge, Enrolment, Checkin } from '@/src/types'
import { useAuth } from '@/src/lib/auth'
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Calendar, 
  Users, 
  Star, 
  BarChart3, 
  CheckCircle,
  Activity,
  Clock,
  Zap,
  Camera,
  X
} from 'lucide-react'

interface EnrolmentWithChallenge extends Enrolment {
  challenge?: Challenge
}

export default function CheckinPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const [enrolments, setEnrolments] = useState<EnrolmentWithChallenge[]>([])
  const [selectedEnrolment, setSelectedEnrolment] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [populating, setPopulating] = useState(false)
  const [photos, setPhotos] = useState<{
    front: File | null
    back: File | null
    left: File | null
    right: File | null
  }>({
    front: null,
    back: null,
    left: null,
    right: null
  })
  
  const [photoUrls, setPhotoUrls] = useState<{
    front: string | null
    back: string | null
    left: string | null
    right: string | null
  }>({
    front: null,
    back: null,
    left: null,
    right: null
  })
  
  const [showSummary, setShowSummary] = useState(false)
  const [summaryData, setSummaryData] = useState<any>(null)
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({})
  
  // Function to get full photo URL from reference
  const getPhotoUrlFromReference = (photoRef: any) => {
    if (!photoRef || !photoRef.fileName) return null
    
    // Reconstruct the Firebase Storage URL
    const baseUrl = `https://firebasestorage.googleapis.com/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/o/progress-photos%2F${photoRef.fileName}`
    return `${baseUrl}?alt=media`
  }
  
  // Function to compress image
  const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.7): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()
      
      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
        const newWidth = img.width * ratio
        const newHeight = img.height * ratio
        
        canvas.width = newWidth
        canvas.height = newHeight
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, newWidth, newHeight)
        
        canvas.toBlob((blob) => {
          if (blob) {
            // Create new file with compressed data
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            resolve(file) // Fallback to original if compression fails
          }
        }, 'image/jpeg', quality)
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchEnrolments()
    }
  }, [user])

  const fetchEnrolments = async () => {
    if (!user) return

    try {
      // Simplified query to avoid index issues for demo
      const enrolmentsQuery = query(
        collection(db, 'enrolments'),
        limit(10)
      )
      const enrolmentsSnapshot = await getDocs(enrolmentsQuery)
      const enrolmentsData = enrolmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Enrolment[]

      // Fetch challenge details for each enrolment
      const enrolmentsWithChallenges = await Promise.all(
        enrolmentsData.map(async (enrolment) => {
          try {
            const challengeDoc = await getDoc(doc(db, 'challenges', enrolment.challengeId))
            if (challengeDoc.exists()) {
              const challengeData = challengeDoc.data() as Challenge
              return {
                ...enrolment,
                challenge: challengeData
              }
            }
            return enrolment
          } catch (error) {
            console.error('Error fetching challenge:', error)
            return enrolment
          }
        })
      )

      setEnrolments(enrolmentsWithChallenges)
    } catch (error) {
      console.error('Error fetching enrolments:', error)
    } finally {
      setLoading(false)
    }
  }

  const createDemoEnrolment = async () => {
    if (!user) return

    try {
      setPopulating(true)
      console.log('Creating demo enrolment...')

      // Get a single challenge for demo
      const challengesQuery = query(collection(db, 'challenges'), limit(1))
      const challengesSnapshot = await getDocs(challengesQuery)
      
      if (challengesSnapshot.empty) {
        console.log('No challenges found')
        return
      }

      const challenge = challengesSnapshot.docs[0]
      console.log('Challenge found:', challenge.id)

      // Create demo enrolment
      const demoEnrolment = {
        userId: 'demo-user',
        challengeId: challenge.id,
        status: 'active',
        startDate: new Date(),
        createdAt: new Date(),
        totalScore: 0,
        checkinCount: 0,
        currentStreak: 0,
        longestStreak: 0
      }

      await addDoc(collection(db, 'enrolments'), demoEnrolment)
      console.log('Demo enrolment created successfully')
      
      // Refresh the list
      await fetchEnrolments()
    } catch (error) {
      console.error('Error creating demo enrolment:', error)
    } finally {
      setPopulating(false)
    }
  }

  const cleanupBrokenEnrolments = async () => {
    try {
      const enrolmentsQuery = query(collection(db, 'enrolments'))
      const enrolmentsSnapshot = await getDocs(enrolmentsQuery)
      
      for (const docSnapshot of enrolmentsSnapshot.docs) {
        const enrolment = docSnapshot.data()
        try {
          await getDoc(doc(db, 'challenges', enrolment.challengeId))
        } catch (error) {
          console.log('Deleting broken enrolment:', docSnapshot.id)
          await deleteDoc(doc(db, 'enrolments', docSnapshot.id))
        }
      }
      
      await fetchEnrolments()
    } catch (error) {
      console.error('Error cleaning up enrolments:', error)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, angle: 'front' | 'back' | 'left' | 'right') => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // Compress the image before storing
      const compressedFile = await compressImage(file, 800, 0.7)
      
      console.log(`📸 Image compression: ${angle}`)
      console.log(`  Original: ${(file.size / 1024 / 1024).toFixed(2)} MB`)
      console.log(`  Compressed: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`)
      console.log(`  Reduction: ${((1 - compressedFile.size / file.size) * 100).toFixed(1)}%`)
      
      // Store the compressed file for later upload
      setPhotos(prev => ({
        ...prev,
        [angle]: compressedFile
      }))
      
      // Create a preview URL for display
      const reader = new FileReader()
      reader.onload = (event) => {
        setPhotoUrls(prev => ({
          ...prev,
          [angle]: event.target?.result as string
        }))
      }
      reader.readAsDataURL(compressedFile)
      
    } catch (error) {
      console.error(`❌ Error compressing ${angle} image:`, error)
      // Fallback to original file
      setPhotos(prev => ({
        ...prev,
        [angle]: file
      }))
      
      const reader = new FileReader()
      reader.onload = (event) => {
        setPhotoUrls(prev => ({
          ...prev,
          [angle]: event.target?.result as string
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = (angle: 'front' | 'back' | 'left' | 'right') => {
    setPhotos(prev => ({
      ...prev,
      [angle]: null
    }))
    setPhotoUrls(prev => ({
      ...prev,
      [angle]: null
    }))
  }

  const uploadPhotosToStorage = async (): Promise<string[]> => {
    const uploadedUrls: string[] = []
    const anglesToUpload = Object.keys(photos).filter(angle => photos[angle as keyof typeof photos])
    
    console.log('📤 Photo upload analysis:')
    console.log('  - Photos with files:', anglesToUpload)
    console.log('  - Photos with existing URLs:', Object.keys(photoUrls).filter(angle => photoUrls[angle as keyof typeof photoUrls]))
    
    // Check if we need to upload any new photos
    const newPhotosToUpload = anglesToUpload.filter(angle => !photoUrls[angle as keyof typeof photoUrls])
    
    if (newPhotosToUpload.length === 0) {
      console.log('🔄 All photos already uploaded, reusing existing URLs')
      return Object.values(photoUrls).filter(url => url) as string[]
    }
    
    setUploadingPhotos(true)
    setUploadProgress({})
    
    try {
      for (const [angle, file] of Object.entries(photos)) {
        if (file) {
          // Check if this photo already has a URL (was previously uploaded)
          if (photoUrls[angle as keyof typeof photoUrls]) {
            console.log(`🔄 ${angle} photo already uploaded, reusing URL:`, photoUrls[angle as keyof typeof photoUrls])
            uploadedUrls.push(photoUrls[angle as keyof typeof photoUrls])
            continue
          }
          
          // Only upload if no existing URL
          try {
            console.log(`📤 Uploading NEW ${angle} photo:`, file.name, file.size)
            setUploadProgress(prev => ({ ...prev, [angle]: 0 }))
            
            const fileName = `${user?.uid}_${Date.now()}_${angle}.jpg`
            const storageRef = ref(storage, `progress-photos/${fileName}`)
            
            // Simulate upload progress (Firebase doesn't provide real progress)
            const progressInterval = setInterval(() => {
              setUploadProgress(prev => ({
                ...prev,
                [angle]: Math.min(prev[angle] + Math.random() * 20, 90)
              }))
            }, 200)
            
            await uploadBytes(storageRef, file)
            clearInterval(progressInterval)
            setUploadProgress(prev => ({ ...prev, [angle]: 100 }))
            
            const downloadURL = await getDownloadURL(storageRef)
            uploadedUrls.push(downloadURL)
            console.log(`✅ ${angle} photo uploaded successfully:`, downloadURL)
            
            // Small delay to show 100% completion
            setTimeout(() => {
              setUploadProgress(prev => {
                const newProgress = { ...prev }
                delete newProgress[angle]
                return newProgress
              })
            }, 500)
            
          } catch (error) {
            console.error(`❌ Error uploading ${angle} photo:`, error)
            setUploadProgress(prev => {
              const newProgress = { ...prev }
              delete newProgress[angle]
              return newProgress
            })
          }
        }
      }
    } finally {
      setUploadingPhotos(false)
    }
    
    console.log('📸 Photo processing complete. Total URLs:', uploadedUrls.length)
    return uploadedUrls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedEnrolment) return

    try {
      const formData = new FormData(e.target as HTMLFormElement)
      
      const photoUrls = await uploadPhotosToStorage() // Upload photos to storage and get URLs
      console.log('📸 Uploaded photo URLs:', photoUrls)
      
      // Store only photo references, not full URLs
      const photoReferences = Object.entries(photoUrls)
        .filter(([_, url]) => url)
        .map(([angle, url]) => ({
          angle,
          fileName: url.split('/').pop()?.split('?')[0] || `${angle}_${Date.now()}.jpg`
        }))
      
      const input = {
        userId: user.uid,
        enrolmentId: selectedEnrolment,
        challengeId: enrolments.find(e => e.id === selectedEnrolment)?.challengeId || '',
        date: new Date().toISOString(),
        createdAt: new Date(),
        workouts: parseInt(formData.get('workouts') as string) || 0,
        steps: parseInt(formData.get('steps') as string) || 0,
        nutritionScore: parseInt(formData.get('nutritionScore') as string) || 0,
        weightKg: parseFloat(formData.get('weightKg') as string) || 0,
        sleepHours: parseInt(formData.get('sleepHours') as string) || 0,
        waterIntake: parseInt(formData.get('waterIntake') as string) || 0,
        meditationMinutes: parseInt(formData.get('meditationMinutes') as string) || 0,
        notes: formData.get('notes') as string || '',
        photoReferences, // Store lightweight references instead of full URLs
        autoScore: 0 // Will calculate based on challenge scoring
      }
      
      console.log('📝 Check-in data to save:', input)
      
      // Calculate points based on challenge scoring
      const selectedEnrolmentData = enrolments.find(e => e.id === selectedEnrolment)
      console.log('🔍 Challenge scoring config:', selectedEnrolmentData?.challenge?.scoring)
      
      if (selectedEnrolmentData?.challenge?.scoring) {
        const scoring = selectedEnrolmentData.challenge.scoring
        
        // Base check-in points
        let points = scoring.checkinPoints || 10
        console.log('📊 Base points:', points)
        
        // Workout bonus
        if (input.workouts > 0) {
          const workoutBonus = input.workouts * (scoring.workoutPoints || 5)
          points += workoutBonus
          console.log('💪 Workout bonus:', workoutBonus, 'Total points:', points)
        }
        
        // Steps bonus
        if (input.steps > 0) {
          const stepsBuckets = scoring.stepsBuckets || [5000, 10000, 15000, 20000]
          for (let i = 0; i < stepsBuckets.length; i++) {
            if (input.steps >= stepsBuckets[i]) {
              const stepsBonus = 2 * (i + 1)
              points += stepsBonus
              console.log('🚶 Steps bonus:', stepsBonus, 'Total points:', points)
              break
            }
          }
        }
        
        // Nutrition bonus
        if (input.nutritionScore >= 7) {
          const nutritionBonus = scoring.nutritionPoints || 3
          points += nutritionBonus
          console.log('🥗 Nutrition bonus:', nutritionBonus, 'Total points:', points)
        }
        
        // Wellness bonuses
        if (input.sleepHours >= 7) {
          points += 2
          console.log('😴 Sleep bonus: +2, Total points:', points)
        }
        if (input.waterIntake >= 8) {
          points += 2
          console.log('💧 Water bonus: +2, Total points:', points)
        }
        if (input.meditationMinutes >= 5) {
          points += 2
          console.log('🧘 Meditation bonus: +2, Total points:', points)
        }
        
        input.autoScore = points
        console.log('🎯 Final calculated points:', input.autoScore)
      } else {
        console.log('⚠️ No challenge scoring config found, using default scoring')
        
        // Default scoring system when challenge doesn't have scoring rules
        let points = 10 // Base check-in points
        
        // Workout bonus
        if (input.workouts > 0) {
          points += (input.workouts * 5)
          console.log('💪 Default workout bonus:', input.workouts * 5, 'Total points:', points)
        }
        
        // Steps bonus
        if (input.steps > 0) {
          if (input.steps >= 20000) points += 8
          else if (input.steps >= 15000) points += 6
          else if (input.steps >= 10000) points += 4
          else if (input.steps >= 5000) points += 2
          console.log('🚶 Default steps bonus for', input.steps, 'steps. Total points:', points)
        }
        
        // Nutrition bonus
        if (input.nutritionScore >= 7) {
          points += 3
          console.log('🥗 Default nutrition bonus: +3, Total points:', points)
        }
        
        // Wellness bonuses
        if (input.sleepHours >= 7) {
          points += 2
          console.log('😴 Default sleep bonus: +2, Total points:', points)
        }
        if (input.waterIntake >= 8) {
          points += 2
          console.log('💧 Default water bonus: +2, Total points:', points)
        }
        if (input.meditationMinutes >= 10) {
          points += 2
          console.log('🧘 Default meditation bonus: +2, Total points:', points)
        }
        
        input.autoScore = points
        console.log('🎯 Final calculated points (default scoring):', input.autoScore)
      }
      
      // Show summary modal instead of submitting directly
      setSummaryData({
        ...input,
        challenge: selectedEnrolmentData?.challenge,
        points: input.autoScore,
        photoUrls: photoUrls // Pass the actual photo URLs for display
      })
      setShowSummary(true)
      
    } catch (error) {
      console.error('Error preparing check-in summary:', error)
      alert('Error preparing check-in. Please try again.')
    }
  }

  const handleConfirmSubmit = async () => {
    if (!summaryData) return
    
    setSubmitting(true)
    try {
      console.log('Submitting check-in with data:', summaryData)
      console.log('Points calculation breakdown:', {
        base: summaryData.autoScore,
        workouts: summaryData.workouts,
        steps: summaryData.steps,
        nutrition: summaryData.nutritionScore
      })

      await addDoc(collection(db, 'checkins'), summaryData)
      
      // Update enrolment stats
      const enrolmentRef = doc(db, 'enrolments', summaryData.enrolmentId)
      
      // Get current enrolment data first
      const currentEnrolment = await getDoc(enrolmentRef)
      if (currentEnrolment.exists()) {
        const currentData = currentEnrolment.data()
        const newTotalScore = (currentData.totalScore || 0) + summaryData.autoScore
        const newCheckinCount = (currentData.checkinCount || 0) + 1
        
        await updateDoc(enrolmentRef, {
          totalScore: newTotalScore,
          checkinCount: newCheckinCount,
          lastCheckinDate: new Date()
        })
        
        console.log('✅ Enrolment updated successfully:', {
          oldTotalScore: currentData.totalScore || 0,
          newTotalScore,
          oldCheckinCount: currentData.checkinCount || 0,
          newCheckinCount
        })
      } else {
        console.error('❌ Enrolment document not found:', summaryData.enrolmentId)
        throw new Error('Enrolment not found')
      }

      setSuccess(true)
      setSelectedEnrolment('')
      setShowSummary(false)
      setSummaryData(null)
      
      // Clear photo state after successful submission
      setPhotos({ front: null, back: null, left: null, right: null })
      setPhotoUrls({ front: null, back: null, left: null, right: null })
      
      // Refresh enrolments to show updated stats
      await fetchEnrolments()
    } catch (error) {
      console.error('Error submitting check-in:', error)
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      })
      console.error('Summary data that failed:', summaryData)
      alert(`Error submitting check-in: ${error.message}. Please try again.`)
    } finally {
      setSubmitting(false)
    }
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading...</h2>
        </div>
      </div>
    )
  }

  // Show loading while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading check-in form...</h2>
          <p className="text-gray-500">Fetching your challenges</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Modern Header - Matching Dashboard */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Fitness Challenge</h1>
                <p className="text-sm text-gray-600">Welcome back, {profile?.displayName || 'Champion'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {profile?.role === 'coach' ? 'Coach' : profile?.role === 'admin' ? 'Admin' : 'Participant'}
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {(profile?.displayName || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section - Updated to Match Dashboard Green Style */}
        <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-3xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
              <CheckCircle className="w-4 h-4" />
              Daily Progress
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Daily Check-in 🎯
            </h2>
            <p className="text-lg text-green-100 max-w-2xl mx-auto">
              Log your daily fitness activities, track your progress, and earn points to climb the leaderboard!
            </p>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-3xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-900">Check-in Submitted Successfully! 🎉</h3>
                <p className="text-green-700">Great job! Your progress has been recorded and points have been added to your total.</p>
              </div>
              <Link href="/progress">
                <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                  View Progress
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Challenge Selection */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden mb-12">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 border-b border-gray-100/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Select Challenge</h3>
                <p className="text-gray-600">Choose which challenge you're checking in for</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {enrolments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {enrolments.map((enrolment) => (
                  <button
                    key={enrolment.id}
                    onClick={() => setSelectedEnrolment(enrolment.id)}
                    className={`group p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                      selectedEnrolment === enrolment.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
                        : 'bg-white hover:shadow-md hover:-translate-y-1 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        selectedEnrolment === enrolment.id
                          ? 'bg-white/20'
                          : 'bg-blue-100'
                      }`}>
                        <Target className={`w-4 h-4 ${
                          selectedEnrolment === enrolment.id
                            ? 'text-white'
                            : 'text-blue-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-bold ${
                          selectedEnrolment === enrolment.id
                            ? 'text-white'
                            : 'text-gray-900'
                        }`}>
                          {enrolment.challenge?.name || 'Unknown Challenge'}
                        </h4>
                        <p className={`text-sm ${
                          selectedEnrolment === enrolment.id
                            ? 'text-blue-100'
                            : 'text-gray-600'
                        }`}>
                          {enrolment.challenge?.description || 'No description'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className={`${
                        selectedEnrolment === enrolment.id
                          ? 'text-blue-100'
                          : 'text-gray-500'
                      }`}>
                        {enrolment.totalScore || 0} pts
                      </span>
                      <span className={`${
                        selectedEnrolment === enrolment.id
                          ? 'text-blue-100'
                          : 'text-gray-500'
                      }`}>
                        {enrolment.challenge?.durationDays || 0} days
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No challenges to check in for</h3>
                <p className="text-gray-500 mb-6">You need to join a challenge before you can check in.</p>
                <div className="flex gap-4 justify-center">
                  <Button 
                    onClick={createDemoEnrolment}
                    disabled={populating}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    {populating ? 'Creating...' : 'Create Demo Enrolment'}
                  </Button>
                  <Link href="/challenges">
                    <Button variant="outline">
                      Browse Challenges
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Form Section */}
        {selectedEnrolment && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden mb-12">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 border-b border-gray-100/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Daily Check-in Form</h3>
                  <p className="text-gray-600">Log your fitness activities for today</p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* Physical Activity */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                <h3 className="flex items-center gap-3 text-lg font-bold text-gray-900 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                    <Activity className="w-4 h-4 text-blue-600" />
                  </div>
                  Physical Activity
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Did you complete any workouts today?
                    </label>
                    <select
                      name="workouts"
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg font-medium bg-white"
                      defaultValue="0"
                    >
                      <option value="0">No workouts today</option>
                      <option value="1">1 workout</option>
                      <option value="2">2 workouts</option>
                      <option value="3">3+ workouts</option>
                    </select>
                    <p className="text-sm text-blue-600 mt-1">Each workout earns bonus points!</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      How many steps did you do today?
                    </label>
                    <select
                      name="steps"
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg font-medium bg-white"
                      defaultValue="0"
                    >
                      <option value="0">Less than 5,000</option>
                      <option value="5000">5,000 - 9,999</option>
                      <option value="10000">10,000 - 14,999</option>
                      <option value="15000">15,000 - 19,999</option>
                      <option value="20000">20,000+ steps</option>
                    </select>
                    <p className="text-sm text-blue-600 mt-1">Higher step counts earn more points!</p>
                  </div>
                </div>
              </div>

              {/* Health Metrics */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                <h3 className="flex items-center gap-3 text-lg font-bold text-gray-900 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  Health Metrics
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      How would you rate your nutrition today?
                    </label>
                    <select
                      name="nutritionScore"
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 text-lg font-medium bg-white"
                      defaultValue="5"
                    >
                      <option value="1">1 - Poor (junk food, skipped meals)</option>
                      <option value="2">2 - Below average</option>
                      <option value="3">3 - Fair</option>
                      <option value="4">4 - Below average</option>
                      <option value="5">5 - Average (mixed day)</option>
                      <option value="6">6 - Above average</option>
                      <option value="7">7 - Good (mostly healthy)</option>
                      <option value="8">8 - Very good</option>
                      <option value="9">9 - Excellent</option>
                      <option value="10">10 - Perfect (ideal nutrition day)</option>
                    </select>
                    <p className="text-sm text-green-600 mt-1">Be honest - this helps track your progress!</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Weight (kg)
                    </label>
                    <Input
                      type="number"
                      name="weightKg"
                      step="0.1"
                      min="30"
                      max="300"
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 text-lg font-medium"
                      placeholder="70.0"
                    />
                    <p className="text-sm text-green-600 mt-1">Track your weight progress</p>
                  </div>
                </div>
              </div>

              {/* Wellness Metrics */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
                <h3 className="flex items-center gap-3 text-lg font-bold text-gray-900 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                    <Zap className="w-4 h-4 text-purple-600" />
                  </div>
                  Wellness Metrics
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      How many hours did you sleep?
                    </label>
                    <select
                      name="sleepHours"
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-lg font-medium bg-white"
                      defaultValue="7"
                    >
                      <option value="0">Less than 4 hours</option>
                      <option value="4">4-5 hours</option>
                      <option value="5">5-6 hours</option>
                      <option value="6">6-7 hours</option>
                      <option value="7">7-8 hours</option>
                      <option value="8">8-9 hours</option>
                      <option value="9">9+ hours</option>
                    </select>
                    <p className="text-sm text-purple-600 mt-1">Aim for 7-9 hours for optimal health</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      How many glasses of water did you drink?
                    </label>
                    <select
                      name="waterIntake"
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-lg font-medium bg-white"
                      defaultValue="6"
                    >
                      <option value="0">0-2 glasses</option>
                      <option value="3">3-4 glasses</option>
                      <option value="5">5-6 glasses</option>
                      <option value="7">7-8 glasses</option>
                      <option value="8">8+ glasses</option>
                    </select>
                    <p className="text-sm text-purple-600 mt-1">Aim for 8+ glasses daily</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Did you meditate today?
                    </label>
                    <select
                      name="meditationMinutes"
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-lg font-medium bg-white"
                      defaultValue="0"
                    >
                      <option value="0">No meditation</option>
                      <option value="5">5-10 minutes</option>
                      <option value="15">15-20 minutes</option>
                      <option value="30">30+ minutes</option>
                    </select>
                    <p className="text-sm text-purple-600 mt-1">Any meditation counts towards wellness!</p>
                  </div>
                </div>
              </div>

              {/* Daily Reflection */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-100">
                <h3 className="flex items-center gap-3 text-lg font-bold text-gray-900 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center">
                    <Star className="w-4 h-4 text-yellow-600" />
                  </div>
                  Daily Reflection
                </h3>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    How did you feel today?
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 text-lg font-medium resize-none"
                    placeholder="Share your thoughts, achievements, or challenges..."
                  ></textarea>
                  <p className="text-sm text-yellow-600 mt-1">Reflect on your fitness journey</p>
                </div>
              </div>

              {/* Progress Photos - 4 Angle System */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-100">
                <h3 className="flex items-center gap-3 text-lg font-bold text-gray-900 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center">
                    <Camera className="w-4 h-4 text-indigo-600" />
                  </div>
                  Progress Photos
                </h3>
                
                <p className="text-sm text-indigo-600 mb-4">Upload photos from 4 different angles to track your transformation</p>
                
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Progress Tracking:</strong> These photos will automatically appear in your Progress page timeline, 
                    where you can pin important milestones to your transformation gallery.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Front View */}
                  <div className="bg-white rounded-xl p-4 border-2 border-dashed border-indigo-200 hover:border-indigo-400 transition-colors">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Camera className="w-5 h-5 text-indigo-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Front View</h4>
                      <p className="text-sm text-gray-600 mb-3">Stand straight, arms at sides</p>
                      <input
                        type="file"
                        name="frontPhoto"
                        accept="image/*"
                        className="hidden"
                        id="frontPhoto"
                        onChange={(e) => handlePhotoUpload(e, 'front')}
                      />
                      <label
                        htmlFor="frontPhoto"
                        className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        {photos.front ? 'Change Photo' : 'Upload Photo'}
                      </label>
                                              {photoUrls.front && (
                          <div className="mt-3">
                            <img 
                              src={photoUrls.front} 
                              alt="Front view" 
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removePhoto('front')}
                              className="mt-2 text-sm text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                        
                        {/* Upload Progress Indicator */}
                        {uploadProgress.front !== undefined && (
                          <div className="mt-3">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                              <span className="text-sm text-indigo-600">Uploading...</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress.front}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600">{Math.round(uploadProgress.front)}%</span>
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Back View */}
                  <div className="bg-white rounded-xl p-4 border-2 border-dashed border-indigo-200 hover:border-indigo-400 transition-colors">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Camera className="w-5 h-5 text-indigo-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Back View</h4>
                      <p className="text-sm text-gray-600 mb-3">Stand straight, back to camera</p>
                      <input
                        type="file"
                        name="backPhoto"
                        accept="image/*"
                        className="hidden"
                        id="backPhoto"
                        onChange={(e) => handlePhotoUpload(e, 'back')}
                      />
                      <label
                        htmlFor="backPhoto"
                        className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        {photos.back ? 'Change Photo' : 'Upload Photo'}
                      </label>
                      {photoUrls.back && (
                        <div className="mt-3">
                          <img 
                            src={photoUrls.back} 
                            alt="Back view" 
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto('back')}
                            className="mt-2 text-sm text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Left Side */}
                  <div className="bg-white rounded-xl p-4 border-2 border-dashed border-indigo-200 hover:border-indigo-400 transition-colors">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Camera className="w-5 h-5 text-indigo-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Left Side</h4>
                      <p className="text-sm text-gray-600 mb-3">Profile view from left</p>
                      <input
                        type="file"
                        name="leftPhoto"
                        accept="image/*"
                        className="hidden"
                        id="leftPhoto"
                        onChange={(e) => handlePhotoUpload(e, 'left')}
                      />
                      <label
                        htmlFor="leftPhoto"
                        className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        {photos.left ? 'Change Photo' : 'Upload Photo'}
                      </label>
                      {photoUrls.left && (
                        <div className="mt-3">
                          <img 
                            src={photoUrls.left} 
                            alt="Left side view" 
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto('left')}
                            className="mt-2 text-sm text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side */}
                  <div className="bg-white rounded-xl p-4 border-2 border-dashed border-indigo-200 hover:border-indigo-400 transition-colors">
                    <div className="text-center">
                                              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Camera className="w-5 h-5 text-indigo-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Right Side</h4>
                      <p className="text-sm text-gray-600 mb-3">Profile view from right</p>
                      <input
                        type="file"
                        name="rightPhoto"
                        accept="image/*"
                        className="hidden"
                        id="rightPhoto"
                        onChange={(e) => handlePhotoUpload(e, 'right')}
                      />
                      <label
                        htmlFor="rightPhoto"
                        className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        {photos.right ? 'Change Photo' : 'Upload Photo'}
                      </label>
                      {photoUrls.right && (
                        <div className="mt-3">
                          <img 
                            src={photoUrls.right} 
                            alt="Right side view" 
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto('right')}
                            className="mt-2 text-sm text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                                  <div className="mt-4 p-3 bg-indigo-100 rounded-lg">
                    <p className="text-sm text-indigo-800 text-center">
                      💡 <strong>Photo Tips:</strong> Wear fitted clothing, stand in good lighting, and maintain consistent poses for accurate progress tracking.
                    </p>
                    <p className="text-sm text-indigo-700 text-center mt-2">
                      📸 <strong>Auto-compression:</strong> Large images are automatically compressed to 800px width for optimal storage and performance.
                    </p>
                  </div>
              </div>

                              {/* Upload Status */}
                {uploadingPhotos && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      <div>
                        <p className="text-sm font-medium text-blue-800">Uploading Photos...</p>
                        <p className="text-xs text-blue-600">Please wait while your photos are being uploaded</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={submitting || uploadingPhotos}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : uploadingPhotos ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Uploading Photos...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Review & Submit
                    </>
                  )}
                </Button>
            </form>
          </div>
        )}

        {/* Challenge Info Section */}
        {selectedEnrolment && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-100/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Challenge Scoring Guide</h3>
                  <p className="text-gray-600">How to maximize your points for this challenge</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {enrolments.find(e => e.id === selectedEnrolment)?.challenge?.scoring?.checkinPoints || 10}
                  </div>
                  <div className="text-sm text-gray-600">Base Check-in Points</div>
                </div>
                
                <div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Activity className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    +{enrolments.find(e => e.id === selectedEnrolment)?.challenge?.scoring?.workoutPoints || 5}
                  </div>
                  <div className="text-sm text-gray-600">Per Workout</div>
                </div>
                
                <div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    +{enrolments.find(e => e.id === selectedEnrolment)?.challenge?.scoring?.nutritionPoints || 3}
                  </div>
                  <div className="text-sm text-gray-600">Good Nutrition (7+)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Check-in Summary Modal */}
        {showSummary && summaryData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Check-in</h2>
                <p className="text-gray-600">Please review your information before submitting</p>
              </div>

              {/* Challenge Info */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Challenge</h3>
                <p className="text-gray-700">{summaryData.challenge?.name || 'Unknown Challenge'}</p>
                <p className="text-sm text-gray-600">{summaryData.challenge?.description || 'No description'}</p>
              </div>

              {/* Metrics Summary */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-gray-900">{summaryData.workouts}</div>
                  <div className="text-sm text-gray-600">Workouts</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-gray-900">{summaryData.steps.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Steps</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-gray-900">{summaryData.nutritionScore}/10</div>
                  <div className="text-sm text-gray-600">Nutrition</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-gray-900">{summaryData.weightKg} kg</div>
                  <div className="text-sm text-gray-600">Weight</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-gray-900">{summaryData.sleepHours}h</div>
                  <div className="text-sm text-gray-600">Sleep</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-gray-900">{summaryData.waterIntake} cups</div>
                  <div className="text-sm text-gray-600">Water</div>
                </div>
              </div>

                             {/* Photo Preview */}
               {summaryData.photoUrls && Object.keys(summaryData.photoUrls).filter(angle => summaryData.photoUrls[angle]).length > 0 && (
                 <div className="mb-6">
                   <h3 className="font-semibold text-gray-900 mb-3">Progress Photos</h3>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                     {Object.entries(summaryData.photoUrls).map(([angle, photoUrl], index) => {
                       if (!photoUrl) return null
                       
                       const angleNames = ['Front', 'Back', 'Left Side', 'Right Side']
                       return (
                         <div key={angle} className="relative">
                           <img 
                             src={photoUrl as string} 
                             alt={`${angle} view`}
                             className="w-full h-20 object-cover rounded-lg border border-gray-200"
                           />
                           <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                             {angleNames[index]}
                           </div>
                         </div>
                       )
                     })}
                   </div>
                 </div>
               )}

              {/* Notes */}
              {summaryData.notes && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                  <p className="text-gray-700 bg-gray-50 rounded-lg p-3">{summaryData.notes}</p>
                </div>
              )}

              {/* Points Summary */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-4 mb-6 text-center">
                <h3 className="font-semibold text-gray-900 mb-2">Points Earned</h3>
                <div className="text-3xl font-bold text-green-600">{summaryData.points}</div>
                <p className="text-sm text-gray-600">Total points for this check-in</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowSummary(false)}
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Edit Check-in
                </Button>
                <Button
                  onClick={handleConfirmSubmit}
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirm & Submit
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 