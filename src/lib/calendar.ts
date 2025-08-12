import { Challenge, Habit, Enrolment } from '../types'

export interface CalendarEvent {
  id: string
  title: string
  description: string
  startDate: Date
  endDate?: Date
  allDay?: boolean
  location?: string
  url?: string
  categories: string[]
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
    interval?: number
    endDate?: Date
    byDay?: number[] // 0=Sunday, 1=Monday, etc.
  }
}

export interface CalendarExport {
  challengeId: string
  challengeName: string
  events: CalendarEvent[]
  icsContent: string
  downloadUrl: string
}

export class CalendarService {
  /**
   * Generate iCal content for a challenge
   */
  static generateChallengeCalendar(challenge: Challenge, habits: Habit[]): string {
    const events: CalendarEvent[] = []
    
    // Add challenge start/end events
    if (challenge.startDate) {
      events.push({
        id: `challenge-start-${challenge.id}`,
        title: `🎯 ${challenge.name} - Challenge Starts!`,
        description: `Your fitness challenge begins today! Get ready to crush your goals.`,
        startDate: new Date(challenge.startDate),
        allDay: true,
        categories: ['challenge', 'start'],
        url: `${window.location.origin}/challenge/${challenge.id}`
      })
    }
    
    if (challenge.endDate) {
      events.push({
        id: `challenge-end-${challenge.id}`,
        title: `🏆 ${challenge.name} - Challenge Ends!`,
        description: `Final day of your challenge! Submit your final check-in and see your results.`,
        startDate: new Date(challenge.endDate),
        allDay: true,
        categories: ['challenge', 'end'],
        url: `${window.location.origin}/challenge/${challenge.id}`
      })
    }
    
    // Add habit events
    habits.forEach(habit => {
      if (habit.active) {
        const habitEvents = this.generateHabitEvents(habit, challenge)
        events.push(...habitEvents)
      }
    })
    
    // Generate iCal content
    return this.generateICS(events, challenge.name)
  }
  
  /**
   * Generate recurring events for a habit
   */
  static generateHabitEvents(habit: Habit, challenge: Challenge): CalendarEvent[] {
    const events: CalendarEvent[] = []
    
    if (!challenge.startDate) return events
    
    const startDate = new Date(challenge.startDate)
    const endDate = challenge.endDate ? new Date(challenge.endDate) : new Date(startDate.getTime() + (challenge.durationDays || 30) * 24 * 60 * 60 * 1000)
    
    // Create recurring habit events
    const event: CalendarEvent = {
      id: `habit-${habit.id}`,
      title: `✅ ${habit.name}`,
      description: `${habit.description}\n\nPoints: ${habit.points}\nStreak Bonus: ${habit.streakBonus}`,
      startDate: startDate,
      allDay: false,
      categories: ['habit', 'fitness'],
      url: `${window.location.origin}/checkin`,
      recurrence: {
        frequency: habit.frequency === 'daily' ? 'daily' : 'weekly',
        interval: 1,
        endDate: endDate,
        byDay: habit.frequency === 'custom' ? habit.customFrequency?.days : undefined
      }
    }
    
    events.push(event)
    
    // Add reminder events if enabled
    if (habit.reminder && habit.reminderTime) {
      const [hours, minutes] = habit.reminderTime.split(':').map(Number)
      const reminderDate = new Date(startDate)
      reminderDate.setHours(hours, minutes, 0, 0)
      
      events.push({
        id: `reminder-${habit.id}`,
        title: `🔔 Reminder: ${habit.name}`,
        description: `Time to complete your habit: ${habit.name}`,
        startDate: reminderDate,
        allDay: false,
        categories: ['reminder', 'habit'],
        recurrence: {
          frequency: habit.frequency === 'daily' ? 'daily' : 'weekly',
          interval: 1,
          endDate: endDate,
          byDay: habit.frequency === 'custom' ? habit.customFrequency?.days : undefined
        }
      })
    }
    
    return events
  }
  
  /**
   * Generate iCal content from events
   */
  static generateICS(events: CalendarEvent[], calendarName: string): string {
    let ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Fitness Challenge Platform//Calendar Service//EN',
      `X-WR-CALNAME:${calendarName}`,
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ]
    
    events.forEach(event => {
      ics.push(
        'BEGIN:VEVENT',
        `UID:${event.id}`,
        `DTSTAMP:${this.formatDate(new Date())}`,
        `DTSTART:${this.formatDate(event.startDate)}`,
        event.endDate ? `DTEND:${this.formatDate(event.endDate)}` : '',
        event.allDay ? 'X-MICROSOFT-CDO-ALLDAYEVENT:TRUE' : '',
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
        event.location ? `LOCATION:${event.location}` : '',
        event.url ? `URL:${event.url}` : '',
        event.categories.length > 0 ? `CATEGORIES:${event.categories.join(',')}` : '',
        this.generateRecurrenceRule(event.recurrence),
        'END:VEVENT'
      )
    })
    
    ics.push('END:VCALENDAR')
    
    return ics.filter(line => line !== '').join('\r\n')
  }
  
  /**
   * Generate recurrence rule for iCal
   */
  static generateRecurrenceRule(recurrence?: CalendarEvent['recurrence']): string {
    if (!recurrence) return ''
    
    let rule = 'RRULE:FREQ='
    
    switch (recurrence.frequency) {
      case 'daily':
        rule += 'DAILY'
        break
      case 'weekly':
        rule += 'WEEKLY'
        break
      case 'monthly':
        rule += 'MONTHLY'
        break
      case 'yearly':
        rule += 'YEARLY'
        break
    }
    
    if (recurrence.interval && recurrence.interval > 1) {
      rule += `;INTERVAL=${recurrence.interval}`
    }
    
    if (recurrence.byDay && recurrence.byDay.length > 0) {
      const days = recurrence.byDay.map(day => {
        const dayNames = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']
        return dayNames[day % 7]
      })
      rule += `;BYDAY=${days.join(',')}`
    }
    
    if (recurrence.endDate) {
      rule += `;UNTIL=${this.formatDate(recurrence.endDate)}`
    }
    
    return rule
  }
  
  /**
   * Format date for iCal
   */
  static formatDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }
  
  /**
   * Download calendar file
   */
  static downloadCalendar(icsContent: string, filename: string): void {
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  }
  
  /**
   * Get calendar preview for a challenge
   */
  static getChallengeCalendarPreview(challenge: Challenge, habits: Habit[]): CalendarEvent[] {
    const events: CalendarEvent[] = []
    
    // Add challenge events
    if (challenge.startDate) {
      events.push({
        id: `challenge-start-${challenge.id}`,
        title: `🎯 ${challenge.name} - Challenge Starts!`,
        description: `Your fitness challenge begins today!`,
        startDate: new Date(challenge.startDate),
        allDay: true,
        categories: ['challenge', 'start']
      })
    }
    
    if (challenge.endDate) {
      events.push({
        id: `challenge-end-${challenge.id}`,
        title: `🏆 ${challenge.name} - Challenge Ends!`,
        description: `Final day of your challenge!`,
        startDate: new Date(challenge.endDate),
        allDay: true,
        categories: ['challenge', 'end']
      })
    }
    
    // Add sample habit events (next 7 days)
    habits.slice(0, 3).forEach((habit, index) => {
      if (habit.active) {
        const startDate = new Date()
        startDate.setDate(startDate.getDate() + index)
        
        events.push({
          id: `habit-preview-${habit.id}`,
          title: `✅ ${habit.name}`,
          description: `Daily habit: ${habit.description}`,
          startDate: startDate,
          allDay: false,
          categories: ['habit', 'fitness']
        })
      }
    })
    
    return events.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
  }
}
