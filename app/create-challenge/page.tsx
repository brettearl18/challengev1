'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/src/components/ui/Button'
import { Input } from '@/src/components/ui/Input'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/src/lib/firebase.client'
import { Challenge } from '@/src/types'
import { useAuth } from '@/src/lib/auth'
import { 
  Target, 
  Trophy,
  Link as LinkIcon,
  Copy,
  CheckCircle,
  Users,
  Zap
} from 'lucide-react'

export default function CreateChallengePage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [challengeCreated, setChallengeCreated] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [copied, setCopied] = useState(false)

  const [challengeData, setChallengeData] = useState({
    name: '',
    description: '',
    challengeType: 'fitness' as 'fitness' | 'weight-loss' | 'wellness' | 'strength' | 'endurance',
    duration: 30,
    durationUnit: 'days' as 'days' | 'weeks',
    priceCents: 0,
    maxParticipants: 100,
    scoring: {
      checkinPoints: 10,
      workoutPoints: 5,
      nutritionPoints: 3,
      stepsBuckets: [5000, 8000, 10000, 15000],
      stepsPoints: 2,
      weightLossPoints: 10,
      consistencyBonus: 5,
      streakMultiplier: 1.1,
      // Progressive completion bonuses (1-3% of max points)
      healthProfileBonus: 2, // 2% bonus
      beforePhotosBonus: 1.5, // 1.5% bonus
      progressPhotosBonus: 1 // 1% bonus
    },
    requirements: {
      minAge: 18,
      fitnessLevel: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
      equipment: [] as string[],
      medicalClearance: false,
      // New: Health baseline requirements
      requiresHealthBaseline: false,
      requiresBeforePhotos: false,
      requiresProgressPhotos: false,
      healthMetrics: {
        weight: true,
        height: true,
        bodyMeasurements: true,
        activityLevel: true,
        skillLevel: true
      }
    },
    tags: [] as string[],
    termsAndConditions: '',
    privacyPolicy: ''
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || (profile?.role !== 'coach' && profile?.role !== 'admin')) return

    setLoading(true)
    try {
      // Calculate duration in days for storage
      const durationDays = challengeData.durationUnit === 'weeks' 
        ? challengeData.duration * 7 
        : challengeData.duration

      const challengeDoc = {
        ...challengeData,
        durationDays, // Store the calculated days
        createdBy: user.uid,
        status: 'draft' as const,
        currentParticipants: 0,
        createdAt: serverTimestamp(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        // Enhanced scoring system
        scoring: {
          checkinPoints: challengeData.scoring.checkinPoints,
          workoutPoints: challengeData.scoring.workoutPoints,
          nutritionPoints: challengeData.scoring.nutritionPoints,
          stepsBuckets: challengeData.scoring.stepsBuckets,
          stepsPoints: challengeData.scoring.stepsPoints,
          weightLossPoints: challengeData.scoring.weightLossPoints,
          consistencyBonus: challengeData.scoring.consistencyBonus,
          streakMultiplier: challengeData.scoring.streakMultiplier,
          healthProfileBonus: challengeData.scoring.healthProfileBonus,
          beforePhotosBonus: challengeData.scoring.beforePhotosBonus,
          progressPhotosBonus: challengeData.scoring.progressPhotosBonus
        },
        // Enhanced requirements
        requirements: {
          minAge: challengeData.requirements.minAge,
          fitnessLevel: challengeData.requirements.fitnessLevel,
          equipment: challengeData.requirements.equipment,
          medicalClearance: challengeData.requirements.medicalClearance,
          requiresHealthBaseline: challengeData.requirements.requiresHealthBaseline,
          requiresBeforePhotos: challengeData.requirements.requiresBeforePhotos,
          requiresProgressPhotos: challengeData.requirements.requiresProgressPhotos,
          healthMetrics: challengeData.requirements.healthMetrics
        },
        // Additional fields for future expansion
        tags: challengeData.tags,
        prizes: {
          firstPlace: '',
          secondPlace: '',
          thirdPlace: '',
          participation: ''
        },
        termsAndConditions: challengeData.termsAndConditions,
        privacyPolicy: challengeData.privacyPolicy,
        // Metadata
        updatedAt: serverTimestamp(),
        version: 1
      }

      const docRef = await addDoc(collection(db, 'challenges'), challengeDoc)
      
      // Generate invite link (new invite route)
      const baseUrl = window.location.origin
      const inviteUrl = `${baseUrl}/invite/${docRef.id}`
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

  if (challengeCreated) {
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
          {/* Invite Link Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden mb-8 max-w-2xl mx-auto">
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
                setChallengeData({
                  name: '',
                  description: '',
                  challengeType: 'fitness',
                  duration: 30,
                  durationUnit: 'days',
                  priceCents: 0,
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
                  tags: [],
                  termsAndConditions: '',
                  privacyPolicy: ''
                })
              }}
              className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
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
              Create Challenge
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Create Your Fitness Challenge 🎯
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed max-w-4xl mx-auto">
              Design engaging challenges and invite participants to join your fitness community!
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 border-b border-gray-100/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Challenge Details</h3>
                  <p className="text-gray-600">Fill in the details for your new fitness challenge</p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Challenge Name *
                </label>
                <Input
                  value={challengeData.name}
                  onChange={(e) => setChallengeData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., 30-Day Fitness Transformation"
                  className="text-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={challengeData.description}
                  onChange={(e) => setChallengeData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what participants will achieve, the rules, and what makes this challenge special..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg resize-none"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Challenge Type *
                  </label>
                  <select
                    value={challengeData.challengeType}
                    onChange={(e) => setChallengeData(prev => ({ ...prev, challengeType: e.target.value as any }))}
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
                    Duration *
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={challengeData.duration}
                      onChange={(e) => setChallengeData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      min="1"
                      max={challengeData.durationUnit === 'weeks' ? '52' : '365'}
                      className="flex-1 text-lg"
                      required
                    />
                    <select
                      value={challengeData.durationUnit}
                      onChange={(e) => setChallengeData(prev => ({ 
                        ...prev, 
                        durationUnit: e.target.value as 'days' | 'weeks',
                        duration: e.target.value === 'weeks' ? Math.min(prev.duration, 52) : prev.duration
                      }))}
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg bg-white"
                    >
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                    </select>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {challengeData.durationUnit === 'weeks' 
                      ? `${challengeData.duration} weeks = ${challengeData.duration * 7} days`
                      : `${challengeData.duration} days`
                    }
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Participants
                  </label>
                  <Input
                    type="number"
                    value={challengeData.maxParticipants}
                    onChange={(e) => setChallengeData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                    min="1"
                    max="1000"
                    className="text-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (AUD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">A$</span>
                    <Input
                      type="number"
                      value={challengeData.priceCents / 100}
                      onChange={(e) => setChallengeData(prev => ({ ...prev, priceCents: Math.round(parseFloat(e.target.value) * 100) }))}
                      min="0"
                      step="0.01"
                      className="pl-10 text-lg"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {challengeData.priceCents > 0 
                      ? `Total: A$${(challengeData.priceCents / 100).toFixed(2)}`
                      : 'Set to 0 for free challenges'
                    }
                  </p>
                </div>
              </div>

              {/* Advanced Scoring Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  Scoring System
                </h3>
                <p className="text-gray-600 mb-4">Define how participants earn points and rewards</p>
                
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight Loss Points
                    </label>
                    <Input
                      type="number"
                      value={challengeData.scoring.weightLossPoints}
                      onChange={(e) => handleInputChange('scoring.weightLossPoints', parseInt(e.target.value))}
                      min="0"
                      className="text-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Consistency Bonus
                    </label>
                    <Input
                      type="number"
                      value={challengeData.scoring.consistencyBonus}
                      onChange={(e) => handleInputChange('scoring.consistencyBonus', parseInt(e.target.value))}
                      min="0"
                      className="text-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Requirements Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Participant Requirements
                </h3>
                <p className="text-gray-600 mb-4">Set eligibility criteria and fitness requirements</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Age
                    </label>
                    <Input
                      type="number"
                      value={challengeData.requirements.minAge}
                      onChange={(e) => handleInputChange('requirements.minAge', parseInt(e.target.value))}
                      min="13"
                      max="100"
                      className="text-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fitness Level
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
                </div>

                <div className="mt-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={challengeData.requirements.medicalClearance}
                      onChange={(e) => handleInputChange('requirements.medicalClearance', e.target.checked)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Require medical clearance for participation
                    </span>
                  </label>
                </div>
              </div>

              {/* Helpful Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm">💡</span>
                  </div>
                  <div>
                    <p className="text-blue-800 font-medium mb-2">Challenge Creation Tips:</p>
                    <ul className="text-blue-700 text-sm space-y-1">
                      <li>• <strong>Scoring:</strong> Balance points to encourage daily participation</li>
                      <li>• <strong>Duration:</strong> 4-12 weeks work best for engagement</li>
                      <li>• <strong>Requirements:</strong> Set realistic fitness levels for your audience</li>
                      <li>• <strong>Pricing:</strong> Free challenges often have higher participation</li>
                      <li>• <strong>Description:</strong> Be clear about goals and expectations</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Terms & Conditions Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-red-600" />
                  Legal & Compliance
                </h3>
                <p className="text-gray-600 mb-4">Set terms and conditions for participants</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Terms & Conditions *
                    </label>
                    <textarea
                      value={challengeData.termsAndConditions}
                      onChange={(e) => setChallengeData(prev => ({ ...prev, termsAndConditions: e.target.value }))}
                      placeholder="Enter the terms and conditions that participants must agree to when joining this challenge. Include liability waivers, participation rules, and any other legal requirements..."
                      rows={6}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg resize-none"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      This is required for legal compliance and participant safety
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Privacy Policy (Optional)
                    </label>
                    <textarea
                      value={challengeData.privacyPolicy}
                      onChange={(e) => setChallengeData(prev => ({ ...prev, privacyPolicy: e.target.value }))}
                      placeholder="Optional: Add specific privacy policy details for this challenge..."
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg resize-none"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Leave empty to use default platform privacy policy
                    </p>
                  </div>
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={loading || !challengeData.name || !challengeData.description || !challengeData.termsAndConditions}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 py-4 text-lg font-bold"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Challenge...
                  </>
                ) : (
                  <>
                    <Trophy className="w-5 h-5 mr-2" />
                    Create Challenge
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
