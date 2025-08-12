import { Checkin, Challenge, Enrolment } from '@/src/types'
import { CheatDetection } from '@/src/types'

export interface ScoringInput {
  checkin: Checkin
  challenge: Challenge
  enrolment: Enrolment
  previousCheckins: Checkin[]
  teamMembers?: Enrolment[]
}

export interface ScoringResult {
  autoScore: number
  coachScore?: number
  totalScore: number
  streakBonus: number
  teamBonus: number
  cheatDetection?: CheatDetection[]
  anomalies: string[]
}

export interface StreakInfo {
  currentStreak: number
  longestStreak: number
  lastCheckinDate?: string
}

export function computeScore(input: ScoringInput): ScoringResult {
  const { checkin, challenge, enrolment, previousCheckins, teamMembers } = input
  const { scoring, antiCheat } = challenge
  
  let autoScore = 0
  const anomalies: string[] = []
  const cheatDetection: CheatDetection[] = []
  
  // Base check-in points
  autoScore += scoring.checkinPoints
  
  // Workout points (capped per day)
  if (typeof checkin.workouts === 'number') {
    const maxWorkoutsPerDay = 2
    const workoutPoints = Math.min(checkin.workouts, maxWorkoutsPerDay) * scoring.workoutPoints
    autoScore += workoutPoints
    
    if (checkin.workouts > maxWorkoutsPerDay) {
      anomalies.push(`Workouts capped at ${maxWorkoutsPerDay} per day`)
    }
  }
  
  // Nutrition score (0-10 scale)
  if (typeof checkin.nutritionScore === 'number') {
    const nutritionPoints = Math.round((checkin.nutritionScore / 10) * scoring.nutritionPoints)
    autoScore += nutritionPoints
    
    // Flag suspicious nutrition scores
    if (checkin.nutritionScore === 10 && previousCheckins.length > 0) {
      const avgNutrition = previousCheckins.reduce((sum, c) => sum + (c.nutritionScore || 0), 0) / previousCheckins.length
      if (avgNutrition < 6 && checkin.nutritionScore === 10) {
        cheatDetection.push({
          type: 'anomaly',
          confidence: 0.7,
          details: 'Nutrition score significantly higher than average',
          action: 'review'
        })
      }
    }
  }
  
  // Steps points (bucketed)
  if (typeof checkin.steps === 'number') {
    const stepsPoints = scoring.stepsBuckets.filter(bucket => checkin.steps! >= bucket).length * 2
    autoScore += stepsPoints
    
    // Flag suspicious step counts
    if (checkin.steps! > 50000) {
      cheatDetection.push({
        type: 'anomaly',
        confidence: 0.8,
        details: 'Unusually high step count',
        action: 'review'
      })
    }
    
    // Check for duplicate step counts
    const duplicateSteps = previousCheckins.filter(c => c.steps === checkin.steps && c.steps! > 0)
    if (duplicateSteps.length > 0) {
      cheatDetection.push({
        type: 'duplicate',
        confidence: 0.6,
        details: 'Step count matches previous check-ins',
        action: 'flag'
      })
    }
  }
  
  // Progress measurement points
  if (checkin.measurements || checkin.weightKg) {
    const progressPoints = calculateProgressPoints(checkin, previousCheckins, scoring.progressPoints)
    autoScore += progressPoints
  }
  
  // Streak bonus
  const streakInfo = calculateStreak(checkin.date, previousCheckins)
  const streakBonus = Math.min(streakInfo.currentStreak * scoring.streakBonus, 20) // Cap at 20 points
  autoScore += streakBonus
  
  // Team bonus (if applicable)
  let teamBonus = 0
  if (teamMembers && teamMembers.length > 1) {
    const activeTeamMembers = teamMembers.filter(m => 
      m.status === 'active' && m.checkinsCompleted > 0
    ).length
    
    if (activeTeamMembers >= 3) {
      teamBonus = scoring.teamBonus
      autoScore += teamBonus
    }
  }
  
  // Anti-cheat checks
  const antiCheatResults = performAntiCheatChecks(checkin, previousCheckins, antiCheat)
  cheatDetection.push(...antiCheatResults.detections)
  anomalies.push(...antiCheatResults.anomalies)
  
  // Calculate total score
  const totalScore = autoScore + (checkin.coachScore || 0)
  
  return {
    autoScore,
    coachScore: checkin.coachScore,
    totalScore,
    streakBonus,
    teamBonus,
    cheatDetection: cheatDetection.length > 0 ? cheatDetection : undefined,
    anomalies
  }
}

function calculateProgressPoints(
  checkin: Checkin, 
  previousCheckins: Checkin[], 
  maxPoints: number
): number {
  if (previousCheckins.length === 0) return 0
  
  let totalProgress = 0
  let measurementCount = 0
  
  // Weight progress
  if (checkin.weightKg && previousCheckins[0].weightKg) {
    const weightDiff = previousCheckins[0].weightKg - checkin.weightKg
    // Reward healthy weight loss (0.1-1kg per week)
    if (weightDiff > 0 && weightDiff <= 1) {
      totalProgress += Math.min(weightDiff * 10, 5)
    }
    measurementCount++
  }
  
  // Measurement progress
  if (checkin.measurements && previousCheckins[0].measurements) {
    const current = checkin.measurements
    const previous = previousCheckins[0].measurements
    
    Object.keys(current).forEach(key => {
      const k = key as keyof typeof current
      if (current[k] && previous[k]) {
        const diff = previous[k]! - current[k]!
        if (diff > 0 && diff <= 5) { // Reward small, realistic changes
          totalProgress += Math.min(diff * 2, 3)
        }
        measurementCount++
      }
    })
  }
  
  if (measurementCount === 0) return 0
  
  // Average progress points, capped at max
  const avgProgress = totalProgress / measurementCount
  return Math.min(Math.round(avgProgress), maxPoints)
}

function calculateStreak(currentDate: string, previousCheckins: Checkin[]): StreakInfo {
  if (previousCheckins.length === 0) {
    return { currentStreak: 1, longestStreak: 1 }
  }
  
  // Sort check-ins by date (newest first)
  const sortedCheckins = [...previousCheckins].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  
  let currentStreak = 1
  let longestStreak = 1
  let tempStreak = 1
  
  for (let i = 0; i < sortedCheckins.length - 1; i++) {
    const current = new Date(sortedCheckins[i].date)
    const next = new Date(sortedCheckins[i + 1].date)
    const diffDays = Math.floor((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) {
      tempStreak++
      currentStreak = Math.max(currentStreak, tempStreak)
    } else if (diffDays === 0) {
      // Same day check-in, don't break streak
      continue
    } else {
      longestStreak = Math.max(longestStreak, tempStreak)
      tempStreak = 1
    }
  }
  
  longestStreak = Math.max(longestStreak, tempStreak)
  
  return {
    currentStreak,
    longestStreak,
    lastCheckinDate: sortedCheckins[0]?.date
  }
}

function performAntiCheatChecks(
  checkin: Checkin, 
  previousCheckins: Checkin[], 
  antiCheat: Challenge['antiCheat']
): { detections: CheatDetection[], anomalies: string[] } {
  const detections: CheatDetection[] = []
  const anomalies: string[] = []
  
  // Cooldown check
  if (antiCheat.cooldownMinutes > 0 && previousCheckins.length > 0) {
    const lastCheckin = previousCheckins[0]
    const timeDiff = Date.now() - lastCheckin.createdAt
    const cooldownMs = antiCheat.cooldownMinutes * 60 * 1000
    
    if (timeDiff < cooldownMs) {
      detections.push({
        type: 'manual',
        confidence: 1.0,
        details: `Check-in submitted before cooldown period (${antiCheat.cooldownMinutes} minutes)`,
        action: 'block'
      })
    }
  }
  
  // Duplicate detection
  if (antiCheat.duplicateDetection) {
    const duplicateCheckins = previousCheckins.filter(c => 
      c.steps === checkin.steps &&
      c.workouts === checkin.workouts &&
      c.nutritionScore === checkin.nutritionScore &&
      c.weightKg === checkin.weightKg
    )
    
    if (duplicateCheckins.length > 0) {
      detections.push({
        type: 'duplicate',
        confidence: 0.8,
        details: 'Check-in data identical to previous submissions',
        action: 'flag'
      })
    }
  }
  
  // Anomaly detection
  if (antiCheat.anomalyThreshold > 0) {
    const anomalies = detectAnomalies(checkin, previousCheckins)
    anomalies.forEach(anomaly => {
      if (anomaly.confidence > antiCheat.anomalyThreshold) {
        detections.push({
          type: 'anomaly',
          confidence: anomaly.confidence,
          details: anomaly.details,
          action: 'review'
        })
      }
    })
  }
  
  return { detections, anomalies }
}

function detectAnomalies(checkin: Checkin, previousCheckins: Checkin[]): Array<{confidence: number, details: string}> {
  const anomalies: Array<{confidence: number, details: string}> = []
  
  if (previousCheckins.length === 0) return anomalies
  
  // Calculate averages from previous check-ins
  const avgSteps = previousCheckins.reduce((sum, c) => sum + (c.steps || 0), 0) / previousCheckins.length
  const avgWorkouts = previousCheckins.reduce((sum, c) => sum + (c.workouts || 0), 0) / previousCheckins.length
  const avgNutrition = previousCheckins.reduce((sum, c) => sum + (c.nutritionScore || 0), 0) / previousCheckins.length
  
  // Steps anomaly
  if (checkin.steps && avgSteps > 0) {
    const stepsRatio = checkin.steps / avgSteps
    if (stepsRatio > 3 || stepsRatio < 0.1) {
      anomalies.push({
        confidence: Math.min(Math.abs(stepsRatio - 1) / 2, 0.9),
        details: `Step count is ${stepsRatio.toFixed(1)}x your average`
      })
    }
  }
  
  // Workout anomaly
  if (checkin.workouts && avgWorkouts > 0) {
    const workoutRatio = checkin.workouts / avgWorkouts
    if (workoutRatio > 5) {
      anomalies.push({
        confidence: Math.min(workoutRatio / 10, 0.9),
        details: `Workout count is ${workoutRatio.toFixed(1)}x your average`
      })
    }
  }
  
  // Nutrition anomaly
  if (checkin.nutritionScore && avgNutrition > 0) {
    const nutritionDiff = Math.abs(checkin.nutritionScore - avgNutrition)
    if (nutritionDiff > 4) {
      anomalies.push({
        confidence: Math.min(nutritionDiff / 10, 0.9),
        details: `Nutrition score differs by ${nutritionDiff} from your average`
      })
    }
  }
  
  return anomalies
}

// Export utility functions for testing
export { calculateProgressPoints, calculateStreak, performAntiCheatChecks, detectAnomalies } 