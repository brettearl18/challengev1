'use client'

import { useState } from 'react'
import { Button } from './ui/Button'
import { Calendar, Download, Settings, X } from 'lucide-react'
import { Habit, Challenge } from '../types'
import { HabitCalendarService, HabitCalendarEvent } from '../lib/habitCalendar'

interface HabitCalendarButtonProps {
  habit: Habit
  challenge: Challenge
  onUpdateHabit: (updatedHabit: Habit) => void
  className?: string
}

export default function HabitCalendarButton({ 
  habit, 
  challenge, 
  onUpdateHabit, 
  className = '' 
}: HabitCalendarButtonProps) {
  const [isCalendarEnabled, setIsCalendarEnabled] = useState(
    habit.calendarIntegration?.enabled ?? false
  )
  const [showSettings, setShowSettings] = useState(false)
  const [calendarSettings, setCalendarSettings] = useState({
    eventTitle: habit.calendarIntegration?.eventTitle || habit.name,
    eventDescription: habit.calendarIntegration?.eventDescription || habit.description,
    reminderMinutes: habit.calendarIntegration?.reminderMinutes || 15,
    color: habit.calendarIntegration?.color || HabitCalendarService['getCategoryColor'](habit.category)
  })

  const handleToggleCalendar = () => {
    const newEnabled = !isCalendarEnabled
    setIsCalendarEnabled(newEnabled)
    
    const updatedHabit = HabitCalendarService.toggleCalendarIntegration(habit, newEnabled)
    onUpdateHabit(updatedHabit)
  }

  const handleUpdateSettings = () => {
    const updatedHabit = HabitCalendarService.updateCalendarSettings(habit, {
      ...calendarSettings,
      enabled: isCalendarEnabled
    })
    onUpdateHabit(updatedHabit)
    setShowSettings(false)
  }

  const handleDownloadCalendar = () => {
    if (!isCalendarEnabled) return
    
    console.log('Generating calendar for habit:', habit.name)
    console.log('Habit calendar settings:', habit.calendarIntegration)
    console.log('Challenge:', challenge.name)
    console.log('Challenge start date:', challenge.startDate)
    console.log('Challenge end date:', challenge.endDate)
    console.log('Challenge duration days:', challenge.durationDays)
    
    const events = HabitCalendarService.generateHabitCalendar(habit, challenge)
    console.log('Generated events:', events)
    
    if (events.length > 0) {
      console.log(`Downloading ${events.length} events`)
      HabitCalendarService.downloadHabitCalendar(events, `${habit.name}_calendar.ics`)
    } else {
      console.log('No events generated - calendar file will be empty')
      alert('No calendar events generated. Please check that the challenge has a start date and the habit is properly configured.')
    }
  }

  const getCalendarPreview = () => {
    if (!isCalendarEnabled || !challenge.startDate) {
      console.log('Calendar preview disabled:', { 
        isCalendarEnabled, 
        hasStartDate: !!challenge.startDate 
      })
      return []
    }
    
    const preview = HabitCalendarService.getHabitCalendarPreview(habit, challenge, 7)
    console.log('Calendar preview for', habit.name, ':', preview.length, 'events')
    return preview
  }

  const previewEvents = getCalendarPreview()
  const eventCount = previewEvents.length

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Main Calendar Toggle Button */}
      <Button
        variant={isCalendarEnabled ? "default" : "outline"}
        size="sm"
        onClick={handleToggleCalendar}
        className={`flex items-center gap-2 ${
          isCalendarEnabled 
            ? 'bg-green-600 hover:bg-green-700 text-white' 
            : 'text-gray-600 hover:text-gray-800'
        }`}
      >
        <Calendar className="w-4 h-4" />
        {isCalendarEnabled ? 'In Calendar' : 'Add to Calendar'}
      </Button>

      {/* Settings Button */}
      {isCalendarEnabled && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className="text-gray-600 hover:text-gray-800"
        >
          <Settings className="w-4 h-4" />
        </Button>
      )}

      {/* Download Button */}
      {isCalendarEnabled && eventCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadCalendar}
          className="text-blue-600 hover:text-blue-700"
          title={`Download ${eventCount} calendar events`}
        >
          <Download className="w-4 h-4" />
          <span className="ml-1 text-xs">{eventCount}</span>
        </Button>
      )}

      {/* Calendar Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Calendar Settings for {habit.name}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Event Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  value={calendarSettings.eventTitle}
                  onChange={(e) => setCalendarSettings(prev => ({
                    ...prev,
                    eventTitle: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Event title in calendar"
                />
              </div>

              {/* Event Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Description
                </label>
                <textarea
                  value={calendarSettings.eventDescription}
                  onChange={(e) => setCalendarSettings(prev => ({
                    ...prev,
                    eventDescription: e.target.value
                  }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Description shown in calendar event"
                />
              </div>

              {/* Reminder */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reminder (minutes before)
                </label>
                <input
                  type="number"
                  value={calendarSettings.reminderMinutes}
                  onChange={(e) => setCalendarSettings(prev => ({
                    ...prev,
                    reminderMinutes: parseInt(e.target.value) || 15
                  }))}
                  min="0"
                  max="1440"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Color
                </label>
                <div className="flex gap-2">
                  {['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#6B7280'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setCalendarSettings(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-full border-2 ${
                        calendarSettings.color === color ? 'border-gray-800' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      title={`Select ${color}`}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              {eventCount > 0 && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Preview:</strong> {eventCount} events will be created
                  </p>
                  <p className="text-xs text-gray-500">
                    Based on {habit.frequency} frequency from {new Date(challenge.startDate).toLocaleDateString()}
                    {challenge.endDate && ` to ${new Date(challenge.endDate).toLocaleDateString()}`}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowSettings(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateSettings}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Save Settings
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
