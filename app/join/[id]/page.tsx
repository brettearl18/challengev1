'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { Input } from '@/src/components/ui/Input'
import { getChallenge, createEnrolment } from '@/src/lib/challenges'
import { useAuth } from '@/src/lib/auth'
import { Challenge } from '@/src/types'
import { CheckCircle, Shield, Users, ArrowLeft, Calendar, Target, Trophy, Star } from 'lucide-react'
import Link from 'next/link'

export default function JoinChallengePage() {
  const params = useParams()
  const router = useRouter()
  const { user, profile } = useAuth()
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

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

  const handleJoinChallenge = async () => {
    if (!challenge || !user) return

    try {
      setJoining(true)
      setError(null)

      const result = await createEnrolment({
        userId: user.uid,
        challengeId: challenge.id,
        paymentStatus: 'paid', // Free challenges are automatically paid
        createdAt: Date.now(),
        totalScore: 0
      })

      if (result.success) {
        setSuccess(true)
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        setError(result.error || 'Failed to join challenge')
      }
    } catch (err) {
      setError('An error occurred while joining the challenge')
      console.error('Join error:', err)
    } finally {
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading challenge...</p>
        </div>
      </div>
    )
  }

  if (error || !challenge) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Challenge Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The challenge you are looking for does not exist.'}</p>
          <Link href="/challenges">
            <Button>Back to Challenges</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h1>
          <p className="text-gray-600 mb-6">You need to sign in to join this challenge.</p>
          <div className="space-x-4">
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline">Create Account</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to the Challenge!</h1>
          <p className="text-gray-600 mb-6">You've successfully joined "{challenge.name}". Redirecting to your dashboard...</p>
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <Link href={`/challenge/${challenge.id}`} className="mb-4">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Challenge
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Join Challenge</h1>
          <p className="text-lg text-gray-600 mt-2">Complete your registration for "{challenge.name}"</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Join Challenge
                </CardTitle>
                <CardDescription>
                  Join this fitness challenge and start your journey to better health!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* User Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Your Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Display Name
                      </label>
                      <Input
                        value={profile?.displayName || user.email || ''}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <Input
                        value={user.email || ''}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Challenge Commitment */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Challenge Commitment</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        By joining this challenge, you commit to participating actively and following the challenge guidelines. 
                        Remember, consistency is key to success!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Challenge-Specific Terms and Conditions */}
                {challenge.termsAndConditions && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                      <h4 className="font-medium text-gray-900 mb-2">Challenge Terms & Conditions</h4>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">
                        {challenge.termsAndConditions}
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="challengeTerms"
                        className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        required
                      />
                      <label htmlFor="challengeTerms" className="text-sm text-gray-700">
                        I have read and agree to the challenge terms and conditions above
                      </label>
                    </div>
                  </div>
                )}

                {/* General Terms and Conditions */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="terms"
                      className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      required
                    />
                    <label htmlFor="terms" className="text-sm text-gray-700">
                      I agree to the{' '}
                      <Link href="/terms" className="text-primary hover:underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="challenge"
                      className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      required
                    />
                    <label htmlFor="challenge" className="text-sm text-gray-700">
                      I understand that this is a fitness challenge and I will participate responsibly
                    </label>
                  </div>
                </div>

                {/* Join Button */}
                <Button
                  onClick={handleJoinChallenge}
                  disabled={joining}
                  size="lg"
                  className="w-full"
                >
                  {joining ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Joining Challenge...
                    </>
                  ) : (
                    <>
                      <Trophy className="w-4 h-4 mr-2" />
                      Join Challenge for Free
                    </>
                  )}
                </Button>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Challenge Summary */}
          <div className="space-y-6">
            {/* Challenge Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Challenge Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  {challenge.bannerUrl ? (
                    <img
                      src={challenge.bannerUrl}
                      alt={challenge.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                      <Target className="w-8 h-8 text-primary/40" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{challenge.name}</h3>
                    <p className="text-sm text-gray-600">{challenge.description}</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span>
                      {challenge.startDate && challenge.endDate ? (
                        `${Math.ceil((new Date(challenge.endDate).getTime() - new Date(challenge.startDate).getTime()) / (1000 * 60 * 60 * 24))} days`
                      ) : (
                        `${challenge.durationDays} days`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Participants</span>
                    <span>{challenge.currentParticipants} joined</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Points/Day</span>
                    <span>{challenge.scoring.checkinPoints + (challenge.scoring.workoutPoints * 2) + challenge.scoring.nutritionPoints} pts</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What's Included */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What's Included</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Full challenge access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Daily progress tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Community support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Leaderboard access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Progress analytics</span>
                  </div>
                  {challenge.prizes && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Eligible for prizes</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Free Challenge Notice */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg text-green-800 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Free Challenge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-700 text-sm">
                  This challenge is completely free! Join now and start your fitness journey without any cost.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 