'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { Trophy, Medal, Users, TrendingUp, Award, Clock, Target, Star, Crown, Calendar } from 'lucide-react'
import Link from 'next/link'
import { getGlobalLeaderboard, GlobalLeaderboardEntry } from '@/src/lib/leaderboard.service'





export default function LeaderboardPage() {
  const [globalLeaderboard, setGlobalLeaderboard] = useState<GlobalLeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch global leaderboard data using the new service
        const globalData = await getGlobalLeaderboard(50)
        setGlobalLeaderboard(globalData)
        
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
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full text-white text-sm font-bold shadow-lg">
                🌍 Global Rankings
              </div>
              <div className="px-6 py-3 bg-gray-200 rounded-full text-gray-600 text-sm font-medium">
                📊 Challenge-specific leaderboards available within each challenge
              </div>
            </div>
            
            {/* Quick Navigation */}
            <div className="text-center mb-8">
              <p className="text-gray-600 mb-4">
                Want to see rankings for a specific challenge? 
              </p>
              <Link href="/challenges">
                <Button variant="outline" className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1 rounded-2xl px-6 py-3">
                  Browse Challenges
                </Button>
              </Link>
            </div>
            
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
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {globalLeaderboard.reduce((sum, entry) => sum + entry.challengesCount, 0)}
                </div>
                <div className="text-sm text-gray-600 font-medium">Total Challenge Entries</div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {globalLeaderboard.reduce((sum, entry) => sum + entry.totalCheckins, 0)}
                </div>
                <div className="text-sm text-gray-600 font-medium">Total Check-ins</div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {globalLeaderboard.length > 0 ? Math.round(globalLeaderboard.reduce((sum, entry) => sum + entry.averageScore, 0) / globalLeaderboard.length) : 0}
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