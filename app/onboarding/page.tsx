'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { getChallenge, createEnrolment } from '@/src/lib/challenges'
import { useAuth } from '@/src/lib/auth'
import { Challenge, HealthBaseline } from '@/src/types'
import HealthBaselineForm from '@/src/components/HealthBaselineForm'
import { 
  CheckCircle, 
  Shield, 
  Users, 
  Calendar, 
  Target, 
  Trophy, 
  Star,
  ArrowRight,
  Camera,
  Activity,
  BarChart3,
  Zap
} from 'lucide-react'

type OnboardingStep = 'welcome' | 'health-baseline' | 'before-photos' | 'challenge-terms' | 'complete'

export default function OnboardingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, profile } = useAuth()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome')
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [healthBaseline, setHealthBaseline] = useState<HealthBaseline | null>(null)
  const [beforePhotos, setBeforePhotos] = useState<string[]>([])
  const [inviteData, setInviteData] = useState<any>(null)

  useEffect(() => {
    // Check for pending invite from localStorage
    const pendingInvite = localStorage.getItem('pendingInvite')
    if (pendingInvite) {
      const invite = JSON.parse(pendingInvite)
      setInviteData(invite)
      loadChallenge(invite.challengeId)
    } else {
      // Check for invite in URL params
      const inviteId = searchParams.get('invite')
      if (inviteId) {
        loadChallenge(inviteId)
      } else {
        setError('No invitation found')
        setLoading(false)
      }
    }
  }, [searchParams])

  const loadChallenge = async (id: string) => {
    try {
      setLoading(true)
      const challengeData = await getChallenge(id)
      if (challengeData) {
        setChallenge(challengeData)
        // Determine starting step based on challenge requirements
        if (challengeData.requirements?.requiresHealthBaseline) {
          setCurrentStep('health-baseline')
        } else if (challengeData.requirements?.requiresBeforePhotos) {
          setCurrentStep('before-photos')
        } else {
          setCurrentStep('challenge-terms')
        }
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

  const handleHealthBaselineComplete = (baseline: HealthBaseline) => {
    setHealthBaseline(baseline)
    
    // Move to next step based on challenge requirements
    if (challenge?.requirements?.requiresBeforePhotos) {
      setCurrentStep('before-photos')
    } else {
      setCurrentStep('challenge-terms')
    }
  }

  const handleHealthBaselineSkip = () => {
    // Move to next step even if skipped
    if (challenge?.requirements?.requiresBeforePhotos) {
      setCurrentStep('before-photos')
    } else {
      setCurrentStep('challenge-terms')
    }
  }

  const handleBeforePhotosComplete = (photos: string[]) => {
    setBeforePhotos(photos)
    setCurrentStep('challenge-terms')
  }

  const handleBeforePhotosSkip = () => {
    setCurrentStep('challenge-terms')
  }

  const handleChallengeTermsAccept = async () => {
    if (!challenge || !user) return

    try {
      setProcessing(true)
      setError(null)

      // Create enrolment with health baseline and photos
      const result = await createEnrolment({
        userId: user.uid,
        challengeId: challenge.id,
        paymentStatus: 'paid', // Free challenges are automatically paid
        createdAt: Date.now(),
        totalScore: 0,
        healthBaseline: healthBaseline || undefined,
        beforePhotos: beforePhotos.length > 0 ? beforePhotos : undefined,
        completionBonuses: {
          healthProfile: !!healthBaseline,
          beforePhotos: beforePhotos.length > 0,
          progressPhotos: false
        }
      })

      if (result.success) {
        // Clear pending invite
        localStorage.removeItem('pendingInvite')
        setCurrentStep('complete')
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
      } else {
        setError(result.error || 'Failed to join challenge')
      }
    } catch (err) {
      setError('An error occurred while joining the challenge')
      console.error('Join error:', err)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your challenge invitation...</p>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Setup Failed</h1>
          <p className="text-gray-600 mb-6">{error || 'Unable to load challenge information.'}</p>
          <Button onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">Please sign in to complete your challenge setup.</p>
          <Button onClick={() => router.push('/login')}>
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  // Render different steps
  switch (currentStep) {
    case 'welcome':
      return renderWelcomeStep()
    case 'health-baseline':
      return renderHealthBaselineStep()
    case 'before-photos':
      return renderBeforePhotosStep()
    case 'challenge-terms':
      return renderChallengeTermsStep()
    case 'complete':
      return renderCompleteStep()
    default:
      return renderWelcomeStep()
  }

  function renderWelcomeStep() {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-10 h-10 text-blue-600" />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to {challenge.name}!
              </h1>
              
              <p className="text-lg text-gray-600 mb-8">
                You're about to join an exciting fitness challenge. Let's get you set up with everything you need to succeed.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-blue-900 mb-3">What's Next?</h3>
                <div className="space-y-3 text-left">
                  {challenge.requirements?.requiresHealthBaseline && (
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <span className="text-blue-800">Complete your health baseline profile</span>
                    </div>
                  )}
                  {challenge.requirements?.requiresBeforePhotos && (
                    <div className="flex items-center gap-3">
                      <Camera className="w-5 h-5 text-blue-600" />
                      <span className="text-blue-800">Upload your before photos</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-800">Accept challenge terms and conditions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-800">Start your fitness journey!</span>
                  </div>
                </div>
              </div>

              <Button 
                size="lg" 
                onClick={() => {
                  if (challenge.requirements?.requiresHealthBaseline) {
                    setCurrentStep('health-baseline')
                  } else if (challenge.requirements?.requiresBeforePhotos) {
                    setCurrentStep('before-photos')
                  } else {
                    setCurrentStep('challenge-terms')
                  }
                }}
                className="w-full"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  function renderHealthBaselineStep() {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Baseline Profile</h1>
            <p className="text-lg text-gray-600">Help us personalize your challenge experience</p>
          </div>
          
          <HealthBaselineForm
            challenge={challenge}
            onComplete={handleHealthBaselineComplete}
            onSkip={challenge.requirements?.requiresHealthBaseline ? undefined : handleHealthBaselineSkip}
          />
        </div>
      </div>
    )
  }

  function renderBeforePhotosStep() {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Camera className="w-6 h-6 text-purple-600" />
                  Before Photos
                </CardTitle>
                <CardDescription>
                  {challenge.requirements?.requiresBeforePhotos 
                    ? 'Required for this challenge' 
                    : 'Optional but recommended for tracking progress'
                  }
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
                    <h4 className="font-medium text-purple-900 mb-3">Photo Requirements</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm text-purple-700">
                      <div>📸 Front View</div>
                      <div>📸 Back View</div>
                      <div>📸 Left Side</div>
                      <div>📸 Right Side</div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-6">
                    Take clear photos in good lighting, wearing form-fitting clothing. 
                    These photos will help track your progress throughout the challenge.
                  </p>

                  {/* Photo upload component would go here */}
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Photo upload functionality coming soon</p>
                    <Button variant="outline" disabled>
                      Upload Photos
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep('health-baseline')}
                  >
                    Back
                  </Button>
                  
                  <div className="space-x-3">
                    {!challenge.requirements?.requiresBeforePhotos && (
                      <Button variant="outline" onClick={handleBeforePhotosSkip}>
                        Skip for Now
                      </Button>
                    )}
                    <Button onClick={handleBeforePhotosComplete}>
                      Continue
                      <ArrowRight className="w-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  function renderChallengeTermsStep() {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Shield className="w-6 h-6 text-green-600" />
                  Challenge Terms & Conditions
                </CardTitle>
                <CardDescription>
                  Review and accept the challenge terms to complete your enrollment
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {/* Challenge-specific terms */}
                  {challenge.termsAndConditions && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                      <h4 className="font-medium text-gray-900 mb-2">Challenge Terms & Conditions</h4>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">
                        {challenge.termsAndConditions}
                      </div>
                    </div>
                  )}
                  
                  {/* General terms */}
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        id="terms"
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        required
                      />
                      <span className="text-sm text-gray-700">
                        I agree to the Terms of Service and Privacy Policy
                      </span>
                    </label>
                    
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        id="challenge"
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        required
                      />
                      <span className="text-sm text-gray-700">
                        I understand this is a fitness challenge and I will participate responsibly
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      if (challenge.requirements?.requiresBeforePhotos) {
                        setCurrentStep('before-photos')
                      } else {
                        setCurrentStep('health-baseline')
                      }
                    }}
                  >
                    Back
                  </Button>
                  
                  <Button 
                    onClick={handleChallengeTermsAccept}
                    disabled={processing}
                    size="lg"
                  >
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Joining Challenge...
                      </>
                    ) : (
                      <>
                        <Trophy className="w-4 h-4 mr-2" />
                        Join Challenge
                      </>
                    )}
                  </Button>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  function renderCompleteStep() {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-green-50 border border-green-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to the Challenge!</h1>
          
          <p className="text-lg text-gray-600 mb-6">
            You've successfully joined "{challenge.name}" and completed your setup. 
            Redirecting to your dashboard...
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-green-900 mb-2">What You've Completed:</h3>
            <div className="text-sm text-green-700 space-y-1">
              {healthBaseline && <div>✅ Health baseline profile</div>}
              {beforePhotos.length > 0 && <div>✅ Before photos</div>}
              <div>✅ Challenge terms acceptance</div>
              <div>✅ Challenge enrollment</div>
            </div>
          </div>
          
          <Button onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }
}
