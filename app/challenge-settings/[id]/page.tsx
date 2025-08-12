'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getChallenge } from '@/src/lib/challenges'
import { updateDoc, doc } from 'firebase/firestore'
import { db } from '@/src/lib/firebase.client'
import { Challenge } from '@/src/types'
import { Calendar, Clock, Users, Trophy, Save, ArrowLeft, Target, Zap, Bell, Plus, Trash2, TrendingUp, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/src/components/ui/Button'
import { Input } from '@/src/components/ui/Input'
import HabitModal from '@/src/components/HabitModal'
import CalendarView from '@/src/components/CalendarView'
import { Habit } from '@/src/types'

export default function ChallengeSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const challengeId = params.id as string
  
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form states
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [maxParticipants, setMaxParticipants] = useState<number>(0)
  const [status, setStatus] = useState<'draft' | 'published' | 'archived' | 'completed'>('draft')
  const [priceCents, setPriceCents] = useState<number>(0)
  
  // Habit management state
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)

  useEffect(() => {
    if (challengeId) {
      loadChallenge()
    }
  }, [challengeId])

  const loadChallenge = async () => {
    try {
      setLoading(true)
      setError(null)
      const challengeData = await getChallenge(challengeId)
      
      if (challengeData) {
        setChallenge(challengeData)
        if (challengeData.startDate) {
          setStartDate(challengeData.startDate)
        }
        if (challengeData.endDate) {
          setEndDate(challengeData.endDate)
        }
        setMaxParticipants(challengeData.maxParticipants || 0)
        setStatus(challengeData.status)
        setPriceCents(challengeData.priceCents)
      } else {
        setError('Challenge not found')
      }
    } catch (error) {
      console.error('Error loading challenge:', error)
      setError('Failed to load challenge')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!challenge) return
    
    try {
      setSaving(true)
      const challengeRef = doc(db, 'challenges', challengeId)
      
      await updateDoc(challengeRef, {
        startDate: startDate || null,
        endDate: endDate || null,
        maxParticipants,
        status,
        priceCents,
        requirements: challenge.requirements,
        termsAndConditions: challenge.termsAndConditions,
        privacyPolicy: challenge.privacyPolicy,
        updatedAt: Date.now()
      })
      
      // Reload the challenge to get updated data
      await loadChallenge()
      
      alert('Challenge settings saved successfully!')
    } catch (error) {
      console.error('Error saving challenge:', error)
      alert('Failed to save challenge settings')
    } finally {
      setSaving(false)
    }
  }

  // Habit management functions
  const handleSaveHabit = async (habitData: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!challenge) return
    
    try {
      const newHabit: Habit = {
        ...habitData,
        id: editingHabit?.id || `habit_${Date.now()}`,
        createdAt: editingHabit?.createdAt || Date.now(),
        updatedAt: Date.now()
      }
      
      const updatedHabits = editingHabit
        ? (challenge.habits || []).map(h => h.id === editingHabit.id ? newHabit : h)
        : [...(challenge.habits || []), newHabit]
      
      const challengeRef = doc(db, 'challenges', challengeId)
      await updateDoc(challengeRef, {
        habits: updatedHabits,
        updatedAt: Date.now()
      })
      
      // Update local state
      setChallenge(prev => prev ? { ...prev, habits: updatedHabits } : null)
      setEditingHabit(null)
      setIsHabitModalOpen(false)
      
      alert(editingHabit ? 'Habit updated successfully!' : 'Habit created successfully!')
    } catch (error) {
      console.error('Error saving habit:', error)
      alert('Failed to save habit')
    }
  }

  const handleDeleteHabit = async (habitId: string) => {
    if (!challenge) return
    
    try {
      const updatedHabits = (challenge.habits || []).filter(h => h.id !== habitId)
      
      const challengeRef = doc(db, 'challenges', challengeId)
      await updateDoc(challengeRef, {
        habits: updatedHabits,
        updatedAt: Date.now()
      })
      
      // Update local state
      setChallenge(prev => prev ? { ...prev, habits: updatedHabits } : null)
      
      alert('Habit deleted successfully!')
    } catch (error) {
      console.error('Error deleting habit:', error)
      alert('Failed to delete habit')
    }
  }

  const openHabitModal = (habit?: Habit) => {
    setEditingHabit(habit || null)
    setIsHabitModalOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading challenge...</h2>
        </div>
      </div>
    )
  }

  if (error || !challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Challenge Not Found</h2>
          <p className="text-gray-500 mb-6">
            {error || 'The challenge you\'re looking for doesn\'t exist or you don\'t have access to it.'}
          </p>
          <div className="space-y-3">
            <Link href="/challenges">
              <Button className="w-full">Back to Challenges</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">Go to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/challenges">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Challenges
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Challenge Settings</h1>
                <p className="text-gray-600">{challenge.name}</p>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Challenge Overview */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-100/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Challenge Overview</h3>
                  <p className="text-gray-600">Basic information about your challenge</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Challenge Name
                  </label>
                  <Input
                    value={challenge.name}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Challenge Type
                  </label>
                  <Input
                    value={challenge.challengeType}
                    readOnly
                    className="bg-gray-50 capitalize"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg"
                  >
                    <option value="draft">📝 Draft</option>
                    <option value="published">🚀 Published</option>
                    <option value="archived">📦 Archived</option>
                    <option value="completed">🏆 Completed</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Participants
                  </label>
                  <Input
                    value={challenge.currentParticipants}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Timing & Schedule */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 border-b border-gray-100/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Timing & Schedule</h3>
                  <p className="text-gray-600">Set start dates and duration for your challenge</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="text-lg"
                  />
                  <p className="text-sm text-gray-500 mt-1">Leave empty for flexible start</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="text-lg"
                  />
                  <p className="text-sm text-gray-500 mt-1">Leave empty for duration-based</p>
                </div>
              </div>
              
              {challenge.durationDays && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">Duration: {challenge.durationDays} days</span>
                  </div>
                  <p className="text-blue-700 text-sm mt-1">
                    This challenge is configured to run for {challenge.durationDays} days from start
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Participation & Pricing */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b border-gray-100/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Participation & Pricing</h3>
                  <p className="text-gray-600">Control who can join and set pricing</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Participants
                  </label>
                  <Input
                    type="number"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(parseInt(e.target.value))}
                    min="1"
                    max="1000"
                    className="text-lg"
                  />
                  <p className="text-sm text-gray-500 mt-1">Set to 0 for unlimited</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (AUD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">A$</span>
                    <Input
                      type="number"
                      value={priceCents / 100}
                      onChange={(e) => setPriceCents(Math.round(parseFloat(e.target.value) * 100))}
                      min="0"
                      step="0.01"
                      className="pl-10 text-lg"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {priceCents > 0 
                      ? `Total: A$${(priceCents / 100).toFixed(2)}`
                      : 'Free challenge'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

                        {/* Scoring System */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden mb-8">
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 border-b border-gray-100/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Scoring System</h3>
                      <p className="text-gray-600">Current point values for activities</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600">{challenge.scoring.checkinPoints}</div>
                      <div className="text-sm text-gray-600">Daily Check-in</div>
                    </div>
                    
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-2xl font-bold text-green-600">{challenge.scoring.workoutPoints}</div>
                      <div className="text-sm text-gray-600">Per Workout</div>
                    </div>
                    
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-2xl font-bold text-purple-600">{challenge.scoring.nutritionPoints}</div>
                      <div className="text-sm text-gray-600">Nutrition Score</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 text-sm">💡</span>
                      </div>
                      <div>
                        <p className="text-blue-800 font-medium mb-2">Scoring Note:</p>
                        <p className="text-blue-700 text-sm">
                          Scoring rules are set when creating the challenge. To modify scoring, you'll need to create a new challenge or contact support.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Habit Management */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden mb-8">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 border-b border-gray-100/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center">
                        <Target className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Habit Management</h3>
                        <p className="text-gray-600">Configure daily habits and targets for participants</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => openHabitModal()}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Habit
                    </Button>
                  </div>
                </div>
                
                <div className="p-6">
                  {challenge.habits && challenge.habits.length > 0 ? (
                    <div className="space-y-4">
                      {challenge.habits.map((habit) => (
                        <div key={habit.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  habit.category === 'fitness' ? 'bg-blue-100 text-blue-600' :
                                  habit.category === 'nutrition' ? 'bg-green-100 text-green-600' :
                                  habit.category === 'wellness' ? 'bg-purple-100 text-purple-600' :
                                  'bg-orange-100 text-orange-600'
                                }`}>
                                  {habit.category === 'fitness' ? '🏃‍♂️' :
                                   habit.category === 'nutrition' ? '🥗' :
                                   habit.category === 'wellness' ? '🧘‍♀️' : '🌟'}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">{habit.name}</h4>
                                  <p className="text-sm text-gray-600">{habit.description}</p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500">Frequency:</span>
                                  <div className="font-medium text-gray-900">
                                    {habit.frequency === 'daily' ? '📅 Daily' :
                                     habit.frequency === 'weekly' ? '📊 Weekly' : '⚙️ Custom'}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-500">Target:</span>
                                  <div className="font-medium text-gray-900">
                                    {habit.target.value} {habit.target.unit}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-500">Points:</span>
                                  <div className="font-medium text-gray-900">{habit.points} pts</div>
                                </div>
                                <div>
                                  <span className="text-gray-500">Status:</span>
                                  <div className={`font-medium ${habit.active ? 'text-green-600' : 'text-gray-500'}`}>
                                    {habit.active ? '✅ Active' : '⏸️ Inactive'}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openHabitModal(habit)}
                                className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteHabit(habit.id)}
                                className="border-red-200 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No Habits Configured</h4>
                      <p className="text-gray-500 mb-6">Add habits to help participants build consistent routines</p>
                      <Button 
                        variant="outline" 
                        className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                        onClick={() => openHabitModal()}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Configure First Habit
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Participant Management */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden mb-8">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-gray-100/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Participant Management</h3>
                        <p className="text-gray-600">Manage who's enrolled and their progress</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{challenge.currentParticipants}</div>
                      <div className="text-sm text-gray-500">Active Participants</div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Recent Enrolments</h4>
                        <Link href={`/challenge/${challenge.id}/participants`} className="text-sm text-blue-600 hover:text-blue-700">
                          View All →
                        </Link>
                      </div>
                      <div className="text-center py-8 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">No recent enrolments</p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Quick Actions</h4>
                      </div>
                      <div className="space-y-3">
                        <Button variant="outline" className="w-full justify-start text-left">
                          <Users className="w-4 h-4 mr-2" />
                          Send Group Message
                        </Button>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          View Progress Report
                        </Button>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <Trophy className="w-4 h-4 mr-2" />
                          Leaderboard
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Challenge Calendar */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden mb-8">
                <CalendarView 
                  challenge={challenge} 
                  habits={challenge.habits || []} 
                  className="p-6"
                />
              </div>

              {/* Challenge Analytics */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden mb-8">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 border-b border-gray-100/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Challenge Analytics</h3>
                      <p className="text-gray-600">Track performance and engagement metrics</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600">0%</div>
                      <div className="text-sm text-gray-600">Check-in Rate</div>
                    </div>
                    
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-2xl font-bold text-green-600">0</div>
                      <div className="text-sm text-gray-600">Active Streaks</div>
                    </div>
                    
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-2xl font-bold text-purple-600">0</div>
                      <div className="text-sm text-gray-600">Total Points</div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 text-sm">📊</span>
                      </div>
                      <div>
                        <p className="text-blue-800 font-medium mb-2">Analytics Note:</p>
                        <p className="text-blue-700 text-sm">
                          Analytics will populate as participants start checking in. Check back regularly to monitor challenge performance.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Requirements Section */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden mb-8">
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 border-b border-gray-100/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Participant Requirements</h3>
                      <p className="text-gray-600">Set eligibility criteria and fitness requirements</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Age
                      </label>
                      <Input
                        type="number"
                        value={challenge.requirements?.minAge || 18}
                        onChange={(e) => setChallenge(prev => prev ? ({
                          ...prev,
                          requirements: {
                            ...prev.requirements,
                            minAge: parseInt(e.target.value)
                          }
                        }) : null)}
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
                        value={challenge.requirements?.fitnessLevel || 'beginner'}
                        onChange={(e) => setChallenge(prev => prev ? ({
                          ...prev,
                          requirements: {
                            ...prev.requirements,
                            fitnessLevel: e.target.value as 'beginner' | 'intermediate' | 'advanced'
                          }
                        }) : null)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg"
                      >
                        <option value="beginner">🟢 Beginner - Suitable for everyone</option>
                        <option value="intermediate">🟡 Intermediate - Some fitness experience</option>
                        <option value="advanced">🔴 Advanced - High fitness level required</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={challenge.requirements?.medicalClearance || false}
                        onChange={(e) => setChallenge(prev => prev ? ({
                          ...prev,
                          requirements: {
                            ...prev.requirements,
                            medicalClearance: e.target.checked
                          }
                        }) : null)}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Require medical clearance for participation
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Terms & Conditions Section */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden mb-8">
                <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 border-b border-gray-100/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center">
                      <Zap className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Terms & Conditions</h3>
                      <p className="text-gray-600">Legal requirements and participant agreements</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Terms & Conditions *
                      </label>
                      <textarea
                        value={challenge.termsAndConditions || ''}
                        onChange={(e) => setChallenge(prev => prev ? ({
                          ...prev,
                          termsAndConditions: e.target.value
                        }) : null)}
                        placeholder="Enter the terms and conditions that participants must agree to when joining this challenge..."
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
                        value={challenge.privacyPolicy || ''}
                        onChange={(e) => setChallenge(prev => prev ? ({
                          ...prev,
                          privacyPolicy: e.target.value
                        }) : null)}
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
              </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/challenges">
              <Button variant="outline" className="w-full sm:w-auto">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Challenges
              </Button>
            </Link>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save All Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Habit Management Modal */}
      <HabitModal
        isOpen={isHabitModalOpen}
        onClose={() => {
          setIsHabitModalOpen(false)
          setEditingHabit(null)
        }}
        habit={editingHabit}
        onSave={handleSaveHabit}
        onDelete={editingHabit ? handleDeleteHabit : undefined}
      />
    </div>
  )
}
