'use client'
import { useEffect, useState } from 'react'
import { collection, query, orderBy, limit, getDocs, where, getDoc, doc } from 'firebase/firestore'
import { db } from '@/src/lib/firebase.client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { Challenge, Enrolment, Checkin } from '@/src/types'
import { Trophy, Medal, Users, Calendar, TrendingUp, Award, Clock, Target, Star, Crown } from 'lucide-react'
import Link from 'next/link'

interface ChallengeLeaderboard {
  challenge: Challenge
  topParticipants: {
    userId: string
    displayName?: string
    photoURL?: string
    totalScore: number
    checkinsCount: number
    rank: number
  }[]
  totalParticipants: number
  averageScore: number
}

interface GlobalLeaderboardEntry {
  userId: string
  displayName?: string
  photoURL?: string
  totalScore: number
  challengesCount: number
  totalCheckins: number
  rank: number
}

export default function LeaderboardPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [challengeLeaderboards, setChallengeLeaderboards] = useState<ChallengeLeaderboard[]>([])
  const [globalLeaderboard, setGlobalLeaderboard] = useState<GlobalLeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState<'all' | 'week' | 'month'>('all')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch all published challenges
        const challengesQuery = query(
          collection(db, 'challenges'),
          where('status', '==', 'published'),
          orderBy('createdAt', 'desc')
        )
        const challengesSnap = await getDocs(challengesQuery)
        const challengesData = challengesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Challenge))
        setChallenges(challengesData)

        // Fetch leaderboard data for each challenge
        const leaderboards: ChallengeLeaderboard[] = []
        
        for (const challenge of challengesData) {
          // Fetch participants for this challenge
          const enrolmentsQuery = query(
            collection(db, 'enrolments'),
            where('challengeId', '==', challenge.id),
            where('paymentStatus', '==', 'paid')
          )
          const enrolmentsSnap = await getDocs(enrolmentsQuery)
          const enrolments = enrolmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enrolment))
          
          // Fetch check-ins and calculate scores for each participant
          const participants: { [userId: string]: { score: number; checkins: number } } = {}
          
          for (const enrolment of enrolments) {
            const checkinsQuery = query(
              collection(db, 'checkins'),
              where('enrolmentId', '==', enrolment.id)
            )
            const checkinsSnap = await getDocs(checkinsQuery)
            const checkins = checkinsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Checkin))
            
            const totalScore = checkins.reduce((sum, checkin) => sum + (checkin.autoScore || 0), 0)
            participants[enrolment.userId] = {
              score: totalScore,
              checkins: checkins.length
            }
          }
          
          // Sort participants by score and get top 5
          const topParticipants = Object.entries(participants)
            .sort(([, a], [, b]) => b.score - a.score)
            .slice(0, 5)
            .map(([userId, data], index) => ({
              userId,
              totalScore: data.score,
              checkinsCount: data.checkins,
              rank: index + 1,
              displayName: undefined, // Will be populated later
              photoURL: undefined
            }))
          
          // Calculate averages
          const totalParticipants = Object.keys(participants).length
          const averageScore = totalParticipants > 0 
            ? Object.values(participants).reduce((sum, p) => sum + p.score, 0) / totalParticipants 
            : 0
          
          leaderboards.push({
            challenge,
            topParticipants,
            totalParticipants,
            averageScore
          })
        }
        
        // Populate user details for top participants
        for (const leaderboard of leaderboards) {
          for (const participant of leaderboard.topParticipants) {
            const userRef = doc(db, 'users', participant.userId)
            const userSnap = await getDoc(userRef)
            if (userSnap.exists()) {
              const userData = userSnap.data()
              participant.displayName = userData.displayName || userData.email || 'Anonymous'
              participant.photoURL = userData.photoURL
            }
          }
        }
        
        setChallengeLeaderboards(leaderboards)
        
        // Calculate global leaderboard across all challenges
        const globalScores: { [userId: string]: { score: number; challenges: number; checkins: number } } = {}
        
        for (const leaderboard of leaderboards) {
          for (const participant of leaderboard.topParticipants) {
            if (!globalScores[participant.userId]) {
              globalScores[participant.userId] = { score: 0, challenges: 0, checkins: 0 }
            }
            globalScores[participant.userId].score += participant.totalScore
            globalScores[participant.userId].challenges += 1
            globalScores[participant.userId].checkins += participant.checkinsCount
          }
        }
        
        const globalEntries = Object.entries(globalScores)
          .map(([userId, data]) => ({
            userId,
            totalScore: data.score,
            challengesCount: data.challenges,
            totalCheckins: data.checkins,
            rank: 0,
            displayName: undefined,
            photoURL: undefined
          }))
          .sort((a, b) => b.totalScore - a.totalScore)
          .slice(0, 20)
        
        // Populate user details for global leaderboard
        for (const entry of globalEntries) {
          const userRef = doc(db, 'users', entry.userId)
          const userSnap = await getDoc(userRef)
          if (userSnap.exists()) {
            const userData = userSnap.data()
            entry.displayName = userData.displayName || userData.email || 'Anonymous'
            entry.photoURL = userData.photoURL
          }
        }
        
        // Assign ranks
        globalEntries.forEach((entry, index) => {
          entry.rank = index + 1
        })
        
        setGlobalLeaderboard(globalEntries)
        
      } catch (error) {
        console.error('Error fetching leaderboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Leaderboards</h2>
          <p className="text-gray-600">Preparing the competition...</p>
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
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-white text-sm font-bold shadow-lg mb-6">
                <Trophy className="w-5 h-5" />
                Live Competition
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 bg-clip-text text-transparent">
              Global Leaderboards
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed max-w-4xl mx-auto">
              See who's leading the fitness revolution across all challenges. Track progress, celebrate achievements, and find your motivation to climb the ranks.
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{globalLeaderboard.length}</div>
                <div className="text-sm text-gray-600 font-medium">Top Performers</div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{challenges.length}</div>
                <div className="text-sm text-gray-600 font-medium">Active Challenges</div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {challengeLeaderboards.reduce((sum, lb) => sum + lb.totalParticipants, 0)}
                </div>
                <div className="text-sm text-gray-600 font-medium">Total Participants</div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {Math.round(globalLeaderboard.reduce((sum, entry) => sum + entry.totalScore, 0) / globalLeaderboard.length)}
                </div>
                <div className="text-sm text-gray-600 font-medium">Avg Score</div>
              </div>
            </div>
          </div>
        </div>
      </div>

              {/* Global Leaderboard Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Global Champions</h2>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Top performers across all challenges based on total score. These are the elite athletes leading the fitness revolution.
            </p>
          </div>

          {/* Global Leaderboard Table */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
                    <th className="text-left py-4 px-6 font-bold text-gray-700 text-lg">Rank</th>
                    <th className="text-left py-4 px-6 font-bold text-gray-700 text-lg">Participant</th>
                    <th className="text-center py-4 px-6 font-bold text-gray-700 text-lg">Total Score</th>
                    <th className="text-center py-4 px-6 font-bold text-gray-700 text-lg">Challenges</th>
                    <th className="text-center py-4 px-6 font-bold text-gray-700 text-lg">Check-ins</th>
                  </tr>
                </thead>
                <tbody>
                  {globalLeaderboard.map((entry, index) => (
                    <tr 
                      key={entry.userId} 
                      className={`border-b border-gray-100/50 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/30 ${
                        index % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/30'
                      }`}
                    >
                      <td className="py-5 px-6">
                        <div className="flex items-center">
                          {entry.rank === 1 && (
                            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mr-3">
                              <Trophy className="w-5 h-5 text-white" />
                            </div>
                          )}
                          {entry.rank === 2 && (
                            <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mr-3">
                              <Medal className="w-5 h-5 text-white" />
                            </div>
                          )}
                          {entry.rank === 3 && (
                            <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mr-3">
                              <Medal className="w-5 h-5 text-white" />
                            </div>
                          )}
                          {entry.rank > 3 && (
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-sm font-bold text-gray-600">#{entry.rank}</span>
                            </div>
                          )}
                          <span className={`font-bold text-lg ${
                            entry.rank === 1 ? 'text-yellow-600' :
                            entry.rank === 2 ? 'text-gray-600' :
                            entry.rank === 3 ? 'text-amber-600' :
                            'text-gray-700'
                          }`}>
                            #{entry.rank}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center">
                          {entry.photoURL ? (
                            <img 
                              src={entry.photoURL} 
                              alt={entry.displayName} 
                              className="w-12 h-12 rounded-full mr-4 border-2 border-white shadow-md"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mr-4 flex items-center justify-center border-2 border-white shadow-md">
                              <Users className="w-6 h-6 text-blue-600" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-gray-900 text-lg">{entry.displayName}</div>
                            <div className="text-sm text-gray-500">Champion</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                          <span className="font-bold text-2xl">{entry.totalScore.toFixed(1)}</span>
                        </div>
                        <div className="text-sm text-gray-500">points</div>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full">
                          <Target className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold text-blue-800">{entry.challengesCount}</span>
                        </div>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
                          <Calendar className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-green-800">{entry.totalCheckins}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Challenge-specific Leaderboards Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Challenge Leaderboards</h2>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Individual challenge rankings and top performers. See who's dominating each specific fitness program.
            </p>
          </div>

          {/* Challenge Leaderboards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {challengeLeaderboards.map((leaderboard) => (
              <div key={leaderboard.challenge.id} className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                {/* Challenge Header */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-100/50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                        <Target className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{leaderboard.challenge.name}</h3>
                        <p className="text-sm text-gray-600">{leaderboard.challenge.description}</p>
                      </div>
                    </div>
                    <Link href={`/leaderboard/${leaderboard.challenge.id}`}>
                      <Button variant="outline" size="sm" className="bg-white/80 hover:bg-white">
                        View Full
                      </Button>
                    </Link>
                  </div>
                  
                  {/* Challenge Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">{leaderboard.totalParticipants}</div>
                      <div className="text-xs text-gray-600 font-medium">Participants</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">{leaderboard.averageScore.toFixed(1)}</div>
                      <div className="text-xs text-gray-600 font-medium">Avg Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {leaderboard.challenge.durationDays || 0}
                      </div>
                      <div className="text-xs text-gray-600 font-medium">Days</div>
                    </div>
                  </div>
                </div>

                {/* Top 3 Participants */}
                <div className="p-6">
                  <h4 className="font-bold text-gray-700 mb-4 text-lg">🏆 Top Performers</h4>
                  <div className="space-y-3">
                    {leaderboard.topParticipants.slice(0, 3).map((participant) => (
                      <div key={participant.userId} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-2xl border border-gray-100/50 hover:from-blue-50/50 hover:to-purple-50/30 transition-all duration-200">
                        <div className="flex items-center">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full mr-4">
                            {participant.rank === 1 && (
                              <div className="w-full h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                <Trophy className="w-5 h-5 text-white" />
                              </div>
                            )}
                            {participant.rank === 2 && (
                              <div className="w-full h-full bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                                <Medal className="w-5 h-5 text-white" />
                              </div>
                            )}
                            {participant.rank === 3 && (
                              <div className="w-full h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                                <Medal className="w-5 h-5 text-white" />
                              </div>
                            )}
                            {participant.rank > 3 && (
                              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-bold text-gray-600">#{participant.rank}</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{participant.displayName}</div>
                            <div className="text-sm text-gray-600 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {participant.checkinsCount} check-ins
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-2xl text-blue-600">{participant.totalScore.toFixed(1)}</div>
                          <div className="text-xs text-gray-500">points</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Call to Action Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-16 text-white overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
            
            <div className="relative text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-4xl md:text-5xl font-bold">Ready to Join the Challenge?</h3>
              </div>
              <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
                Start your fitness journey today and see your name on the leaderboard! Transform your life and become a champion.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/challenges">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-4 rounded-full font-bold text-xl shadow-2xl shadow-white/20 hover:shadow-white/30 transition-all duration-300 hover:scale-105">
                    <Target className="w-6 h-6 mr-2" />
                    Browse Challenges
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-10 py-4 rounded-full font-bold text-xl transition-all duration-300 hover:scale-105">
                    <TrendingUp className="w-6 h-6 mr-2" />
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