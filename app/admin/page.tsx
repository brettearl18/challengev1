'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { collection, query, orderBy, limit, getDocs, where, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/src/lib/firebase.client'
import { useAuth } from '@/src/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { Input } from '@/src/components/ui/Input'
import { Challenge, Enrolment, Checkin } from '@/src/types'
import { 
  Users, 
  Target, 
  Trophy, 
  DollarSign, 
  TrendingUp, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle,
  Calendar,
  BarChart3,
  Activity,
  Shield
} from 'lucide-react'
import Link from 'next/link'

interface AdminStats {
  totalUsers: number
  totalChallenges: number
  totalEnrolments: number
  totalRevenue: number
  activeChallenges: number
  completedChallenges: number
}

export default function AdminPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalChallenges: 0,
    totalEnrolments: 0,
    totalRevenue: 0,
    activeChallenges: 0,
    completedChallenges: 0
  })
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [recentEnrolments, setRecentEnrolments] = useState<Enrolment[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateChallenge, setShowCreateChallenge] = useState(false)
  const [newChallenge, setNewChallenge] = useState({
    name: '',
    description: '',
    durationDays: 30,
    priceCents: 2999,
    currency: 'USD' as const,
    challengeType: 'fitness' as const,
    status: 'draft' as const
  })

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login')
      } else if (profile?.role !== 'admin') {
        router.push('/dashboard')
      } else {
        fetchAdminData()
      }
    }
  }, [user, profile, authLoading, router])

  const fetchAdminData = async () => {
    if (!user || profile?.role !== 'admin') return

    try {
      setLoading(true)
      
      // Fetch all challenges
      const challengesQuery = query(collection(db, 'challenges'), orderBy('createdAt', 'desc'))
      const challengesSnap = await getDocs(challengesQuery)
      const challengesData = challengesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Challenge))
      setChallenges(challengesData)
      
      // Fetch all users
      const usersQuery = query(collection(db, 'users'))
      const usersSnap = await getDocs(usersQuery)
      const totalUsers = usersSnap.size
      
      // Fetch all enrolments
      const enrolmentsQuery = query(collection(db, 'enrolments'))
      const enrolmentsSnap = await getDocs(enrolmentsQuery)
      const totalEnrolments = enrolmentsSnap.size
      
      // Calculate revenue from paid enrolments
      const paidEnrolments = enrolmentsSnap.docs.filter(doc => doc.data().paymentStatus === 'paid')
      const totalRevenue = paidEnrolments.reduce((sum, doc) => {
        const data = doc.data()
        return sum + (data.priceCents || 0)
      }, 0)
      
      // Calculate challenge stats
      const activeChallenges = challengesData.filter(c => c.status === 'published').length
      const completedChallenges = challengesData.filter(c => c.status === 'archived').length
      
      setStats({
        totalUsers,
        totalChallenges: challengesData.length,
        totalEnrolments,
        totalRevenue,
        activeChallenges,
        completedChallenges
      })
      
      // Fetch recent enrolments
      const recentEnrolmentsQuery = query(
        collection(db, 'enrolments'),
        orderBy('createdAt', 'desc'),
        limit(5)
      )
      const recentEnrolmentsSnap = await getDocs(recentEnrolmentsQuery)
      const recentEnrolmentsData = recentEnrolmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enrolment))
      setRecentEnrolments(recentEnrolmentsData)
      
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateChallenge = async () => {
    try {
      const challengeData = {
        ...newChallenge,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        currentParticipants: 0,
        maxParticipants: 100,
        timezone: 'UTC',
        scoring: {
          checkinPoints: 10,
          workoutPoints: 20,
          nutritionPoints: 15,
          stepsBuckets: [5000, 8000, 10000],
          consistencyBonus: 5,
          streakMultiplier: 1.1
        },
        requirements: {
          fitnessLevel: 'beginner'
        },
        tags: [newChallenge.challengeType]
      }
      
      await addDoc(collection(db, 'challenges'), challengeData)
      
      // Reset form and refresh data
      setNewChallenge({
        name: '',
        description: '',
        durationDays: 30,
        priceCents: 2999,
        currency: 'USD',
        challengeType: 'fitness',
        status: 'draft'
      })
      setShowCreateChallenge(false)
      fetchAdminData()
    } catch (error) {
      console.error('Error creating challenge:', error)
    }
  }

  const handleUpdateChallengeStatus = async (challengeId: string, newStatus: 'draft' | 'published' | 'archived') => {
    try {
      await updateDoc(doc(db, 'challenges', challengeId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      })
      fetchAdminData()
    } catch (error) {
      console.error('Error updating challenge status:', error)
    }
  }

  const handleDeleteChallenge = async (challengeId: string) => {
    if (confirm('Are you sure you want to delete this challenge? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'challenges', challengeId))
        fetchAdminData()
      } catch (error) {
        console.error('Error deleting challenge:', error)
      }
    }
  }

  const populateDemoChallenges = async () => {
    try {
      const demoChallenges = [
        {
          name: "12-Week Fitness Transformation",
          description: "A comprehensive 12-week program designed to transform your fitness level through progressive workouts, nutrition guidance, and habit building. Perfect for beginners and intermediate fitness enthusiasts looking to build strength, endurance, and healthy habits.",
          challengeType: "fitness",
          status: "published",
          startDate: new Date('2024-01-15').getTime(),
          endDate: new Date('2024-04-08').getTime(),
          durationDays: 84,
          maxParticipants: 200,
          currentParticipants: 156,
          priceCents: 0,
          currency: "USD",
          bannerUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop",
          tags: ["fitness", "transformation", "12-weeks", "beginner-friendly"],
          scoring: {
            checkinPoints: 10,
            workoutPoints: 15,
            nutritionPoints: 10,
            bonusPoints: 5,
            streakBonus: true,
            streakMultiplier: 1.5
          },
          habits: [
            { name: "Daily Workout", description: "Complete a workout session", frequency: "daily", target: 1, points: 15 },
            { name: "Water Intake", description: "Drink 8 glasses of water", frequency: "daily", target: 8, points: 10 },
            { name: "Sleep 8 Hours", description: "Get adequate sleep", frequency: "daily", target: 8, points: 10 }
          ],
          prizes: {
            firstPlace: "Fitness tracker and 3 months gym membership",
            secondPlace: "Premium workout equipment",
            thirdPlace: "Nutrition consultation session"
          },
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        {
          name: "30-Day Weight Loss Challenge",
          description: "Intensive 30-day weight loss program focusing on calorie deficit, cardio exercise, and healthy eating habits. Includes meal planning, workout routines, and daily check-ins to keep you accountable.",
          challengeType: "weight-loss",
          status: "published",
          startDate: new Date('2024-01-20').getTime(),
          endDate: new Date('2024-02-19').getTime(),
          durationDays: 30,
          maxParticipants: 150,
          currentParticipants: 89,
          priceCents: 0,
          currency: "USD",
          bannerUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=400&fit=crop",
          tags: ["weight-loss", "30-days", "intensive", "calorie-deficit"],
          scoring: {
            checkinPoints: 15,
            workoutPoints: 20,
            nutritionPoints: 15,
            bonusPoints: 10,
            streakBonus: true,
            streakMultiplier: 2.0
          },
          habits: [
            { name: "Calorie Deficit", description: "Maintain daily calorie deficit", frequency: "daily", target: 1, points: 15 },
            { name: "Cardio Exercise", description: "Complete cardio workout", frequency: "daily", target: 1, points: 20 },
            { name: "No Junk Food", description: "Avoid processed foods", frequency: "daily", target: 1, points: 15 }
          ],
          prizes: {
            firstPlace: "Personal training sessions and meal plan",
            secondPlace: "Fitness equipment package",
            thirdPlace: "Nutrition consultation"
          },
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        {
          name: "Strength Building Program",
          description: "6-week strength training program designed to build muscle mass and increase overall strength. Includes progressive overload principles, proper form guidance, and recovery strategies.",
          challengeType: "strength",
          status: "published",
          startDate: new Date('2024-02-01').getTime(),
          endDate: new Date('2024-03-14').getTime(),
          durationDays: 42,
          maxParticipants: 100,
          currentParticipants: 67,
          priceCents: 0,
          currency: "USD",
          bannerUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&h=400&fit=crop",
          tags: ["strength", "muscle-building", "6-weeks", "progressive"],
          scoring: {
            checkinPoints: 12,
            workoutPoints: 25,
            nutritionPoints: 12,
            bonusPoints: 8,
            streakBonus: true,
            streakMultiplier: 1.8
          },
          habits: [
            { name: "Strength Training", description: "Complete strength workout", frequency: "every-other-day", target: 1, points: 25 },
            { name: "Protein Intake", description: "Consume adequate protein", frequency: "daily", target: 1, points: 12 },
            { name: "Rest Days", description: "Take proper rest days", frequency: "weekly", target: 2, points: 8 }
          ],
          prizes: {
            firstPlace: "Home gym equipment set",
            secondPlace: "Personal training package",
            thirdPlace: "Recovery tools and supplements"
          },
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ]

      for (const challenge of demoChallenges) {
        await addDoc(collection(db, 'challenges'), challenge)
      }

      alert('Demo challenges added successfully!')
      fetchAdminData() // Refresh the data
    } catch (error) {
      console.error('Error adding demo challenges:', error)
      alert('Failed to add demo challenges')
    }
  }

  // Check if user is admin - REMOVED FOR DEV MODE
  // if (authLoading) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 py-8">
  //       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
  //         <p className="mt-4 text-gray-600">Loading...</p>
  //       </div>
  //     </div>
  //   )
  // }

  // if (!user || profile?.role !== 'admin') {
  //   return (
  //     <div className="min-h-screen bg-gray-50 py-8">
  //       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  //       <div className="text-center">
  //         <Shield className="mx-auto h-16 w-16 text-red-500 mb-4" />
  //         <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
  //         <text className="text-gray-600 mb-6">
  //           You don't have permission to access the admin panel.
  //         </text>
  //         <Link href="/dashboard">
  //           <Button>Return to Dashboard</Button>
  //         </Link>
  //       </div>
  //     </div>
  //   )
  // }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading...</h2>
        </div>
      </div>
    )
  }

  // Show access denied if not admin
  if (!user || profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-6">You need admin privileges to access this page.</p>
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading admin data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your fitness challenge platform</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Challenges</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalChallenges}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Trophy className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Enrolments</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalEnrolments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${(stats.totalRevenue / 100).toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Challenges</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeChallenges}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedChallenges}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Challenge */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Create New Challenge
            </CardTitle>
            <CardDescription>
              Add a new fitness challenge to your platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showCreateChallenge ? (
              <Button onClick={() => setShowCreateChallenge(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Challenge
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <Input
                      value={newChallenge.name}
                      onChange={(e) => setNewChallenge({...newChallenge, name: e.target.value})}
                      placeholder="Challenge title"
                    />
                  </div>
                                       <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                       <select
                         value={newChallenge.challengeType}
                         onChange={(e) => setNewChallenge({...newChallenge, challengeType: e.target.value as any})}
                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                       >
                         <option value="fitness">Fitness</option>
                         <option value="weight-loss">Weight Loss</option>
                         <option value="wellness">Wellness</option>
                         <option value="strength">Strength</option>
                         <option value="endurance">Endurance</option>
                       </select>
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">Duration (days)</label>
                       <Input
                         type="number"
                         value={newChallenge.durationDays}
                         onChange={(e) => setNewChallenge({...newChallenge, durationDays: parseInt(e.target.value)})}
                         min="1"
                       />
                     </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price (cents)</label>
                    <Input
                      type="number"
                      value={newChallenge.priceCents}
                      onChange={(e) => setNewChallenge({...newChallenge, priceCents: parseInt(e.target.value)})}
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newChallenge.description}
                    onChange={(e) => setNewChallenge({...newChallenge, description: e.target.value})}
                    placeholder="Challenge description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex space-x-3">
                  <Button onClick={handleCreateChallenge}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Challenge
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateChallenge(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Populate Demo Data */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="w-5 h-5 mr-2" />
              Demo Data
            </CardTitle>
            <CardDescription>
              Quickly populate your platform with sample challenges for testing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                This will add 3 sample challenges (12-Week Fitness, 30-Day Weight Loss, and Strength Building) 
                to your platform. These challenges are set to "published" status and ready for users to join.
              </p>
              <Button onClick={populateDemoChallenges} className="bg-green-600 hover:bg-green-700">
                <Trophy className="w-4 h-4 mr-2" />
                Populate Demo Challenges
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Challenges Management */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Manage Challenges
            </CardTitle>
            <CardDescription>
              View and manage all challenges on your platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Title</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Participants</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {challenges.map((challenge) => (
                    <tr key={challenge.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{challenge.name}</div>
                          <div className="text-sm text-gray-600">{challenge.description}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {challenge.challengeType}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          challenge.status === 'published' ? 'bg-green-100 text-green-800' :
                          challenge.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {challenge.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-gray-900">{challenge.currentParticipants || 0}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <Link href={`/challenge/${challenge.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateChallengeStatus(
                              challenge.id,
                              challenge.status === 'published' ? 'draft' : 'published'
                            )}
                          >
                            {challenge.status === 'published' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteChallenge(challenge.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Enrolments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Recent Enrolments
            </CardTitle>
            <CardDescription>
              Latest challenge enrollments and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Challenge</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Amount</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEnrolments.map((enrolment) => (
                    <tr key={enrolment.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="text-sm font-medium text-gray-900">
                          {enrolment.userId}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900">
                          {challenges.find(c => c.id === enrolment.challengeId)?.name || 'Unknown Challenge'}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          enrolment.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                          enrolment.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {enrolment.paymentStatus}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-gray-900">
                          ${((challenges.find(c => c.id === enrolment.challengeId)?.priceCents || 0) / 100).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-sm text-gray-600">
                          {enrolment.createdAt ? new Date(enrolment.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 