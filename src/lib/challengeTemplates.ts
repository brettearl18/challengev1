import { ChallengeTemplate } from '@/src/types'

export const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  {
    id: '30-day-fitness-bootcamp',
    name: '30-Day Fitness Bootcamp',
    description: 'Transform your fitness in just 30 days with this comprehensive bootcamp. Perfect for beginners looking to build healthy habits and see real results.',
    challengeType: 'fitness',
    durationDays: 30,
    scoring: {
      checkinPoints: 15,
      workoutPoints: 25,
      nutritionPoints: 20,
      stepsBuckets: [6000, 8000, 10000, 12000],
      weightLossPoints: 30,
      consistencyBonus: 10,
      streakMultiplier: 1.2
    },
    requirements: {
      minAge: 18,
      fitnessLevel: 'beginner',
      equipment: ['comfortable shoes', 'water bottle'],
      medicalClearance: false
    },
    tags: ['beginner-friendly', '30-day', 'bootcamp', 'habits'],
    isPublic: true,
    createdBy: 'system',
    createdAt: Date.now(),
    usageCount: 0
  },
  {
    id: 'weight-loss-transformation',
    name: 'Weight Loss Transformation',
    description: 'A science-based approach to sustainable weight loss with nutrition guidance, workout plans, and progress tracking.',
    challengeType: 'weight-loss',
    durationDays: 60,
    scoring: {
      checkinPoints: 20,
      workoutPoints: 30,
      nutritionPoints: 35,
      stepsBuckets: [8000, 10000, 12000, 15000],
      weightLossPoints: 50,
      consistencyBonus: 15,
      streakMultiplier: 1.3
    },
    requirements: {
      minAge: 18,
      fitnessLevel: 'beginner',
      equipment: ['scale', 'measuring tape', 'comfortable workout clothes'],
      medicalClearance: true
    },
    tags: ['weight-loss', 'nutrition', '60-day', 'transformation'],
    isPublic: true,
    createdBy: 'system',
    createdAt: Date.now(),
    usageCount: 0
  },
  {
    id: 'strength-building-program',
    name: 'Strength Building Program',
    description: 'Build muscle and increase strength with progressive resistance training. Suitable for intermediate to advanced fitness levels.',
    challengeType: 'strength',
    durationDays: 90,
    scoring: {
      checkinPoints: 15,
      workoutPoints: 40,
      nutritionPoints: 25,
      stepsBuckets: [5000, 7000, 9000],
      weightLossPoints: 20,
      consistencyBonus: 20,
      streakMultiplier: 1.4
    },
    requirements: {
      minAge: 18,
      fitnessLevel: 'intermediate',
      equipment: ['dumbbells', 'resistance bands', 'bench'],
      medicalClearance: true
    },
    tags: ['strength', 'muscle-building', '90-day', 'progressive'],
    isPublic: true,
    createdBy: 'system',
    createdAt: Date.now(),
    usageCount: 0
  },
  {
    id: 'wellness-journey',
    name: 'Wellness Journey',
    description: 'Holistic approach to wellness including mental health, sleep, nutrition, and gentle movement. Perfect for stress relief and overall wellbeing.',
    challengeType: 'wellness',
    durationDays: 45,
    scoring: {
      checkinPoints: 20,
      workoutPoints: 15,
      nutritionPoints: 25,
      stepsBuckets: [4000, 6000, 8000],
      weightLossPoints: 10,
      consistencyBonus: 25,
      streakMultiplier: 1.1
    },
    requirements: {
      minAge: 16,
      fitnessLevel: 'beginner',
      equipment: ['meditation app', 'journal', 'comfortable space'],
      medicalClearance: false
    },
    tags: ['wellness', 'mental-health', 'holistic', 'stress-relief'],
    isPublic: true,
    createdBy: 'system',
    createdAt: Date.now(),
    usageCount: 0
  },
  {
    id: 'endurance-challenge',
    name: 'Endurance Challenge',
    description: 'Build cardiovascular endurance and stamina through running, cycling, and HIIT workouts. Challenge yourself to go further and faster.',
    challengeType: 'endurance',
    durationDays: 75,
    scoring: {
      checkinPoints: 15,
      workoutPoints: 35,
      nutritionPoints: 20,
      stepsBuckets: [10000, 12000, 15000, 20000],
      weightLossPoints: 15,
      consistencyBonus: 15,
      streakMultiplier: 1.25
    },
    requirements: {
      minAge: 18,
      fitnessLevel: 'intermediate',
      equipment: ['running shoes', 'fitness tracker', 'water bottle'],
      medicalClearance: true
    },
    tags: ['endurance', 'cardio', 'running', 'HIIT', '75-day'],
    isPublic: true,
    createdBy: 'system',
    createdAt: Date.now(),
    usageCount: 0
  }
]

export const getTemplateById = (id: string): ChallengeTemplate | undefined => {
  return CHALLENGE_TEMPLATES.find(template => template.id === id)
}

export const getTemplatesByType = (type: string): ChallengeTemplate[] => {
  return CHALLENGE_TEMPLATES.filter(template => template.challengeType === type)
}

export const getPopularTemplates = (limit: number = 5): ChallengeTemplate[] => {
  return [...CHALLENGE_TEMPLATES]
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, limit)
}

