'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { Input } from '@/src/components/ui/Input'
import { Label } from '@/src/components/ui/Label'
import { Textarea } from '@/src/components/ui/Textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/Select'
import { ChallengeContent, ChallengePhase } from '@/src/types'
import { Upload, Video, FileText, Image, Plus, Trash2 } from 'lucide-react'

interface ContentManagementStepProps {
  data: any
  onUpdate: (data: any) => void
  onNext: () => void
  onBack: () => void
  onApprove?: () => void
}

export default function ContentManagementStep({
  data,
  onUpdate,
  onNext,
  onBack
}: ContentManagementStepProps) {
  const [localContent, setLocalContent] = useState<ChallengeContent>(data.content || {
    workoutVideos: [],
    nutritionGuides: [],
    downloadableResources: []
  })
  
  const challengePhases = data.challengePhases || []

  const handleUpdate = () => {
    onUpdate({
      ...data,
      content: localContent
    })
    onNext()
  }

  const addWorkoutVideo = () => {
    const newVideo = {
      id: `video-${Date.now()}`,
      title: '',
      description: '',
      videoUrl: '',
      duration: 0,
      difficulty: 'beginner',
      phase: 1
    }
    setLocalContent(prev => ({
      ...prev,
      workoutVideos: [...prev.workoutVideos, newVideo]
    }))
  }

  const updateWorkoutVideo = (id: string, field: keyof typeof localContent.workoutVideos[0], value: any) => {
    setLocalContent(prev => ({
      ...prev,
      workoutVideos: prev.workoutVideos.map(video =>
        video.id === id ? { ...video, [field]: value } : video
      )
    }))
  }

  const removeWorkoutVideo = (id: string) => {
    setLocalContent(prev => ({
      ...prev,
      workoutVideos: prev.workoutVideos.filter(video => video.id !== id)
    }))
  }

  const addNutritionGuide = () => {
    const newGuide = {
      id: `guide-${Date.now()}`,
      title: '',
      type: 'meal-plan' as const,
      content: '',
      attachments: []
    }
    setLocalContent(prev => ({
      ...prev,
      nutritionGuides: [...prev.nutritionGuides, newGuide]
    }))
  }

  const updateNutritionGuide = (id: string, field: keyof typeof localContent.nutritionGuides[0], value: any) => {
    setLocalContent(prev => ({
      ...prev,
      nutritionGuides: prev.nutritionGuides.map(guide =>
        guide.id === id ? { ...guide, [field]: value } : guide
      )
    }))
  }

  const removeNutritionGuide = (id: string) => {
    setLocalContent(prev => ({
      ...prev,
      nutritionGuides: prev.nutritionGuides.filter(guide => guide.id !== id)
    }))
  }

  const addDownloadableResource = () => {
    const newResource = {
      id: `resource-${Date.now()}`,
      title: '',
      type: 'pdf' as const,
      fileUrl: '',
      description: ''
    }
    setLocalContent(prev => ({
      ...prev,
      downloadableResources: [...prev.downloadableResources, newResource]
    }))
  }

  const updateDownloadableResource = (id: string, field: keyof typeof localContent.downloadableResources[0], value: any) => {
    setLocalContent(prev => ({
      ...prev,
      downloadableResources: prev.downloadableResources.map(resource =>
        resource.id === id ? { ...resource, [field]: value } : resource
      )
    }))
  }

  const removeDownloadableResource = (id: string) => {
    setLocalContent(prev => ({
      ...prev,
      downloadableResources: prev.downloadableResources.filter(resource => resource.id !== id)
    }))
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Content & Resources</h2>
        <p className="text-gray-600">
          Add workout videos, nutrition guides, and downloadable resources for your challenge
        </p>
      </div>

      {/* Workout Videos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Video className="w-5 h-5" />
                <span>Workout Videos</span>
              </CardTitle>
              <CardDescription>
                Upload or link workout videos for different phases of your challenge
              </CardDescription>
            </div>
            <Button onClick={addWorkoutVideo} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Video
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {localContent.workoutVideos.map((video, index) => (
            <div key={video.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Video {index + 1}</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeWorkoutVideo(video.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`video-title-${video.id}`}>Title</Label>
                  <Input
                    id={`video-title-${video.id}`}
                    value={video.title}
                    onChange={(e) => updateWorkoutVideo(video.id, 'title', e.target.value)}
                    placeholder="e.g., Beginner Cardio Workout"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`video-duration-${video.id}`}>Duration (minutes)</Label>
                  <Input
                    id={`video-duration-${video.id}`}
                    type="number"
                    value={video.duration}
                    onChange={(e) => updateWorkoutVideo(video.id, 'duration', parseInt(e.target.value))}
                    placeholder="30"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`video-difficulty-${video.id}`}>Difficulty</Label>
                  <Select
                    value={video.difficulty}
                    onValueChange={(value) => updateWorkoutVideo(video.id, 'difficulty', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`video-phase-${video.id}`}>Challenge Phase</Label>
                  <Select
                    value={video.phase.toString()}
                    onValueChange={(value) => updateWorkoutVideo(video.id, 'phase', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {challengePhases.map(phase => (
                        <SelectItem key={phase.phaseNumber} value={phase.phaseNumber.toString()}>
                          Phase {phase.phaseNumber}: {phase.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`video-description-${video.id}`}>Description</Label>
                <Textarea
                  id={`video-description-${video.id}`}
                  value={video.description}
                  onChange={(e) => updateWorkoutVideo(video.id, 'description', e.target.value)}
                  placeholder="Describe what this workout covers and who it's suitable for..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`video-url-${video.id}`}>Video URL</Label>
                <Input
                  id={`video-url-${video.id}`}
                  value={video.videoUrl}
                  onChange={(e) => updateWorkoutVideo(video.id, 'videoUrl', e.target.value)}
                  placeholder="https://youtube.com/watch?v=... or upload file"
                />
              </div>
            </div>
          ))}
          
          {localContent.workoutVideos.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Video className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No workout videos added yet</p>
              <p className="text-sm">Click "Add Video" to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nutrition Guides */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Nutrition Guides</span>
              </CardTitle>
              <CardDescription>
                Add meal plans, recipes, and nutrition education content
              </CardDescription>
            </div>
            <Button onClick={addNutritionGuide} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Guide
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {localContent.nutritionGuides.map((guide, index) => (
            <div key={guide.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Guide {index + 1}</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeNutritionGuide(guide.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`guide-title-${guide.id}`}>Title</Label>
                  <Input
                    id={`guide-title-${guide.id}`}
                    value={guide.title}
                    onChange={(e) => updateNutritionGuide(guide.id, 'title', e.target.value)}
                    placeholder="e.g., 7-Day Meal Plan"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`guide-type-${guide.id}`}>Type</Label>
                  <Select
                    value={guide.type}
                    onValueChange={(value) => updateNutritionGuide(guide.id, 'type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meal-plan">Meal Plan</SelectItem>
                      <SelectItem value="recipe">Recipe</SelectItem>
                      <SelectItem value="shopping-list">Shopping List</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`guide-content-${guide.id}`}>Content</Label>
                <Textarea
                  id={`guide-content-${guide.id}`}
                  value={guide.content}
                  onChange={(e) => updateNutritionGuide(guide.id, 'content', e.target.value)}
                  placeholder="Enter the nutrition guide content..."
                  rows={6}
                />
              </div>
            </div>
          ))}
          
          {localContent.nutritionGuides.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No nutrition guides added yet</p>
              <p className="text-sm">Click "Add Guide" to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Downloadable Resources */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Image className="w-5 h-5" />
                <span>Downloadable Resources</span>
              </CardTitle>
              <CardDescription>
                Add PDFs, templates, calendars, and other downloadable content
              </CardDescription>
            </div>
            <Button onClick={addDownloadableResource} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Resource
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {localContent.downloadableResources.map((resource, index) => (
            <div key={resource.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Resource {index + 1}</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeDownloadableResource(resource.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`resource-title-${resource.id}`}>Title</Label>
                  <Input
                    id={`resource-title-${resource.id}`}
                    value={resource.title}
                    onChange={(e) => updateDownloadableResource(resource.id, 'title', e.target.value)}
                    placeholder="e.g., Progress Tracker Template"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`resource-type-${resource.id}`}>Type</Label>
                  <Select
                    value={resource.type}
                    onValueChange={(value) => updateDownloadableResource(resource.id, 'type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="template">Template</SelectItem>
                      <SelectItem value="calendar">Calendar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`resource-description-${resource.id}`}>Description</Label>
                <Textarea
                  id={`resource-description-${resource.id}`}
                  value={resource.description}
                  onChange={(e) => updateDownloadableResource(resource.id, 'description', e.target.value)}
                  placeholder="Describe what this resource contains..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`resource-url-${resource.id}`}>File URL</Label>
                <Input
                  id={`resource-url-${resource.id}`}
                  value={resource.fileUrl}
                  onChange={(e) => updateDownloadableResource(resource.id, 'fileUrl', e.target.value)}
                  placeholder="https://... or upload file"
                />
              </div>
            </div>
          ))}
          
          {localContent.downloadableResources.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Image className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No downloadable resources added yet</p>
              <p className="text-sm">Click "Add Resource" to get started</p>
            </div>
          )}
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
