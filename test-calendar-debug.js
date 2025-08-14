// Test script to debug calendar generation
import { HabitCalendarService } from './src/lib/habitCalendar.js'

// Mock data
const mockHabit = {
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

const mockChallenge = {
  id: 'test-challenge-1',
  name: '30 Day Fitness Challenge',
  startDate: '2025-01-01',
  endDate: '2025-01-31',
  durationDays: 31
}

console.log('Testing calendar generation...')
console.log('Habit:', mockHabit.name)
console.log('Challenge:', mockChallenge.name)
console.log('Start Date:', mockChallenge.startDate)
console.log('End Date:', mockChallenge.endDate)
console.log('Duration:', mockChallenge.durationDays, 'days')

try {
  const events = HabitCalendarService.generateHabitCalendar(mockHabit, mockChallenge)
  console.log('Generated events:', events.length)
  
  if (events.length > 0) {
    console.log('First event:', events[0])
    console.log('Last event:', events[events.length - 1])
  } else {
    console.log('No events generated!')
    console.log('Habit calendar enabled:', mockHabit.calendarIntegration?.enabled)
    console.log('Challenge start date:', mockChallenge.startDate)
  }
} catch (error) {
  console.error('Error generating calendar:', error)
}
