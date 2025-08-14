'use client'

import { useState } from 'react'
import { Button } from '@/src/components/ui/Button'
import { HabitCalendarService } from '@/src/lib/habitCalendar'
import { Habit, Challenge } from '@/src/types'

export default function DebugCalendarPage() {
  const [testResults, setTestResults] = useState<string[]>([])

  const addLog = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const clearLogs = () => {
    setTestResults([])
  }

  const testCalendarGeneration = () => {
    addLog('=== Testing Calendar Generation ===')
    
    // Test data
    const testHabit: Habit = {
      id: 'test-habit-1',
      name: 'Morning Walk',
      description: 'Take a 30-minute walk every morning',
      category: 'fitness',
      frequency: 'daily',
      customFrequency: {
        days: [1, 2, 3, 4, 5, 6, 7],
        times: ['09:00']
      },
      target: {
        type: 'duration',
        value: 30,
        unit: 'min',
        min: 0,
        max: 100
      },
      points: 10,
      streakBonus: 5,
      reminder: true,
      reminderTime: '09:00',
      active: true,
      calendarIntegration: {
        enabled: true,
        eventTitle: 'Morning Walk',
        eventDescription: 'Take a 30-minute walk every morning',
        reminderMinutes: 15,
        color: '#3B82F6'
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    const testChallenge: Challenge = {
      id: 'test-challenge-1',
      name: '30 Day Fitness Challenge',
      description: 'A test challenge for calendar debugging',
      challengeType: 'fitness',
      challengeTypes: ['fitness'],
      gender: 'all',
      tags: [],
      status: 'published',
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      durationDays: 31,
      maxParticipants: 100,
      currentParticipants: 0,
      priceCents: 0,
      currency: 'AUD',
      timezone: 'UTC',
      scoring: {
        checkinPoints: 10,
        workoutPoints: 20,
        nutritionPoints: 15,
        stepsBuckets: [5000, 10000, 15000],
        weightLossPoints: 50,
        consistencyBonus: 25,
        streakMultiplier: 1.5
      },
      requirements: {
        minAge: 18,
        fitnessLevel: 'beginner',
        equipment: [],
        medicalClearance: false,
        requiresHealthBaseline: false,
        requiresBeforePhotos: false,
        requiresProgressPhotos: false,
        healthMetrics: {
          weight: true,
          height: true,
          bodyMeasurements: true,
          activityLevel: true,
          skillLevel: true
        },
        timeCommitment: 'medium',
        location: 'anywhere',
        groupSize: 'individual'
      },
      targetAudience: {
        fitnessLevel: 'beginner',
        ageGroups: ['18-25', '26-35', '36-45', '46-55', '55+'],
        equipmentRequired: [],
        medicalClearance: false,
        prerequisites: [],
        skillRequirements: []
      },
      digitalTools: {
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
      },
      content: {
        workoutVideos: [],
        nutritionGuides: [],
        downloadableResources: [],
        educationalContent: []
      },
      challengePhases: [],
      flexibleStart: false,
      termsAndConditions: 'Test terms',
      privacyPolicy: 'Test privacy policy',
      habits: [testHabit],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    addLog(`Testing with habit: ${testHabit.name}`)
    addLog(`Challenge: ${testChallenge.name}`)
    addLog(`Start date: ${testChallenge.startDate}`)
    addLog(`End date: ${testChallenge.endDate}`)
    addLog(`Duration: ${testChallenge.durationDays} days`)
    addLog(`Calendar enabled: ${testHabit.calendarIntegration?.enabled}`)

    try {
      const events = HabitCalendarService.generateHabitCalendar(testHabit, testChallenge)
      addLog(`Generated ${events.length} events`)
      
      if (events.length > 0) {
        addLog(`First event: ${events[0].title} on ${events[0].startDate.toDateString()}`)
        addLog(`Last event: ${events[events.length - 1].title} on ${events[events.length - 1].startDate.toDateString()}`)
        
        // Test iCal generation
        const icsContent = HabitCalendarService.generateHabitICS(events)
        addLog(`iCal content length: ${icsContent.length} characters`)
        
        if (icsContent.length > 0) {
          addLog('✅ iCal generation successful')
        } else {
          addLog('❌ iCal generation failed - empty content')
        }
      } else {
        addLog('❌ No events generated')
      }
    } catch (error) {
      addLog(`❌ Error: ${error}`)
    }
  }

  const testDateParsing = () => {
    addLog('=== Testing Date Parsing ===')
    
    const testDates = [
      '2025-01-01',
      '2025-01-31',
      '2025-12-31',
      'invalid-date',
      ''
    ]
    
    testDates.forEach(dateStr => {
      const date = new Date(dateStr)
      const isValid = !isNaN(date.getTime())
      if (isValid) {
        addLog(`"${dateStr}" -> Valid -> ${date.toISOString()}`)
      } else {
        addLog(`"${dateStr}" -> Invalid -> Cannot convert to ISO string`)
      }
    })
  }

  const downloadTestCalendar = () => {
    addLog('=== Testing Calendar Download ===')
    
    const testHabit: Habit = {
      id: 'test-habit-1',
      name: 'Test Habit',
      description: 'A test habit for calendar download',
      category: 'fitness',
      frequency: 'daily',
      customFrequency: {
        days: [1, 2, 3, 4, 5, 6, 7],
        times: ['09:00']
      },
      target: {
        type: 'count',
        value: 1,
        unit: 'time',
        min: 0,
        max: 100
      },
      points: 10,
      streakBonus: 5,
      reminder: false,
      reminderTime: '09:00',
      active: true,
      calendarIntegration: {
        enabled: true,
        eventTitle: 'Test Habit',
        eventDescription: 'A test habit for calendar download',
        reminderMinutes: 15,
        color: '#3B82F6'
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    const testChallenge: Challenge = {
      id: 'test-challenge-1',
      name: 'Test Challenge',
      description: 'A test challenge',
      challengeType: 'fitness',
      challengeTypes: ['fitness'],
      gender: 'all',
      tags: [],
      status: 'published',
      startDate: '2025-01-01',
      endDate: '2025-01-07',
      durationDays: 7,
      maxParticipants: 10,
      currentParticipants: 0,
      priceCents: 0,
      currency: 'AUD',
      timezone: 'UTC',
      scoring: {
        checkinPoints: 10,
        workoutPoints: 20,
        nutritionPoints: 15,
        stepsBuckets: [5000, 10000, 15000],
        weightLossPoints: 50,
        consistencyBonus: 25,
        streakMultiplier: 1.5,
        healthProfileBonus: 2,
        beforePhotosBonus: 1.5,
        progressPhotosBonus: 1
      },
      requirements: {
        minAge: 18,
        fitnessLevel: 'beginner',
        equipment: [],
        medicalClearance: false,
        requiresHealthBaseline: false,
        requiresBeforePhotos: false,
        requiresProgressPhotos: false,
        healthMetrics: {
          weight: true,
          height: true,
          bodyMeasurements: true,
          activityLevel: true,
          skillLevel: true
        },
        timeCommitment: 'medium',
        location: 'anywhere',
        groupSize: 'individual'
      },
      targetAudience: {
        fitnessLevel: 'beginner',
        ageGroups: ['18-25', '26-35', '36-45', '46-55', '55+'],
        equipmentRequired: [],
        medicalClearance: false,
        prerequisites: [],
        skillRequirements: []
      },
      digitalTools: {
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
      },
      content: {
        workoutVideos: [],
        nutritionGuides: [],
        downloadableResources: [],
        educationalContent: []
      },
      challengePhases: [],
      flexibleStart: false,
      termsAndConditions: 'Test terms',
      privacyPolicy: 'Test privacy policy',
      habits: [testHabit],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    try {
      const events = HabitCalendarService.generateHabitCalendar(testHabit, testChallenge)
      addLog(`Generated ${events.length} events for download test`)
      
      if (events.length > 0) {
        HabitCalendarService.downloadHabitCalendar(events, 'test_calendar.ics')
        addLog('✅ Calendar download initiated')
      } else {
        addLog('❌ No events to download')
      }
    } catch (error) {
      addLog(`❌ Download error: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Calendar Debug Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Controls</h2>
          <div className="flex gap-4">
            <Button onClick={testCalendarGeneration} className="bg-blue-600 hover:bg-blue-700">
              Test Calendar Generation
            </Button>
            <Button onClick={testDateParsing} className="bg-green-600 hover:bg-green-700">
              Test Date Parsing
            </Button>
            <Button onClick={downloadTestCalendar} className="bg-purple-600 hover:bg-purple-700">
              Test Calendar Download
            </Button>
            <Button onClick={clearLogs} variant="outline">
              Clear Logs
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Results</h2>
          <div className="bg-gray-100 rounded p-4 h-96 overflow-y-auto font-mono text-sm">
            {testResults.length === 0 ? (
              <p className="text-gray-500">No test results yet. Run a test to see output.</p>
            ) : (
              testResults.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
