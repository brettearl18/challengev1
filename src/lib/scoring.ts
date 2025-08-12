import { Challenge, Checkin } from '../types'

export function computeScore(input: {
  checkinPoints: number
  workoutPoints: number
  nutritionPoints: number
  stepsBuckets: number[]
  steps?: number
  workouts?: number
  nutritionScore?: number
  weightKg?: number
  sleepHours?: number
  waterIntake?: number
  meditationMinutes?: number
  consistencyBonus?: number
  streakMultiplier?: number
  currentStreak?: number
}) {
  const { 
    checkinPoints, 
    workoutPoints, 
    nutritionPoints, 
    stepsBuckets, 
    steps, 
    workouts, 
    nutritionScore,
    weightKg,
    sleepHours,
    waterIntake,
    meditationMinutes,
    consistencyBonus = 0,
    streakMultiplier = 1,
    currentStreak = 0
  } = input
  
  let score = checkinPoints
  
  // Workout points
  if (typeof workouts === 'number') {
    score += Math.min(workouts, 2) * workoutPoints
  }
  
  // Nutrition points
  if (typeof nutritionScore === 'number') {
    score += Math.round((nutritionScore / 10) * nutritionPoints)
  }
  
  // Steps points
  if (typeof steps === 'number') {
    const bucket = stepsBuckets.filter(b => steps >= b).length
    score += bucket * 2
  }
  
  // Sleep bonus (7-9 hours is optimal)
  if (typeof sleepHours === 'number') {
    if (sleepHours >= 7 && sleepHours <= 9) {
      score += 2
    } else if (sleepHours >= 6 && sleepHours <= 10) {
      score += 1
    }
  }
  
  // Water intake bonus (2+ liters is good)
  if (typeof waterIntake === 'number' && waterIntake >= 2) {
    score += 1
  }
  
  // Meditation bonus
  if (typeof meditationMinutes === 'number' && meditationMinutes >= 10) {
    score += 1
  }
  
  // Consistency bonus
  if (consistencyBonus > 0) {
    score += consistencyBonus
  }
  
  // Streak multiplier
  if (streakMultiplier > 1 && currentStreak > 0) {
    score = Math.round(score * streakMultiplier)
  }
  
  return score
}

export function calculateStreak(checkins: Checkin[]): { currentStreak: number; longestStreak: number } {
  if (checkins.length === 0) return { currentStreak: 0, longestStreak: 0 }
  
  // Sort checkins by date
  const sortedCheckins = [...checkins].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  
  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0
  
  for (let i = 0; i < sortedCheckins.length; i++) {
    const currentDate = new Date(sortedCheckins[i].date)
    
    if (i === 0) {
      // First checkin
      tempStreak = 1
      currentStreak = 1
    } else {
      const prevDate = new Date(sortedCheckins[i - 1].date)
      const diffDays = Math.floor((prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) {
        // Consecutive day
        tempStreak++
        if (i === sortedCheckins.length - 1) {
          currentStreak = tempStreak
        }
      } else {
        // Break in streak
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 1
      }
    }
  }
  
  longestStreak = Math.max(longestStreak, tempStreak)
  
  return { currentStreak, longestStreak }
}

export function calculateRankings(participants: Array<{ userId: string; totalScore: number; displayName?: string }>) {
  // Sort by score (descending)
  const sorted = [...participants].sort((a, b) => b.totalScore - a.totalScore)
  
  // Assign ranks (handle ties)
  let currentRank = 1
  let currentScore = sorted[0]?.totalScore
  
  return sorted.map((participant, index) => {
    if (index > 0 && participant.totalScore < currentScore!) {
      currentRank = index + 1
      currentScore = participant.totalScore
    }
    
    return {
      ...participant,
      rank: currentRank
    }
  })
}

export function getProgressPercentage(startDate: string, endDate: string): number {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  if (now < start) return 0
  if (now > end) return 100
  
  const totalDuration = end.getTime() - start.getTime()
  const elapsed = now.getTime() - start.getTime()
  
  return Math.round((elapsed / totalDuration) * 100)
} 