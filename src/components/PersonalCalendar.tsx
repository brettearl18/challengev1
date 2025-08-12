'use client'

import { useState, useEffect } from 'react'
import { Challenge, Habit, Enrolment, Checkin } from '../types'
import { CalendarService } from '../lib/calendar'
import { Button } from './ui/Button'
import { Calendar, Download, Smartphone, Trophy, Target, Users, ChevronLeft, ChevronRight } from 'lucide-react'

interface PersonalCalendarProps {
  enrolments: Enrolment[]
  challenges: Challenge[]
  checkins: Checkin[]
  className?: string
}

export default function PersonalCalendar({ 
  enrolments, 
  challenges, 
  checkins, 
  className = '' 
}: PersonalCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [events, setEvents] = useState<any[]>([])
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
  })
  const [selectedDays, setSelectedDays] = useState<string[]>([
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ])

  useEffect(() => {
    if (enrolments.length > 0 && challenges.length > 0) {
      // Generate events from all challenges
      const allEvents: any[] = []
      
      challenges.forEach(challenge => {
        if (challenge.habits) {
          challenge.habits.forEach(habit => {
            if (habit.active && challenge.startDate) {
              const startDate = new Date(challenge.startDate)
              const endDate = challenge.endDate 
                ? new Date(challenge.endDate) 
                : new Date(startDate.getTime() + (challenge.durationDays || 30) * 24 * 60 * 60 * 1000)
              
              allEvents.push({
                id: `habit-${habit.id}`,
                title: `✅ ${habit.name}`,
                description: `${habit.description}\nChallenge: ${challenge.name}`,
                startDate: startDate,
                challengeName: challenge.name,
                category: 'habit'
              })
            }
          })
        }
        
        if (challenge.startDate) {
          allEvents.push({
            id: `start-${challenge.id}`,
            title: `🎯 ${challenge.name} - Starts!`,
            description: 'Challenge begins today!',
            startDate: new Date(challenge.startDate),
            challengeName: challenge.name,
            category: 'start',
            allDay: true
          })
        }
        
        if (challenge.endDate) {
          allEvents.push({
            id: `end-${challenge.id}`,
            title: `🏆 ${challenge.name} - Ends!`,
            description: 'Final day of challenge!',
            startDate: new Date(challenge.endDate),
            challengeName: challenge.name,
            category: 'end',
            allDay: true
          })
        }
      })
      
      // Add check-ins
      checkins.forEach(checkin => {
        const challenge = challenges.find(c => c.id === checkin.challengeId)
        if (challenge) {
          allEvents.push({
            id: `checkin-${checkin.id}`,
            title: `✅ Check-in: ${challenge.name}`,
            description: 'Daily check-in completed',
            startDate: new Date(checkin.createdAt),
            challengeName: challenge.name,
            category: 'checkin'
          })
        }
      })
      
      setEvents(allEvents.sort((a, b) => a.startDate.getTime() - b.startDate.getTime()))
    }
  }, [enrolments, challenges, checkins])

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
    // Check if date is within selected range
    if (date < dateRange.start || date > dateRange.end) {
      return []
    }
    
    // Check if day of week is selected
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
    if (!selectedDays.includes(dayName)) {
      return []
    }
    
    return events.filter(event => {
      const eventDate = new Date(event.startDate)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const previousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  // Update current month when date range changes
  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      const startMonth = dateRange.start.getMonth()
      const currentMonth = currentDate.getMonth()
      
      // If current month is not within the date range, jump to the start month
      if (startMonth !== currentMonth && 
          (dateRange.start.getFullYear() !== currentDate.getFullYear() || 
           Math.abs(startMonth - currentMonth) > 1)) {
        setCurrentDate(new Date(dateRange.start.getFullYear(), dateRange.start.getMonth(), 1))
      }
    }
  }, [dateRange.start, dateRange.end])

  const downloadPersonalCalendar = () => {
    // Generate iCal for all challenges
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Fitness Challenge Platform//Personal Calendar//EN',
      'X-WR-CALNAME:My Fitness Challenges',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ]
    
    events.forEach(event => {
      icsContent.push(
        'BEGIN:VEVENT',
        `UID:${event.id}`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `DTSTART:${event.startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        event.allDay ? 'X-MICROSOFT-CDO-ALLDAYEVENT:TRUE' : '',
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
        'END:VEVENT'
      )
    })
    
    icsContent.push('END:VCALENDAR')
    
    const ics = icsContent.filter(line => line !== '').join('\r\n')
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = 'my_fitness_calendar.ics'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  }

  const renderCalendar = () => {
    const { daysInMonth, startingDay } = getDaysInMonth(currentDate)
    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    
    const days = []
    
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 text-gray-300"></div>)
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dayEvents = getEventsForDate(date)
      const isToday = date.toDateString() === new Date().toDateString()
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString()
      
      // Check if date is within range and day is selected
      const isInRange = date >= dateRange.start && date <= dateRange.end
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
      const isDaySelected = selectedDays.includes(dayName)
      const isFiltered = !isInRange || !isDaySelected
      
      days.push(
        <div 
          key={day}
          className={`p-2 border min-h-[80px] cursor-pointer transition-colors ${
            isFiltered 
              ? 'border-gray-100 bg-gray-50 text-gray-400' 
              : isToday 
              ? 'border-blue-300 bg-blue-50' 
              : 'border-gray-200'
          } ${isSelected ? 'bg-indigo-50 border-indigo-300' : ''}`}
          onClick={() => isFiltered ? null : setSelectedDate(date)}
        >
          <div className={`text-sm font-medium mb-1 ${
            isFiltered 
              ? 'text-gray-400' 
              : isToday 
              ? 'text-blue-600' 
              : 'text-gray-900'
          }`}>
            {day}
          </div>
          <div className="space-y-1">
            {!isFiltered && dayEvents.slice(0, 2).map((event, index) => (
              <div 
                key={event.id}
                className={`text-xs p-1 rounded truncate ${
                  event.category === 'start' 
                    ? 'bg-purple-100 text-purple-700' 
                    : event.category === 'end'
                    ? 'bg-orange-100 text-orange-700'
                    : event.category === 'checkin'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
                title={event.title}
              >
                {event.title}
              </div>
            ))}
            {!isFiltered && dayEvents.length > 2 && (
              <div className="text-xs text-gray-500">
                +{dayEvents.length - 2} more
              </div>
            )}
            {isFiltered && (
              <div className="text-xs text-gray-400 italic">
                {!isInRange ? 'Out of range' : 'Day filtered'}
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
        
        {/* Calendar Legend */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-50 border border-blue-300 rounded"></div>
              <span>Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-50 border border-gray-100 rounded"></div>
              <span>Filtered Out</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white border border-gray-200 rounded"></div>
              <span>Active</span>
            </div>
          </div>
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
            {selectedDate.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
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
                  event.category === 'start' 
                    ? 'border-l-purple-500 bg-purple-50' 
                    : event.category === 'end'
                    ? 'border-l-orange-500 bg-orange-50'
                    : event.category === 'checkin'
                    ? 'border-l-green-500 bg-green-50'
                    : 'border-l-blue-500 bg-blue-50'
                }`}
              >
                <div className="font-medium text-gray-900">{event.title}</div>
                <div className="text-sm text-gray-600 mt-1">{event.description}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {event.challengeName}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (enrolments.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No challenges yet</h3>
        <p className="text-gray-500 mb-6">Join a challenge to see your personal fitness calendar!</p>
      </div>
    )
  }

  const summary = {
    totalChallenges: challenges.length,
    activeChallenges: challenges.filter(c => c.status === 'published').length,
    totalHabits: challenges.reduce((sum, c) => sum + (c.habits?.length || 0), 0),
    activeHabits: challenges.reduce((sum, c) => 
      sum + (c.habits?.filter(h => h.active).length || 0), 0
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">My Fitness Calendar</h3>
            <p className="text-gray-600">
              All your challenges, habits, and check-ins in one place
              {selectedDays.length < 7 && (
                <span className="ml-2 text-blue-600 font-medium">
                  • Filtered to {selectedDays.length} days
                </span>
              )}
            </p>
          </div>
        </div>
        
        <Button
          variant="outline"
          onClick={downloadPersonalCalendar}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export Calendar
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{summary.totalChallenges}</div>
          <div className="text-sm text-gray-600">Total Challenges</div>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{summary.activeChallenges}</div>
          <div className="text-sm text-gray-600">Active Challenges</div>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">{summary.totalHabits}</div>
          <div className="text-sm text-gray-600">Total Habits</div>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
          <div className="text-2xl font-bold text-orange-600">{summary.activeHabits}</div>
          <div className="text-sm text-gray-600">Active Habits</div>
        </div>
      </div>

      {/* Date Range and Day Selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Calendar Filters</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const now = new Date()
              setDateRange({
                start: new Date(now.getFullYear(), now.getMonth(), 1),
                end: new Date(now.getFullYear(), now.getMonth() + 1, 0)
              })
              setSelectedDays([
                'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
              ])
            }}
          >
            Reset Filters
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Date Range Selector */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Date Range</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start.toISOString().split('T')[0]}
                  onChange={(e) => setDateRange(prev => ({
                    ...prev,
                    start: new Date(e.target.value)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={dateRange.end.toISOString().split('T')[0]}
                  onChange={(e) => setDateRange(prev => ({
                    ...prev,
                    end: new Date(e.target.value)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const now = new Date()
                  setDateRange({
                    start: new Date(now.getFullYear(), now.getMonth(), 1),
                    end: new Date(now.getFullYear(), now.getMonth() + 1, 0)
                  })
                }}
              >
                This Month
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const now = new Date()
                  setDateRange({
                    start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
                    end: new Date(now.getFullYear(), now.getMonth(), 0)
                  })
                }}
              >
                Last Month
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const now = new Date()
                  setDateRange({
                    start: new Date(now.getFullYear(), 0, 1),
                    end: new Date(now.getFullYear(), 11, 31)
                  })
                }}
              >
                This Year
              </Button>
            </div>
          </div>

          {/* Day of Week Selector */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Show Habits On</h4>
            <div className="grid grid-cols-2 gap-2">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                <label key={day} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedDays.includes(day)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedDays(prev => [...prev, day])
                      } else {
                        setSelectedDays(prev => prev.filter(d => d !== day))
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{day}</span>
                </label>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDays([
                  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
                ])}
              >
                All Days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDays([
                  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
                ])}
              >
                Weekdays Only
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDays([
                  'Saturday', 'Sunday'
                ])}
              >
                Weekends Only
              </Button>
            </div>
          </div>
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
              Export your calendar to sync all challenges and habits with your phone's calendar app.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Date Range:</span>
              <span className="text-sm text-gray-600">
                {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Days:</span>
              <span className="text-sm text-gray-600">
                {selectedDays.length === 7 ? 'All days' : selectedDays.join(', ')}
              </span>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Showing {events.filter(event => {
              const eventDate = new Date(event.startDate)
              const dayName = eventDate.toLocaleDateString('en-US', { weekday: 'long' })
              return eventDate >= dateRange.start && eventDate <= dateRange.end && selectedDays.includes(dayName)
            }).length} events
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
