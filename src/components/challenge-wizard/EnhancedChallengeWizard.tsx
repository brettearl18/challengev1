'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/src/components/ui/Button'
import { Input } from '@/src/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/src/lib/firebase.client'
import { useAuth } from '@/src/lib/auth'
import { ChallengeType, ChallengeTag } from '@/src/types'
import { Currency } from '@/src/lib/currency'
import { 
  Target, 
  Trophy,
  Link as LinkIcon,
  Copy,
  CheckCircle,
  Users,
  Zap,
  ArrowLeft,
  ArrowRight,
  Check
} from 'lucide-react'
import ChallengeFoundationStep from './ChallengeFoundationStep'
import DigitalToolsStep from './DigitalToolsStep'
import ContentManagementStep from './ContentManagementStep'
import PrizeSystemStep from './PrizeSystemStep'
import ChallengePreviewStep from './ChallengePreviewStep'

interface EnhancedChallengeWizardProps {
  onComplete?: (challengeId: string) => void
}

export default function EnhancedChallengeWizard({ onComplete }: EnhancedChallengeWizardProps) {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [challengeCreated, setChallengeCreated] = useState(false)
  const [challengeId, setChallengeId] = useState<string>('')
  const [inviteLink, setInviteLink] = useState('')
  const [copied, setCopied] = useState(false)

  // Enhanced challenge data structure
  const [challengeData, setChallengeData] = useState({
    // Basic Information
    name: '',
    description: '',
    challengeType: 'fitness' as 'fitness' | 'weight-loss' | 'wellness' | 'strength' | 'endurance' | 'nutrition' | 'mindfulness',
    challengeTypes: ['fitness'] as ChallengeType[],
    gender: 'all' as 'all' | 'women-only' | 'men-only' | 'non-binary-friendly',
    tags: [] as ChallengeTag[],
    duration: 30,
    durationUnit: 'days' as 'days' | 'weeks',
    priceCents: 0,
    currency: 'USD' as Currency,
    maxParticipants: 100,
    flexibleStart: false,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    
    // Target Audience
    targetAudience: {
      fitnessLevel: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
      ageGroups: ['18-25', '26-35', '36-45', '46-55', '55+'],
      equipmentRequired: [] as string[],
      medicalClearance: false,
      prerequisites: [] as string[],
      skillRequirements: [] as string[]
    },
    
    // Challenge Structure (to be implemented)
    challengePhases: [] as any[],
    
    // Digital Tools (to be implemented)
    digitalTools: {
      fitnessApps: {
        strava: false,
        myFitnessPal: false,
        fitbit: false,
        appleHealth: false,
        googleFit: false
      },
      socialPlatforms: {
        instagram: false,
        facebook: false,
        whatsapp: false,
        discord: false
      },
      progressTracking: {
        beforePhotos: false,
        progressPhotos: false,
        measurements: false,
        videoProgress: false,
        journalEntries: false
      }
    },
    
    // Scoring System
    scoring: {
      checkinPoints: 10,
      workoutPoints: 5,
      nutritionPoints: 3,
      stepsBuckets: [5000, 8000, 10000, 15000],
      stepsPoints: 2,
      weightLossPoints: 10,
      consistencyBonus: 5,
      streakMultiplier: 1.1,
      healthProfileBonus: 2,
      beforePhotosBonus: 1.5,
      progressPhotosBonus: 1
    },
    
    // Requirements
    requirements: {
      minAge: 18,
      fitnessLevel: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
      equipment: [] as string[],
      medicalClearance: false,
      requiresHealthBaseline: false,
      requiresBeforePhotos: false,
      requiresProgressPhotos: false,
      healthMetrics: {
        weight: true,
        height: true,
        bodyMeasurements: true,
        activityLevel: true,
        skillLevel: true
      },
      timeCommitment: 'medium' as 'low' | 'medium' | 'high',
      location: 'anywhere' as 'home' | 'gym' | 'outdoor' | 'anywhere',
      groupSize: 'individual' as 'individual' | 'small-group' | 'large-group'
    },
    
    // Prizes & Incentives
    prizes: {
      firstPlace: '',
      secondPlace: '',
      thirdPlace: '',
      participation: '',
      milestoneRewards: {
        week1: '',
        week2: '',
        week3: '',
        week4: ''
      },
      socialRecognition: {
        leaderboardFeature: true,
        socialMediaShoutout: true,
        communitySpotlight: true,
        successStorySharing: true
      }
    },
    
    // Content & Resources (to be implemented)
    content: {
      workoutVideos: [] as any[],
      nutritionGuides: [] as any[],
      downloadableResources: [] as any[],
      educationalContent: [] as any[]
    },
    
    // Metadata
    termsAndConditions: '',
    privacyPolicy: ''
  })

  // Wizard steps configuration
  const wizardSteps = [
    {
      id: 'foundation',
      title: 'Challenge Foundation',
      description: 'Basic information and target audience',
      component: ChallengeFoundationStep,
      completed: false
    },
    {
      id: 'digital-tools',
      title: 'Digital Tools & Apps',
      description: 'App integrations and social platforms',
      component: DigitalToolsStep,
      completed: false
    },
    {
      id: 'content',
      title: 'Content & Resources',
      description: 'Videos, guides, and downloadable content',
      component: ContentManagementStep,
      completed: false
    },
    {
      id: 'prizes',
      title: 'Prizes & Incentives',
      description: 'Rewards and recognition',
      component: PrizeSystemStep,
      completed: false
    },
    {
      id: 'preview',
      title: 'Challenge Preview',
      description: 'Review all settings before approval',
      component: ChallengePreviewStep,
      completed: false
    }
  ]

  const handleDataUpdate = (updatedData: any) => {
    setChallengeData(prev => ({
      ...prev,
      ...updatedData
    }))
  }

  const handleStepComplete = (stepIndex: number) => {
    const updatedSteps = [...wizardSteps]
    updatedSteps[stepIndex].completed = true
    // For now, we'll just mark as completed
    // In the future, this will update the wizardSteps state
  }

  const handleNext = () => {
    if (currentStep < wizardSteps.length - 1) {
      handleStepComplete(currentStep)
      setCurrentStep(currentStep + 1)
    }
  }

  const handleApprove = () => {
    // This will be called from the preview step
    handleSubmit()
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!user || (profile?.role !== 'coach' && profile?.role !== 'admin')) return

    setLoading(true)
    try {
      // Calculate duration in days for storage
      const durationDays = challengeData.durationUnit === 'weeks' 
        ? challengeData.duration * 7 
        : challengeData.duration

      const challengeDoc = {
        ...challengeData,
        durationDays,
        createdBy: user.uid,
        status: 'draft' as const,
        currentParticipants: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        version: 1
      }

      const docRef = await addDoc(collection(db, 'challenges'), challengeDoc)
      
      // Store challenge ID and generate invite link
      setChallengeId(docRef.id)
      const baseUrl = window.location.origin
      const inviteUrl = `${baseUrl}/invite/${docRef.id}`
      setInviteLink(inviteUrl)
      
      setChallengeCreated(true)
      
      if (onComplete) {
        onComplete(docRef.id)
      }
    } catch (error) {
      console.error('Error creating challenge:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 h-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading...</h2>
        </div>
      </div>
    )
  }

  // Show access denied if not coach
  if (!user || (profile?.role !== 'coach' && profile?.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-6">You need coach privileges to access this page.</p>
          <Button onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  // Show success state after challenge creation
  if (challengeCreated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Challenge Created Successfully! 🎉
            </h1>
            
            <p className="text-xl text-gray-600 mb-8">
              Your enhanced fitness challenge is ready to go! Share the invite link below to start recruiting participants.
            </p>

            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite Link</h3>
              <div className="flex items-center gap-3 mb-4">
                <Input
                  value={inviteLink}
                  readOnly
                  className="flex-1"
                />
                <Button
                  onClick={copyInviteLink}
                  variant="outline"
                  className="px-4"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Share this link with potential participants to invite them to your challenge
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => router.push(`/challenge-dashboard/${challengeId}`)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Go to Challenge Dashboard
              </Button>
              <Button
                onClick={() => router.push('/coach-dashboard')}
                variant="outline"
              >
                Go to Main Dashboard
              </Button>
              <Button
                onClick={() => {
                  setChallengeCreated(false)
                  setCurrentStep(0)
                  setChallengeData({
                    name: '',
                    description: '',
                    challengeType: 'fitness',
                    challengeTypes: ['fitness'],
                    gender: 'all',
                    tags: [],
                    duration: 30,
                    durationUnit: 'days',
                    priceCents: 0,
                    currency: 'USD',
                    maxParticipants: 100,
                    flexibleStart: false,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    targetAudience: {
                      fitnessLevel: 'beginner',
                      ageGroups: ['18-25', '26-35', '36-45', '46-55', '55+'],
                      equipmentRequired: [],
                      medicalClearance: false,
                      prerequisites: [],
                      skillRequirements: []
                    },
                    challengePhases: [],
                    digitalTools: {
                      fitnessApps: {
                        strava: false,
                        myFitnessPal: false,
                        fitbit: false,
                        appleHealth: false,
                        googleFit: false
                      },
                      socialPlatforms: {
                        instagram: false,
                        facebook: false,
                        whatsapp: false,
                        discord: false
                      },
                      progressTracking: {
                        beforePhotos: false,
                        progressPhotos: false,
                        measurements: false,
                        videoProgress: false,
                        journalEntries: false
                      }
                    },
                    scoring: {
                      checkinPoints: 10,
                      workoutPoints: 5,
                      nutritionPoints: 3,
                      stepsBuckets: [5000, 8000, 10000, 15000],
                      stepsPoints: 2,
                      weightLossPoints: 10,
                      consistencyBonus: 5,
                      streakMultiplier: 1.1,
                      healthProfileBonus: 2,
                      beforePhotosBonus: 1.5,
                      progressPhotosBonus: 1
                    },
                    requirements: {
                      minAge: 18,
                      fitnessLevel: 'beginner',
                      equipment: [],
                      medicalClearance: false,
                      requiresHealthBaseline: false,
                      requiresBeforePhotos: false,
                      requiresProgressPhotos: false,
                      healthMetrics: {
                        weight: true,
                        height: true,
                        bodyMeasurements: true,
                        activityLevel: true,
                        skillLevel: true
                      },
                      timeCommitment: 'medium',
                      location: 'anywhere',
                      groupSize: 'individual'
                    },
                    prizes: {
                      firstPlace: '',
                      secondPlace: '',
                      thirdPlace: '',
                      participation: '',
                      milestoneRewards: {
                        week1: '',
                        week2: '',
                        week3: '',
                        week4: ''
                      },
                      socialRecognition: {
                        leaderboardFeature: true,
                        socialMediaShoutout: true,
                        communitySpotlight: true,
                        successStorySharing: true
                      }
                    },
                    content: {
                      workoutVideos: [],
                      nutritionGuides: [],
                      downloadableResources: [],
                      educationalContent: []
                    },
                    termsAndConditions: '',
                    privacyPolicy: ''
                  })
                }}
                variant="outline"
              >
                Create Another Challenge
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const CurrentStepComponent = wizardSteps[currentStep].component

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/coach-dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Enhanced Challenge Wizard</h1>
                <p className="text-gray-600">Create professional-grade fitness challenges</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {wizardSteps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      index < currentStep 
                        ? 'bg-green-500 text-white' 
                        : index === currentStep 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
                    </div>
                    {index < wizardSteps.length - 1 && (
                      <div className={`w-16 h-1 mx-2 ${
                        index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="text-sm text-gray-600">
                Step {currentStep + 1} of {wizardSteps.length}: {wizardSteps[currentStep].title}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Step Content */}
          {CurrentStepComponent && (
            <CurrentStepComponent
              data={challengeData}
              onUpdate={handleDataUpdate}
              onNext={handleNext}
              onBack={handleBack}
              onApprove={handleApprove}
            />
          )}

          {/* Placeholder for unimplemented steps */}
          {!CurrentStepComponent && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  {wizardSteps[currentStep].title}
                </CardTitle>
                <CardDescription>
                  {wizardSteps[currentStep].description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Coming Soon!
                  </h3>
                  <p className="text-gray-500 mb-6">
                    This step is currently under development. For now, you can create a basic challenge.
                  </p>
                  
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={handleBack}
                      variant="outline"
                      className="px-6"
                    >
                      Back
                    </Button>
                    
                    {currentStep === wizardSteps.length - 1 ? (
                      <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                      >
                        {loading ? 'Creating...' : 'Create Challenge'}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleNext}
                        className="px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        Next: {wizardSteps[currentStep + 1]?.title}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
