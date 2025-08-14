'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { getChallenge } from '@/src/lib/challenges'
import { Challenge } from '@/src/types'
import { 
  CheckCircle, 
  Shield, 
  Users, 
  Calendar, 
  Target, 
  Trophy, 
  Star,
  ArrowRight,
  Clock,
  Award,
  Zap,
  Camera,
  Activity,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'

export default function InviteLandingPage() {
  const params = useParams()
  const router = useRouter()
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [accepting, setAccepting] = useState(false)

  useEffect(() => {
    if (params.id) {
      loadChallenge(params.id as string)
    }
  }, [params.id])

  const loadChallenge = async (id: string) => {
    try {
      setLoading(true)
      const challengeData = await getChallenge(id)
      if (challengeData) {
        setChallenge(challengeData)
      } else {
        setError('Challenge not found')
      }
    } catch (err) {
      setError('Failed to load challenge')
      console.error('Error loading challenge:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptInvite = async () => {
    if (!challenge || !email.trim()) return

    try {
      setAccepting(true)
      
      // Store invite acceptance in localStorage for signup flow
      localStorage.setItem('pendingInvite', JSON.stringify({
        challengeId: challenge.id,
        email: email.trim(),
        acceptedAt: Date.now()
      }))

      // Redirect to signup with challenge context
      router.push(`/signup?invite=${challenge.id}`)
    } catch (err) {
      console.error('Error accepting invite:', err)
    } finally {
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading challenge invitation...</p>
        </div>
      </div>
    )
  }

  if (error || !challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invitation Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'This challenge invitation is no longer valid or has expired.'}</p>
          <Link href="/challenges">
            <Button>Browse Challenges</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">You're Invited!</h1>
              <p className="text-lg text-gray-600 mt-2">Join "{challenge.name}" and transform your fitness journey</p>
            </div>
            <div className="hidden md:block">
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                <div className="flex items-center gap-2 text-blue-700">
                  <Trophy className="w-5 h-5" />
                  <span className="font-medium">Challenge Invitation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Challenge Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Target className="w-6 h-6 text-blue-600" />
                  {challenge.name}
                </CardTitle>
                <CardDescription className="text-lg">
                  {challenge.description || 'Transform your fitness with this comprehensive challenge!'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Duration</p>
                        <p className="text-sm text-gray-600">{challenge.durationDays} days</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Participants</p>
                        <p className="text-sm text-gray-600">{challenge.currentParticipants}/{challenge.maxParticipants || '∞'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Challenge Type</p>
                        <p className="text-sm text-gray-600 capitalize">{challenge.challengeType.replace('-', ' ')}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Entry Fee</p>
                        <p className="text-sm text-gray-600">
                          {challenge.priceCents === 0 ? 'Free' : `$${(challenge.priceCents / 100).toFixed(2)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Scoring System</p>
                        <p className="text-sm text-gray-600">Daily check-ins, workouts, nutrition</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Timezone</p>
                        <p className="text-sm text-gray-600">{challenge.timezone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Challenge Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  What You'll Need
                </CardTitle>
                <CardDescription>
                  Requirements and expectations for this challenge
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Health Baseline</h4>
                      <div className="space-y-2">
                        {challenge.requirements?.requiresHealthBaseline && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Health profile & measurements</span>
                          </div>
                        )}
                        {challenge.requirements?.requiresBeforePhotos && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Camera className="w-4 h-4 text-green-500" />
                            <span>Before photos (4 angles)</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Activity className="w-4 h-4 text-blue-500" />
                          <span>Fitness level: {challenge.requirements?.fitnessLevel}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Commitment</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Daily check-ins</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Regular workouts</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Nutrition tracking</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scoring & Rewards */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  Scoring & Rewards
                </CardTitle>
                <CardDescription>
                  How you'll earn points and what you can win
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Daily Activities</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Check-in</span>
                        <span className="font-medium">{challenge.scoring.checkinPoints} pts</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Workout</span>
                        <span className="font-medium">{challenge.scoring.workoutPoints} pts</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Nutrition</span>
                        <span className="font-medium">{challenge.scoring.nutritionPoints} pts</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Steps (10k+)</span>
                        <span className="font-medium">+{challenge.scoring.stepsBuckets?.[0] || 5000} pts</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Bonus Points</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Consistency</span>
                        <span className="font-medium">+{challenge.scoring.consistencyBonus || 5} pts</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Streak multiplier</span>
                        <span className="font-medium">x{challenge.scoring.streakMultiplier || 1.1}</span>
                      </div>
                      {challenge.scoring.healthProfileBonus && (
                        <div className="flex justify-between">
                          <span>Health profile</span>
                          <span className="font-medium">+{challenge.scoring.healthProfileBonus}%</span>
                        </div>
                      )}
                      {challenge.scoring.beforePhotosBonus && (
                        <div className="flex justify-between">
                          <span>Before photos</span>
                          <span className="font-medium">+{challenge.scoring.beforePhotosBonus}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Accept Invite */}
          <div className="space-y-6">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Accept Invitation
                </CardTitle>
                <CardDescription>
                  Ready to start your transformation? Join this challenge now!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <Button
                  onClick={handleAcceptInvite}
                  disabled={!email.trim() || accepting}
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {accepting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Accept Invitation
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link href={`/login?redirect=/join/${challenge.id}`} className="text-blue-600 hover:underline">
                      Sign in here
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Challenge Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Challenge Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className="font-medium capitalize">{challenge.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created</span>
                    <span className="font-medium">
                      {new Date(challenge.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type</span>
                    <span className="font-medium capitalize">{challenge.challengeType.replace('-', ' ')}</span>
                  </div>
                  {challenge.requirements?.minAge && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Min Age</span>
                      <span className="font-medium">{challenge.requirements.minAge}+</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
