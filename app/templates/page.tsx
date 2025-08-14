'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { Input } from '@/src/components/ui/Input'
import { ChallengeTemplate, TemplateFilters } from '@/src/types'
import { useAuth } from '@/src/lib/auth'
import { 
  Search, 
  Filter, 
  Star, 
  Users, 
  Clock, 
  Target, 
  Trophy, 
  Zap,
  Download,
  ShoppingCart,
  Eye,
  Heart,
  TrendingUp,
  Award,
  CheckCircle,
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

// Mock data for demonstration - replace with actual API calls
const mockTemplates: ChallengeTemplate[] = [
  {
    id: '1',
    name: '30-Day Fitness Transformation',
    description: 'A comprehensive 30-day program designed to kickstart your fitness journey with progressive workouts, nutrition guidance, and habit building.',
    challengeType: 'fitness',
    durationDays: 30,
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
      equipment: ['dumbbells', 'resistance bands'],
      medicalClearance: false,
      requiresHealthBaseline: true,
      requiresBeforePhotos: true,
      requiresProgressPhotos: true,
      healthMetrics: {
        weight: true,
        height: true,
        bodyMeasurements: true,
        activityLevel: true,
        skillLevel: true
      }
    },
    tags: ['beginner-friendly', 'weight-loss', 'muscle-building'],
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
      successMetrics: {
        averageCompletionRate: 78,
        averageParticipantSatisfaction: 4.6,
        averageResults: '7.2 lbs weight loss',
        totalChallengesCreated: 1250
      }
    },
    content: {
      overview: 'Transform your fitness in just 30 days with this comprehensive program.',
      weeklyPlans: [],
      nutritionGuidance: {
        mealPlans: [],
        supplements: ['Multivitamin', 'Protein powder'],
        hydration: '8-10 glasses of water daily'
      },
      habitBuilding: {
        dailyHabits: ['Morning workout', 'Track nutrition', '10k steps'],
        weeklyHabits: ['Weigh-in', 'Progress photos', 'Recovery day'],
        trackingMethods: ['App logging', 'Photo documentation', 'Measurement tracking'],
        motivationTips: ['Set realistic goals', 'Find workout buddy', 'Celebrate small wins']
      },
      progressTracking: {
        metrics: ['Weight', 'Body measurements', 'Progress photos', 'Workout performance'],
        checkpoints: []
      }
    },
    licensing: {
      type: 'free',
      terms: 'Free for personal and commercial use',
      attributionRequired: false,
      modificationAllowed: true,
      commercialUse: true
    },
    creator: {
      name: 'Fitness Challenge Team',
      bio: 'Expert fitness professionals with years of experience in program design',
      credentials: ['Certified Personal Trainers', 'Nutrition Specialists', 'Sports Scientists'],
      profileImage: '/api/placeholder/100/100'
    }
  },
  {
    id: '2',
    name: '12-Week Strength Mastery',
    description: 'Advanced strength training program designed to build maximum muscle mass and strength through progressive overload principles.',
    challengeType: 'strength',
    durationDays: 84,
    scoring: {
      checkinPoints: 15,
      workoutPoints: 8,
      nutritionPoints: 5,
      stepsBuckets: [5000, 8000, 10000, 15000],
      stepsPoints: 3,
      weightLossPoints: 15,
      consistencyBonus: 10,
      streakMultiplier: 1.2
    },
    requirements: {
      minAge: 18,
      fitnessLevel: 'advanced',
      equipment: ['barbell', 'weight plates', 'power rack', 'bench'],
      medicalClearance: true,
      requiresHealthBaseline: true,
      requiresBeforePhotos: true,
      requiresProgressPhotos: true,
      healthMetrics: {
        weight: true,
        height: true,
        bodyMeasurements: true,
        activityLevel: true,
        skillLevel: true
      }
    },
    tags: ['advanced', 'strength-training', 'muscle-building', 'progressive-overload'],
    isPublic: true,
    createdBy: 'expert-coach',
    createdAt: Date.now() - 86400000 * 60,
    usageCount: 450,
    marketplace: {
      isPublished: true,
      priceCents: 2999,
      currency: 'USD',
      qualityTier: 'expert',
      category: 'strength',
      difficulty: 'advanced',
      estimatedResults: ['15-25 lbs muscle gain', '30% strength increase', 'Improved body composition'],
      timeCommitment: 'high',
      equipmentRequired: ['barbell', 'weight plates', 'power rack', 'bench'],
      successMetrics: {
        averageCompletionRate: 65,
        averageParticipantSatisfaction: 4.8,
        averageResults: '18.5 lbs muscle gain',
        totalChallengesCreated: 450
      }
    },
    content: {
      overview: 'Master strength training with this comprehensive 12-week program.',
      weeklyPlans: [],
      nutritionGuidance: {
        mealPlans: [],
        supplements: ['Creatine', 'Protein powder', 'BCAAs', 'Pre-workout'],
        hydration: '1 gallon of water daily'
      },
      habitBuilding: {
        dailyHabits: ['Track macros', 'Pre-workout meal', 'Post-workout protein'],
        weeklyHabits: ['Progress photos', 'Strength testing', 'Recovery protocols'],
        trackingMethods: ['Strength logs', 'Body composition', 'Progress photos'],
        motivationTips: ['Focus on progressive overload', 'Track every workout', 'Prioritize recovery']
      },
      progressTracking: {
        metrics: ['1RM lifts', 'Body composition', 'Progress photos', 'Workout volume'],
        checkpoints: []
      }
    },
    licensing: {
      type: 'single-use',
      terms: 'Single use license for one challenge',
      attributionRequired: true,
      modificationAllowed: true,
      commercialUse: true
    },
    creator: {
      name: 'Coach Mike Johnson',
      bio: 'Former powerlifting champion and certified strength coach with 15+ years experience',
      credentials: ['CSCS Certified', 'Former Powerlifting Champion', 'Masters in Exercise Science'],
      profileImage: '/api/placeholder/100/100',
      website: 'https://coachmike.com',
      socialMedia: {
        instagram: '@coachmike_strength',
        youtube: 'Coach Mike Strength',
        linkedin: 'mike-johnson-strength'
      }
    }
  },
  {
    id: '3',
    name: '8-Week Wellness Reset',
    description: 'Holistic wellness program focusing on mental health, stress management, and sustainable lifestyle changes.',
    challengeType: 'wellness',
    durationDays: 56,
    scoring: {
      checkinPoints: 12,
      workoutPoints: 6,
      nutritionPoints: 8,
      stepsBuckets: [5000, 8000, 10000, 15000],
      stepsPoints: 4,
      weightLossPoints: 8,
      consistencyBonus: 6,
      streakMultiplier: 1.15
    },
    requirements: {
      minAge: 16,
      fitnessLevel: 'beginner',
      equipment: ['meditation app', 'yoga mat', 'journal'],
      medicalClearance: false,
      requiresHealthBaseline: true,
      requiresBeforePhotos: false,
      requiresProgressPhotos: false,
      healthMetrics: {
        weight: true,
        height: true,
        bodyMeasurements: false,
        activityLevel: true,
        skillLevel: true
      }
    },
    tags: ['wellness', 'mental-health', 'stress-management', 'mindfulness'],
    isPublic: true,
    createdBy: 'wellness-expert',
    createdAt: Date.now() - 86400000 * 45,
    usageCount: 890,
    marketplace: {
      isPublished: true,
      priceCents: 1499,
      currency: 'USD',
      qualityTier: 'premium',
      category: 'wellness',
      difficulty: 'beginner',
      estimatedResults: ['Reduced stress levels', 'Better sleep quality', 'Improved mood', 'Sustainable habits'],
      timeCommitment: 'low',
      equipmentRequired: ['meditation app', 'yoga mat', 'journal'],
      successMetrics: {
        averageCompletionRate: 82,
        averageParticipantSatisfaction: 4.7,
        averageResults: '40% stress reduction',
        totalChallengesCreated: 890
      }
    },
    content: {
      overview: 'Reset your wellness with this holistic 8-week program.',
      weeklyPlans: [],
      nutritionGuidance: {
        mealPlans: [],
        supplements: ['Omega-3', 'Vitamin D', 'Magnesium'],
        hydration: '8-10 glasses of water daily'
      },
      habitBuilding: {
        dailyHabits: ['Morning meditation', 'Gratitude journal', 'Mindful eating'],
        weeklyHabits: ['Nature walk', 'Digital detox', 'Self-care day'],
        trackingMethods: ['Mood tracking', 'Sleep logging', 'Stress level monitoring'],
        motivationTips: ['Start small', 'Be patient', 'Celebrate progress', 'Find your why']
      },
      progressTracking: {
        metrics: ['Stress levels', 'Sleep quality', 'Mood', 'Energy levels'],
        checkpoints: []
      }
    },
    licensing: {
      type: 'unlimited',
      terms: 'Unlimited use license',
      attributionRequired: true,
      modificationAllowed: true,
      commercialUse: true
    },
    creator: {
      name: 'Dr. Sarah Chen',
      bio: 'Licensed psychologist and wellness coach specializing in stress management and mindfulness',
      credentials: ['PhD in Psychology', 'Licensed Therapist', 'Certified Wellness Coach', 'Mindfulness Instructor'],
      profileImage: '/api/placeholder/100/100',
      website: 'https://drsarahchen.com'
    }
  }
]

export default function TemplatesPage() {
  const { user, profile } = useAuth()
  const [templates, setTemplates] = useState<ChallengeTemplate[]>(mockTemplates)
  const [filteredTemplates, setFilteredTemplates] = useState<ChallengeTemplate[]>(mockTemplates)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<TemplateFilters>({})
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [selectedTier, setSelectedTier] = useState<string>('all')
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 })

  useEffect(() => {
    applyFilters()
  }, [searchTerm, filters, selectedCategory, selectedDifficulty, selectedTier, priceRange])

  const applyFilters = () => {
    let filtered = templates

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.marketplace?.category === selectedCategory)
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(template => template.marketplace?.difficulty === selectedDifficulty)
    }

    // Quality tier filter
    if (selectedTier !== 'all') {
      filtered = filtered.filter(template => template.marketplace?.qualityTier === selectedTier)
    }

    // Price range filter
    filtered = filtered.filter(template => 
      template.marketplace?.priceCents >= priceRange.min && 
      template.marketplace?.priceCents <= priceRange.max
    )

    setFilteredTemplates(filtered)
  }

  const getQualityTierColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
      case 'premium': return 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
      case 'expert': return 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
      case 'platinum': return 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-lg'
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
      case 'intermediate': return 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg'
      case 'advanced': return 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
      case 'expert': return 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg'
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg'
    }
  }

  const handleTemplateAction = (template: ChallengeTemplate, action: 'preview' | 'purchase' | 'download') => {
    switch (action) {
      case 'preview':
        // Navigate to template preview page
        window.open(`/templates/${template.id}`, '_blank')
        break
      case 'purchase':
        // Handle purchase flow
        console.log('Purchase template:', template.id)
        break
      case 'download':
        // Handle download for free templates
        console.log('Download template:', template.id)
        break
    }
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
                <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                  <Award className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <h1 className="text-5xl font-bold text-white leading-tight mb-6">
                Challenge Templates
              </h1>
              
              <p className="text-xl text-blue-100 leading-relaxed max-w-3xl">
                Browse and purchase professional challenge templates designed by fitness experts
              </p>
            </div>
            
            {profile?.role === 'coach' && (
              <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-4">
                <Link href="/create-challenge">
                  <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-500/25 text-lg font-semibold py-4 px-8 rounded-2xl">
                    <Zap className="w-5 h-5 mr-3" />
                    Create Custom Challenge
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline"
                  disabled
                  className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 shadow-lg shadow-white/10 text-lg font-semibold py-4 px-8 rounded-2xl cursor-not-allowed opacity-80"
                >
                  <Sparkles className="w-5 h-5 mr-3" />
                  Create with AI
                  <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs font-medium">Coming Soon</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Search and Filters */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row gap-6 mb-8">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <Input
                type="text"
                placeholder="Search templates by name, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-4 text-lg border-0 shadow-2xl bg-white/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent"
              />
            </div>
            
            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:w-auto bg-white/90 backdrop-blur-sm border-gray-200 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 rounded-2xl px-8 py-4 text-lg font-semibold"
            >
              <Filter className="w-5 h-5 mr-3" />
              Filters
              {showFilters && <X className="w-5 h-5 ml-3" />}
            </Button>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex flex-wrap gap-3 mb-6">
            {['all', 'fitness', 'strength', 'wellness', 'weight-loss', 'endurance'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 hover:scale-105 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-xl border border-gray-100'
                }`}
              >
                {category === 'all' ? 'All Categories' : category.replace('-', ' ')}
              </button>
            ))}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-gray-100 p-8 mb-8 shadow-2xl">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Filter className="w-6 h-6 text-blue-600" />
                Advanced Filters
              </h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Difficulty</label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-white/50 backdrop-blur-sm"
                  >
                    <option value="all">All Difficulties</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Quality Tier</label>
                  <select
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-white/50 backdrop-blur-sm"
                  >
                    <option value="all">All Tiers</option>
                    <option value="free">Free</option>
                    <option value="premium">Premium</option>
                    <option value="expert">Expert</option>
                    <option value="platinum">Platinum</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Price Range</label>
                  <div className="flex gap-3">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                      className="w-24 border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm"
                    />
                    <span className="text-gray-500 flex items-center">-</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || 10000 }))}
                      className="w-24 border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Duration</label>
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-white/50 backdrop-blur-sm"
                  >
                    <option value="all">Any Duration</option>
                    <option value="1-4">1-4 weeks</option>
                    <option value="5-8">5-8 weeks</option>
                    <option value="9-12">9-12 weeks</option>
                    <option value="13+">13+ weeks</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <p className="text-gray-600 text-lg">
              Showing <span className="font-semibold text-gray-900">{filteredTemplates.length}</span> of <span className="font-semibold text-gray-900">{templates.length}</span> templates
            </p>
            <div className="flex items-center gap-2 text-blue-600">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium">Premium templates available</span>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 rounded-3xl overflow-hidden group">
              <CardHeader className="pb-6 bg-gradient-to-r from-gray-50 to-blue-50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                      {template.name}
                    </CardTitle>
                    <div className="flex items-center gap-3 mb-4">
                      {template.marketplace?.qualityTier && (
                        <span className={`px-3 py-2 rounded-full text-xs font-semibold ${getQualityTierColor(template.marketplace.qualityTier)}`}>
                          {template.marketplace.qualityTier.charAt(0).toUpperCase() + template.marketplace.qualityTier.slice(1)}
                        </span>
                      )}
                      {template.marketplace?.difficulty && (
                        <span className={`px-3 py-2 rounded-full text-xs font-semibold ${getDifficultyColor(template.marketplace.difficulty)}`}>
                          {template.marketplace.difficulty.charAt(0).toUpperCase() + template.marketplace.difficulty.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                      {template.marketplace?.priceCents === 0 ? 'Free' : `$${((template.marketplace?.priceCents || 0) / 100).toFixed(2)}`}
                    </div>
                    <div className="text-sm text-gray-500 font-medium">
                      {template.marketplace?.licensing?.type === 'free' ? 'Unlimited use' : 'Single use'}
                    </div>
                  </div>
                </div>
                
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  {template.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6">
                {/* Key Features */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium">{template.durationDays} days</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium">{template.usageCount?.toLocaleString() || '0'} coaches using</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium">{template.marketplace?.successMetrics?.averageParticipantSatisfaction || 'N/A'}/5.0 rating</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium">{template.marketplace?.successMetrics?.averageCompletionRate || 'N/A'}% completion rate</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {template.tags?.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-2 bg-gradient-to-r from-gray-100 to-blue-100 text-gray-700 text-xs font-medium rounded-xl border border-gray-200"
                    >
                      {tag.replace('-', ' ')}
                    </span>
                  ))}
                  {template.tags && template.tags.length > 3 && (
                    <span className="px-3 py-2 bg-gradient-to-r from-gray-100 to-blue-100 text-gray-700 text-xs font-medium rounded-xl border border-gray-200">
                      +{template.tags.length - 3} more
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="flex-1 bg-white/60 backdrop-blur-sm border-gray-200 text-gray-400 cursor-not-allowed rounded-2xl py-3 font-semibold"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                    <span className="ml-2 px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-500">Coming Soon</span>
                  </Button>
                  
                  <Button
                    size="sm"
                    disabled
                    className="flex-1 bg-gray-400 cursor-not-allowed rounded-2xl py-3 font-semibold text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Coming Soon
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No templates found</h3>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
                setSelectedDifficulty('all')
                setSelectedTier('all')
                setPriceRange({ min: 0, max: 10000 })
              }}
              className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1 rounded-2xl px-8 py-3 font-semibold"
            >
              Clear all filters
            </Button>
          </div>
        )}

        {/* Call to Action */}
        {filteredTemplates.length > 0 && (
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-12 border border-blue-100">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Need a Custom Challenge?</h3>
              <p className="text-gray-600 mb-8 text-lg max-w-2xl mx-auto">
                Can't find exactly what you're looking for? Create a custom challenge tailored to your specific needs and goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/create-challenge">
                  <Button size="lg" className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25 text-lg font-semibold py-4 px-8 rounded-2xl">
                    Start Creating
                    <ArrowRight className="w-5 h-5 ml-3" />
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline"
                  disabled
                  className="bg-white/80 backdrop-blur-sm border-gray-200 text-gray-600 hover:bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1 rounded-2xl px-8 py-4 text-lg font-semibold cursor-not-allowed opacity-80"
                >
                  <Sparkles className="w-5 h-5 mr-3" />
                  Create with AI
                  <span className="ml-2 px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-500">Coming Soon</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
