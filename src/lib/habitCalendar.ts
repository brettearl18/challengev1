import { Habit, Challenge } from '../types'

export interface HabitCalendarEvent {
  id: string
  title: string
  description: string
  startDate: Date
  endDate: Date
  allDay: boolean
  recurrence?: string
  color: string
  habitId: string
  challengeId: string
  category: string
}

export interface HabitCalendarExport {
  events: HabitCalendarEvent[]
  icsContent: string
  fileName: string
}

export class HabitCalendarService {
  /**
   * Generate calendar events for a habit within a challenge timeframe
   */
  static generateHabitCalendar(
    habit: Habit,
    challenge: Challenge,
    timezone: string = 'Australia/Perth'
  ): HabitCalendarEvent[] {
    if (!habit.calendarIntegration?.enabled || !challenge.startDate) {
      console.log('Calendar generation skipped:', {
        calendarEnabled: habit.calendarIntegration?.enabled,
        hasStartDate: !!challenge.startDate
      })
      return []
    }

    const events: HabitCalendarEvent[] = []
    const startDate = new Date(challenge.startDate)
    const endDate = challenge.endDate 
      ? new Date(challenge.endDate)
      : new Date(startDate.getTime() + (challenge.durationDays || 30) * 24 * 60 * 60 * 1000)

    // Validate dates
    if (isNaN(startDate.getTime())) {
      console.error('Invalid start date:', challenge.startDate)
      return []
    }
    
    if (isNaN(endDate.getTime())) {
      console.error('Invalid end date:', challenge.endDate)
      return []
    }

    console.log('Generating calendar events:', {
      habitName: habit.name,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      durationDays: challenge.durationDays
    })

    // Get habit schedule
    const schedule = this.getHabitSchedule(habit, startDate, endDate)
    console.log('Generated schedule:', schedule.length, 'dates')
    
    // Generate events for each scheduled day
    schedule.forEach((date, index) => {
      const event: HabitCalendarEvent = {
        id: `habit-${habit.id}-${index}`,
        title: habit.calendarIntegration?.eventTitle || habit.name,
        description: this.generateEventDescription(habit, challenge),
        startDate: date,
        endDate: new Date(date.getTime() + 30 * 60 * 1000), // 30 min default
        allDay: false,
        color: habit.calendarIntegration?.color || this.getCategoryColor(habit.category),
        habitId: habit.id,
        challengeId: challenge.id,
        category: habit.category
      }

      // Add recurrence rule if applicable
      if (habit.frequency === 'daily' || habit.frequency === 'weekly') {
        event.recurrence = this.generateRecurrenceRule(habit, startDate, endDate)
      }

      events.push(event)
    })

    return events
  }

  /**
   * Get the schedule of dates for a habit based on its frequency
   */
  private static getHabitSchedule(habit: Habit, startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = []
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      if (this.shouldIncludeDate(habit, currentDate, startDate)) {
        dates.push(new Date(currentDate))
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return dates
  }

  /**
   * Determine if a specific date should include this habit
   */
  private static shouldIncludeDate(habit: Habit, date: Date, challengeStartDate: Date): boolean {
    const dayOfWeek = date.getDay() // 0 = Sunday, 1 = Monday, etc.

    switch (habit.frequency) {
      case 'daily':
        return true
      
      case 'weekly':
        // Weekly habits occur on the same day of week as the challenge start date
        const challengeStartDayOfWeek = challengeStartDate.getDay()
        return dayOfWeek === challengeStartDayOfWeek
      
      case 'custom':
        if (habit.customFrequency?.days) {
          // Convert day numbers to match JavaScript Date.getDay()
          // 1 = Monday, 2 = Tuesday, etc. -> 1 = Monday, 2 = Tuesday, etc.
          return habit.customFrequency.days.includes(dayOfWeek === 0 ? 7 : dayOfWeek)
        }
        return false
      
      default:
        return false
    }
  }

  /**
   * Generate recurrence rule for calendar events
   */
  private static generateRecurrenceRule(habit: Habit, startDate: Date, endDate: Date): string {
    // Validate dates before calling toISOString
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error('Invalid dates in generateRecurrenceRule:', { startDate, endDate })
      return ''
    }
    
    const endDateStr = endDate.toISOString().split('T')[0].replace(/-/g, '')

    switch (habit.frequency) {
      case 'daily':
        return `FREQ=DAILY;UNTIL=${endDateStr}`
      
      case 'weekly':
        const dayOfWeek = startDate.getDay()
        const dayNames = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']
        return `FREQ=WEEKLY;BYDAY=${dayNames[dayOfWeek]};UNTIL=${endDateStr}`
      
      default:
        return ''
    }
  }

  /**
   * Generate event description with habit and challenge details
   */
  private static generateEventDescription(habit: Habit, challenge: Challenge): string {
    let description = `${habit.description}\n\n`
    
    if (habit.target) {
      description += `Target: ${habit.target.value}${habit.target.unit ? ' ' + habit.target.unit : ''}\n`
    }
    
    description += `Points: ${habit.points} pts\n`
    description += `Challenge: ${challenge.name}\n`
    
    if (habit.reminder && habit.reminderTime) {
      description += `Reminder: ${habit.reminderTime}`
    }
    
    return description
  }

  /**
   * Get color for habit category
   */
  private static getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      fitness: '#3B82F6',      // Blue
      nutrition: '#10B981',    // Green
      wellness: '#8B5CF6',     // Purple
      lifestyle: '#F59E0B'     // Amber
    }
    return colors[category] || '#6B7280' // Gray default
  }

  /**
   * Generate iCal content for habit events
   */
  static generateHabitICS(events: HabitCalendarEvent[]): string {
    if (events.length === 0) return ''

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Fitness Challenge Platform//Habit Calendar//EN',
      'X-WR-CALNAME:My Fitness Habits',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ]

    events.forEach(event => {
      // Validate dates before calling toISOString
      if (isNaN(event.startDate.getTime()) || isNaN(event.endDate.getTime())) {
        console.error('Invalid dates in event:', event)
        return // Skip this event
      }
      
      const eventContent = [
        'BEGIN:VEVENT',
        `UID:${event.id}`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `DTSTART:${event.startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `DTEND:${event.endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
        `CATEGORIES:${event.category}`,
        `COLOR:${event.color}`,
        event.allDay ? 'X-MICROSOFT-CDO-ALLDAYEVENT:TRUE' : '',
        event.recurrence ? `RRULE:${event.recurrence}` : '',
        'END:VEVENT'
      ]
      
      icsContent.push(...eventContent.filter(line => line !== ''))
    })

    icsContent.push('END:VCALENDAR')
    return icsContent.join('\r\n')
  }

  /**
   * Download habit calendar as iCal file
   */
  static downloadHabitCalendar(events: HabitCalendarEvent[], fileName?: string): void {
    const icsContent = this.generateHabitICS(events)
    if (!icsContent) return

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = fileName || 'my_fitness_habits.ics'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  }

  /**
   * Get calendar preview for a habit
   */
  static getHabitCalendarPreview(
    habit: Habit,
    challenge: Challenge,
    previewDays: number = 7
  ): HabitCalendarEvent[] {
    if (!challenge.startDate) return []

    const startDate = new Date(challenge.startDate)
    const endDate = new Date(startDate.getTime() + previewDays * 24 * 60 * 60 * 1000)
    
    // Validate the calculated end date
    if (isNaN(endDate.getTime())) {
      console.error('Invalid calculated end date:', endDate)
      return []
    }
    
    return this.generateHabitCalendar(habit, { ...challenge, endDate: endDate.toISOString() })
  }

  /**
   * Toggle calendar integration for a habit
   */
  static toggleCalendarIntegration(habit: Habit, enabled: boolean): Habit {
    return {
      ...habit,
      calendarIntegration: {
        enabled,
        eventTitle: habit.calendarIntegration?.eventTitle || habit.name,
        eventDescription: habit.calendarIntegration?.eventDescription || habit.description,
        reminderMinutes: habit.calendarIntegration?.reminderMinutes || 15,
        color: habit.calendarIntegration?.color || this.getCategoryColor(habit.category)
      }
    }
  }

  /**
   * Update calendar settings for a habit
   */
  static updateCalendarSettings(
    habit: Habit,
    settings: Partial<Habit['calendarIntegration']>
  ): Habit {
    return {
      ...habit,
      calendarIntegration: {
        ...habit.calendarIntegration,
        ...settings
      }
    }
  }
}
