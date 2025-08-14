'use client'
import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { db } from '@/src/lib/firebase.client'
import { useAuth } from '@/src/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { Input } from '@/src/components/ui/Input'
import { Challenge, Enrolment, Checkin } from '@/src/types'
import { 
  Activity, 
  Calendar, 
  Target, 
  Trophy, 
  TrendingUp, 
  BarChart3, 
  Search, 
  Filter,
  Camera,
  Star,
  CheckCircle,
  Award,
  Users,
  Clock,
  Zap,
  X
} from 'lucide-react'
import Link from 'next/link'

interface EnrolmentWithChallenge extends Enrolment {
  challenge: Challenge
}

interface CheckinWithChallenge extends Checkin {
  challenge: Challenge
}

export default function ProgressPage() {
  const { user, profile } = useAuth()
  const [checkins, setCheckins] = useState<CheckinWithChallenge[]>([])
  const [enrolments, setEnrolments] = useState<EnrolmentWithChallenge[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedChallenge, setSelectedChallenge] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [fullscreenPhoto, setFullscreenPhoto] = useState<string | null>(null)

  // Photo fullscreen functions
  const viewPhotoFullscreen = (photoUrl: string) => {
    setFullscreenPhoto(photoUrl)
  }

  const closeFullscreenPhoto = () => {
    setFullscreenPhoto(null)
  }

  // Helper function to get photos from either old or new structure
  const getCheckinPhotos = (checkin: CheckinWithChallenge) => {
    // If old photos array exists, use it
    if (checkin.photos && checkin.photos.length > 0) {
      return checkin.photos.map((url, index) => ({
        url,
        angle: ['front', 'back', 'left', 'right'][index] || 'unknown'
      }))
    }
    
    // If new photoReferences exist, reconstruct URLs
    if (checkin.photoReferences && checkin.photoReferences.length > 0) {
      return checkin.photoReferences.map((ref: any) => {
        // Reconstruct Firebase Storage URL
        const fileName = ref.fileName
        const baseUrl = `https://firebasestorage.googleapis.com/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/o/progress-photos%2F${fileName}`
        return {
          url: `${baseUrl}?alt=media`,
          angle: ref.angle
        }
      })
    }
    
    return []
  }

  useEffect(() => {
    fetchProgressData()
  }, [])

  const fetchProgressData = async () => {
    try {
      setLoading(true)
      
      // Fetch all check-ins for current user
      const checkinsQuery = query(
        collection(db, 'checkins'),
        where('userId', '==', user?.uid || 'demo-user'),
        orderBy('createdAt', 'desc'),
        limit(50)
      )
      const checkinsSnap = await getDocs(checkinsQuery)
      const checkinsData = checkinsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Checkin))
      
      // Fetch challenge details for each check-in
      const checkinsWithChallenges: CheckinWithChallenge[] = []
      for (const checkin of checkinsData) {
        try {
          const challengeDoc = await getDocs(query(collection(db, 'challenges'), where('__name__', '==', checkin.challengeId)))
          if (!challengeDoc.empty) {
            const challenge = challengeDoc.docs[0].data() as Challenge
            checkinsWithChallenges.push({
              ...checkin,
              challenge
            })
          }
        } catch (error) {
          console.log('Skipping check-in with invalid challenge:', checkin.challengeId)
        }
      }
      
      setCheckins(checkinsWithChallenges)
      
      // Debug: Log check-ins with photos
      console.log('Fetched check-ins:', checkinsWithChallenges)
      
      // Handle both old photo structure and new photoReferences structure
      const checkinsWithPhotos = checkinsWithChallenges.filter(checkin => {
        // Check for old photos array
        if (checkin.photos && checkin.photos.length > 0) return true
        // Check for new photoReferences array
        if (checkin.photoReferences && checkin.photoReferences.length > 0) return true
        return false
      })
      console.log('Check-ins with photos:', checkinsWithPhotos)
      
      // Fetch enrolments for progress tracking
      const enrolmentsQuery = query(
        collection(db, 'enrolments'),
        where('userId', '==', user?.uid || 'demo-user'),
        limit(10)
      )
      const enrolmentsSnap = await getDocs(enrolmentsQuery)
      const enrolmentsData = enrolmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enrolment))
      
      // Fetch challenge details for each enrolment
      const enrolmentsWithChallenges: EnrolmentWithChallenge[] = []
      for (const enrolment of enrolmentsData) {
        try {
          const challengeDoc = await getDocs(query(collection(db, 'challenges'), where('__name__', '==', enrolment.challengeId)))
          if (!challengeDoc.empty) {
            const challenge = challengeDoc.docs[0].data() as Challenge
            enrolmentsWithChallenges.push({
              ...enrolment,
              challenge
            })
          }
        } catch (error) {
          console.log('Skipping enrolment with invalid challenge:', enrolment.challengeId)
        }
      }
      
      setEnrolments(enrolmentsWithChallenges)
      
    } catch (error) {
      console.error('Error fetching progress data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate progress statistics
  const totalCheckins = checkins.length
  const totalPoints = checkins.reduce((sum, checkin) => sum + (checkin.autoScore || 0), 0)
  const averageScore = totalCheckins > 0 ? Math.round(totalPoints / totalCheckins) : 0
  const currentStreak = calculateCurrentStreak(checkins)
  const longestStreak = calculateLongestStreak(checkins)

  // Filter check-ins based on search and filters
  const filteredCheckins = checkins.filter(checkin => {
    const matchesSearch = searchTerm === '' || 
      checkin.challenge?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      checkin.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesChallenge = selectedChallenge === 'all' || checkin.challengeId === selectedChallenge
    
    const matchesDate = dateFilter === 'all' || 
      (dateFilter === 'week' && isWithinDays(checkin.date, 7)) ||
      (dateFilter === 'month' && isWithinDays(checkin.date, 30))
    
    return matchesSearch && matchesChallenge && matchesDate
  })

  // Helper functions
  function calculateCurrentStreak(checkins: Checkin[]): number {
    if (checkins.length === 0) return 0
    
    const sortedCheckins = [...checkins].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    let streak = 0
    const today = new Date()
    
    for (let i = 0; i < sortedCheckins.length; i++) {
      const checkinDate = new Date(sortedCheckins[i].date)
      const daysDiff = Math.floor((today.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff === streak) {
        streak++
      } else {
        break
      }
    }
    
    return streak
  }

  function calculateLongestStreak(checkins: Checkin[]): number {
    if (checkins.length === 0) return 0
    
    const sortedCheckins = [...checkins].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    let maxStreak = 0
    let currentStreak = 1
    
    for (let i = 1; i < sortedCheckins.length; i++) {
      const prevDate = new Date(sortedCheckins[i-1].date)
      const currDate = new Date(sortedCheckins[i].date)
      const daysDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff === 1) {
        currentStreak++
        maxStreak = Math.max(maxStreak, currentStreak)
      } else {
        currentStreak = 1
      }
    }
    
    return Math.max(maxStreak, currentStreak)
  }

  function isWithinDays(dateString: string, days: number): boolean {
    const checkinDate = new Date(dateString)
    const today = new Date()
    const daysDiff = Math.floor((today.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24))
    return daysDiff <= days
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your progress...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Progress Page - 4-Angle Before/Current Layout</h1>
        <p className="text-center text-gray-600 mb-8">
          This page will show the 4-angle Before/Current photo structure you requested:
          Front, Back, Left Side, and Right Side - each with Before and Current photos.
        </p>
        
        {/* Debug Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">🔍 Debug Info</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>Current User ID: {user?.uid || 'Not authenticated'}</p>
            <p>Total Check-ins: {checkins.length}</p>
            <p>Check-ins with Photos: {checkins.filter(checkin => {
              return (checkin.photos && checkin.photos.length > 0) || 
                     (checkin.photoReferences && checkin.photoReferences.length > 0)
            }).length}</p>
          </div>
        </div>

        {/* Progress Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Weight Progress */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Weight Progress</h3>
              <span className="text-sm font-medium text-blue-600">Current: 165 lbs</span>
            </div>
            <div className="bg-blue-50 rounded-xl p-8 text-center">
              <BarChart3 className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-blue-600 mb-2">Weight Chart</p>
              <p className="text-sm text-blue-500">Track your weight changes over time</p>
              <p className="text-sm text-blue-600 mt-2">Starting: 175 lbs • Current: 165 lbs</p>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">-10 lbs</p>
                <p className="text-sm text-gray-600">Total Lost</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">-2.5 lbs</p>
                <p className="text-sm text-gray-600">Avg/Week</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">4 weeks</p>
                <p className="text-sm text-gray-600">Duration</p>
              </div>
            </div>
          </div>

          {/* Habit Completion */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Habit Completion</h3>
              <span className="text-sm font-medium text-green-600">This Week: 85%</span>
            </div>
            <div className="bg-green-50 rounded-xl p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-green-600 mb-2">Habit Completion Chart</p>
              <p className="text-sm text-green-500">Track your daily habit success rate</p>
              <p className="text-sm text-green-600 mt-2">This Week: 85% • Last Week: 72%</p>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">85%</p>
                <p className="text-sm text-gray-600">This Week</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">72%</p>
                <p className="text-sm text-gray-600">Last Week</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">+13%</p>
                <p className="text-sm text-gray-600">Improvement</p>
              </div>
            </div>
          </div>
        </div>

        {/* Challenge Progress */}
        {enrolments.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Challenge Progress</h3>
                <p className="text-gray-600">Track your progress across all active challenges</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolments.map((enrolment, index) => (
                <div key={enrolment.id} className="bg-gradient-to-br from-gray-50 to-yellow-50/30 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{enrolment.challenge?.name || 'Unknown Challenge'}</h4>
                      <p className="text-sm text-gray-600">Started: {new Date(enrolment.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Total Score</span>
                      <span className="text-lg font-bold text-gray-900">{enrolment.totalScore || 0}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Current Streak</span>
                      <span className="text-lg font-bold text-gray-900">{enrolment.progress?.currentStreak || 0}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Longest Streak</span>
                      <span className="text-lg font-bold text-gray-900">{enrolment.progress?.longestStreak || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Leaderboard</h3>
              <p className="text-gray-600">See how you rank against other participants</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {/* Top 3 Podium */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {/* 2nd Place */}
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl">🥈</span>
                </div>
                <p className="font-semibold text-gray-700">Sarah Johnson</p>
                <p className="text-sm text-gray-500">2,450 pts</p>
              </div>
              
              {/* 1st Place */}
              <div className="text-center">
                <div className="w-20 h-20 bg-yellow-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-3xl">🥇</span>
                </div>
                <p className="font-semibold text-gray-700">Mike Chen</p>
                <p className="text-sm text-gray-500">3,120 pts</p>
              </div>
              
              {/* 3rd Place */}
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl">🥉</span>
                </div>
                <p className="font-semibold text-gray-700">Emma Davis</p>
                <p className="text-sm text-gray-500">2,180 pts</p>
              </div>
            </div>
            
            {/* Other Rankings */}
            <div className="space-y-2">
              {[
                { rank: 4, name: "Alex Rodriguez", points: 1980, isCurrentUser: false },
                { rank: 5, name: "Liam Earl", points: 1850, isCurrentUser: true },
                { rank: 6, name: "Lisa Wang", points: 1720, isCurrentUser: false },
                { rank: 7, name: "Tom Wilson", points: 1650, isCurrentUser: false },
                { rank: 8, name: "Maria Garcia", points: 1580, isCurrentUser: false }
              ].map((participant) => (
                <div key={participant.rank} className={`flex items-center justify-between p-3 rounded-lg ${participant.isCurrentUser ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      participant.isCurrentUser ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'
                    }`}>
                      {participant.rank}
                    </span>
                    <span className={`font-medium ${participant.isCurrentUser ? 'text-green-800' : 'text-gray-700'}`}>
                      {participant.name}
                    </span>
                    {participant.isCurrentUser && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">You</span>
                    )}
                  </div>
                  <span className="font-semibold text-gray-900">{participant.points} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4-Angle Before/Current Layout */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">4-Angle Before/Current Layout</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Front Angle */}
            <div className="space-y-3">
              <h5 className="text-sm font-semibold text-gray-700 text-center">Front View</h5>
              <div className="space-y-2">
                <div className="relative">
                  <div className="w-full h-24 bg-gradient-to-br from-red-100 to-pink-100 rounded-lg border-2 border-red-200 flex items-center justify-center">
                    <span className="text-red-600 font-bold text-lg">B</span>
                  </div>
                  <div className="absolute top-1 left-1 px-2 py-1 bg-red-500 text-white text-xs rounded-full">Before</div>
                </div>
                <div className="relative">
                  <div className="w-full h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg border-2 border-green-200 flex items-center justify-center">
                    <span className="text-green-600 font-bold text-lg">C</span>
                  </div>
                  <div className="absolute top-1 left-1 px-2 py-1 bg-green-500 text-white text-xs rounded-full">Current</div>
                </div>
              </div>
            </div>

            {/* Back Angle */}
            <div className="space-y-3">
              <h5 className="text-sm font-semibold text-gray-700 text-center">Back View</h5>
              <div className="space-y-2">
                <div className="relative">
                  <div className="w-full h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg border-2 border-blue-200 flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">B</span>
                  </div>
                  <div className="absolute top-1 left-1 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">Before</div>
                </div>
                <div className="relative">
                  <div className="w-full h-24 bg-gradient-to-br from-purple-100 to-violet-100 rounded-lg border-2 border-purple-200 flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-lg">C</span>
                  </div>
                  <div className="absolute top-1 left-1 px-2 py-1 bg-purple-500 text-white text-xs rounded-full">Current</div>
                </div>
              </div>
            </div>

            {/* Left Side Angle */}
            <div className="space-y-3">
              <h5 className="text-sm font-semibold text-gray-700 text-center">Left Side</h5>
              <div className="space-y-2">
                <div className="relative">
                  <div className="w-full h-24 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg border-2 border-orange-200 flex items-center justify-center">
                    <span className="text-orange-600 font-bold text-lg">B</span>
                  </div>
                  <div className="absolute top-1 left-1 px-2 py-1 bg-orange-500 text-white text-xs rounded-full">Before</div>
                </div>
                <div className="relative">
                  <div className="w-full h-24 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-lg border-2 border-teal-200 flex items-center justify-center">
                    <span className="text-teal-600 font-bold text-lg">C</span>
                  </div>
                  <div className="absolute top-1 left-1 px-2 py-1 bg-teal-500 text-white text-xs rounded-full">Current</div>
                </div>
              </div>
            </div>

            {/* Right Side Angle */}
            <div className="space-y-3">
              <h5 className="text-sm font-semibold text-gray-700 text-center">Right Side</h5>
              <div className="space-y-2">
                <div className="relative">
                  <div className="w-full h-24 bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg border-2 border-pink-200 flex items-center justify-center">
                    <span className="text-pink-600 font-bold text-lg">B</span>
                  </div>
                  <div className="absolute top-1 left-1 px-2 py-1 bg-pink-500 text-white text-xs rounded-full">Before</div>
                </div>
                <div className="relative">
                  <div className="w-full h-24 bg-gradient-to-br from-emerald-100 to-green-100 rounded-lg border-2 border-emerald-200 flex items-center justify-center">
                    <span className="text-emerald-600 font-bold text-lg">C</span>
                  </div>
                  <div className="absolute top-1 left-1 px-2 py-1 bg-emerald-500 text-white text-xs rounded-full">Current</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center text-gray-600">
            <p>This layout shows Before (B) and Current (C) photos for each of the 4 angles:</p>
            <p className="mt-2">Front, Back, Left Side, and Right Side</p>
          </div>
        </div>
      </div>
    </div>
  )
}
