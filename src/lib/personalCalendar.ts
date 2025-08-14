import { Challenge, Habit, Enrolment, Checkin } from '@/src/types'
import { CalendarEvent } from './calendar'

export interface PersonalCalendarData {
  userId: string
  enrolments: Enrolment[]
  challenges: Challenge[]
  checkins: Checkin[]
  events: CalendarEvent[]
}

export class PersonalCalendarService {
  static generatePersonalCalendar(
    userId: string,
    enrolments: Enrolment[],
    challenges: Challenge[],
    checkins: Checkin[]
  ): PersonalCalendarData {
    // Default return to ensure function always returns
    if (!userId || !enrolments || !challenges || !checkins) {
      return { userId: userId || '', enrolments: [], challenges: [], checkins: [], events: [] }
    }
    
    const events: CalendarEvent[] = []
    
    // Process enrolments
    for (const enrolment of enrolments) {
      const challenge = challenges.find(c => c.id === enrolment.challengeId)
      if (!challenge) continue
      
      if (challenge.startDate) {
        events.push({
          id: `challenge-start-${challenge.id}`,
          title: `🎯 ${challenge.name} - Challenge Starts!`,
          description: `Your fitness challenge begins today!`,
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
          description: `Final day of your challenge!`,
          startDate: new Date(challenge.endDate),
          allDay: true,
          categories: ['challenge', 'end'],
          url: `${window.location.origin}/challenge/${challenge.id}`
        })
      }
      
      if (challenge.habits) {
        for (const habit of challenge.habits) {
          if (habit.active) {
            const habitEvents = PersonalCalendarService.generateHabitEvents(habit, challenge, userId)
            events.push(...habitEvents)
          }
        }
      }
    }
    
    // Process checkins
    for (const checkin of checkins) {
      const challenge = challenges.find(c => c.id === checkin.challengeId)
      if (challenge) {
        events.push({
          id: `checkin-${checkin.id}`,
          title: `✅ Check-in: ${challenge.name}`,
          description: `Daily check-in completed`,
          startDate: new Date(checkin.createdAt),
          allDay: false,
          categories: ['checkin', 'completed'],
          url: `${window.location.origin}/checkin`
        })
      }
    }
    
    // Sort events by date
    events.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
    
    // Always return the result
    const result: PersonalCalendarData = { userId, enrolments, challenges, checkins, events }
    return result
  }
  
  static generateHabitEvents(habit: Habit, challenge: Challenge, userId: string): CalendarEvent[] {
    const events: CalendarEvent[] = []
    
    if (!challenge.startDate) return events
    
    const startDate = new Date(challenge.startDate)
    const endDate = challenge.endDate 
      ? new Date(challenge.endDate) 
      : new Date(startDate.getTime() + (challenge.durationDays || 30) * 24 * 60 * 60 * 1000)
    
    events.push({
      id: `habit-${habit.id}-${userId}`,
      title: `✅ ${habit.name}`,
      description: `${habit.description}\nChallenge: ${challenge.name}\nPoints: ${habit.points}`,
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
    })
    
    if (habit.reminder && habit.reminderTime) {
      const [hours, minutes] = habit.reminderTime.split(':').map(Number)
      const reminderDate = new Date(startDate)
      reminderDate.setHours(hours, minutes, 0, 0)
      
      events.push({
        id: `reminder-${habit.id}-${userId}`,
        title: `🔔 Reminder: ${habit.name}`,
        description: `Time to complete: ${habit.name}\nChallenge: ${challenge.name}`,
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
  
  static getUpcomingEvents(events: CalendarEvent[], days: number = 7): CalendarEvent[] {
    const now = new Date()
    const endDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
    
    return events.filter(event => {
      const eventDate = new Date(event.startDate)
      return eventDate >= now && eventDate <= endDate
    })
  }
  
  static getEventsForDate(events: CalendarEvent[], date: Date): CalendarEvent[] {
    return events.filter(event => {
      const eventDate = new Date(event.startDate)
      return eventDate.toDateString() === date.toDateString()
    })
  }
  
  static getChallengeSummary(challenges: Challenge[]) {
    const activeChallenges = challenges.filter(c => 
      c.status === 'published' && 
      c.startDate && 
      new Date(c.startDate) <= new Date()
    )
    
    const totalHabits = challenges.reduce((sum, c) => 
      sum + (c.habits?.length || 0), 0
    )
    
    const activeHabits = challenges.reduce((sum, c) => 
      sum + (c.habits?.filter(h => h.active).length || 0), 0
    )
    
    return {
      totalChallenges: challenges.length,
      activeChallenges: activeChallenges.length,
      totalHabits,
      activeHabits
    }
  }
}
