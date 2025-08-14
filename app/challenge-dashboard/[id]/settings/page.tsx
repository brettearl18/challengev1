'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { Badge } from '@/src/components/ui/Badge'
import { Input } from '@/src/components/ui/Input'
import { Textarea } from '@/src/components/ui/Textarea'
import { Switch } from '@/src/components/ui/Switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/Select'
import { 
  ArrowLeft,
  Settings,
  Save,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  Share2,
  Calendar,
  Users,
  Target,
  Zap,
  DollarSign,
  Globe,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/src/lib/firebase.client'
import { useRouter as useNextRouter } from 'next/navigation'
import { formatCents, centsToDollars, dollarsToCents } from '@/src/lib/currency'

export default function ChallengeSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const nextRouter = useNextRouter()
  const [challenge, setChallenge] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<any>('')
  const challengeId = params.id as string

  const handleSave = async () => {
    if (!challenge) return
    
    setSaving(true)
    try {
      await updateDoc(doc(db, 'challenges', challengeId), {
        ...challenge,
        updatedAt: new Date()
      })
      setSaving(false)
      // Show success message
    } catch (error) {
      console.error('Error updating challenge:', error)
      setSaving(false)
      // Show error message
    }
  }

  const handleDelete = async () => {
    if (!challenge) return
    
    try {
      await deleteDoc(doc(db, 'challenges', challengeId))
      nextRouter.push('/coach-dashboard')
    } catch (error) {
      console.error('Error deleting challenge:', error)
      // Show error message
    }
  }

  const startEditing = (field: string, value: any) => {
    setEditingField(field)
    setEditValue(value)
  }

  const saveEdit = () => {
    if (editingField && challenge) {
      setChallenge({
        ...challenge,
        [editingField]: editValue
      })
      setEditingField(null)
      setEditValue('')
    }
  }

  const cancelEdit = () => {
    setEditingField(null)
    setEditValue('')
  }

  // Ensure challenge has default values for nested objects
  const ensureChallengeDefaults = (challengeData: any) => {
    if (!challengeData) return challengeData
    
    return {
      ...challengeData,
      scoring: {
        checkinPoints: 0,
        workoutPoints: 0,
        nutritionPoints: 0,
        stepsPoints: 0,
        consistencyBonus: 0,
        streakMultiplier: 1,
        healthProfileBonus: 0,
        beforePhotosBonus: 0,
        ...challengeData.scoring
      },
      prizes: {
        prizes: {
          firstPlace: { value: 0, title: '' },
          secondPlace: { value: 0, title: '' },
          thirdPlace: { value: 0, title: '' },
          participation: { value: 0, title: '' },
          ...challengeData.prizes?.prizes
        },
        socialRecognition: {
          leaderboardFeature: false,
          socialMediaShoutout: false,
          communitySpotlight: false,
          successStorySharing: false,
          ...challengeData.prizes?.socialRecognition
        },
        ...challengeData.prizes
      }
    }
  }

  useEffect(() => {
    if (!challengeId) return

    // For now, we'll use the challenge data from the parent component
    // In a real app, you'd fetch this from Firestore
    setLoading(false)
    
    // Initialize with default values if challenge is not set
    if (!challenge) {
      setChallenge(ensureChallengeDefaults({
        name: 'New Challenge',
        description: '',
        status: 'draft',
        priceCents: 0,
        maxParticipants: 100,
        duration: 30,
        durationUnit: 'days',
        flexibleStart: false,
        isPrivate: false,
        autoApprove: false,
        currency: 'USD'
      }))
    }
  }, [challengeId, challenge])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Loading Settings...</h2>
          <p className="text-gray-500">Fetching challenge configuration</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/challenge-dashboard/${challengeId}`)}
                className="hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Challenge
              </Button>
              <div className="border-l border-gray-300 h-12"></div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Challenge Settings</h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Configure and manage your challenge
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                className="hover:bg-gray-50 transition-colors"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Challenge
              </Button>
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Basic Information */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                Basic Information
              </CardTitle>
              <CardDescription>
                Core challenge details and configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Challenge Name</label>
                  {editingField === 'name' ? (
                    <div className="space-y-2">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder="Enter challenge name"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit}>Save</Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-900">{challenge?.name || 'Not set'}</span>
                      <Button size="sm" variant="outline" onClick={() => startEditing('name', challenge?.name || '')}>
                        Edit
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <Badge className={challenge?.status === 'published' ? 
                      'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {challenge?.status === 'published' ? 'Published' : 'Draft'}
                    </Badge>
                    <Select value={challenge?.status || 'draft'} onValueChange={(value) => setChallenge({...challenge, status: value})}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Entry Price</label>
                  {editingField === 'priceCents' ? (
                    <div className="space-y-2">
                      <Input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(parseFloat(e.target.value) || 0)}
                        placeholder="Enter price in dollars"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit}>Save</Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-900">
                        {challenge?.priceCents ? `$${centsToDollars(challenge.priceCents)}` : 'Free'}
                      </span>
                      <Button size="sm" variant="outline" onClick={() => startEditing('priceCents', challenge?.priceCents || 0)}>
                        Edit
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Participants</label>
                  {editingField === 'maxParticipants' ? (
                    <div className="space-y-2">
                      <Input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(parseInt(e.target.value) || 100)}
                        placeholder="Enter max participants"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit}>Save</Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-900">{challenge?.maxParticipants || 100}</span>
                      <Button size="sm" variant="outline" onClick={() => startEditing('maxParticipants', challenge?.maxParticipants || 100)}>
                        Edit
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                {editingField === 'description' ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder="Enter challenge description"
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveEdit}>Save</Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">{challenge?.description || 'No description'}</span>
                    <Button size="sm" variant="outline" onClick={() => startEditing('description', challenge?.description || '')}>
                      Edit
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Challenge Configuration */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                Challenge Configuration
              </CardTitle>
              <CardDescription>
                Advanced settings and features
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">
                      {challenge?.duration} {challenge?.durationUnit}
                    </span>
                    <Select value={challenge?.durationUnit || 'days'} onValueChange={(value) => setChallenge({...challenge, durationUnit: value})}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="days">Days</SelectItem>
                        <SelectItem value="weeks">Weeks</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Flexible Start</label>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">
                      {challenge?.flexibleStart ? 'Enabled' : 'Disabled'}
                    </span>
                    <Switch
                      checked={challenge?.flexibleStart || false}
                      onCheckedChange={(checked) => setChallenge({...challenge, flexibleStart: checked})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Privacy</label>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      {challenge?.isPrivate ? <Lock className="w-4 h-4 text-gray-500" /> : <Globe className="w-4 h-4 text-green-500" />}
                      <span className="text-gray-900">
                        {challenge?.isPrivate ? 'Private' : 'Public'}
                      </span>
                    </div>
                    <Switch
                      checked={challenge?.isPrivate || false}
                      onCheckedChange={(checked) => setChallenge({...challenge, isPrivate: checked})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Auto-approval</label>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">
                      {challenge?.autoApprove ? 'Enabled' : 'Disabled'}
                    </span>
                    <Switch
                      checked={challenge?.autoApprove || false}
                      onCheckedChange={(checked) => setChallenge({...challenge, autoApprove: checked})}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scoring System */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-gray-100">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                Scoring System
              </CardTitle>
              <CardDescription>
                Configure points and bonuses
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Daily Activities</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span>Check-in Points</span>
                      <Input
                        type="number"
                        value={challenge?.scoring?.checkinPoints || 0}
                        onChange={(e) => setChallenge({
                          ...challenge,
                          scoring: { 
                            ...(challenge?.scoring || {}), 
                            checkinPoints: parseInt(e.target.value) || 0 
                          }
                        })}
                        className="w-20"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span>Workout Points</span>
                      <Input
                        type="number"
                        value={challenge?.scoring?.workoutPoints || 0}
                        onChange={(e) => setChallenge({
                          ...challenge,
                          scoring: { 
                            ...(challenge?.scoring || {}), 
                            workoutPoints: parseInt(e.target.value) || 0 
                          }
                        })}
                        className="w-20"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span>Steps Points</span>
                      <Input
                        type="number"
                        value={challenge?.scoring?.stepsPoints || 0}
                        onChange={(e) => setChallenge({
                          ...challenge,
                          scoring: { 
                            ...(challenge?.scoring || {}), 
                            stepsPoints: parseInt(e.target.value) || 0 
                          }
                        })}
                        className="w-20"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Bonuses</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span>Consistency Bonus</span>
                      <Input
                        type="number"
                        value={challenge?.scoring?.consistencyBonus || 0}
                        onChange={(e) => setChallenge({
                          ...challenge,
                          scoring: { 
                            ...(challenge?.scoring || {}), 
                            consistencyBonus: parseInt(e.target.value) || 0 
                          }
                        })}
                        className="w-20"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span>Streak Multiplier</span>
                      <Input
                        type="number"
                        step="0.1"
                        value={challenge?.scoring?.streakMultiplier || 1}
                        onChange={(e) => setChallenge({
                          ...challenge,
                          scoring: { 
                            ...(challenge?.scoring || {}), 
                            streakMultiplier: parseFloat(e.target.value) || 1 
                          }
                        })}
                        className="w-20"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="shadow-lg border-0 bg-red-50 border-red-200">
            <CardHeader className="bg-red-100 border-b border-red-200">
              <CardTitle className="flex items-center gap-3 text-xl text-red-800">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                Danger Zone
              </CardTitle>
              <CardDescription className="text-red-700">
                Irreversible actions that will permanently affect your challenge
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
                  <div>
                    <h4 className="font-semibold text-red-800">Delete Challenge</h4>
                    <p className="text-red-600 text-sm">
                      Permanently delete this challenge and all associated data. This action cannot be undone.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Challenge
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">Delete Challenge?</h3>
            </div>
            <p className="text-gray-600 mb-6">
              This will permanently delete "{challenge?.name}" and all associated data. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-red-600 hover:bg-red-700"
                onClick={handleDelete}
              >
                Delete Challenge
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
