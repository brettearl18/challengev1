'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { Input } from '@/src/components/ui/Input'
import { Label } from '@/src/components/ui/Label'
import { Textarea } from '@/src/components/ui/Textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/Select'
import { Switch } from '@/src/components/ui/Switch'
import { Plus, Trash2, Trophy, Medal, Star, Gift } from 'lucide-react'

interface Prize {
  id: string
  title: string
  description: string
  value: number
  type: 'physical' | 'digital' | 'service' | 'recognition'
  deliveryMethod: string
  sponsor?: string
}

interface MilestoneReward {
  id: string
  week: number
  title: string
  description: string
  type: 'badge' | 'points' | 'prize' | 'recognition'
}

interface PrizeSystem {
  prizes: {
    firstPlace: Prize
    secondPlace: Prize
    thirdPlace: Prize
    participation: Prize
  }
  milestoneRewards: MilestoneReward[]
  socialRecognition: {
    leaderboardFeature: boolean
    socialMediaShoutout: boolean
    communitySpotlight: boolean
    successStorySharing: boolean
  }
}

interface PrizeSystemStepProps {
  data: any
  onUpdate: (data: any) => void
  onNext: () => void
  onBack: () => void
  onApprove?: () => void
}

export default function PrizeSystemStep({
  data,
  onUpdate,
  onNext,
  onBack
}: PrizeSystemStepProps) {
  const [localPrizeSystem, setLocalPrizeSystem] = useState<PrizeSystem>(() => {
    // Ensure we have proper default values
    const defaultPrizeSystem: PrizeSystem = {
      prizes: {
        firstPlace: { id: '1st', title: '', description: '', value: 0, type: 'recognition', deliveryMethod: '' },
        secondPlace: { id: '2nd', title: '', description: '', value: 0, type: 'recognition', deliveryMethod: '' },
        thirdPlace: { id: '3rd', title: '', description: '', value: 0, type: 'recognition', deliveryMethod: '' },
        participation: { id: 'participation', title: '', description: '', value: 0, type: 'recognition', deliveryMethod: '' }
      },
      milestoneRewards: [],
      socialRecognition: {
        leaderboardFeature: true,
        socialMediaShoutout: true,
        communitySpotlight: true,
        successStorySharing: true
      }
    }

    // If data.prizes exists and has the right structure, use it
    if (data.prizes && data.prizes.prizes && typeof data.prizes.prizes === 'object') {
      return {
        ...defaultPrizeSystem,
        ...data.prizes,
        prizes: {
          ...defaultPrizeSystem.prizes,
          ...data.prizes.prizes
        }
      }
    }

    return defaultPrizeSystem
  })

  const handleUpdate = () => {
    onUpdate({
      ...data,
      prizes: localPrizeSystem
    })
    onNext()
  }

  const updatePrize = (position: keyof PrizeSystem['prizes'], field: keyof Prize, value: any) => {
    setLocalPrizeSystem(prev => ({
      ...prev,
      prizes: {
        ...prev.prizes,
        [position]: {
          ...prev.prizes[position],
          [field]: value
        }
      }
    }))
  }

  const addMilestoneReward = () => {
    const newReward: MilestoneReward = {
      id: `milestone-${Date.now()}`,
      week: localPrizeSystem.milestoneRewards.length + 1,
      title: '',
      description: '',
      type: 'badge'
    }
    setLocalPrizeSystem(prev => ({
      ...prev,
      milestoneRewards: [...prev.milestoneRewards, newReward]
    }))
  }

  const updateMilestoneReward = (id: string, field: keyof MilestoneReward, value: any) => {
    setLocalPrizeSystem(prev => ({
      ...prev,
      milestoneRewards: prev.milestoneRewards.map(reward =>
        reward.id === id ? { ...reward, [field]: value } : reward
      )
    }))
  }

  const removeMilestoneReward = (id: string) => {
    setLocalPrizeSystem(prev => ({
      ...prev,
      milestoneRewards: prev.milestoneRewards.filter(reward => reward.id !== id)
    }))
  }

  const updateSocialRecognition = (field: keyof PrizeSystem['socialRecognition'], value: boolean) => {
    setLocalPrizeSystem(prev => ({
      ...prev,
      socialRecognition: {
        ...prev.socialRecognition,
        [field]: value
      }
    }))
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Prizes & Incentives</h2>
        <p className="text-gray-600">
          Set up prizes, milestone rewards, and social recognition to motivate participants
        </p>
      </div>

      {/* Main Prizes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span>Main Prizes</span>
          </CardTitle>
          <CardDescription>
            Define the top prizes for your challenge winners
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {localPrizeSystem.prizes && Object.entries(localPrizeSystem.prizes).map(([position, prize]) => (
            <div key={position} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center space-x-2">
                {position === 'firstPlace' && <Trophy className="w-5 h-5 text-yellow-500" />}
                {position === 'secondPlace' && <Medal className="w-5 h-5 text-gray-400" />}
                {position === 'thirdPlace' && <Medal className="w-5 h-5 text-amber-600" />}
                {position === 'participation' && <Star className="w-5 h-5 text-blue-500" />}
                <h4 className="font-medium capitalize">
                  {position.replace(/([A-Z])/g, ' $1').trim()}
                </h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`${position}-title`}>Prize Title</Label>
                  <Input
                    id={`${position}-title`}
                    value={prize.title}
                    onChange={(e) => updatePrize(position as keyof PrizeSystem['prizes'], 'title', e.target.value)}
                    placeholder="e.g., Premium Fitness Package"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`${position}-value`}>Value ($)</Label>
                  <Input
                    id={`${position}-value`}
                    type="number"
                    value={prize.value}
                    onChange={(e) => updatePrize(position as keyof PrizeSystem['prizes'], 'value', parseFloat(e.target.value))}
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`${position}-type`}>Prize Type</Label>
                  <Select
                    value={prize.type}
                    onValueChange={(value) => updatePrize(position as keyof PrizeSystem['prizes'], 'type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="physical">Physical Product</SelectItem>
                      <SelectItem value="digital">Digital Product</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="recognition">Recognition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`${position}-delivery`}>Delivery Method</Label>
                  <Input
                    id={`${position}-delivery`}
                    value={prize.deliveryMethod}
                    onChange={(e) => updatePrize(position as keyof PrizeSystem['prizes'], 'deliveryMethod', e.target.value)}
                    placeholder="e.g., Shipped, Email, In-person"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`${position}-description`}>Description</Label>
                <Textarea
                  id={`${position}-description`}
                  value={prize.description}
                  onChange={(e) => updatePrize(position as keyof PrizeSystem['prizes'], 'description', e.target.value)}
                  placeholder="Describe what this prize includes..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`${position}-sponsor`}>Sponsor (Optional)</Label>
                <Input
                  id={`${position}-sponsor`}
                  value={prize.sponsor || ''}
                  onChange={(e) => updatePrize(position as keyof PrizeSystem['prizes'], 'sponsor', e.target.value)}
                  placeholder="e.g., Nike, Local Gym, Personal Trainer"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Milestone Rewards */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Gift className="w-5 h-5 text-green-500" />
                <span>Milestone Rewards</span>
              </CardTitle>
              <CardDescription>
                Set up weekly or milestone rewards to keep participants engaged
              </CardDescription>
            </div>
            <Button onClick={addMilestoneReward} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Milestone
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {localPrizeSystem.milestoneRewards.map((reward, index) => (
            <div key={reward.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Week {reward.week}</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeMilestoneReward(reward.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`milestone-title-${reward.id}`}>Title</Label>
                  <Input
                    id={`milestone-title-${reward.id}`}
                    value={reward.title}
                    onChange={(e) => updateMilestoneReward(reward.id, 'title', e.target.value)}
                    placeholder="e.g., Consistency Champion"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`milestone-type-${reward.id}`}>Reward Type</Label>
                  <Select
                    value={reward.type}
                    onValueChange={(value) => updateMilestoneReward(reward.id, 'type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="badge">Badge</SelectItem>
                      <SelectItem value="points">Points</SelectItem>
                      <SelectItem value="prize">Prize</SelectItem>
                      <SelectItem value="recognition">Recognition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`milestone-description-${reward.id}`}>Description</Label>
                <Textarea
                  id={`milestone-description-${reward.id}`}
                  value={reward.description}
                  onChange={(e) => updateMilestoneReward(reward.id, 'description', e.target.value)}
                  placeholder="Describe what participants need to achieve for this milestone..."
                  rows={3}
                />
              </div>
            </div>
          ))}
          
          {localPrizeSystem.milestoneRewards.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Gift className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No milestone rewards added yet</p>
              <p className="text-sm">Click "Add Milestone" to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Social Recognition */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-purple-500" />
            <span>Social Recognition</span>
          </CardTitle>
          <CardDescription>
            Choose how participants will be recognized in the community
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {localPrizeSystem.socialRecognition && Object.entries(localPrizeSystem.socialRecognition).map(([feature, enabled]) => (
            <div key={feature} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <Label className="text-sm font-medium capitalize">
                    {feature.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  <p className="text-xs text-gray-500">
                    {feature === 'leaderboardFeature' && 'Feature top performers on the leaderboard'}
                    {feature === 'socialMediaShoutout' && 'Share achievements on social media'}
                    {feature === 'communitySpotlight' && 'Highlight participants in community posts'}
                    {feature === 'successStorySharing' && 'Share success stories with the community'}
                  </p>
                </div>
              </div>
              <Switch
                checked={enabled}
                onCheckedChange={(checked) => updateSocialRecognition(feature as keyof PrizeSystem['socialRecognition'], checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Prize Budget Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Prize Budget Summary</CardTitle>
          <CardDescription>
            Overview of your total prize budget and distribution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                ${(localPrizeSystem.prizes?.firstPlace?.value || 0) + (localPrizeSystem.prizes?.secondPlace?.value || 0) + (localPrizeSystem.prizes?.thirdPlace?.value || 0)}
              </div>
              <div className="text-sm text-blue-600">Top 3 Prizes</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                ${localPrizeSystem.prizes?.participation?.value || 0}
              </div>
              <div className="text-sm text-green-600">Participation Prize</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {localPrizeSystem.milestoneRewards?.length || 0}
              </div>
              <div className="text-sm text-purple-600">Milestone Rewards</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleUpdate}>
          Continue
        </Button>
      </div>
    </div>
  )
}
