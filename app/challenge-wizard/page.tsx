'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { Input } from '@/src/components/ui/Input'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/src/lib/firebase.client'
import { Challenge, ChallengeType } from '@/src/types'
import { useAuth } from '@/src/lib/auth'
import { 
  Target, 
  Calendar, 
  DollarSign, 
  Trophy,
  Users,
  Settings,
  Link as LinkIcon,
  Copy,
  CheckCircle,
  ArrowRight,
  Plus
} from 'lucide-react'

export default function ChallengeWizardPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [challengeCreated, setChallengeCreated] = useState(false)
  const [createdChallenge, setCreatedChallenge] = useState<Challenge | null>(null)
  const [inviteLink, setInviteLink] = useState('')
  const [copied, setCopied] = useState(false)

  const [challengeData, setChallengeData] = useState({
    name: '',
    description: '',
    challengeType: 'fitness' as ChallengeType,
    durationDays: 30,
    priceCents: 0,
    currency: 'USD' as 'USD' | 'AUD',
    maxParticipants: 100,
    scoring: {
      checkinPoints: 10,
      workoutPoints: 5,
      nutritionPoints: 3,
      stepsBuckets: [5000, 8000, 10000, 15000],
      stepsPoints: 2,
      weightLossPoints: 10,
      consistencyBonus: 5,
      streakMultiplier: 1.1
    },
    requirements: {
      minAge: 18,
      fitnessLevel: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
      equipment: [] as string[],
      medicalClearance: false
    },
    tags: [] as string[]
  })

  // Redirect if not authenticated or not coach
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login')
      } else if (profile?.role !== 'coach' && profile?.role !== 'admin') {
        router.push('/dashboard')
      }
    }
  }, [user, profile, authLoading, router])

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setChallengeData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any || {}),
          [child]: value
        }
      }))
    } else {
      setChallengeData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleSubmit = async () => {
    if (!user || (profile?.role !== 'coach' && profile?.role !== 'admin')) return

    setLoading(true)
    try {
      const challengeDoc = {
        ...challengeData,
        createdBy: user.uid,
        status: 'draft' as const,
        currentParticipants: 0,
        createdAt: serverTimestamp(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }

      const docRef = await addDoc(collection(db, 'challenges'), challengeDoc)
      
      const newChallenge = {
        id: docRef.id,
        ...challengeDoc,
        createdAt: Date.now()
      } as Challenge

      setCreatedChallenge(newChallenge)
      
      // Generate invite link
      const baseUrl = window.location.origin
      const inviteUrl = `${baseUrl}/join/${docRef.id}`
      setInviteLink(inviteUrl)
      
      setChallengeCreated(true)
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

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
          <p className="text-gray-500 mb-6">You need coach privileges to create challenges.</p>
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (challengeCreated && createdChallenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        {/* Success Hero */}
        <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-blue-600 to-purple-600">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative container mx-auto px-4 py-16">
            <div className="max-w-7xl mx-auto text-center">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-bold shadow-lg mb-6">
                <CheckCircle className="w-5 h-5" />
                Challenge Created!
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                🎉 Challenge Created Successfully!
              </h1>
              <p className="text-xl md:text-2xl text-green-100 leading-relaxed max-w-4xl mx-auto">
                Your fitness challenge is ready! Share the invite link below to start recruiting participants.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          {/* Challenge Summary */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 border-b border-gray-100/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Challenge Details</h3>
                  <p className="text-gray-600">Review your newly created challenge</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-4">{createdChallenge.name}</h4>
                  <p className="text-gray-600 mb-4">{createdChallenge.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-700">{createdChallenge.durationDays} days</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">{createdChallenge.challengeType} challenge</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-purple-600" />
                      <span className="text-gray-700">Max {createdChallenge.maxParticipants} participants</span>
                    </div>
                    {createdChallenge.priceCents > 0 && (
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-5 h-5 text-yellow-600" />
                        <span className="text-gray-700">${(createdChallenge.priceCents / 100).toFixed(2)} {createdChallenge.currency}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl">
                  <h5 className="font-bold text-gray-900 mb-3">Scoring System</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Daily Check-in:</span>
                      <span className="font-medium">{createdChallenge.scoring.checkinPoints} pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Per Workout:</span>
                      <span className="font-medium">+{createdChallenge.scoring.workoutPoints} pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Good Nutrition:</span>
                      <span className="font-medium">+{createdChallenge.scoring.nutritionPoints} pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Steps Bonus:</span>
                      <span className="font-medium">+{createdChallenge.scoring.stepsBuckets?.length || 0} buckets</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Invite Link Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b border-gray-100/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                  <LinkIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Invite Participants</h3>
                  <p className="text-gray-600">Share this link to invite people to join your challenge</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Input
                  value={inviteLink}
                  readOnly
                  className="flex-1 text-lg font-mono"
                />
                <Button
                  onClick={copyInviteLink}
                  className={`px-6 ${copied ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm">💡</span>
                  </div>
                  <div>
                    <p className="text-blue-800 font-medium mb-2">Pro Tips:</p>
                    <ul className="text-blue-700 text-sm space-y-1">
                      <li>• Share this link on social media, email, or messaging apps</li>
                      <li>• Participants can click the link to join directly</li>
                      <li>• You can track join requests in your coach dashboard</li>
                      <li>• The challenge starts when you publish it</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/coach-dashboard">
              <Button variant="outline" className="w-full sm:w-auto">
                <Target className="w-4 h-4 mr-2" />
                Go to Coach Dashboard
              </Button>
            </Link>
            <Button
              onClick={() => {
                setChallengeCreated(false)
                setCurrentStep(1)
                setChallengeData({
                  name: '',
                  description: '',
                  challengeType: 'fitness',
                  durationDays: 30,
                  priceCents: 0,
                  currency: 'USD',
                  maxParticipants: 100,
                  scoring: {
                    checkinPoints: 10,
                    workoutPoints: 5,
                    nutritionPoints: 3,
                    stepsBuckets: [5000, 8000, 10000, 15000],
                    stepsPoints: 2,
                    weightLossPoints: 10,
                    consistencyBonus: 5,
                    streakMultiplier: 1.1
                  },
                  requirements: {
                    minAge: 18,
                    fitnessLevel: 'beginner',
                    equipment: [],
                    medicalClearance: false
                  },
                  tags: []
                })
              }}
              className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Another Challenge
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-bold shadow-lg mb-6">
              <Target className="w-5 h-5" />
              Challenge Creation Wizard
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Create Your Fitness Challenge 🎯
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed max-w-4xl mx-auto">
              Design engaging challenges, set scoring rules, and invite participants to join your fitness community!
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  step <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step < currentStep ? '✓' : step}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <p className="text-gray-600">
              Step {currentStep} of 4: {
                currentStep === 1 ? 'Basic Info' :
                currentStep === 2 ? 'Challenge Details' :
                currentStep === 3 ? 'Scoring & Rules' :
                'Review & Create'
              }
            </p>
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 1 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Target className="w-6 h-6 text-blue-600" />
                  Basic Challenge Information
                </CardTitle>
                <CardDescription>
                  Start with the fundamental details of your challenge
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Challenge Name *
                  </label>
                  <Input
                    value={challengeData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., 30-Day Fitness Transformation"
                    className="text-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={challengeData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe what participants will achieve, the rules, and what makes this challenge special..."
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg resize-none"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Challenge Type *
                    </label>
                    <select
                      value={challengeData.challengeType}
                      onChange={(e) => handleInputChange('challengeType', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg"
                    >
                      <option value="fitness">🏃‍♂️ General Fitness</option>
                      <option value="weight-loss">⚖️ Weight Loss</option>
                      <option value="wellness">🧘‍♀️ Wellness & Mindfulness</option>
                      <option value="strength">💪 Strength Training</option>
                      <option value="endurance">🏃‍♀️ Endurance & Cardio</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (Days) *
                    </label>
                    <Input
                      type="number"
                      value={challengeData.durationDays}
                      onChange={(e) => handleInputChange('durationDays', parseInt(e.target.value))}
                      min="1"
                      max="365"
                      className="text-lg"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Settings className="w-6 h-6 text-green-600" />
                  Challenge Settings
                </CardTitle>
                <CardDescription>
                  Configure participation limits and pricing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Participants
                    </label>
                    <Input
                      type="number"
                      value={challengeData.maxParticipants}
                      onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value))}
                      min="1"
                      max="1000"
                      className="text-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        type="number"
                        value={challengeData.priceCents / 100}
                        onChange={(e) => handleInputChange('priceCents', Math.round(parseFloat(e.target.value) * 100))}
                        min="0"
                        step="0.01"
                        className="pl-8 text-lg"
                        placeholder="0.00"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Set to 0 for free challenges</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fitness Level Requirements
                  </label>
                  <select
                    value={challengeData.requirements.fitnessLevel}
                    onChange={(e) => handleInputChange('requirements.fitnessLevel', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg"
                  >
                    <option value="beginner">🟢 Beginner - Suitable for everyone</option>
                    <option value="intermediate">🟡 Intermediate - Some fitness experience</option>
                    <option value="advanced">🔴 Advanced - High fitness level required</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-yellow-600" />
                  Scoring System
                </CardTitle>
                <CardDescription>
                  Define how participants earn points and rewards
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Daily Check-in Points
                    </label>
                    <Input
                      type="number"
                      value={challengeData.scoring.checkinPoints}
                      onChange={(e) => handleInputChange('scoring.checkinPoints', parseInt(e.target.value))}
                      min="1"
                      className="text-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Per Workout Bonus
                    </label>
                    <Input
                      type="number"
                      value={challengeData.scoring.workoutPoints}
                      onChange={(e) => handleInputChange('scoring.workoutPoints', parseInt(e.target.value))}
                      min="0"
                      className="text-lg"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nutrition Score Bonus
                    </label>
                    <Input
                      type="number"
                      value={challengeData.scoring.nutritionPoints}
                      onChange={(e) => handleInputChange('scoring.nutritionPoints', parseInt(e.target.value))}
                      min="0"
                      className="text-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Steps Bonus Points
                    </label>
                    <Input
                      type="number"
                      value={challengeData.scoring.stepsPoints}
                      onChange={(e) => handleInputChange('scoring.stepsPoints', parseInt(e.target.value))}
                      min="0"
                      className="text-lg"
                    />
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 text-sm">💡</span>
                    </div>
                    <div>
                      <p className="text-blue-800 font-medium mb-2">Scoring Tips:</p>
                      <ul className="text-blue-700 text-sm space-y-1">
                        <li>• Daily check-in points encourage consistency</li>
                        <li>• Workout bonuses reward extra effort</li>
                        <li>• Nutrition points promote healthy eating</li>
                        <li>• Steps bonuses encourage daily movement</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 4 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  Review & Create
                </CardTitle>
                <CardDescription>
                  Review your challenge details before creating
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-bold text-lg text-gray-900 mb-4">Challenge Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{challengeData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium capitalize">{challengeData.challengeType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{challengeData.durationDays} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Max Participants:</span>
                      <span className="font-medium">{challengeData.maxParticipants}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium">
                        {challengeData.priceCents > 0 
                          ? `$${(challengeData.priceCents / 100).toFixed(2)}` 
                          : 'Free'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Daily Points:</span>
                      <span className="font-medium">{challengeData.scoring.checkinPoints} pts</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-yellow-600 text-sm">⚠️</span>
                    </div>
                    <div>
                      <p className="text-yellow-800 font-medium mb-2">Ready to Create?</p>
                      <p className="text-yellow-700 text-sm">
                        Your challenge will be created as a draft. You can publish it later from your coach dashboard 
                        when you're ready to start accepting participants.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              onClick={prevStep}
              disabled={currentStep === 1}
              variant="outline"
              className="px-8"
            >
              Previous
            </Button>
            
            {currentStep < 4 ? (
              <Button
                onClick={nextStep}
                disabled={
                  (currentStep === 1 && (!challengeData.name || !challengeData.description)) ||
                  (currentStep === 2 && challengeData.maxParticipants < 1) ||
                  (currentStep === 3 && challengeData.scoring.checkinPoints < 1)
                }
                className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Trophy className="w-4 h-4 mr-2" />
                    Create Challenge
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
