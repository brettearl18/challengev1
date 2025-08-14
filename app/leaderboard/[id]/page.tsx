'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { Trophy, Medal, Users, Calendar, TrendingUp, Award, Clock, Target, Star, Crown, ArrowLeft, BarChart3, Zap } from 'lucide-react'
import Link from 'next/link'
import { getChallengeLeaderboard, LeaderboardParticipant } from '@/src/lib/leaderboard.service'
import { Challenge } from '@/src/types'



export default function ChallengeLeaderboardPage() {
  const params = useParams()
  const router = useRouter()
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [participants, setParticipants] = useState<LeaderboardParticipant[]>([])
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState<'all' | 'week' | 'month'>('all')

  useEffect(() => {
    if (params.id) {
      loadChallengeLeaderboard(params.id as string)
    }
  }, [params.id, timeFilter])

  const loadChallengeLeaderboard = async (challengeId: string) => {
    try {
      setLoading(true)
      
      const leaderboard = await getChallengeLeaderboard(challengeId)
      if (!leaderboard) {
        router.push('/challenges')
        return
      }
      
      setChallenge(leaderboard.challenge)
      setParticipants(leaderboard.participants)
      
    } catch (error) {
      console.error('Error fetching challenge leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />
      case 2: return <Medal className="w-6 h-6 text-gray-400" />
      case 3: return <Medal className="w-6 h-6 text-amber-600" />
      default: return <Trophy className="w-5 h-5 text-blue-500" />
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
      case 2: return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
      case 3: return 'bg-gradient-to-r from-amber-600 to-orange-600 text-white'
      default: return 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Challenge Leaderboard</h2>
          <p className="text-gray-600">Preparing the competition...</p>
        </div>
      </div>
    )
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Challenge Not Found</h2>
          <p className="text-gray-600 mb-6">The challenge you're looking for doesn't exist.</p>
          <Link href="/challenges">
            <Button>Back to Challenges</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <Link href={`/challenge/${challenge.id}`}>
                  <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Challenge
                  </Button>
                </Link>
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <h1 className="text-5xl font-bold text-white leading-tight mb-6">
                {challenge.name} Leaderboard
              </h1>
              
              <p className="text-xl text-blue-100 leading-relaxed max-w-3xl">
                Track your progress and see how you rank against other participants in this challenge
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="w-full lg:w-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">{participants.length}</div>
                    <div className="text-blue-100 text-sm">Participants</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      {participants.length > 0 ? participants[0].totalScore : 0}
                    </div>
                    <div className="text-blue-100 text-sm">Top Score</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Filter Tabs */}
          <div className="flex justify-center mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-gray-100">
              {['all', 'week', 'month'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter as 'all' | 'week' | 'month')}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    timeFilter === filter
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {filter === 'all' ? 'All Time' : filter === 'week' ? 'This Week' : 'This Month'}
                </button>
              ))}
            </div>
          </div>

          {/* Leaderboard Table */}
          <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden">
            <CardHeader className="pb-6 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="flex items-center gap-4 text-3xl">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                Challenge Rankings
              </CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Current standings based on {timeFilter === 'all' ? 'total' : timeFilter === 'week' ? 'weekly' : 'monthly'} performance
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100">
                      <th className="text-left py-6 px-8 font-bold text-gray-700 text-lg">Rank</th>
                      <th className="text-left py-6 px-8 font-bold text-gray-700 text-lg">Participant</th>
                      <th className="text-center py-6 px-8 font-bold text-gray-700 text-lg">Score</th>
                      <th className="text-center py-6 px-8 font-bold text-gray-700 text-lg">Check-ins</th>
                      <th className="text-center py-6 px-8 font-bold text-gray-700 text-lg">Streak</th>
                      <th className="text-center py-6 px-8 font-bold text-gray-700 text-lg">Last Activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((participant, index) => (
                      <tr 
                        key={participant.userId} 
                        className={`border-b border-gray-100/50 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/30 ${
                          index < 3 ? 'bg-gradient-to-r from-yellow-50/30 to-orange-50/30' : ''
                        }`}
                      >
                        <td className="py-6 px-8">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getRankColor(participant.rank)}`}>
                              {getRankIcon(participant.rank)}
                            </div>
                            <div className="text-2xl font-bold text-gray-900">#{participant.rank}</div>
                          </div>
                        </td>
                        <td className="py-6 px-8">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {participant.displayName?.charAt(0)?.toUpperCase() || 'A'}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 text-lg">{participant.displayName}</div>
                              <div className="text-sm text-gray-500">Participant</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-6 px-8 text-center">
                          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            {participant.totalScore.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">points</div>
                        </td>
                        <td className="py-6 px-8 text-center">
                          <div className="text-xl font-semibold text-gray-900">{participant.checkinsCount}</div>
                          <div className="text-sm text-gray-500">check-ins</div>
                        </td>
                        <td className="py-6 px-8 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-500" />
                            <span className="text-xl font-semibold text-gray-900">{participant.streak || 0}</span>
                          </div>
                          <div className="text-sm text-gray-500">days</div>
                        </td>
                        <td className="py-6 px-8 text-center">
                          <div className="text-sm text-gray-600">
                            {participant.lastCheckin 
                              ? participant.lastCheckin.toLocaleDateString()
                              : 'Never'
                            }
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-12 border border-blue-100">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Want to Climb the Ranks?</h3>
              <p className="text-gray-600 mb-8 text-lg max-w-2xl mx-auto">
                Keep checking in, complete your daily habits, and watch your score rise. Consistency is the key to success!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={`/challenge/${challenge.id}`}>
                  <Button size="lg" className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25 text-lg font-semibold py-4 px-8 rounded-2xl">
                    Back to Challenge
                  </Button>
                </Link>
                <Link href="/leaderboard">
                  <Button size="lg" variant="outline" className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1 rounded-2xl px-8 py-4 text-lg font-semibold">
                    View Global Leaderboard
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