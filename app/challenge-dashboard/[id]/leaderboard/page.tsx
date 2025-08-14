'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { Badge } from '@/src/components/ui/Badge'
import { 
  ArrowLeft,
  Trophy,
  Medal,
  Star,
  TrendingUp,
  Users,
  Target,
  Calendar,
  Award
} from 'lucide-react'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '@/src/lib/firebase.client'

export default function ChallengeLeaderboardPage() {
  const params = useParams()
  const router = useRouter()
  const [participants, setParticipants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const challengeId = params.id as string

  useEffect(() => {
    if (!challengeId) return

    const unsubscribe = onSnapshot(
      query(
        collection(db, 'enrolments'),
        where('challengeId', '==', challengeId),
        orderBy('totalScore', 'desc')
      ),
      (snapshot) => {
        const participantData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setParticipants(participantData)
        setLoading(false)
      },
      (error) => {
        console.error('Error fetching participants:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [challengeId])

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />
    return <Star className="w-4 h-4 text-gray-400" />
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
    if (rank === 2) return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white'
    if (rank === 3) return 'bg-gradient-to-r from-amber-500 to-amber-700 text-white'
    return 'bg-gray-100 text-gray-700'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Loading Leaderboard...</h2>
          <p className="text-gray-500">Fetching participant data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/challenge-dashboard/${challengeId}`)}
                className="hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Challenge
              </Button>
              <div className="border-l border-gray-300 h-12"></div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Challenge Leaderboard</h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Track participant progress and rankings
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                className="hover:bg-gray-50 transition-colors"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-blue-100" />
                <div className="text-2xl font-bold">{participants.length}</div>
                <div className="text-blue-100">Total Participants</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Target className="w-8 h-8 mx-auto mb-2 text-green-100" />
                <div className="text-2xl font-bold">
                  {participants.length > 0 ? Math.max(...participants.map(p => p.totalScore || 0)) : 0}
                </div>
                <div className="text-green-100">Top Score</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-100" />
                <div className="text-2xl font-bold">
                  {participants.length > 0 ? Math.round(participants.reduce((acc, p) => acc + (p.totalScore || 0), 0) / participants.length) : 0}
                </div>
                <div className="text-purple-100">Average Score</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-amber-100" />
                <div className="text-2xl font-bold">
                  {participants.length > 0 ? participants.filter(p => p.lastCheckin).length : 0}
                </div>
                <div className="text-amber-100">Active Today</div>
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-gray-100">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                Participant Rankings
              </CardTitle>
              <CardDescription>
                Current standings based on total points and activity
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {participants.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Participants Yet</h3>
                  <p className="text-gray-500 mb-4">Share your challenge invite link to start building your leaderboard</p>
                  <Button 
                    onClick={() => router.push(`/challenge-dashboard/${challengeId}`)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Back to Challenge
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {participants.map((participant, index) => (
                    <div key={participant.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRankColor(index + 1)}`}>
                            {getRankIcon(index + 1)}
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-semibold text-gray-900">
                                #{index + 1} {participant.userName || 'Anonymous'}
                              </h3>
                              {index < 3 && (
                                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                                  Top {index + 1}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                              <span>Score: {participant.totalScore || 0}</span>
                              <span>Check-ins: {participant.checkinsCompleted || 0}</span>
                              {participant.lastCheckin && (
                                <span>Last: {participant.lastCheckin.toDate?.()?.toLocaleDateString() || 'Unknown'}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            {participant.totalScore || 0}
                          </div>
                          <div className="text-sm text-gray-500">points</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
