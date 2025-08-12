'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/components/ui/Dialog'
import { Button } from '@/src/components/ui/Button'
import { Input } from '@/src/components/ui/Input'
import { Habit } from '@/src/types'
import { X, Target, Clock, Star, Bell, Plus, Trash2, Save, Zap } from 'lucide-react'

interface HabitModalProps {
  isOpen: boolean
  onClose: () => void
  habit?: Habit | null
  onSave: (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => void
  onDelete?: (habitId: string) => void
}

export default function HabitModal({ isOpen, onClose, habit, onSave, onDelete }: HabitModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'fitness' as 'fitness' | 'nutrition' | 'wellness' | 'lifestyle',
    frequency: 'daily' as 'daily' | 'weekly' | 'custom',
    customFrequency: {
      days: [1, 2, 3, 4, 5, 6, 7], // Monday to Sunday
      times: ['09:00']
    },
    target: {
      type: 'count' as 'count' | 'duration' | 'boolean' | 'range',
      value: 1,
      unit: '',
      min: 0,
      max: 100
    },
    points: 10,
    streakBonus: 5,
    reminder: false,
    reminderTime: '09:00',
    active: true
  })

  useEffect(() => {
    if (habit) {
      setFormData({
        name: habit.name,
        description: habit.description,
        category: habit.category,
        frequency: habit.frequency,
        customFrequency: habit.customFrequency || {
          days: [1, 2, 3, 4, 5, 6, 7],
          times: ['09:00']
        },
        target: {
          ...habit.target,
          unit: habit.target.unit || '',
          min: habit.target.min || 0,
          max: habit.target.max || 100
        },
        points: habit.points,
        streakBonus: habit.streakBonus,
        reminder: habit.reminder,
        reminderTime: habit.reminderTime || '09:00',
        active: habit.active
      })
    } else {
      // Reset form for new habit
      setFormData({
        name: '',
        description: '',
        category: 'fitness',
        frequency: 'daily',
        customFrequency: {
          days: [1, 2, 3, 4, 5, 6, 7],
          times: ['09:00']
        },
        target: {
          type: 'count',
          value: 1,
          unit: '',
          min: 0,
          max: 100
        },
        points: 10,
        streakBonus: 5,
        reminder: false,
        reminderTime: '09:00',
        active: true
      })
    }
  }, [habit])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.name.trim()) {
      alert('Please enter a habit name')
      return
    }
    
    if (formData.target.value <= 0) {
      alert('Target value must be greater than 0')
      return
    }
    
    if (formData.points <= 0) {
      alert('Points must be greater than 0')
      return
    }
    
    // Range validation
    if (formData.target.type === 'range' && formData.target.min >= formData.target.max) {
      alert('Minimum value must be less than maximum value')
      return
    }
    
    onSave(formData)
    onClose()
  }

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const weekDays = [
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
    { value: 7, label: 'Sun' }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[90vw] md:w-[80vw] lg:w-[75vw] max-w-7xl max-h-[90vh] overflow-y-auto">
    <DialogHeader className="pb-6 px-8">
      <div className="flex items-center justify-between">
        <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
          <Target className="w-6 h-6 text-indigo-600" />
          {habit ? 'Edit Habit' : 'Create New Habit'}
        </DialogTitle>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </DialogHeader>

    <form onSubmit={handleSubmit} className="space-y-8 px-8">
      {/* Helpful Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-blue-600 text-lg">💡</span>
          </div>
          <div>
            <p className="text-blue-800 font-semibold mb-2 text-lg">Creating Effective Habits</p>
            <p className="text-blue-700 text-base leading-relaxed">
              Design habits that are specific, measurable, and achievable. Clear targets help participants stay motivated and track progress effectively.
            </p>
          </div>
        </div>
      </div>

          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3 pb-3 border-b border-gray-200">
              <Target className="w-6 h-6 text-indigo-600" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Habit Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Morning Workout, Drink Water"
                  className="w-full px-4 py-3 text-base"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-base"
                >
                  <option value="fitness">🏃‍♂️ Fitness</option>
                  <option value="nutrition">🥗 Nutrition</option>
                  <option value="wellness">🧘‍♀️ Wellness</option>
                  <option value="lifestyle">🌟 Lifestyle</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe what this habit involves..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none text-base"
              />
            </div>
          </div>

          {/* Frequency & Schedule */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3 pb-3 border-b border-gray-200">
              <Clock className="w-6 h-6 text-blue-600" />
              Frequency & Schedule
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Frequency *
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => handleInputChange('frequency', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-base"
                >
                  <option value="daily">📅 Daily</option>
                  <option value="weekly">📊 Weekly</option>
                  <option value="custom">⚙️ Custom</option>
                </select>
              </div>

              {formData.frequency === 'custom' && (
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Custom Days
                  </label>
                  <div className="flex gap-3 flex-wrap">
                    {weekDays.map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => {
                          const currentDays = formData.customFrequency.days
                          const newDays = currentDays.includes(day.value)
                            ? currentDays.filter(d => d !== day.value)
                            : [...currentDays, day.value]
                          handleInputChange('customFrequency.days', newDays.sort())
                        }}
                        className={`px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                          formData.customFrequency.days.includes(day.value)
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-3">
                    Select which days of the week this habit should be performed
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Target & Goals */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3 pb-3 border-b border-gray-200">
              <Target className="w-6 h-6 text-green-600" />
              Target & Goals
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Target Type *
                </label>
                <select
                  value={formData.target.type}
                  onChange={(e) => handleInputChange('target.type', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-base"
                >
                  <option value="count">🔢 Count - Specific number (e.g., 10 pushups, 3 meals)</option>
                  <option value="duration">⏱️ Duration - Time-based (e.g., 30 minutes, 2 hours)</option>
                  <option value="boolean">✅ Boolean - Yes/No (e.g., Did you meditate? Take vitamins?)</option>
                  <option value="range">📊 Range - Min/Max values (e.g., 7-9 hours sleep, 6-8 glasses water)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Target Value *
                </label>
                <Input
                  type="number"
                  value={formData.target.value}
                  onChange={(e) => handleInputChange('target.value', parseInt(e.target.value))}
                  min="1"
                  className="w-full px-4 py-3 text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Unit
                </label>
                <Input
                  value={formData.target.unit}
                  onChange={(e) => handleInputChange('target.unit', e.target.value)}
                  placeholder="e.g., reps, minutes, hours"
                  className="w-full px-4 py-3 text-base"
                />
              </div>
            </div>

            {formData.target.type === 'range' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Minimum Value
                  </label>
                  <Input
                    type="number"
                    value={formData.target.min}
                    onChange={(e) => handleInputChange('target.min', parseInt(e.target.value))}
                    min="0"
                    className="w-full px-4 py-3 text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Maximum Value
                  </label>
                  <Input
                    type="number"
                    value={formData.target.max}
                    onChange={(e) => handleInputChange('target.max', parseInt(e.target.value))}
                    min="1"
                    className="w-full px-4 py-3 text-base"
                  />
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 mt-2">
                    Participants will get points when their value falls within this range
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Scoring & Rewards */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3 pb-3 border-b border-gray-200">
              <Star className="w-6 h-6 text-yellow-600" />
              Scoring & Rewards
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Points per Completion *
                </label>
                <Input
                  type="number"
                  value={formData.points}
                  onChange={(e) => handleInputChange('points', parseInt(e.target.value))}
                  min="1"
                  max="100"
                  className="w-full px-4 py-3 text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Streak Bonus
                </label>
                <Input
                  type="number"
                  value={formData.streakBonus}
                  onChange={(e) => handleInputChange('streakBonus', parseInt(e.target.value))}
                  min="0"
                  max="50"
                  className="w-full px-4 py-3 text-base"
                />
                <p className="text-sm text-gray-500 mt-2">Extra points for consecutive days</p>
              </div>
            </div>
          </div>

          {/* Reminders */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3 pb-3 border-b border-gray-200">
              <Bell className="w-6 h-6 text-orange-600" />
              Reminders & Notifications
            </h3>
            
            <div className="space-y-6">
              <label className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={formData.reminder}
                  onChange={(e) => handleInputChange('reminder', e.target.checked)}
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <div>
                  <span className="text-base font-semibold text-gray-700">Enable daily reminders</span>
                  <p className="text-sm text-gray-500 mt-1">Send notifications to participants</p>
                </div>
              </label>

              {formData.reminder && (
                <div className="ml-9">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Reminder Time
                  </label>
                  <Input
                    type="time"
                    value={formData.reminderTime}
                    onChange={(e) => handleInputChange('reminderTime', e.target.value)}
                    className="w-40 px-4 py-3 text-base"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    When to send daily reminders (participant's local time)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3 pb-3 border-b border-gray-200">
              <Zap className="w-6 h-6 text-green-600" />
              Habit Status
            </h3>
            
            <label className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => handleInputChange('active', e.target.checked)}
                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <div>
                <span className="text-base font-semibold text-gray-700">Active Habit</span>
                <p className="text-sm text-gray-500 mt-1">Participants can see and track this habit</p>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-10 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 -mx-8 -mb-6 px-8 py-8">
            <div className="flex items-center gap-4">
              {habit && onDelete && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onDelete(habit.id)}
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 px-6 py-3"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  Delete Habit
                </Button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="px-8 py-3 text-base font-medium"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-10 py-3 font-semibold text-base"
              >
                {habit ? (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Update Habit
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Create Habit
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
