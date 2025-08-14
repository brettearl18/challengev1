'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { Badge } from '@/src/components/ui/Badge'
import { 
  ArrowLeft,
  Users,
  Trophy,
  Settings,
  BarChart3,
  Edit,
  Share2,
  Copy,
  CheckCircle,
  Clock,
  DollarSign,
  Target,
  Zap,
  TrendingUp,
  Calendar,
  Award,
  Star,
  Activity,
  Target as TargetIcon,
  Heart,
  Shield,
  Sparkles,
  Tag
} from 'lucide-react'
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore'
import { db } from '@/src/lib/firebase.client'
import { useAuth } from '@/src/lib/auth'
import { formatCents } from '@/src/lib/currency'

export default function ChallengeDashboardPage() {
  const params = useParams()
  const router = useRouter()
  const { user, profile } = useAuth()
  const [challenge, setChallenge] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const challengeId = params.id as string

  useEffect(() => {
    if (!challengeId) return

    const unsubscribe = onSnapshot(
      doc(db, 'challenges', challengeId),
      (doc) => {
        if (doc.exists()) {
          setChallenge({ id: doc.id, ...doc.data() })
        }
        setLoading(false)
      },
      (error) => {
        console.error('Error fetching challenge:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [challengeId])

  const copyInviteLink = async () => {
    const baseUrl = window.location.origin
    const inviteUrl = `${baseUrl}/invite/${challengeId}`
    
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const formatDuration = () => {
    if (!challenge) return ''
    if (challenge.durationUnit === 'weeks') {
      return `${challenge.duration} week${challenge.duration > 1 ? 's' : ''}`
    }
    return `${challenge.duration} day${challenge.duration > 1 ? 's' : ''}`
  }

  const formatPrice = () => {
    if (!challenge) return ''
    if (challenge.priceCents === 0) {
      return 'Free'
    }
    // Ensure currency has a fallback value
    const currency = challenge.currency || 'USD'
    return formatCents(challenge.priceCents, currency)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Loading Challenge...</h2>
          <p className="text-gray-500">Preparing your dashboard</p>
        </div>
      </div>
    )
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Target className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Challenge Not Found</h2>
          <p className="text-gray-500 mb-6">The challenge you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push('/coach-dashboard')} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/coach-dashboard')}
                className="hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="border-l border-gray-300 h-12"></div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{challenge.name}</h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <TargetIcon className="w-4 h-4" />
                  Challenge Management Dashboard
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => router.push(`/challenge-dashboard/${challengeId}/edit`)}
                className="hover:bg-gray-50 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Challenge
              </Button>
              <Button 
                onClick={copyInviteLink}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
              >
                <Share2 className="w-4 h-4 mr-2" />
                {copied ? 'Copied!' : 'Share'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Challenge Overview */}
          <div className="lg:col-span-2 space-y-8">
            {/* Enhanced Challenge Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{challenge.currentParticipants || 0}</div>
                  <div className="text-blue-100 mb-2">Participants</div>
                  <div className="text-xs text-blue-200 bg-white/10 rounded-full px-3 py-1 inline-block">
                    Max: {challenge.maxParticipants}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{formatDuration()}</div>
                  <div className="text-green-100 mb-2">Duration</div>
                  <div className="text-xs text-green-200 bg-white/10 rounded-full px-3 py-1 inline-block">
                    {challenge.flexibleStart ? 'Flexible Start' : 'Fixed Start'}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{formatPrice()}</div>
                  <div className="text-amber-100 mb-2">Entry Price</div>
                  <div className="text-xs text-amber-200 bg-white/10 rounded-full px-3 py-1 inline-block">
                    {challenge.currency}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Challenge Details */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  Challenge Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        Primary Type
                      </h4>
                      <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 text-sm">
                        {challenge.challengeType?.replace('-', ' ') || 'Not specified'}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-pink-500" />
                        Target Gender
                      </h4>
                      <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 text-sm">
                        {challenge.gender === 'all' ? 'All Genders' : 
                         challenge.gender === 'women-only' ? 'Women Only' :
                         challenge.gender === 'men-only' ? 'Men Only' : 'Non-binary Friendly'}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-500" />
                        Status
                      </h4>
                      <Badge className={challenge.status === 'published' ? 
                        'bg-gradient-to-r from-green-500 to-emerald-600 text-white' : 
                        'bg-gradient-to-r from-amber-500 to-orange-600 text-white'}>
                        {challenge.status === 'published' ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        Created
                      </h4>
                      <span className="text-gray-700 bg-gray-50 px-3 py-2 rounded-lg inline-block">
                        {challenge.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-100 pt-6">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    Description
                  </h4>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                    {challenge.description}
                  </p>
                </div>

                {challenge.tags && challenge.tags.length > 0 && (
                  <div className="border-t border-gray-100 pt-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-purple-500" />
                      Challenge Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {challenge.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="bg-white border-purple-200 text-purple-700 hover:bg-purple-50 px-3 py-1">
                          {tag.replace('-', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enhanced Scoring System */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-gray-100">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  Scoring System
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                      <Activity className="w-5 h-5 text-blue-500" />
                      Daily Activities
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="text-gray-700">Check-in</span>
                        <Badge className="bg-blue-100 text-blue-800">{challenge.scoring?.checkinPoints || 0} pts</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="text-gray-700">Workout</span>
                        <Badge className="bg-green-100 text-green-800">{challenge.scoring?.workoutPoints || 0} pts</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <span className="text-gray-700">Nutrition</span>
                        <Badge className="bg-purple-100 text-purple-800">{challenge.scoring?.nutritionPoints || 0} pts</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <span className="text-gray-700">Steps</span>
                        <Badge className="bg-orange-100 text-orange-800">{challenge.scoring?.stepsPoints || 0} pts</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                      <Star className="w-5 h-5 text-yellow-500" />
                      Bonuses & Multipliers
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <span className="text-gray-700">Consistency</span>
                        <Badge className="bg-yellow-100 text-yellow-800">{challenge.scoring?.consistencyBonus || 0} pts</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <span className="text-gray-700">Streak Multiplier</span>
                        <Badge className="bg-red-100 text-red-800">{challenge.scoring?.streakMultiplier || 1}x</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                        <span className="text-gray-700">Health Profile</span>
                        <Badge className="bg-emerald-100 text-emerald-800">{challenge.scoring?.healthProfileBonus || 0}%</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                        <span className="text-gray-700">Before Photos</span>
                        <Badge className="bg-pink-100 text-pink-800">{challenge.scoring?.beforePhotosBonus || 0}%</Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <Button 
                    onClick={() => router.push(`/challenge-dashboard/${challengeId}/leaderboard`)}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Full Leaderboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Actions & Info */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-100">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <Button 
                  className="w-full justify-start bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                  onClick={() => router.push(`/challenge-dashboard/${challengeId}/leaderboard`)}
                >
                  <BarChart3 className="w-4 h-4 mr-3" />
                  View Leaderboard
                </Button>
                <Button 
                  className="w-full justify-start bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                  onClick={() => router.push(`/challenge-dashboard/${challengeId}/participants`)}
                >
                  <Users className="w-4 h-4 mr-3" />
                  Manage Participants
                </Button>
                <Button 
                  className="w-full justify-start bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white border-0 shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                  onClick={() => router.push(`/challenge-dashboard/${challengeId}/prizes`)}
                >
                  <Trophy className="w-4 h-4 mr-3" />
                  Award Prizes
                </Button>
                <Button 
                  className="w-full justify-start bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                  onClick={() => router.push(`/challenge-dashboard/${challengeId}/settings`)}
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Challenge Settings
                </Button>
              </CardContent>
            </Card>

            {/* Enhanced Invite Link */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <Share2 className="w-4 h-4 text-white" />
                  </div>
                  Invite Link
                </CardTitle>
                <CardDescription className="text-green-700">
                  Share this link to invite participants
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <code className="text-sm break-all text-gray-700">
                    {`${window.location.origin}/invite/${challengeId}`}
                  </code>
                </div>
                <Button 
                  onClick={copyInviteLink} 
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {copied ? 'Copied!' : 'Copy Link'}
                </Button>
              </CardContent>
            </Card>

            {/* Enhanced Challenge Status */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  Challenge Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Status</span>
                  <Badge className={challenge.status === 'published' ? 
                    'bg-gradient-to-r from-green-500 to-emerald-600 text-white' : 
                    'bg-gradient-to-r from-amber-500 to-orange-600 text-white'}>
                    {challenge.status === 'published' ? 'Published' : 'Draft'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Participants</span>
                  <span className="text-sm font-bold text-blue-700">
                    {challenge.currentParticipants || 0} / {challenge.maxParticipants}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Created</span>
                  <span className="text-sm font-medium text-green-700">
                    {challenge.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
