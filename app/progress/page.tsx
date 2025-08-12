'use client'
import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { db } from '@/src/lib/firebase.client'
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
  Zap
} from 'lucide-react'
import Link from 'next/link'

interface EnrolmentWithChallenge extends Enrolment {
  challenge: Challenge
}

interface CheckinWithChallenge extends Checkin {
  challenge: Challenge
}

export default function ProgressPage() {
  const [checkins, setCheckins] = useState<CheckinWithChallenge[]>([])
  const [enrolments, setEnrolments] = useState<EnrolmentWithChallenge[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedChallenge, setSelectedChallenge] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')

  useEffect(() => {
    fetchProgressData()
  }, [])

  const fetchProgressData = async () => {
    try {
      setLoading(true)
      
      // Fetch all check-ins for demo user
      const checkinsQuery = query(
        collection(db, 'checkins'),
        where('userId', '==', 'demo-user'),
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
      
      // Fetch enrolments for progress tracking
      const enrolmentsQuery = query(
        collection(db, 'enrolments'),
        where('userId', '==', 'demo-user'),
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
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 opacity-3"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-indigo-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-7xl mx-auto text-center">
            {/* Hero Header */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full text-white text-sm font-bold shadow-lg mb-6">
                <TrendingUp className="w-5 h-5" />
                Your Fitness Journey
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 bg-clip-text text-transparent">
              Progress History
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed max-w-4xl mx-auto">
              Track your fitness transformation, celebrate achievements, and see how far you've come on your journey to better health.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalCheckins}</div>
                <div className="text-sm text-gray-600">Total Check-ins</div>
              </div>
            </div>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalPoints}</div>
                <div className="text-sm text-gray-600">Total Points</div>
              </div>
            </div>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{averageScore}</div>
                <div className="text-sm text-gray-600">Avg Score</div>
              </div>
            </div>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{currentStreak}</div>
                <div className="text-sm text-gray-600">Current Streak</div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Graphs Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden mb-12">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 border-b border-gray-100/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Progress Analytics</h2>
            </div>
            <p className="text-gray-600 mt-2">Visual tracking of your weight and habit completion progress</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Weight Tracking Graph */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Weight Progress</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Current: 165 lbs</span>
                  </div>
                </div>
                
                {/* Weight Chart Placeholder */}
                <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-dashed border-blue-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="w-8 h-8 text-blue-600" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Weight Chart</h4>
                    <p className="text-gray-600 text-sm mb-4">Track your weight changes over time</p>
                    <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>Starting: 175 lbs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Current: 165 lbs</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Weight Stats */}
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">-10 lbs</div>
                    <div className="text-xs text-gray-500">Total Lost</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">-2.5 lbs</div>
                    <div className="text-xs text-gray-500">Avg/Week</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">4 weeks</div>
                    <div className="text-xs text-gray-500">Duration</div>
                  </div>
                </div>
              </div>

              {/* Habit Completion Graph */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Habit Completion</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">This Week: 85%</span>
                  </div>
                </div>
                
                {/* Habit Chart Placeholder */}
                <div className="h-64 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-dashed border-green-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Habit Completion Chart</h4>
                    <p className="text-gray-600 text-sm mb-4">Track your daily habit success rate</p>
                    <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>This Week: 85%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>Last Week: 72%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Habit Stats */}
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">85%</div>
                    <div className="text-xs text-gray-500">This Week</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">72%</div>
                    <div className="text-xs text-gray-500">Last Week</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">+13%</div>
                    <div className="text-xs text-gray-500">Improvement</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Update Weight
                </Button>
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-medium">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Log Habits
                </Button>
                <Button variant="outline" className="border-2 border-gray-200 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-xl font-medium">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Detailed Analytics
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Before & Current Gallery */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden mb-12">
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 border-b border-gray-100/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Before & Current Gallery</h2>
            </div>
            <p className="text-gray-600 mt-2">Document your ongoing fitness transformation journey</p>
          </div>
          
          <div className="p-6">
            {/* Upload Section */}
            <div className="mb-8">
              <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-6 border-2 border-dashed border-pink-200 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-pink-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Your Progress Photos</h3>
                <p className="text-gray-600 mb-4">Upload before and current images to track your transformation</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-6 py-2 rounded-xl font-medium">
                    Upload Before Photo
                  </Button>
                  <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-2 rounded-xl font-medium">
                    Upload Current Photo
                  </Button>
                </div>
              </div>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Sample Before & After Entry */}
              <div className="group bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-500 mb-2">Transformation #1</div>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Before Image */}
                    <div className="relative">
                      <div className="w-full h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-red-600 text-sm font-bold">B</span>
                          </div>
                          <span className="text-xs text-gray-600">Before</span>
                        </div>
                      </div>
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        Before
                      </div>
                    </div>
                    
                                         {/* Current Image */}
                     <div className="relative">
                       <div className="w-full h-32 bg-gradient-to-br from-green-200 to-green-300 rounded-xl flex items-center justify-center">
                         <div className="text-center">
                           <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                             <span className="text-green-600 text-sm font-bold">C</span>
                           </div>
                           <span className="text-xs text-gray-600">Current</span>
                         </div>
                       </div>
                       <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                         Current
                       </div>
                     </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Date</span>
                    <span className="text-sm text-gray-900">Dec 15, 2024</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Challenge</span>
                    <span className="text-sm text-gray-900">30-Day Fitness</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Weight Change</span>
                    <span className="text-sm font-semibold text-green-600">-8 lbs</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs">
                      View Full
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs">
                      Edit
                    </Button>
                  </div>
                </div>
              </div>

              {/* Sample Before & After Entry 2 */}
              <div className="group bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-500 mb-2">Transformation #2</div>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Before Image */}
                    <div className="relative">
                      <div className="w-full h-32 bg-gradient-to-br from-blue-200 to-blue-300 rounded-xl flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-blue-600 text-sm font-bold">B</span>
                          </div>
                          <span className="text-xs text-gray-600">Before</span>
                        </div>
                      </div>
                      <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        Before
                      </div>
                    </div>
                    
                                         {/* Current Image */}
                     <div className="relative">
                       <div className="w-full h-32 bg-gradient-to-br from-purple-200 to-purple-300 rounded-xl flex items-center justify-center">
                         <div className="text-center">
                           <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                             <span className="text-purple-600 text-sm font-bold">C</span>
                           </div>
                           <span className="text-xs text-gray-600">Current</span>
                         </div>
                       </div>
                       <div className="absolute top-2 left-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                         Current
                       </div>
                     </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Date</span>
                    <span className="text-sm text-gray-900">Jan 20, 2025</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Challenge</span>
                    <span className="text-sm text-gray-900">Strength Training</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Muscle Gain</span>
                    <span className="text-sm font-semibold text-blue-600">+5 lbs</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs">
                      View Full
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs">
                      Edit
                    </Button>
                  </div>
                </div>
              </div>

              {/* Add New Entry Card */}
              <div className="group bg-gradient-to-r from-gray-50 to-pink-50 rounded-2xl p-4 shadow-sm border-2 border-dashed border-pink-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer">
                <div className="h-full flex flex-col items-center justify-center text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-8 h-8 text-pink-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Add New Progress</h3>
                  <p className="text-gray-600 text-sm">Document your next milestone</p>
                </div>
              </div>
            </div>

            {/* Gallery Stats */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-pink-600">2</div>
                <div className="text-sm text-gray-600">Transformations</div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-600">-8 lbs</div>
                <div className="text-sm text-gray-600">Total Weight Loss</div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">+5 lbs</div>
                <div className="text-sm text-gray-600">Muscle Gained</div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">35</div>
                <div className="text-sm text-gray-600">Days Tracked</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden mb-12">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-100/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Search & Filter</h2>
            </div>
            <p className="text-gray-600 mt-2">Find specific check-ins and filter by date or challenge</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Search Check-ins
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by challenge or notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Challenge Filter */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Challenge
                </label>
                <select
                  value={selectedChallenge}
                  onChange={(e) => setSelectedChallenge(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium bg-white"
                >
                  <option value="all">All Challenges</option>
                  {enrolments.map((enrolment) => (
                    <option key={enrolment.id} value={enrolment.challengeId}>
                      {enrolment.challenge?.name || 'Unknown Challenge'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Time Period
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium bg-white"
                >
                  <option value="all">All Time</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Check-in History */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden mb-12">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 border-b border-gray-100/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Check-in History</h2>
            </div>
            <p className="text-gray-600 mt-2">Your complete fitness journey timeline</p>
          </div>
          
          <div className="p-6">
            {filteredCheckins.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Activity className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">No Check-ins Found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || selectedChallenge !== 'all' || dateFilter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Start your fitness journey with your first check-in'
                  }
                </p>
                {!searchTerm && selectedChallenge === 'all' && dateFilter === 'all' && (
                  <Link href="/checkin">
                    <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 rounded-full font-medium shadow-lg">
                      First Check-in
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCheckins.map((checkin, index) => (
                  <div key={checkin.id} className={`group p-6 rounded-2xl border border-gray-100/50 transition-all duration-200 hover:shadow-md ${
                    index % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/30'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-6 mb-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">
                              {new Date(checkin.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(checkin.date).toLocaleDateString('en-US', { weekday: 'short' })}
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900 mb-2">
                              {checkin.challenge?.name || 'Unknown Challenge'}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              {checkin.steps && (
                                <span className="flex items-center gap-1 px-3 py-1 bg-blue-50 rounded-full">
                                  <span>👟</span>
                                  {checkin.steps.toLocaleString()} steps
                                </span>
                              )}
                              {checkin.workouts && (
                                <span className="flex items-center gap-1 px-3 py-1 bg-green-50 rounded-full">
                                  <span>💪</span>
                                  {checkin.workouts} workouts
                                </span>
                              )}
                              {checkin.nutritionScore && (
                                <span className="flex items-center gap-1 px-3 py-1 bg-purple-50 rounded-full">
                                  <span>🥗</span>
                                  {checkin.nutritionScore}/10
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {checkin.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-gray-700 text-sm">{checkin.notes}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right ml-6">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                          <span className="text-2xl font-bold">{checkin.autoScore || 0}</span>
                        </div>
                        <div className="text-sm text-gray-500">points</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Challenge Progress */}
        {enrolments.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden mb-12">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 border-b border-gray-100/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Challenge Progress</h2>
              </div>
              <p className="text-gray-600 mt-2">Track your progress across all active challenges</p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {enrolments.map((enrolment) => (
                  <div key={enrolment.id} className="group bg-gradient-to-r from-gray-50 to-blue-50/30 p-6 rounded-2xl border border-gray-100/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-blue-100 rounded-xl flex items-center justify-center">
                          <Target className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 mb-1">
                            {enrolment.challenge?.name || 'Unknown Challenge'}
                          </h3>
                          <div className="text-sm text-gray-600 space-y-1">
                            {enrolment.startDate && (
                              <p>Started: {new Date(enrolment.startDate).toLocaleDateString()}</p>
                            )}
                            {enrolment.lastCheckinDate && (
                              <p>Last Check-in: {new Date(enrolment.lastCheckinDate).toLocaleDateString()}</p>
                            )}
                          </div>
                        </div>
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
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-12 text-white overflow-hidden relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 opacity-90"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            
            <div className="relative">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Keep Up the Great Work!</h2>
              <p className="text-xl mb-8 opacity-90">
                Your progress is inspiring! Continue your fitness journey with daily check-ins.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/checkin">
                  <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-full font-medium shadow-lg">
                    Daily Check-in
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-3 rounded-full font-medium">
                    View Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
