'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { Input } from '@/src/components/ui/Input'
import { collection, query, where, getDocs, orderBy, limit, addDoc, doc, getDoc, deleteDoc, updateDoc, increment } from 'firebase/firestore'
import { db } from '@/src/lib/firebase.client'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedEnrolment) return

    setSubmitting(true)
    try {
      const formData = new FormData(e.target as HTMLFormElement)
      
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
        photos: [], // Will implement photo upload later
        autoScore: 0 // Will calculate based on challenge scoring
      }

      // Calculate points based on challenge scoring
      const selectedEnrolmentData = enrolments.find(e => e.id === selectedEnrolment)
      if (selectedEnrolmentData?.challenge?.scoring) {
        const scoring = selectedEnrolmentData.challenge.scoring
        
        // Base check-in points
        let points = scoring.checkinPoints || 10
        
        // Workout bonus
        if (input.workouts > 0) {
          points += (input.workouts * (scoring.workoutPoints || 5))
        }
        
        // Steps bonus
        if (input.steps > 0) {
          const stepsBuckets = scoring.stepsBuckets || [5000, 10000, 15000, 20000]
          for (let i = 0; i < stepsBuckets.length; i++) {
            if (input.steps >= stepsBuckets[i]) {
              points += 2 * (i + 1) // Fixed points per steps bucket
              break
            }
          }
        }
        
        // Nutrition bonus
        if (input.nutritionScore >= 7) {
          points += scoring.nutritionPoints || 3
        }
        
        // Wellness bonuses
        if (input.sleepHours >= 7) points += 2
        if (input.waterIntake >= 8) points += 2
        if (input.meditationMinutes >= 10) points += 2
        
        input.autoScore = points
      }

      console.log('Submitting check-in with data:', input)
      console.log('Points calculation breakdown:', {
        base: input.autoScore,
        workouts: input.workouts,
        steps: input.steps,
        nutrition: input.nutritionScore
      })

      await addDoc(collection(db, 'checkins'), input)
      
      // Update enrolment stats
      const enrolmentRef = doc(db, 'enrolments', selectedEnrolment)
      await updateDoc(enrolmentRef, {
        totalScore: increment(input.autoScore),
        checkinCount: increment(1),
        lastCheckinDate: new Date()
      })

      setSuccess(true)
      setSelectedEnrolment('')
      
      // Refresh enrolments to show updated stats
      await fetchEnrolments()
    } catch (error) {
      console.error('Error submitting check-in:', error)
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
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-blue-600 to-purple-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-bold shadow-lg mb-6">
              <CheckCircle className="w-5 h-5" />
              Daily Progress
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Daily Check-in 🎯
            </h1>
            <p className="text-xl md:text-2xl text-green-100 leading-relaxed max-w-4xl mx-auto">
              Log your daily fitness activities, track your progress, and earn points to climb the leaderboard!
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
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
                      Workouts Completed
                    </label>
                    <Input
                      type="number"
                      name="workouts"
                      min="0"
                      max="10"
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg font-medium"
                      placeholder="0"
                    />
                    <p className="text-sm text-blue-600 mt-1">Each workout earns bonus points!</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Steps Today
                    </label>
                    <Input
                      type="number"
                      name="steps"
                      min="0"
                      max="50000"
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg font-medium"
                      placeholder="0"
                    />
                    <p className="text-sm text-blue-600 mt-1">Hit step goals for bonus points!</p>
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
                      Nutrition Score (1-10)
                    </label>
                    <Input
                      type="number"
                      name="nutritionScore"
                      min="1"
                      max="10"
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 text-lg font-medium"
                      placeholder="7"
                    />
                    <p className="text-sm text-green-600 mt-1">Rate your nutrition today</p>
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
                      Sleep Hours
                    </label>
                    <Input
                      type="number"
                      name="sleepHours"
                      min="0"
                      max="24"
                      step="0.5"
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-lg font-medium"
                      placeholder="7.5"
                    />
                    <p className="text-sm text-purple-600 mt-1">Aim for 7-9 hours</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Water Intake (glasses)
                    </label>
                    <Input
                      type="number"
                      name="waterIntake"
                      min="0"
                      max="20"
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-lg font-medium"
                      placeholder="8"
                    />
                    <p className="text-sm text-purple-600 mt-1">Aim for 8+ glasses</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Meditation (minutes)
                    </label>
                    <Input
                      type="number"
                      name="meditationMinutes"
                      min="0"
                      max="120"
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-lg font-medium"
                      placeholder="10"
                    />
                    <p className="text-sm text-purple-600 mt-1">Any meditation counts!</p>
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

              {/* Progress Photos */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-100">
                <h3 className="flex items-center gap-3 text-lg font-bold text-gray-900 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center">
                    <Camera className="w-4 h-4 text-indigo-600" />
                  </div>
                  Progress Photos
                </h3>
                
                <div className="border-2 border-dashed border-indigo-300 rounded-2xl p-8 text-center bg-white/50">
                  <Camera className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Upload progress photos (optional)</p>
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-0 hover:from-indigo-700 hover:to-blue-700"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">Max 4 photos, 5MB each</p>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Submit Check-in
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
      </div>
    </div>
  )
} 