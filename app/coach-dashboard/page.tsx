'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { db } from '@/src/lib/firebase.client'
import { Challenge, Enrolment } from '@/src/types'
import { useAuth } from '@/src/lib/auth'
import { 
  Target, 
  Users, 
  TrendingUp, 
  Plus,
  Trophy,
  Activity,
  BarChart3,
  Award
} from 'lucide-react'

export default function CoachDashboardPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [enrolments, setEnrolments] = useState<Enrolment[]>([])
  const [loading, setLoading] = useState(true)

  // Redirect if not authenticated or not coach
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login')
      } else if (profile?.role !== 'coach' && profile?.role !== 'admin') {
        router.push('/dashboard')
      } else {
        fetchCoachData()
      }
    }
  }, [user, profile, authLoading, router])

  const fetchCoachData = async () => {
    if (!user || (profile?.role !== 'coach' && profile?.role !== 'admin')) return

    try {
      setLoading(true)
      
      // For now, fetch all challenges (in a real app, this would be filtered by coach)
      const challengesQuery = query(
        collection(db, 'challenges'),
        orderBy('createdAt', 'desc')
      )
      const challengesSnapshot = await getDocs(challengesQuery)
      const challengesData = challengesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Challenge[]
      
      setChallenges(challengesData)

      // Fetch enrolments for these challenges
      const enrolmentsQuery = query(
        collection(db, 'enrolments'),
        orderBy('createdAt', 'desc')
      )
      const enrolmentsSnapshot = await getDocs(enrolmentsQuery)
      const enrolmentsData = enrolmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Enrolment[]
      
      setEnrolments(enrolmentsData)
      
    } catch (error) {
      console.error('Error fetching coach data:', error)
    } finally {
      setLoading(false)
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

  // Show access denied if not coach
  if (!user || (profile?.role !== 'coach' && profile?.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-6">You need coach privileges to access this page.</p>
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
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
          <h2 className="text-xl font-semibold text-gray-700">Loading your coach dashboard...</h2>
          <p className="text-gray-500">Fetching your challenge data</p>
        </div>
      </div>
    )
  }

  // Calculate stats
  const totalChallenges = challenges.length
  const activeChallenges = challenges.filter(c => c.status === 'published').length
  const totalParticipants = enrolments.length
  const totalRevenue = enrolments.reduce((sum, e) => {
    const challenge = challenges.find(c => c.id === e.challengeId)
    return sum + (challenge?.priceCents || 0)
  }, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-blue-600 to-purple-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-bold shadow-lg mb-6">
              <Target className="w-5 h-5" />
              Coach Dashboard
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Welcome, Coach {profile?.displayName || 'Champion'}! 🎯
            </h1>
            <p className="text-xl md:text-2xl text-green-100 leading-relaxed max-w-4xl mx-auto">
              Manage your fitness challenges, track participant progress, and grow your fitness community!
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Challenges</p>
                <p className="text-3xl font-bold text-gray-900">{totalChallenges}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Challenges</p>
                <p className="text-3xl font-bold text-gray-900">{activeChallenges}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Participants</p>
                <p className="text-3xl font-bold text-gray-900">{totalParticipants}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">${(totalRevenue / 100).toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Trophy className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Plus className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Create Challenge</h3>
                  <p className="text-gray-600">Start a new fitness challenge</p>
                </div>
              </div>
            </div>
            <Link href="/create-challenge">
              <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                Create Challenge
              </Button>
            </Link>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Award className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Browse Templates</h3>
                  <p className="text-gray-600">Find professional challenge templates</p>
                </div>
              </div>
            </div>
            <Link href="/templates">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                Browse Templates
              </Button>
            </Link>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">View Analytics</h3>
                  <p className="text-gray-600">Track challenge performance</p>
                </div>
              </div>
            </div>
            <Link href="/admin">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                View Analytics
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Challenges */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden mb-12">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 border-b border-gray-100/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Your Challenges</h3>
                <p className="text-gray-600">Manage and monitor your fitness challenges</p>
              </div>
            </div>
            
            {/* Archive Rules Info */}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-white">ℹ️</span>
                </div>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Archive Rules:</p>
                  <p>Challenges can only be archived when they have no active participants. This ensures data integrity and prevents disruption to ongoing fitness journeys.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {challenges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {challenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className="group bg-gradient-to-r from-gray-50 to-blue-50/30 p-6 rounded-2xl border border-gray-100/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-2">{challenge.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          {challenge.description || 'No description available'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{challenge.currentParticipants || 0}</div>
                        <div className="text-xs text-gray-500">Participants</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">${(challenge.priceCents / 100).toFixed(2)}</div>
                        <div className="text-xs text-gray-500">Price</div>
                      </div>
                    </div>
                    
                    {/* Archive Status Indicator */}
                    <div className="mb-4">
                      {challenge.currentParticipants > 0 ? (
                        <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                          <span className="text-xs text-amber-700 font-medium">
                            Cannot archive - {challenge.currentParticipants} active participant{challenge.currentParticipants === 1 ? '' : 's'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                          <span className="text-xs text-green-700 font-medium">
                            Safe to archive - No active participants
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Link
                        href={`/challenge/${challenge.id}`}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium text-center hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                      >
                        View Challenge
                      </Link>
                      <Link
                        href={`/challenge-settings/${challenge.id}`}
                        className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium text-center hover:from-green-700 hover:to-blue-700 transition-all duration-200"
                      >
                        Settings
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No challenges yet</h3>
                <p className="text-gray-500 mb-6">Create your first fitness challenge to get started!</p>
                <Link href="/create-challenge">
                  <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                    Create First Challenge
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/create-challenge">
            <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 text-center shadow-lg border border-white/20 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                <Plus className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Create Challenge</h3>
              <p className="text-gray-600 text-sm mb-4">Design and launch new fitness challenges</p>
              <div className="text-green-600 group-hover:translate-x-1 transition-transform duration-200">
                →
              </div>
            </div>
          </Link>

          <Link href="/admin">
            <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 text-center shadow-lg border border-white/20 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Analytics</h3>
              <p className="text-gray-600 text-sm mb-4">View detailed platform analytics</p>
              <div className="text-blue-600 group-hover:translate-x-1 transition-transform duration-200">
                →
              </div>
            </div>
          </Link>

          <Link href="/dashboard">
            <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 text-center shadow-lg border border-white/20 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                <Activity className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Personal Dashboard</h3>
              <p className="text-gray-600 text-sm mb-4">View your personal fitness progress</p>
              <div className="text-purple-600 group-hover:translate-x-1 transition-transform duration-200">
                →
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
