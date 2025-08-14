'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { Input } from '@/src/components/ui/Input'
import { HealthBaseline, Challenge } from '@/src/types'
import { 
  Activity, 
  Camera, 
  Target, 
  CheckCircle, 
  ArrowRight,
  Scale,
  Ruler,
  Zap,
  Heart,
  AlertTriangle
} from 'lucide-react'

interface HealthBaselineFormProps {
  challenge: Challenge
  onComplete: (baseline: HealthBaseline) => void
  onSkip?: () => void
  loading?: boolean
}

export default function HealthBaselineForm({ 
  challenge, 
  onComplete, 
  onSkip, 
  loading = false 
}: HealthBaselineFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Partial<HealthBaseline>>({
    activityLevel: 'moderately_active',
    skillLevel: 'beginner'
  })

  const totalSteps = 4
  const canSkip = challenge.requirements?.requiresHealthBaseline === false

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    const baseline: HealthBaseline = {
      ...formData,
      completedAt: Date.now(),
      updatedAt: Date.now()
    } as HealthBaseline

    onComplete(baseline)
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Target className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900">Basic Measurements</h3>
        <p className="text-gray-600">Let's start with your current measurements</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Weight
          </label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="0.0"
              value={formData.weight?.value || ''}
              onChange={(e) => updateFormData('weight', {
                ...formData.weight,
                value: parseFloat(e.target.value) || 0
              })}
              className="flex-1"
            />
            <select
              value={formData.weight?.unit || 'kg'}
              onChange={(e) => updateFormData('weight', {
                ...formData.weight,
                unit: e.target.value as 'kg' | 'lbs'
              })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="kg">kg</option>
              <option value="lbs">lbs</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Height
          </label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="0"
              value={formData.height?.value || ''}
              onChange={(e) => updateFormData('height', {
                ...formData.height,
                value: parseFloat(e.target.value) || 0
              })}
              className="flex-1"
            />
            <select
              value={formData.height?.unit || 'cm'}
              onChange={(e) => updateFormData('height', {
                ...formData.height,
                unit: e.target.value as 'cm' | 'ft' | 'in'
              })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="cm">cm</option>
              <option value="ft">ft</option>
              <option value="in">in</option>
            </select>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Button onClick={nextStep} disabled={!formData.weight?.value || !formData.height?.value}>
          Next Step
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Ruler className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900">Body Measurements</h3>
        <p className="text-gray-600">Track your progress with body circumference measurements</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chest (cm)
          </label>
          <Input
            type="number"
            placeholder="0"
            value={formData.bodyMeasurements?.chest || ''}
            onChange={(e) => updateFormData('bodyMeasurements', {
              ...formData.bodyMeasurements,
              chest: parseFloat(e.target.value) || 0
            })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Waist (cm)
          </label>
          <Input
            type="number"
            placeholder="0"
            value={formData.bodyMeasurements?.waist || ''}
            onChange={(e) => updateFormData('bodyMeasurements', {
              ...formData.bodyMeasurements,
              waist: parseFloat(e.target.value) || 0
            })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hips (cm)
          </label>
          <Input
            type="number"
            placeholder="0"
            value={formData.bodyMeasurements?.hips || ''}
            onChange={(e) => updateFormData('bodyMeasurements', {
              ...formData.bodyMeasurements,
              hips: parseFloat(e.target.value) || 0
            })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Biceps (cm)
          </label>
          <Input
            type="number"
            placeholder="0"
            value={formData.bodyMeasurements?.biceps || ''}
            onChange={(e) => updateFormData('bodyMeasurements', {
              ...formData.bodyMeasurements,
              biceps: parseFloat(e.target.value) || 0
            })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thighs (cm)
          </label>
          <Input
            type="number"
            placeholder="0"
            value={formData.bodyMeasurements?.thighs || ''}
            onChange={(e) => updateFormData('bodyMeasurements', {
              ...formData.bodyMeasurements,
              thighs: parseFloat(e.target.value) || 0
            })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Calves (cm)
          </label>
          <Input
            type="number"
            placeholder="0"
            value={formData.bodyMeasurements?.calves || ''}
            onChange={(e) => updateFormData('bodyMeasurements', {
              ...formData.bodyMeasurements,
              calves: parseFloat(e.target.value) || 0
            })}
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          Previous
        </Button>
        <Button onClick={nextStep}>
          Next Step
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Activity className="w-12 h-12 text-purple-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900">Activity & Skill Levels</h3>
        <p className="text-gray-600">Help us understand your current fitness level</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Current Activity Level
          </label>
          <div className="space-y-3">
            {[
              { value: 'sedentary', label: 'Sedentary', desc: 'Little to no exercise' },
              { value: 'lightly_active', label: 'Lightly Active', desc: 'Light exercise 1-3 days/week' },
              { value: 'moderately_active', label: 'Moderately Active', desc: 'Moderate exercise 3-5 days/week' },
              { value: 'very_active', label: 'Very Active', desc: 'Hard exercise 6-7 days/week' },
              { value: 'extremely_active', label: 'Extremely Active', desc: 'Very hard exercise, physical job' }
            ].map((level) => (
              <label key={level.value} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="activityLevel"
                  value={level.value}
                  checked={formData.activityLevel === level.value}
                  onChange={(e) => updateFormData('activityLevel', e.target.value)}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div>
                  <span className="font-medium text-gray-900">{level.label}</span>
                  <p className="text-sm text-gray-600">{level.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Gym/Exercise Skill Level
          </label>
          <div className="space-y-3">
            {[
              { value: 'beginner', label: 'Beginner', desc: 'New to exercise or returning after long break' },
              { value: 'intermediate', label: 'Intermediate', desc: 'Regular exercise routine, some experience' },
              { value: 'advanced', label: 'Advanced', desc: 'Consistent training, good form knowledge' },
              { value: 'expert', label: 'Expert', desc: 'Professional or competitive athlete' }
            ].map((level) => (
              <label key={level.value} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="skillLevel"
                  value={level.value}
                  checked={formData.skillLevel === level.value}
                  onChange={(e) => updateFormData('skillLevel', e.target.value)}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div>
                  <span className="font-medium text-gray-900">{level.label}</span>
                  <p className="text-sm text-gray-600">{level.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          Previous
        </Button>
        <Button onClick={nextStep}>
          Next Step
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Heart className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900">Health Information</h3>
        <p className="text-gray-600">Optional but helpful for your safety</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fitness Goals
          </label>
          <textarea
            placeholder="e.g., Lose weight, Build muscle, Improve endurance..."
            value={formData.fitnessGoals?.join(', ') || ''}
            onChange={(e) => updateFormData('fitnessGoals', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Medical Conditions (if any)
          </label>
          <textarea
            placeholder="e.g., Asthma, Heart condition, Diabetes..."
            value={formData.medicalConditions?.join(', ') || ''}
            onChange={(e) => updateFormData('medicalConditions', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Medications (if any)
          </label>
          <textarea
            placeholder="e.g., Blood pressure medication, Asthma inhaler..."
            value={formData.medications?.join(', ') || ''}
            onChange={(e) => updateFormData('medications', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Allergies (if any)
          </label>
          <textarea
            placeholder="e.g., Food allergies, Medication allergies..."
            value={formData.allergies?.join(', ') || ''}
            onChange={(e) => updateFormData('allergies', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          Previous
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Saving...' : 'Complete Health Profile'}
        </Button>
      </div>
    </div>
  )

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1()
      case 2: return renderStep2()
      case 3: return renderStep3()
      case 4: return renderStep4()
      default: return renderStep1()
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Scale className="w-6 h-6 text-blue-600" />
          Health Baseline Profile
        </CardTitle>
        <CardDescription>
          Step {currentStep} of {totalSteps} - {challenge.requirements?.requiresHealthBaseline ? 'Required' : 'Optional'} for this challenge
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        {renderCurrentStep()}

        {/* Skip Option */}
        {canSkip && onSkip && (
          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <Button variant="outline" onClick={onSkip}>
              Skip Health Profile
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              You can complete this later from your profile settings
            </p>
          </div>
        )}

        {/* Challenge Benefits */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Why Complete Your Health Profile?</h4>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• Get personalized recommendations</li>
                <li>• Track progress more accurately</li>
                <li>• Earn bonus points for this challenge</li>
                <li>• Better safety monitoring</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
