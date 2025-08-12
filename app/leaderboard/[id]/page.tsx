'use client'
import { useEffect, useState } from 'react'
import { doc, getDoc, collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore'
import { db } from '@/src/lib/firebase.client'
import { getChallengeParticipants } from '@/src/lib/challenges'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { Challenge, Enrolment, Checkin } from '@/src/types'
import { Trophy, Medal, Users, Calendar, TrendingUp, Award, Clock, Target } from 'lucide-react'
import Link from 'next/link'

interface LeaderboardEntry {
  enrolmentId: string
  userId: string
  displayName?: string
  photoURL?: string
  totalScore: number
  checkinsCount: number
  lastCheckin?: string
  rank: number
}

export default function LeaderboardPage({ params }: { params: { id: string } }) {
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState<'all' | 'week' | 'month'>('all')

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch challenge details
        const challengeRef = doc(db, 'challenges', params.id)
        const challengeSnap = await getDoc(challengeRef)
        if (challengeSnap.exists()) {
          setChallenge({ id: challengeSnap.id, ...challengeSnap.data() } as Challenge)
        }

        // Fetch all participants for this challenge
        const participants = await getChallengeParticipants(params.id)
        
        // Fetch check-ins for each participant and calculate scores
        const entries: LeaderboardEntry[] = []
        
        for (const participant of participants) {
          // Fetch user profile
          const userRef = doc(db, 'users', participant.userId)
          const userSnap = await getDoc(userRef)
          const userData = userSnap.exists() ? userSnap.data() : {}
          
          // Fetch check-ins for this enrolment
          const checkinsQuery = query(
            collection(db, 'checkins'),
            where('enrolmentId', '==', participant.id),
            orderBy('date', 'desc')
          )
          const checkinsSnap = await getDocs(checkinsQuery)
          const checkins = checkinsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Checkin))
          
          // Calculate total score from check-ins
          const totalScore = checkins.reduce((sum, checkin) => sum + (checkin.autoScore || 0), 0)
          const checkinsCount = checkins.length
          const lastCheckin = checkins.length > 0 ? checkins[0].date : undefined
          
          entries.push({
            enrolmentId: participant.id,
            userId: participant.userId,
            displayName: userData.displayName || userData.email || 'Anonymous',
            photoURL: userData.photoURL,
            totalScore,
            checkinsCount,
            lastCheckin,
            rank: 0
          })
        }
        
        // Sort by score (descending) and assign ranks
        entries.sort((a, b) => b.totalScore - a.totalScore)
        entries.forEach((entry, index) => {
          entry.rank = index + 1
        })
        
        setLeaderboard(entries)
      } catch (error) {
        console.error('Error fetching leaderboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Challenge Not Found</h1>
            <p className="text-gray-600 mb-6">The challenge you're looking for doesn't exist.</p>
            <Link href="/challenges">
              <Button variant="outline">← Back to Challenges</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const getTimeFilteredEntries = () => {
    if (timeFilter === 'all') return leaderboard
    
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    return leaderboard.filter(entry => {
      if (!entry.lastCheckin) return false
      const checkinDate = new Date(entry.lastCheckin)
      
      if (timeFilter === 'week') return checkinDate >= weekAgo
      if (timeFilter === 'month') return checkinDate >= monthAgo
      return true
    })
  }

  const filteredEntries = getTimeFilteredEntries()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
              <h2 className="text-xl text-blue-600 mt-1">{challenge.name}</h2>
            </div>
            <Link href={`/challenge/${challenge.id}`}>
              <Button variant="outline">← Back to Challenge</Button>
            </Link>
          </div>
          
          {challenge.description && (
            <p className="text-gray-600 mb-6">{challenge.description}</p>
          )}
          
          <div className="flex items-center space-x-4 mb-6">
            <span className="text-sm font-medium text-gray-700">Time Filter:</span>
            <div className="flex space-x-2">
              {(['all', 'week', 'month'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    timeFilter === filter
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter === 'all' ? 'All Time' : filter === 'week' ? 'This Week' : 'This Month'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Challenge Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{filteredEntries.length}</div>
              <div className="text-sm text-gray-600">Participants</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {filteredEntries.length > 0 ? Math.round(
                  filteredEntries.reduce((sum, entry) => sum + entry.checkinsCount, 0) / filteredEntries.length
                ) : 0}
              </div>
              <div className="text-sm text-gray-600">Avg Check-ins</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">
                {filteredEntries.length > 0 ? filteredEntries[0].totalScore : 0}
              </div>
              <div className="text-sm text-gray-600">Top Score</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">
                {challenge.startDate ? new Date(challenge.startDate).toLocaleDateString() : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Start Date</div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Rankings
            </CardTitle>
            <CardDescription>See how participants rank in this challenge</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Participant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check-ins
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Activity
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEntries.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No participants found for this time period.
                      </td>
                    </tr>
                  ) : (
                    filteredEntries.map((entry) => (
                      <tr key={entry.enrolmentId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {entry.rank === 1 && (
                              <Medal className="w-6 h-6 text-yellow-500 mr-2" />
                            )}
                            {entry.rank === 2 && (
                              <Medal className="w-6 h-6 text-gray-400 mr-2" />
                            )}
                            {entry.rank === 3 && (
                              <Medal className="w-6 h-6 text-orange-500 mr-2" />
                            )}
                            <span className={`font-semibold ${
                              entry.rank <= 3 ? 'text-lg' : 'text-sm'
                            }`}>
                              #{entry.rank}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {entry.photoURL ? (
                              <img 
                                className="h-8 w-8 rounded-full mr-3" 
                                src={entry.photoURL} 
                                alt={entry.displayName}
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gray-300 mr-3 flex items-center justify-center">
                                <span className="text-xs text-gray-600">
                                  {entry.displayName?.charAt(0).toUpperCase() || '?'}
                                </span>
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {entry.displayName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-lg font-bold text-blue-600">
                            {entry.totalScore.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {entry.checkinsCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {entry.lastCheckin ? new Date(entry.lastCheckin).toLocaleDateString() : 'Never'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Scoring Info */}
        <Card className="mt-8 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900">How Scoring Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <p><strong>Check-in:</strong> {challenge.scoring.checkinPoints} points per day</p>
                <p><strong>Workouts:</strong> {challenge.scoring.workoutPoints} points per workout (max 2/day)</p>
              </div>
              <div>
                <p><strong>Nutrition:</strong> Up to {challenge.scoring.nutritionPoints} points (0-10 scale)</p>
                <p><strong>Steps:</strong> Bonus points for {challenge.scoring.stepsBuckets.join(', ')}+ steps</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 