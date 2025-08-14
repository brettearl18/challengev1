'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { Badge } from '@/src/components/ui/Badge'
import { Input } from '@/src/components/ui/Input'
import { 
  ArrowLeft,
  Trophy,
  Award,
  Gift,
  Star,
  Crown,
  Users,
  Target,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  TrendingUp,
  Zap
} from 'lucide-react'
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/src/lib/firebase.client'
import { formatCents } from '@/src/lib/currency'

export default function ChallengePrizesPage() {
  const params = useParams()
  const router = useRouter()
  const [participants, setParticipants] = useState<any[]>([])
  const [challenge, setChallenge] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPrize, setSelectedPrize] = useState<string>('')
  const challengeId = params.id as string

  useEffect(() => {
    if (!challengeId) return

    // Fetch challenge data
    const unsubscribeChallenge = onSnapshot(
      doc(db, 'challenges', challengeId),
      (doc) => {
        if (doc.exists()) {
          setChallenge({ id: doc.id, ...doc.data() })
        }
      }
    )

    // Fetch participants
    const unsubscribeParticipants = onSnapshot(
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

    return () => {
      unsubscribeChallenge()
      unsubscribeParticipants()
    }
  }, [challengeId])

  const awardPrize = async (participantId: string, prizeType: string) => {
    try {
      await updateDoc(doc(db, 'enrolments', participantId), {
        prizeAwarded: prizeType,
        prizeAwardedAt: new Date(),
        updatedAt: new Date()
      })
      setSelectedPrize('')
    } catch (error) {
      console.error('Error awarding prize:', error)
    }
  }

  const getPrizeIcon = (type: string) => {
    switch (type) {
      case 'firstPlace':
        return <Crown className="w-6 h-6 text-yellow-500" />
      case 'secondPlace':
        return <Star className="w-6 h-6 text-gray-400" />
      case 'thirdPlace':
        return <Star className="w-6 h-6 text-amber-600" />
      case 'participation':
        return <Gift className="w-6 h-6 text-blue-500" />
      default:
        return <Award className="w-6 h-6 text-purple-500" />
    }
  }

  const getPrizeColor = (type: string) => {
    switch (type) {
      case 'firstPlace':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
      case 'secondPlace':
        return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white'
      case 'thirdPlace':
        return 'bg-gradient-to-r from-amber-500 to-amber-700 text-white'
      case 'participation':
        return 'bg-gradient-to-r from-blue-500 to-blue-700 text-white'
      default:
        return 'bg-gradient-to-r from-purple-500 to-purple-700 text-white'
    }
  }

  const getPrizeTitle = (type: string) => {
    switch (type) {
      case 'firstPlace':
        return '1st Place'
      case 'secondPlace':
        return '2nd Place'
      case 'thirdPlace':
        return '3rd Place'
      case 'participation':
        return 'Participation'
      default:
        return type.replace(/([A-Z])/g, ' $1').trim()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Loading Prizes...</h2>
          <p className="text-gray-500">Fetching challenge and participant data</p>
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
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Award Prizes</h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Manage and award prizes to top performers
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                className="hover:bg-gray-50 transition-colors"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                View Reports
              </Button>
              <Button 
                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
              >
                <Award className="w-4 h-4 mr-2" />
                Manage Prizes
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Prize Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-100" />
                <div className="text-2xl font-bold">
                  {challenge?.prizes?.prizes?.firstPlace?.value ? formatCents(challenge.prizes.prizes.firstPlace.value, challenge.currency || 'USD') : 'Not Set'}
                </div>
                <div className="text-yellow-100">1st Place Prize</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-gray-500 to-gray-600 text-white border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Star className="w-8 h-8 mx-auto mb-2 text-gray-100" />
                <div className="text-2xl font-bold">
                  {challenge?.prizes?.prizes?.secondPlace?.value ? formatCents(challenge.prizes.prizes.secondPlace.value, challenge.currency || 'USD') : 'Not Set'}
                </div>
                <div className="text-gray-100">2nd Place Prize</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Star className="w-8 h-8 mx-auto mb-2 text-amber-100" />
                <div className="text-2xl font-bold">
                  {challenge?.prizes?.prizes?.thirdPlace?.value ? formatCents(challenge.prizes.prizes.thirdPlace.value, challenge.currency || 'USD') : 'Not Set'}
                </div>
                <div className="text-amber-100">3rd Place Prize</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-blue-100" />
                <div className="text-2xl font-bold">
                  {participants.filter(p => p.prizeAwarded).length}
                </div>
                <div className="text-blue-100">Prizes Awarded</div>
              </CardContent>
            </Card>
          </div>

          {/* Prize Configuration */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm mb-8">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-gray-100">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                Prize Configuration
              </CardTitle>
              <CardDescription>
                Configure prizes and rewards for your challenge
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Main Prizes</h4>
                  <div className="space-y-4">
                    {challenge?.prizes?.prizes && Object.entries(challenge.prizes.prizes).map(([type, prize]: [string, any]) => (
                      <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getPrizeIcon(type)}
                          <span className="font-medium">{getPrizeTitle(type)}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {prize.value ? formatCents(prize.value, challenge.currency) : 'Not Set'}
                          </div>
                          <div className="text-sm text-gray-500">{prize.title || 'No title'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Social Recognition</h4>
                  <div className="space-y-3">
                    {challenge?.prizes?.socialRecognition && Object.entries(challenge.prizes.socialRecognition).map(([feature, enabled]: [string, boolean]) => (
                      <div key={feature} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="capitalize">{feature.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <div className="flex items-center gap-2">
                          {enabled ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <Clock className="w-5 h-5 text-gray-400" />
                          )}
                          <Badge className={enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                            {enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Performers & Prize Awards */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                Top Performers & Prize Awards
              </CardTitle>
              <CardDescription>
                Award prizes to top performers and manage recognition
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {participants.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Participants Yet</h3>
                  <p className="text-gray-500 mb-4">Participants need to join and earn points before prizes can be awarded</p>
                  <Button 
                    onClick={() => router.push(`/challenge-dashboard/${challengeId}`)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Back to Challenge
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {participants.slice(0, 10).map((participant, index) => (
                    <div key={participant.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getPrizeColor(index === 0 ? 'firstPlace' : index === 1 ? 'secondPlace' : index === 2 ? 'thirdPlace' : 'participation')}`}>
                            {getPrizeIcon(index === 0 ? 'firstPlace' : index === 1 ? 'secondPlace' : index === 2 ? 'thirdPlace' : 'participation')}
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900">
                                #{index + 1} {participant.userName || 'Anonymous User'}
                              </h3>
                              {index < 3 && (
                                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                                  Top {index + 1}
                                </Badge>
                              )}
                              {participant.prizeAwarded && (
                                <Badge className="bg-green-100 text-green-800">
                                  Prize Awarded
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>Score: {participant.totalScore || 0}</span>
                              <span>Check-ins: {participant.checkinsCompleted || 0}</span>
                              {participant.prizeAwarded && (
                                <span>Prize: {getPrizeTitle(participant.prizeAwarded)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {!participant.prizeAwarded && index < 3 ? (
                            <select
                              value={selectedPrize === participant.id ? 'firstPlace' : ''}
                              onChange={(e) => {
                                if (e.target.value) {
                                  setSelectedPrize(participant.id)
                                  awardPrize(participant.id, e.target.value)
                                }
                              }}
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Select Prize</option>
                              {index === 0 && <option value="firstPlace">1st Place</option>}
                              {index === 1 && <option value="secondPlace">2nd Place</option>}
                              {index === 2 && <option value="thirdPlace">3rd Place</option>}
                            </select>
                          ) : (
                            <div className="text-right">
                              <div className="text-sm text-gray-500">Prize Awarded</div>
                              <div className="font-medium text-green-600">
                                {participant.prizeAwarded ? getPrizeTitle(participant.prizeAwarded) : 'None'}
                              </div>
                            </div>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="hover:bg-blue-50"
                            disabled={!!participant.prizeAwarded}
                          >
                            <Award className="w-4 h-4 mr-2" />
                            {participant.prizeAwarded ? 'Awarded' : 'Award'}
                          </Button>
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
