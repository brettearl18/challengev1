'use client'

import { useState } from 'react'
import { Input } from '@/src/components/ui/Input'
import { Button } from '@/src/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card'
import { useEffect } from 'react'
import { Target, Users, Calendar, MapPin, Zap, Award, Tag, Users2, DollarSign } from 'lucide-react'
import MultiSelect from '@/src/components/ui/MultiSelect'
import TagCloud from '@/src/components/ui/TagCloud'
import { getCurrencyOptions, dollarsToCents, centsToDollars } from '@/src/lib/currency'

interface ChallengeFoundationStepProps {
  data: any
  onUpdate: (data: any) => void
  onNext: () => void
  onBack: () => void
  onApprove?: () => void
}

export default function ChallengeFoundationStep({ 
  data, 
  onUpdate, 
  onNext, 
  onBack 
}: ChallengeFoundationStepProps) {
  const [formData, setFormData] = useState({
    name: data.name || '',
    description: data.description || '',
    challengeType: data.challengeType || 'fitness',
    challengeTypes: data.challengeTypes || ['fitness'],
    gender: data.gender || 'all',
    tags: data.tags || [],
    duration: data.duration || 30,
    durationUnit: data.durationUnit || 'days',
    priceDollars: data.priceCents ? centsToDollars(data.priceCents) : 0,
    currency: data.currency || 'USD',
    maxParticipants: data.maxParticipants || 100,
    flexibleStart: data.flexibleStart || false,
    timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    // Target Audience
    fitnessLevel: data.targetAudience?.fitnessLevel || 'beginner',
    ageGroups: data.targetAudience?.ageGroups || ['18-25', '26-35', '36-45', '46-55', '55+'],
    equipmentRequired: data.targetAudience?.equipmentRequired || [],
    medicalClearance: data.targetAudience?.medicalClearance || false,
    prerequisites: data.targetAudience?.prerequisites || [],
    skillRequirements: data.targetAudience?.skillRequirements || []
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Update parent component
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      onUpdate({
        ...data,
        [parent]: {
          ...(data[parent] || {}),
          [child]: value
        }
      })
    } else {
      onUpdate({
        ...data,
        [field]: value
      })
    }
  }

  const handleArrayChange = (field: string, value: string, action: 'add' | 'remove') => {
    const currentArray = formData[field as keyof typeof formData] as string[] || []
    let newArray: string[]
    
    if (action === 'add') {
      newArray = [...currentArray, value]
    } else {
      newArray = currentArray.filter(item => item !== value)
    }
    
    handleInputChange(field, newArray)
  }

  // Sync initial state with parent component
  useEffect(() => {
    const initialData = {
      name: formData.name,
      description: formData.description,
      challengeType: formData.challengeType,
      challengeTypes: formData.challengeTypes,
      gender: formData.gender,
      tags: formData.tags,
      duration: formData.duration,
      durationUnit: formData.durationUnit,
      priceCents: dollarsToCents(formData.priceDollars),
      currency: formData.currency,
      maxParticipants: formData.maxParticipants,
      flexibleStart: formData.flexibleStart,
      timezone: formData.timezone,
      targetAudience: {
        fitnessLevel: formData.fitnessLevel,
        ageGroups: formData.ageGroups,
        equipmentRequired: formData.equipmentRequired,
        medicalClearance: formData.medicalClearance,
        prerequisites: formData.prerequisites,
        skillRequirements: formData.skillRequirements
      }
    }
    onUpdate(initialData)
  }, []) // Only run once on mount

  const isFormValid = () => {
    return formData.name.trim() !== '' && 
           formData.description.trim() !== '' && 
           formData.duration > 0
  }

  return (
    <div className="space-y-8">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Set the foundation for your fitness challenge
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Challenge Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., 30-Day Transformation Challenge"
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Challenge Type
              </label>
              <select
                value={formData.challengeType}
                onChange={(e) => handleInputChange('challengeType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="fitness">Fitness</option>
                <option value="weight-loss">Weight Loss</option>
                <option value="wellness">Wellness</option>
                <option value="strength">Strength</option>
                <option value="endurance">Endurance</option>
                <option value="nutrition">Nutrition</option>
                <option value="mindfulness">Mindfulness</option>
                <option value="yoga">Yoga</option>
                <option value="pilates">Pilates</option>
                <option value="cardio">Cardio</option>
                <option value="hiit">HIIT</option>
                <option value="flexibility">Flexibility</option>
                <option value="balance">Balance</option>
                <option value="recovery">Recovery</option>
                <option value="sports">Sports</option>
                <option value="outdoor">Outdoor</option>
                <option value="indoor">Indoor</option>
                <option value="team">Team</option>
                <option value="individual">Individual</option>
                <option value="competitive">Competitive</option>
                <option value="casual">Casual</option>
                <option value="beginner-friendly">Beginner Friendly</option>
                <option value="advanced">Advanced</option>
                <option value="senior-friendly">Senior Friendly</option>
                <option value="prenatal">Prenatal</option>
                <option value="postpartum">Postpartum</option>
                <option value="rehabilitation">Rehabilitation</option>
                <option value="performance">Performance</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="transformation">Transformation</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your challenge, goals, and what participants can expect..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                  min="1"
                  className="flex-1"
                />
                <select
                  value={formData.durationUnit}
                  onChange={(e) => handleInputChange('durationUnit', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="number"
                      value={formData.priceDollars}
                      onChange={(e) => {
                        const dollars = parseFloat(e.target.value) || 0
                        setFormData(prev => ({ ...prev, priceDollars: dollars }))
                        handleInputChange('priceCents', dollarsToCents(dollars))
                      }}
                      min="0"
                      step="0.01"
                      placeholder="0.00 for free"
                      className="w-full"
                    />
                  </div>
                  <select
                    value={formData.currency}
                    onChange={(e) => {
                      const currency = e.target.value as 'USD' | 'AUD' | 'CAD' | 'GBP'
                      setFormData(prev => ({ ...prev, currency }))
                      handleInputChange('currency', currency)
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[120px]"
                  >
                    {getCurrencyOptions().map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-gray-500">
                  {formData.priceDollars > 0 
                    ? `Participants will pay ${formData.currency === 'USD' ? '$' : formData.currency === 'AUD' ? 'A$' : formData.currency === 'CAD' ? 'C$' : '£'}${formData.priceDollars.toFixed(2)}`
                    : 'This challenge is free to join'
                  }
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Participants
              </label>
              <Input
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value))}
                min="1"
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="flexibleStart"
              checked={formData.flexibleStart}
              onChange={(e) => handleInputChange('flexibleStart', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="flexibleStart" className="text-sm text-gray-700">
              Allow participants to start anytime (flexible start)
            </label>
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
          <CardDescription>
            Define multiple challenge types and target audience demographics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Multiple Challenge Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Challenge Types (Optional)
            </label>
            <p className="text-sm text-gray-500 mb-3">
              Select up to 5 additional challenge types to help participants find your challenge
            </p>
            <MultiSelect
              options={[
                { value: 'fitness', label: 'Fitness', description: 'General fitness and conditioning' },
                { value: 'weight-loss', label: 'Weight Loss', description: 'Fat loss and body composition' },
                { value: 'wellness', label: 'Wellness', description: 'Overall health and wellbeing' },
                { value: 'strength', label: 'Strength', description: 'Muscle building and power' },
                { value: 'endurance', label: 'Endurance', description: 'Cardiovascular fitness' },
                { value: 'nutrition', label: 'Nutrition', description: 'Healthy eating habits' },
                { value: 'mindfulness', label: 'Mindfulness', description: 'Mental health and meditation' },
                { value: 'yoga', label: 'Yoga', description: 'Flexibility and mindfulness' },
                { value: 'pilates', label: 'Pilates', description: 'Core strength and control' },
                { value: 'cardio', label: 'Cardio', description: 'Heart health and stamina' },
                { value: 'hiit', label: 'HIIT', description: 'High-intensity interval training' },
                { value: 'flexibility', label: 'Flexibility', description: 'Range of motion and stretching' },
                { value: 'balance', label: 'Balance', description: 'Stability and coordination' },
                { value: 'recovery', label: 'Recovery', description: 'Rest and regeneration' },
                { value: 'sports', label: 'Sports', description: 'Athletic performance' },
                { value: 'outdoor', label: 'Outdoor', description: 'Nature-based activities' },
                { value: 'indoor', label: 'Indoor', description: 'Home or gym-based workouts' },
                { value: 'team', label: 'Team', description: 'Group activities and collaboration' },
                { value: 'individual', label: 'Individual', description: 'Personal training focus' },
                { value: 'competitive', label: 'Competitive', description: 'Performance-based challenges' },
                { value: 'casual', label: 'Casual', description: 'Low-pressure, fun approach' },
                { value: 'beginner-friendly', label: 'Beginner Friendly', description: 'Suitable for newcomers' },
                { value: 'advanced', label: 'Advanced', description: 'For experienced participants' },
                { value: 'senior-friendly', label: 'Senior Friendly', description: 'Age-appropriate modifications' },
                { value: 'prenatal', label: 'Prenatal', description: 'Safe for pregnancy' },
                { value: 'postpartum', label: 'Postpartum', description: 'Post-pregnancy recovery' },
                { value: 'rehabilitation', label: 'Rehabilitation', description: 'Injury recovery and prevention' },
                { value: 'performance', label: 'Performance', description: 'Athletic enhancement' },
                { value: 'lifestyle', label: 'Lifestyle', description: 'Habit and routine building' },
                { value: 'transformation', label: 'Transformation', description: 'Complete lifestyle change' }
              ]}
              selectedValues={formData.challengeTypes}
              onChange={(values) => handleInputChange('challengeTypes', values)}
              placeholder="Select additional challenge types..."
              maxSelections={5}
            />
          </div>

          {/* Gender Targeting */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Gender
            </label>
            <p className="text-sm text-gray-500 mb-3">
              Specify who this challenge is designed for
            </p>
            <select
              value={formData.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Genders - Inclusive for everyone</option>
              <option value="women-only">Women Only - Specifically designed for women</option>
              <option value="men-only">Men Only - Specifically designed for men</option>
              <option value="non-binary-friendly">Non-Binary Friendly - Inclusive and welcoming</option>
            </select>
          </div>

          {/* Challenge Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Challenge Tags
            </label>
            <p className="text-sm text-gray-500 mb-3">
              Add tags to help participants discover and filter your challenge
            </p>
            <TagCloud
              selectedTags={formData.tags}
              onTagsChange={(tags) => handleInputChange('tags', tags)}
              maxTags={15}
            />
          </div>
        </CardContent>
      </Card>

      {/* Target Audience */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-green-600" />
            Target Audience
          </CardTitle>
          <CardDescription>
            Define who this challenge is designed for
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fitness Level
              </label>
              <select
                value={formData.fitnessLevel}
                onChange={(e) => handleInputChange('fitnessLevel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age Groups
              </label>
              <div className="space-y-2">
                {['18-25', '26-35', '36-45', '46-55', '55+'].map(ageGroup => (
                  <label key={ageGroup} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.ageGroups.includes(ageGroup)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleArrayChange('ageGroups', ageGroup, 'add')
                        } else {
                          handleArrayChange('ageGroups', ageGroup, 'remove')
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{ageGroup}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Equipment Required
            </label>
            <div className="space-y-2">
              {['None', 'Dumbbells', 'Resistance Bands', 'Yoga Mat', 'Pull-up Bar', 'Treadmill', 'Bike'].map(equipment => (
                <label key={equipment} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.equipmentRequired.includes(equipment)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleArrayChange('equipmentRequired', equipment, 'add')
                      } else {
                        handleArrayChange('equipmentRequired', equipment, 'remove')
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{equipment}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="medicalClearance"
              checked={formData.medicalClearance}
              onChange={(e) => handleInputChange('medicalClearance', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="medicalClearance" className="text-sm text-gray-700">
              Require medical clearance before participation
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          onClick={onBack}
          variant="outline"
          className="px-6"
        >
          Back
        </Button>
        
        <Button
          onClick={onNext}
          disabled={!isFormValid()}
          className="px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          Next: Challenge Structure
        </Button>
      </div>
    </div>
  )
}
