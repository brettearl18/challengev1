'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { Badge } from '@/src/components/ui/Badge'
import { 
  Target, 
  Users, 
  Calendar, 
  DollarSign, 
  MapPin, 
  Zap, 
  Award, 
  Tag, 
  Users2,
  CheckCircle,
  Clock,
  Trophy,
  Star,
  Gift,
  Smartphone,
  Video,
  FileText,
  Globe,
  Settings
} from 'lucide-react'
import { formatCents } from '@/src/lib/currency'

interface ChallengePreviewStepProps {
  data: any
  onUpdate: (data: any) => void
  onNext: () => void
  onBack: () => void
  onApprove: () => void
}

export default function ChallengePreviewStep({
  data,
  onUpdate,
  onNext,
  onBack,
  onApprove
}: ChallengePreviewStepProps) {
  const formatDuration = () => {
    if (data.durationUnit === 'weeks') {
      return `${data.duration} week${data.duration > 1 ? 's' : ''}`
    }
    return `${data.duration} day${data.duration > 1 ? 's' : ''}`
  }

  const formatPrice = () => {
    if (data.priceCents === 0) {
      return 'Free'
    }
    return formatCents(data.priceCents, data.currency)
  }

  const getFitnessLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getChallengeTypeColor = (type: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-purple-100 text-purple-800',
      'bg-green-100 text-green-800',
      'bg-orange-100 text-orange-800',
      'bg-pink-100 text-pink-800'
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Challenge Preview</h1>
        <p className="text-gray-600">Review all your challenge settings before final approval</p>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Challenge Name</h4>
              <p className="text-gray-700">{data.name}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Primary Type</h4>
              <Badge className={getChallengeTypeColor(data.challengeType)}>
                {data.challengeType.replace('-', ' ')}
              </Badge>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Description</h4>
              <p className="text-gray-700">{data.description}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Duration</h4>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>{formatDuration()}</span>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Price</h4>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{formatPrice()}</span>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Max Participants</h4>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span>{data.maxParticipants}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Challenge Categories & Targeting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-purple-600" />
            Challenge Categories & Targeting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Additional Types</h4>
              <div className="flex flex-wrap gap-2">
                {data.challengeTypes?.map((type: string) => (
                  <Badge key={type} className={getChallengeTypeColor(type)}>
                    {type.replace('-', ' ')}
                  </Badge>
                )) || <span className="text-gray-500">None selected</span>}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Target Gender</h4>
              <Badge className="bg-blue-100 text-blue-800">
                {data.gender === 'all' ? 'All Genders' : 
                 data.gender === 'women-only' ? 'Women Only' :
                 data.gender === 'men-only' ? 'Men Only' : 'Non-binary Friendly'}
              </Badge>
            </div>
            <div className="md:col-span-2">
              <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {data.tags?.length > 0 ? data.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline">
                    {tag.replace('-', ' ')}
                  </Badge>
                )) : <span className="text-gray-500">No tags selected</span>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Target Audience */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users2 className="w-5 h-5 text-green-600" />
            Target Audience
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Fitness Level</h4>
              <Badge className={getFitnessLevelColor(data.targetAudience?.fitnessLevel)}>
                {data.targetAudience?.fitnessLevel || 'Not specified'}
              </Badge>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Age Groups</h4>
              <div className="flex flex-wrap gap-1">
                {data.targetAudience?.ageGroups?.map((age: string) => (
                  <Badge key={age} variant="outline" className="text-xs">
                    {age}
                  </Badge>
                )) || <span className="text-gray-500">Not specified</span>}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Equipment Required</h4>
              <div className="flex flex-wrap gap-1">
                {data.targetAudience?.equipmentRequired?.length > 0 ? 
                  data.targetAudience.equipmentRequired.map((equipment: string) => (
                    <Badge key={equipment} variant="outline" className="text-xs">
                      {equipment}
                    </Badge>
                  )) : <span className="text-gray-500">None required</span>
                }
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Medical Clearance</h4>
              <Badge className={data.targetAudience?.medicalClearance ? 
                'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                {data.targetAudience?.medicalClearance ? 'Required' : 'Not Required'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Digital Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-indigo-600" />
            Digital Tools & Integrations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Fitness Apps</h4>
              <div className="space-y-2">
                {Object.entries(data.digitalTools?.fitnessApps || {}).map(([app, enabled]) => (
                  <div key={app} className="flex items-center gap-2">
                    <CheckCircle className={`w-4 h-4 ${enabled ? 'text-green-500' : 'text-gray-300'}`} />
                    <span className={enabled ? 'text-gray-700' : 'text-gray-400'}>
                      {app.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Social Platforms</h4>
              <div className="space-y-2">
                {Object.entries(data.digitalTools?.socialPlatforms || {}).map(([platform, enabled]) => (
                  <div key={platform} className="flex items-center gap-2">
                    <CheckCircle className={`w-4 h-4 ${enabled ? 'text-green-500' : 'text-gray-300'}`} />
                    <span className={enabled ? 'text-gray-700' : 'text-gray-400'}>
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Progress Tracking</h4>
              <div className="space-y-2">
                {Object.entries(data.digitalTools?.progressTracking || {}).map(([tracking, enabled]) => (
                  <div key={tracking} className="flex items-center gap-2">
                    <CheckCircle className={`w-4 h-4 ${enabled ? 'text-green-500' : 'text-gray-300'}`} />
                    <span className={enabled ? 'text-gray-700' : 'text-gray-400'}>
                      {tracking.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content & Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-orange-600" />
            Content & Resources
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Workout Videos</h4>
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-gray-500" />
                <span>{data.content?.workoutVideos?.length || 0} videos</span>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Nutrition Guides</h4>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span>{data.content?.nutritionGuides?.length || 0} guides</span>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Downloadable Resources</h4>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span>{data.content?.downloadableResources?.length || 0} resources</span>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Educational Content</h4>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-500" />
                <span>{data.content?.educationalContent?.length || 0} items</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prizes & Incentives */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Prizes & Incentives
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Main Prizes</h4>
              <div className="space-y-2">
                {data.prizes?.prizes && Object.entries(data.prizes.prizes).map(([position, prize]: [string, any]) => (
                  <div key={position} className="flex items-center gap-2">
                    {position === 'firstPlace' && <Trophy className="w-4 h-4 text-yellow-500" />}
                    {position === 'secondPlace' && <Star className="w-4 h-4 text-gray-400" />}
                    {position === 'thirdPlace' && <Star className="w-4 h-4 text-amber-600" />}
                    {position === 'participation' && <Gift className="w-4 h-4 text-blue-500" />}
                    <span className="capitalize">{position.replace(/([A-Z])/g, ' $1').trim()}</span>
                    {prize.title && <span className="text-gray-600">- {prize.title}</span>}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Social Recognition</h4>
              <div className="space-y-2">
                {data.prizes?.socialRecognition && Object.entries(data.prizes.socialRecognition).map(([feature, enabled]: [string, boolean]) => (
                  <div key={feature} className="flex items-center gap-2">
                    <CheckCircle className={`w-4 h-4 ${enabled ? 'text-green-500' : 'text-gray-300'}`} />
                    <span className={enabled ? 'text-gray-700' : 'text-gray-400'}>
                      {feature.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scoring System */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            Scoring System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Daily Activities</h4>
              <div className="space-y-1 text-sm">
                <div>Check-in: {data.scoring?.checkinPoints || 0} pts</div>
                <div>Workout: {data.scoring?.workoutPoints || 0} pts</div>
                <div>Nutrition: {data.scoring?.nutritionPoints || 0} pts</div>
                <div>Steps: {data.scoring?.stepsPoints || 0} pts</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Bonuses</h4>
              <div className="space-y-1 text-sm">
                <div>Consistency: {data.scoring?.consistencyBonus || 0} pts</div>
                <div>Streak Multiplier: {data.scoring?.streakMultiplier || 1}x</div>
                <div>Health Profile: {data.scoring?.healthProfileBonus || 0}%</div>
                <div>Before Photos: {data.scoring?.beforePhotosBonus || 0}%</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Requirements</h4>
              <div className="space-y-1 text-sm">
                <div>Min Age: {data.requirements?.minAge || 'None'}</div>
                <div>Fitness Level: {data.requirements?.fitnessLevel || 'Any'}</div>
                <div>Equipment: {data.requirements?.equipment?.length || 0} items</div>
                <div>Medical Clearance: {data.requirements?.medicalClearance ? 'Yes' : 'No'}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600" />
            Final Actions
          </CardTitle>
          <CardDescription>
            Review your challenge and choose your next step
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Ready to Launch?</h4>
                <p className="text-blue-700 text-sm">
                  Your challenge is configured and ready to go! Review the settings above and click "Approve & Create Challenge" when you're satisfied.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack}>
              ← Back to Prizes
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => window.print()}>
                📄 Print Preview
              </Button>
              <Button onClick={onApprove} className="bg-green-600 hover:bg-green-700">
                ✅ Approve & Create Challenge
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
