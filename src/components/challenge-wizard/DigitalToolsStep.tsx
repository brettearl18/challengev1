'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { Switch } from '@/src/components/ui/Switch'
import { Label } from '@/src/components/ui/Label'
import { Input } from '@/src/components/ui/Input'
import { Textarea } from '@/src/components/ui/Textarea'
import { DigitalTools } from '@/src/types'

interface DigitalToolsStepProps {
  data: any
  onUpdate: (data: any) => void
  onNext: () => void
  onBack: () => void
  onApprove?: () => void
}

export default function DigitalToolsStep({
  data,
  onUpdate,
  onNext,
  onBack
}: DigitalToolsStepProps) {
  const [localDigitalTools, setLocalDigitalTools] = useState<DigitalTools>(data.digitalTools || {
    fitnessApps: {
      strava: false,
      myFitnessPal: false,
      fitbit: false,
      appleHealth: false,
      googleFit: false
    },
    socialPlatforms: {
      instagram: false,
      facebook: false,
      whatsapp: false,
      discord: false
    },
    progressTracking: {
      beforePhotos: false,
      progressPhotos: false,
      measurements: false,
      videoProgress: false,
      journalEntries: false
    }
  })

  const handleUpdate = () => {
    onUpdate({
      ...data,
      digitalTools: localDigitalTools
    })
    onNext()
  }

  const updateFitnessApp = (app: keyof DigitalTools['fitnessApps'], enabled: boolean) => {
    setLocalDigitalTools(prev => ({
      ...prev,
      fitnessApps: {
        ...prev.fitnessApps,
        [app]: enabled
      }
    }))
  }

  const updateSocialPlatform = (platform: keyof DigitalTools['socialPlatforms'], enabled: boolean) => {
    setLocalDigitalTools(prev => ({
      ...prev,
      socialPlatforms: {
        ...prev.socialPlatforms,
        [platform]: enabled
      }
    }))
  }

  const updateProgressTracking = (tracking: keyof DigitalTools['progressTracking'], enabled: boolean) => {
    setLocalDigitalTools(prev => ({
      ...prev,
      progressTracking: {
        ...prev.progressTracking,
        [tracking]: enabled
      }
    }))
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Digital Tools & App Integration</h2>
        <p className="text-gray-600">
          Choose which apps and tools your participants will use during the challenge
        </p>
      </div>

      {/* Fitness Apps */}
      <Card>
        <CardHeader>
          <CardTitle>Fitness Apps</CardTitle>
          <CardDescription>
            Select which fitness tracking apps your challenge will integrate with
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(localDigitalTools.fitnessApps).map(([app, enabled]) => (
              <div key={app} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {app.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <Label className="text-sm font-medium capitalize">
                      {app.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <p className="text-xs text-gray-500">
                      {app === 'strava' && 'Track workouts and activities'}
                      {app === 'myFitnessPal' && 'Monitor nutrition and calories'}
                      {app === 'fitbit' && 'Track steps and heart rate'}
                      {app === 'appleHealth' && 'iOS health data integration'}
                      {app === 'googleFit' && 'Android health data integration'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={enabled}
                  onCheckedChange={(checked) => updateFitnessApp(app as keyof DigitalTools['fitnessApps'], checked)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Social Platforms */}
      <Card>
        <CardHeader>
          <CardTitle>Social Platforms</CardTitle>
          <CardDescription>
            Choose social platforms for community building and progress sharing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(localDigitalTools.socialPlatforms).map(([platform, enabled]) => (
              <div key={platform} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-semibold text-sm">
                      {platform.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <Label className="text-sm font-medium capitalize">
                      {platform.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <p className="text-xs text-gray-500">
                      {platform === 'instagram' && 'Share progress photos and stories'}
                      {platform === 'facebook' && 'Create community groups and events'}
                      {platform === 'whatsapp' && 'Group chat and reminders'}
                      {platform === 'discord' && 'Community server and voice channels'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={enabled}
                  onCheckedChange={(checked) => updateSocialPlatform(platform as keyof DigitalTools['socialPlatforms'], checked)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progress Tracking */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Tracking</CardTitle>
          <CardDescription>
            Select how participants will track their progress
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(localDigitalTools.progressTracking).map(([tracking, enabled]) => (
              <div key={tracking} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold text-sm">
                      {tracking.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <Label className="text-sm font-medium capitalize">
                      {tracking.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <p className="text-xs text-gray-500">
                      {tracking === 'beforePhotos' && 'Initial progress photos'}
                      {tracking === 'progressPhotos' && 'Weekly progress updates'}
                      {tracking === 'measurements' && 'Body measurements tracking'}
                      {tracking === 'videoProgress' && 'Video progress logs'}
                      {tracking === 'journalEntries' && 'Daily journal entries'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={enabled}
                  onCheckedChange={(checked) => updateProgressTracking(tracking as keyof DigitalTools['progressTracking'], checked)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration Setup */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Setup</CardTitle>
          <CardDescription>
            Configure API keys and webhook URLs for selected integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {localDigitalTools.fitnessApps.strava && (
            <div className="space-y-2">
              <Label htmlFor="strava-api-key">Strava API Key</Label>
              <Input
                id="strava-api-key"
                placeholder="Enter your Strava API key"
                type="password"
              />
            </div>
          )}
          
          {localDigitalTools.fitnessApps.myFitnessPal && (
            <div className="space-y-2">
              <Label htmlFor="mfp-api-key">MyFitnessPal API Key</Label>
              <Input
                id="mfp-api-key"
                placeholder="Enter your MyFitnessPal API key"
                type="password"
              />
            </div>
          )}

          {localDigitalTools.socialPlatforms.instagram && (
            <div className="space-y-2">
              <Label htmlFor="instagram-hashtag">Challenge Hashtag</Label>
              <Input
                id="instagram-hashtag"
                placeholder="#YourChallengeName"
              />
            </div>
          )}

          {localDigitalTools.socialPlatforms.whatsapp && (
            <div className="space-y-2">
              <Label htmlFor="whatsapp-group">WhatsApp Group Link</Label>
              <Input
                id="whatsapp-group"
                placeholder="https://chat.whatsapp.com/..."
              />
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
