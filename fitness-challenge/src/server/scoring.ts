export interface ScoringConfig {
  checkinPoints: number
  workoutPoints: number
  nutritionPoints: number
  stepsBuckets: number[]
  weightLossPoints?: number
  consistencyBonus?: number
  streakMultiplier?: number
  challengeType: 'fitness' | 'weight-loss' | 'wellness' | 'strength' | 'endurance'
}

export interface CheckinData {
  steps?: number
  workouts?: number
  nutritionScore?: number
  weightKg?: number
  sleepHours?: number
  waterIntake?: number
  meditationMinutes?: number
  previousWeight?: number
  streakDays?: number
}

export interface ScoreResult {
  totalScore: number
  breakdown: {
    checkin: number
    workouts: number
    nutrition: number
    steps: number
    weightLoss?: number
    consistency?: number
    streak?: number
  }
  bonusMultipliers: {
    streak?: number
    consistency?: number
    challengeType?: number
  }
}

export function computeScore(
  config: ScoringConfig,
  data: CheckinData
): ScoreResult {
  let totalScore = 0
  const breakdown: ScoreResult['breakdown'] = {
    checkin: config.checkinPoints,
    workouts: 0,
    nutrition: 0,
    steps: 0,
    weightLoss: 0,
    consistency: 0,
    streak: 0
  }

  // Base check-in points
  totalScore += config.checkinPoints

  // Workout points (capped at 2 per day)
  if (typeof data.workouts === 'number') {
    const workoutScore = Math.min(data.workouts, 2) * config.workoutPoints
    breakdown.workouts = workoutScore
    totalScore += workoutScore
  }

  // Nutrition points (0-10 scale)
  if (typeof data.nutritionScore === 'number') {
    const nutritionScore = Math.round((data.nutritionScore / 10) * config.nutritionPoints)
    breakdown.nutrition = nutritionScore
    totalScore += nutritionScore
  }

  // Steps bonus points
  if (typeof data.steps === 'number') {
    const stepsScore = config.stepsBuckets.filter(bucket => data.steps! >= bucket).length * 2
    breakdown.steps = stepsScore
    totalScore += stepsScore
  }

  // Weight loss points (if applicable)
  if (config.weightLossPoints && typeof data.weightKg === 'number' && typeof data.previousWeight === 'number') {
    const weightLoss = data.previousWeight - data.weightKg
    if (weightLoss > 0) {
      const weightLossScore = Math.min(weightLoss * config.weightLossPoints, config.weightLossPoints * 2) // Cap at 2kg
      breakdown.weightLoss = weightLossScore
      totalScore += weightLossScore
    }
  }

  // Consistency bonus
  if (config.consistencyBonus && typeof data.streakDays === 'number') {
    const consistencyScore = Math.min(data.streakDays * 0.5, config.consistencyBonus)
    breakdown.consistency = consistencyScore
    totalScore += consistencyScore
  }

  // Streak multiplier
  let streakMultiplier = 1
  if (config.streakMultiplier && typeof data.streakDays === 'number' && data.streakDays >= 7) {
    streakMultiplier = 1 + (Math.floor(data.streakDays / 7) * 0.1) // +10% per week
    breakdown.streak = streakMultiplier
  }

  // Challenge type bonus
  let challengeTypeMultiplier = 1
  if (data.workouts && data.workouts > 0) {
    switch (config.challengeType) {
      case 'strength':
        if (data.workouts >= 3) challengeTypeMultiplier = 1.2 // +20% for strength challenges
        break
      case 'endurance':
        if (data.steps && data.steps >= 10000) challengeTypeMultiplier = 1.15 // +15% for endurance
        break
      case 'wellness':
        if (data.meditationMinutes && data.meditationMinutes >= 10) challengeTypeMultiplier = 1.1 // +10% for wellness
        break
    }
  }

  // Apply multipliers
  totalScore = Math.round(totalScore * streakMultiplier * challengeTypeMultiplier)

  return {
    totalScore,
    breakdown,
    bonusMultipliers: {
      streak: streakMultiplier,
      consistency: challengeTypeMultiplier
    }
  }
}

// Specialized scoring functions for different challenge types
export function computeFitnessScore(config: ScoringConfig, data: CheckinData): ScoreResult {
  return computeScore({ ...config, challengeType: 'fitness' }, data)
}

export function computeWeightLossScore(config: ScoringConfig, data: CheckinData): ScoreResult {
  return computeScore({ 
    ...config, 
    challengeType: 'weight-loss',
    weightLossPoints: config.weightLossPoints || 5
  }, data)
}

export function computeWellnessScore(config: ScoringConfig, data: CheckinData): ScoreResult {
  // Wellness challenges focus on holistic health
  const wellnessData = {
    ...data,
    nutritionScore: data.nutritionScore || 0,
    sleepHours: data.sleepHours || 0,
    waterIntake: data.waterIntake || 0,
    meditationMinutes: data.meditationMinutes || 0
  }
  
  return computeScore({ ...config, challengeType: 'wellness' }, wellnessData)
}

export function computeStrengthScore(config: ScoringConfig, data: CheckinData): ScoreResult {
  // Strength challenges emphasize workout consistency
  const strengthData = {
    ...data,
    workouts: (data.workouts || 0) * 1.5 // Boost workout points for strength challenges
  }
  
  return computeScore({ ...config, challengeType: 'strength' }, strengthData)
}

export function computeEnduranceScore(config: ScoringConfig, data: CheckinData): ScoreResult {
  // Endurance challenges focus on steps and sustained activity
  const enduranceData = {
    ...data,
    steps: data.steps || 0
  }
  
  return computeScore({ ...config, challengeType: 'endurance' }, enduranceData)
}

// Weekly and monthly scoring aggregations
export function computeWeeklyScore(config: ScoringConfig, weekData: CheckinData[]): ScoreResult {
  const weeklyTotals = weekData.reduce((acc, day) => {
    const dayScore = computeScore(config, day)
    return {
      totalScore: acc.totalScore + dayScore.totalScore,
      breakdown: {
        checkin: acc.breakdown.checkin + dayScore.breakdown.checkin,
        workouts: acc.breakdown.workouts + dayScore.breakdown.workouts,
        nutrition: acc.breakdown.nutrition + dayScore.breakdown.nutrition,
        steps: acc.breakdown.steps + dayScore.breakdown.steps,
        weightLoss: (acc.breakdown.weightLoss || 0) + (dayScore.breakdown.weightLoss || 0),
        consistency: (acc.breakdown.consistency || 0) + (dayScore.breakdown.consistency || 0),
        streak: (acc.breakdown.streak || 0) + (dayScore.breakdown.streak || 0)
      }
    }
  }, {
    totalScore: 0,
    breakdown: {
      checkin: 0,
      workouts: 0,
      nutrition: 0,
      steps: 0,
      weightLoss: 0,
      consistency: 0,
      streak: 0
    }
  })

  // Weekly bonus for consistency
  const weeklyBonus = weekData.length >= 5 ? config.checkinPoints * 2 : 0
  weeklyTotals.totalScore += weeklyBonus

  return {
    totalScore: weeklyTotals.totalScore,
    breakdown: weeklyTotals.breakdown,
    bonusMultipliers: {
      consistency: weekData.length >= 5 ? 1.1 : 1
    }
  }
}

// Helper function to get challenge type from challenge data
export function getChallengeType(challenge: any): 'fitness' | 'weight-loss' | 'wellness' | 'strength' | 'endurance' {
  if (challenge.challengeType) return challenge.challengeType
  
  // Infer from challenge name or description
  const name = challenge.name?.toLowerCase() || ''
  const description = challenge.description?.toLowerCase() || ''
  
  if (name.includes('weight') || name.includes('loss') || description.includes('weight')) {
    return 'weight-loss'
  }
  if (name.includes('strength') || name.includes('muscle') || description.includes('strength')) {
    return 'strength'
  }
  if (name.includes('endurance') || name.includes('cardio') || description.includes('endurance')) {
    return 'endurance'
  }
  if (name.includes('wellness') || name.includes('mindfulness') || description.includes('wellness')) {
    return 'wellness'
  }
  
  return 'fitness' // default
} 