'use client'

import { useState, useEffect } from 'react'
import { CalendarEvent, CalendarService } from '@/src/lib/calendar'
import { Challenge, Habit } from '@/src/types'
import { Button } from '@/src/components/ui/Button'
import { Calendar, Download, Smartphone, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarViewProps {
  challenge: Challenge
  habits: Habit[]
  className?: string
}

export default function CalendarView({ challenge, habits, className = '' }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    if (challenge && habits) {
      const calendarEvents = CalendarService.getChallengeCalendarPreview(challenge, habits)
      setEvents(calendarEvents)
    }
  }, [challenge, habits])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()
    
    return { daysInMonth, startingDay, lastDay }
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const previousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const downloadCalendar = () => {
    const icsContent = CalendarService.generateChallengeCalendar(challenge, habits)
    const filename = `${challenge.name.replace(/[^a-z0-9]/gi, '_')}_calendar.ics`
    CalendarService.downloadCalendar(icsContent, filename)
  }

  const getCalendarInstructions = () => {
    const platform = navigator.platform.toLowerCase()
    if (platform.includes('mac')) {
      return 'Double-click the .ics file to add to Calendar app'
    } else if (platform.includes('win')) {
      return 'Double-click the .ics file to add to Outlook/Calendar'
    } else {
      return 'Import the .ics file into your preferred calendar app'
    }
  }

  const renderCalendar = () => {
    const { daysInMonth, startingDay, lastDay } = getDaysInMonth(currentDate)
    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    
    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 text-gray-300"></div>)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dayEvents = getEventsForDate(date)
      const isToday = date.toDateString() === new Date().toDateString()
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString()
      
      days.push(
        <div 
          key={day}
          className={`p-2 border border-gray-200 min-h-[80px] cursor-pointer transition-colors ${
            isToday ? 'bg-blue-50 border-blue-300' : ''
          } ${isSelected ? 'bg-indigo-50 border-indigo-300' : ''}`}
          onClick={() => setSelectedDate(date)}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map((event, index) => (
              <div 
                key={event.id}
                className={`text-xs p-1 rounded truncate ${
                  event.categories.includes('challenge') 
                    ? 'bg-purple-100 text-purple-700' 
                    : event.categories.includes('reminder')
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-green-100 text-green-700'
                }`}
                title={event.title}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-500">
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        </div>
      )
    }
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{monthName}</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={previousMonth}
              className="p-2"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextMonth}
              className="p-2"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 bg-gray-50">
              {day}
            </div>
          ))}
          {days}
        </div>
      </div>
    )
  }

  const renderEventDetails = () => {
    if (!selectedDate) return null
    
    const dayEvents = getEventsForDate(selectedDate)
    
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">
            {formatDate(selectedDate)}
          </h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDate(null)}
          >
            Close
          </Button>
        </div>
        
        {dayEvents.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No events scheduled for this date</p>
        ) : (
          <div className="space-y-3">
            {dayEvents.map(event => (
              <div 
                key={event.id}
                className={`p-3 rounded-lg border-l-4 ${
                  event.categories.includes('challenge') 
                    ? 'border-l-purple-500 bg-purple-50' 
                    : event.categories.includes('reminder')
                    ? 'border-l-orange-500 bg-orange-50'
                    : 'border-l-green-500 bg-green-50'
                }`}
              >
                <div className="font-medium text-gray-900">{event.title}</div>
                <div className="text-sm text-gray-600 mt-1">{event.description}</div>
                {!event.allDay && (
                  <div className="text-xs text-gray-500 mt-1">
                    {formatTime(event.startDate)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Challenge Calendar</h3>
            <p className="text-gray-600">View and export your challenge schedule</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={downloadCalendar}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Calendar
          </Button>
        </div>
      </div>

      {/* Calendar Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <Smartphone className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-blue-800 font-medium mb-1">Sync with Your Phone</p>
            <p className="text-blue-700 text-sm">
              {getCalendarInstructions()}. Your habits and challenge milestones will automatically sync and update.
            </p>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {renderCalendar()}
      </div>

      {/* Event Details Sidebar */}
      {selectedDate && (
        <div className="lg:col-span-1">
          {renderEventDetails()}
        </div>
      )}
    </div>
  )
}
