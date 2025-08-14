'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { ChallengeTemplate } from '@/src/types'
import { useAuth } from '@/src/lib/auth'
import { 
  ArrowLeft,
  Star,
  Users,
  Clock,
  Target,
  Download,
  ShoppingCart,
  Calendar,
  Zap,
  Brain,
  Utensils,
  Dumbbell,
  Camera,
  BarChart3,
  Shield,
  ExternalLink,
  Sparkles,
  CheckCircle,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'

// Mock data
const mockTemplate: ChallengeTemplate = {
  id: '1',
  name: '30-Day Fitness Transformation',
  description: 'A comprehensive 30-day program designed to kickstart your fitness journey with progressive workouts, nutrition guidance, and habit building.',
  challengeType: 'fitness',
  challengeTypes: ['fitness'],
  gender: 'all',
  durationDays: 30,
  scoring: { checkinPoints: 10, workoutPoints: 5, nutritionPoints: 3, stepsBuckets: [5000, 8000, 10000, 15000], weightLossPoints: 10, consistencyBonus: 5, streakMultiplier: 1.1, healthProfileBonus: 2, beforePhotosBonus: 1.5, progressPhotosBonus: 1 },
  requirements: { minAge: 18, fitnessLevel: 'beginner', equipment: ['dumbbells', 'resistance bands'], medicalClearance: false, requiresHealthBaseline: true, requiresBeforePhotos: true, requiresProgressPhotos: true, healthMetrics: { weight: true, height: true, bodyMeasurements: true, activityLevel: true, skillLevel: true }, timeCommitment: 'medium', location: 'anywhere', groupSize: 'individual' },
  tags: ['beginner', 'weight-loss', 'muscle-gain'],
  isPublic: true,
  createdBy: 'system',
  createdAt: Date.now() - 86400000 * 30,
  usageCount: 1250,
  marketplace: {
    isPublished: true,
    priceCents: 0,
    currency: 'USD',
    qualityTier: 'free',
    category: 'fitness',
    difficulty: 'beginner',
    estimatedResults: ['5-10 lbs weight loss', 'Improved endurance', 'Better sleep quality'],
    timeCommitment: 'medium',
    equipmentRequired: ['dumbbells', 'resistance bands', 'yoga mat'],
    successMetrics: { averageCompletionRate: 78, averageParticipantSatisfaction: 4.6, averageResults: '7.2 lbs weight loss', totalChallengesCreated: 1250 },
    licensing: { type: 'free', terms: 'Free for personal and commercial use', attributionRequired: false, modificationAllowed: true, commercialUse: true }
  },
  content: {
    overview: 'Transform your fitness in just 30 days with this comprehensive program.',
    weeklyPlans: [{ week: 1, title: 'Foundation Week', description: 'Build basic fitness habits and establish routine', focus: ['Cardio introduction', 'Basic strength', 'Habit formation'], workouts: [] }],
    nutritionGuidance: { mealPlans: [{ week: 1, focus: 'Balanced nutrition basics', guidelines: ['Eat protein with every meal', 'Include vegetables', 'Stay hydrated'], sampleMeals: [] }], supplements: ['Multivitamin', 'Protein powder'], hydration: '8-10 glasses of water daily' },
    habitBuilding: { dailyHabits: ['Morning workout', 'Track nutrition', '10k steps'], weeklyHabits: ['Weigh-in', 'Progress photos', 'Recovery day'], trackingMethods: ['App logging', 'Photo documentation', 'Measurement tracking'], motivationTips: ['Set realistic goals', 'Find workout buddy', 'Celebrate small wins'] },
    progressTracking: { metrics: ['Weight', 'Body measurements', 'Progress photos', 'Workout performance'], checkpoints: [{ week: 2, measurements: ['Weight', 'Waist', 'Hips'], photos: true, assessments: ['Fitness test', 'Energy levels'] }] }
  },
  creator: { name: 'Fitness Challenge Team', bio: 'Expert fitness professionals with years of experience in program design', credentials: ['Certified Personal Trainers', 'Nutrition Specialists', 'Sports Scientists'], profileImage: '/api/placeholder/100/100' }
}

export default function TemplatePreviewPage() {
  const params = useParams()
  const router = useRouter()
  const { user, profile } = useAuth()
  const [template, setTemplate] = useState<ChallengeTemplate | null>(null)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    setTemplate(mockTemplate)
  }, [params.id])

  const handlePurchase = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    try {
      setPurchasing(true)
      
      if (template?.marketplace?.priceCents === 0) {
        console.log('Downloading free template:', template.id)
        router.push(`/create-challenge?template=${template.id}`)
      } else {
        console.log('Purchasing template:', template.id)
      }
    } catch (error) {
      console.error('Error processing template action:', error)
    } finally {
      setPurchasing(false)
    }
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading template...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <Link href="/templates">
                  <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Templates
                  </Button>
                </Link>
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <h1 className="text-5xl font-bold text-white leading-tight mb-6">
                {template.name}
              </h1>
              
              <p className="text-xl text-blue-100 leading-relaxed max-w-3xl">
                {template.description}
              </p>
            </div>
            
            {/* Price and Action */}
            <div className="w-full lg:w-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-white mb-2">
                    {template.marketplace?.priceCents === 0 ? 'Free' : `$${((template.marketplace?.priceCents || 0) / 100).toFixed(2)}`}
                  </div>
                  <div className="text-blue-100 text-sm">
                    {template.marketplace?.licensing?.type === 'free' ? 'Unlimited use' : 'Single use license'}
                  </div>
                </div>
                
                <Button
                  size="lg"
                  disabled
                  className="w-full text-lg font-semibold py-4 rounded-2xl bg-gray-400 cursor-not-allowed"
                >
                  <Sparkles className="w-5 h-5 mr-3" />
                  Coming Soon
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Template Overview */}
            <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 rounded-3xl overflow-hidden">
              <CardHeader className="pb-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="flex items-center gap-4 text-3xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  Template Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-gray-700 leading-relaxed text-xl">
                  {template.content?.overview}
                </p>
              </CardContent>
            </Card>

            {/* Weekly Plans Preview */}
            <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 rounded-3xl overflow-hidden">
              <CardHeader className="pb-6 bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center gap-4 text-3xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  Weekly Program Structure
                </CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Preview of the {template.durationDays}-day program structure
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-8">
                  {template.content?.weeklyPlans?.map((week) => (
                    <div key={week.week} className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-2xl font-bold text-gray-900">Week {week.week}: {week.title}</h4>
                        <span className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-full shadow-lg">
                          {week.focus.length} focus areas
                        </span>
                      </div>
                      <p className="text-gray-600 mb-6 text-lg leading-relaxed">{week.description}</p>
                      <div className="flex flex-wrap gap-3">
                        {week.focus.map((focus, index) => (
                          <span
                            key={index}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                          >
                            {focus}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Nutrition Guidance */}
            {template.content?.nutritionGuidance && (
              <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 rounded-3xl overflow-hidden">
                <CardHeader className="pb-6 bg-gradient-to-r from-orange-50 to-red-50">
                  <CardTitle className="flex items-center gap-4 text-3xl">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Utensils className="w-6 h-6 text-white" />
                    </div>
                    Nutrition Guidance
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-2xl font-semibold text-gray-900 mb-6">Weekly Meal Plans</h4>
                      <div className="space-y-6">
                        {template.content.nutritionGuidance.mealPlans.map((plan, index) => (
                          <div key={index} className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-8 border border-orange-100">
                            <h5 className="text-xl font-semibold text-gray-900 mb-4">Week {plan.week}: {plan.focus}</h5>
                            <ul className="space-y-3">
                              {plan.guidelines.map((guideline, idx) => (
                                <li key={idx} className="flex items-center gap-4 text-gray-700 text-lg">
                                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="w-5 h-5 text-white" />
                                  </div>
                                  {guideline}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {template.content.nutritionGuidance.supplements && (
                      <div>
                        <h4 className="text-2xl font-semibold text-gray-900 mb-6">Recommended Supplements</h4>
                        <div className="flex flex-wrap gap-4">
                          {template.content.nutritionGuidance.supplements.map((supplement, index) => (
                            <span
                              key={index}
                              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-medium rounded-full shadow-lg"
                            >
                              {supplement}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {template.content.nutritionGuidance.hydration && (
                      <div>
                        <h4 className="text-2xl font-semibold text-gray-900 mb-6">Hydration Guidelines</h4>
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100">
                          <p className="text-gray-700 text-xl leading-relaxed">{template.content.nutritionGuidance.hydration}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Habit Building */}
            {template.content?.habitBuilding && (
              <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 rounded-3xl overflow-hidden">
                <CardHeader className="pb-6 bg-gradient-to-r from-purple-50 to-pink-50">
                  <CardTitle className="flex items-center gap-4 text-3xl">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    Habit Building & Motivation
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-12">
                    <div>
                      <h4 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-purple-600" />
                        Daily Habits
                      </h4>
                      <ul className="space-y-4">
                        {template.content.habitBuilding.dailyHabits.map((habit, index) => (
                          <li key={index} className="flex items-center gap-4 text-gray-700 text-lg">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                            {habit}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-purple-600" />
                        Weekly Habits
                      </h4>
                      <ul className="space-y-4">
                        {template.content.habitBuilding.weeklyHabits.map((habit, index) => (
                          <li key={index} className="flex items-center gap-4 text-gray-700 text-lg">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                            {habit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-12">
                    <h4 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                      <Zap className="w-6 h-6 text-yellow-600" />
                      Motivation Tips
                    </h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      {template.content.habitBuilding.motivationTips.map((tip, index) => (
                        <div key={index} className="flex items-start gap-4 p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border border-yellow-100">
                          <Zap className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" />
                          <span className="text-gray-700 text-lg leading-relaxed">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Progress Tracking */}
            {template.content?.progressTracking && (
              <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 rounded-3xl overflow-hidden">
                <CardHeader className="pb-6 bg-gradient-to-r from-indigo-50 to-purple-50">
                  <CardTitle className="flex items-center gap-4 text-3xl">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    Progress Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-2xl font-semibold text-gray-900 mb-6">Key Metrics</h4>
                      <div className="flex flex-wrap gap-4">
                        {template.content.progressTracking.metrics.map((metric, index) => (
                          <span
                            key={index}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium rounded-full shadow-lg"
                          >
                            {metric}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-2xl font-semibold text-gray-900 mb-6">Progress Checkpoints</h4>
                      <div className="space-y-6">
                        {template.content.progressTracking.checkpoints.map((checkpoint, index) => (
                          <div key={index} className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 border border-indigo-100">
                            <h5 className="text-xl font-semibold text-gray-900 mb-6">Week {checkpoint.week}</h5>
                            <div className="grid md:grid-cols-2 gap-8">
                              <div>
                                <h6 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-3">
                                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                                  Measurements
                                </h6>
                                <div className="flex flex-wrap gap-3">
                                  {checkpoint.measurements.map((measurement, idx) => (
                                    <span
                                      key={idx}
                                      className="px-4 py-2 bg-indigo-100 text-indigo-700 text-sm rounded-full"
                                    >
                                      {measurement}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <h6 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-3">
                                  <Target className="w-5 h-5 text-indigo-600" />
                                  Assessments
                                </h6>
                                <div className="flex flex-wrap gap-3">
                                  {checkpoint.assessments.map((assessment, idx) => (
                                    <span
                                      key={idx}
                                      className="px-4 py-2 bg-purple-100 text-purple-700 text-sm rounded-full"
                                    >
                                      {assessment}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            {checkpoint.photos && (
                              <div className="mt-6 flex items-center gap-3 text-indigo-600 bg-indigo-50 px-6 py-4 rounded-2xl">
                                <Camera className="w-5 h-5" />
                                <span className="font-medium">Progress photos required</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Template Stats */}
            <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 rounded-3xl overflow-hidden">
              <CardHeader className="pb-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="text-xl flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                  Template Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Quality Tier</span>
                    <span className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-medium rounded-full">
                      {template.marketplace?.qualityTier?.charAt(0).toUpperCase() + template.marketplace?.qualityTier?.slice(1) || 'Free'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Difficulty</span>
                    <span className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-medium rounded-full">
                      {template.marketplace?.difficulty?.charAt(0).toUpperCase() + template.marketplace?.difficulty?.slice(1) || 'Beginner'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Duration</span>
                    <span className="font-semibold text-lg">{template.durationDays} days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Category</span>
                    <span className="font-semibold capitalize">{template.marketplace?.category?.replace('-', ' ') || 'Fitness'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Time Commitment</span>
                    <span className="font-semibold capitalize">{template.marketplace?.timeCommitment || 'Medium'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Success Metrics */}
            <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 rounded-3xl overflow-hidden">
              <CardHeader className="pb-6 bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="text-xl flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  Success Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-8">
                  <div className="text-center group">
                    <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">
                      {template.marketplace?.successMetrics?.averageCompletionRate || '78'}%
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Completion Rate</div>
                  </div>
                  <div className="text-center group">
                    <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">
                      {template.marketplace?.successMetrics?.averageParticipantSatisfaction || '4.6'}/5.0
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Satisfaction Rating</div>
                  </div>
                  <div className="text-center group">
                    <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">
                      {template.marketplace?.successMetrics?.totalChallengesCreated?.toLocaleString() || '1,250'}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Challenges Created</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Equipment Required */}
            <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 rounded-3xl overflow-hidden">
              <CardHeader className="pb-6 bg-gradient-to-r from-gray-50 to-blue-50">
                <CardTitle className="text-xl flex items-center gap-3">
                  <Dumbbell className="w-6 h-6 text-gray-600" />
                  Equipment Required
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {template.marketplace?.equipmentRequired?.map((equipment, index) => (
                    <div key={index} className="flex items-center gap-4 text-gray-700">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center">
                        <Dumbbell className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium">{equipment}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Creator Information */}
            <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 rounded-3xl overflow-hidden">
              <CardHeader className="pb-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="text-xl flex items-center gap-3">
                  <Users className="w-6 h-6 text-blue-600" />
                  Created By
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl mx-auto mb-6 flex items-center justify-center">
                    <Users className="w-12 h-12 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-3 text-xl">{template.creator?.name}</h4>
                  <p className="text-gray-600 mb-6 text-sm leading-relaxed">{template.creator?.bio}</p>
                  <div className="space-y-3">
                    {template.creator?.credentials?.map((credential, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {credential}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Licensing Information */}
            <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 rounded-3xl overflow-hidden">
              <CardHeader className="pb-6 bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="text-xl flex items-center gap-3">
                  <Shield className="w-6 h-6 text-green-600" />
                  Licensing
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">License Type</span>
                    <span className="font-semibold capitalize">{template.marketplace?.licensing?.type?.replace('-', ' ') || 'Free'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Modification</span>
                    <span className="font-semibold">{template.marketplace?.licensing?.modificationAllowed ? 'Allowed' : 'Not Allowed'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Commercial Use</span>
                    <span className="font-semibold">{template.marketplace?.licensing?.commercialUse ? 'Allowed' : 'Not Allowed'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Attribution</span>
                    <span className="font-semibold">{template.marketplace?.licensing?.attributionRequired ? 'Required' : 'Not Required'}</span>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-100">
                  <p className="text-xs text-gray-600 leading-relaxed">{template.marketplace?.licensing?.terms || 'Free for personal and commercial use'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
