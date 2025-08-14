'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { Input } from '@/src/components/ui/Input'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
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
  Zap
} from 'lucide-react'
import CalendarView from '@/src/components/CalendarView'

export default function DashboardPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const [enrolments, setEnrolments] = useState<Enrolment[]>([])
  const [recentCheckins, setRecentCheckins] = useState<Checkin[]>([])
  const [loading, setLoading] = useState(true)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    if (!user) return

    try {
      // Fetch user's enrolments
      const enrolmentsQuery = query(
        collection(db, 'enrolments'),
        where('userId', '==', user.uid),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
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
            const challengeDoc = await getDocs(query(
              collection(db, 'challenges'),
              where('__name__', '==', enrolment.challengeId)
            ))
            if (!challengeDoc.empty) {
              const challengeData = challengeDoc.docs[0].data() as Challenge
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

      // Fetch recent check-ins
      const checkinsQuery = query(
        collection(db, 'checkins'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(5)
      )
      const checkinsSnapshot = await getDocs(checkinsQuery)
      const checkinsData = checkinsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Checkin[]

      setRecentCheckins(checkinsData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading...</h2>
        </div>
      </div>
    )
  }

  // Show loading while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading your dashboard...</h2>
          <p className="text-gray-500">Fetching your fitness data</p>
        </div>
      </div>
    )
  }

  // Calculate stats
  const totalPoints = enrolments.reduce((sum, e) => sum + (e.totalScore || 0), 0)
  const totalCheckins = enrolments.reduce((sum, e) => sum + (e.progress?.daysCompleted || 0), 0)
  const currentStreak = enrolments.reduce((max, e) => Math.max(max, e.progress?.currentStreak || 0), 0)
  const activeChallenges = enrolments.length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
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
        {/* Hero Section - Simplified */}
        <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-3xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
              <TrendingUp className="w-4 h-4" />
              Ready to crush it today?
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Let's make today count! 💪
            </h2>
            <p className="text-lg text-green-100 max-w-2xl mx-auto">
              Track your progress, complete daily habits, and stay motivated on your fitness journey.
            </p>
          </div>
        </div>

        {/* Stats Grid - Modern Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Points</p>
                <p className="text-2xl font-bold text-gray-900">{totalPoints.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Check-ins</p>
                <p className="text-2xl font-bold text-gray-900">{totalCheckins}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Current Streak</p>
                <p className="text-2xl font-bold text-gray-900">{currentStreak} days</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Challenges</p>
                <p className="text-2xl font-bold text-gray-900">{activeChallenges}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Modern Design */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Daily Check-in</h3>
                <p className="text-sm text-gray-600">Log your progress</p>
              </div>
            </div>
            <Link
              href="/checkin"
              className="w-full inline-flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors duration-200"
            >
              Check In Now
            </Link>
          </div>

          <div className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Join Challenge</h3>
                <p className="text-sm text-gray-600">Find new challenges</p>
              </div>
            </div>
            <Link
              href="/challenges"
              className="w-full inline-flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200"
            >
              Browse Challenges
            </Link>
          </div>

          <div className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">View Progress</h3>
                <p className="text-sm text-gray-600">Track your fitness journey</p>
              </div>
            </div>
            <Link
              href="/progress"
              className="w-full inline-flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors duration-200"
            >
              View Progress
            </Link>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
            <Link href="/progress" className="text-green-600 hover:text-green-700 text-sm font-medium">
              View All
            </Link>
          </div>
          
          {recentCheckins.length > 0 ? (
            <div className="space-y-4">
              {recentCheckins.slice(0, 5).map((checkin, index) => {
                const enrolment = enrolments.find(e => e.challengeId === checkin.challengeId)
                return (
                  <div key={checkin.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Check-in completed</p>
                      <p className="text-sm text-gray-600">Challenge #{checkin.challengeId.slice(-6)}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(checkin.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">No recent activity yet</p>
              <Link
                href="/checkin"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors duration-200"
              >
                Start Your First Check-in
              </Link>
            </div>
          )}
        </div>

        {/* Active Challenges Section */}
        {enrolments.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Active Challenges</h3>
              <Link href="/my-challenges" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolments.map((enrolment) => (
                <div
                  key={enrolment.id}
                  className="group bg-gray-50 p-6 rounded-xl border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Challenge #{enrolment.challengeId.slice(-6)}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Enrolled on {new Date(enrolment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{enrolment.totalScore || 0}</div>
                      <div className="text-xs text-gray-500">Total Points</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{enrolment.progress?.daysCompleted || 0}</div>
                      <div className="text-xs text-gray-500">Check-ins</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link
                      href={`/challenge/${enrolment.challengeId}`}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium text-center hover:bg-blue-700 transition-colors duration-200"
                    >
                      View Challenge
                    </Link>
                    <Link
                      href="/checkin"
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium text-center hover:bg-green-700 transition-colors duration-200"
                    >
                      Check In
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Motivation Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">💪 Stay Motivated!</h3>
            <p className="text-blue-700 text-sm">
              Every check-in brings you closer to your fitness goals. Keep pushing forward!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 