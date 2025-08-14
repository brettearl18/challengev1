import { ChallengeTemplate } from '@/src/types'

export const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  {
    id: '30-day-fitness-bootcamp',
    name: '30-Day Fitness Bootcamp',
    description: 'Transform your fitness in just 30 days with this comprehensive bootcamp. Perfect for beginners looking to build healthy habits and see real results.',
    challengeType: 'fitness',
    challengeTypes: ['fitness'],
    gender: 'all',
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
      medicalClearance: false,
      requiresHealthBaseline: false,
      requiresBeforePhotos: false,
      requiresProgressPhotos: false,
      healthMetrics: {
        weight: true,
        height: true,
        bodyMeasurements: true,
        activityLevel: true,
        skillLevel: true
      },
      timeCommitment: 'medium',
      location: 'anywhere',
      groupSize: 'individual'
    },
    tags: ['beginner', 'transformation', 'habit-building'],
    isPublic: true,
    createdBy: 'system',
    createdAt: Date.now(),
    usageCount: 0,
    marketplace: {
      isPublished: true,
      priceCents: 0,
      currency: 'USD',
      qualityTier: 'free',
      category: 'fitness',
      difficulty: 'beginner',
      estimatedResults: ['Improved fitness', 'Better habits', 'Increased energy'],
      timeCommitment: 'medium',
      equipmentRequired: ['comfortable shoes', 'water bottle'],
      successMetrics: {
        averageCompletionRate: 75,
        averageParticipantSatisfaction: 4.5,
        averageResults: 'Improved fitness',
        totalChallengesCreated: 0
      },
      licensing: { type: 'free', terms: 'Free for personal use', attributionRequired: false, modificationAllowed: true, commercialUse: false }
    },
    content: {
      overview: 'Transform your fitness in just 30 days with this comprehensive bootcamp.',
      weeklyPlans: [],
      nutritionGuidance: {
        mealPlans: [],
        supplements: [],
        hydration: '8-10 glasses of water daily'
      },
      habitBuilding: {
        dailyHabits: ['Morning workout', 'Track nutrition', 'Stay hydrated'],
        weeklyHabits: ['Weigh-in', 'Progress photos', 'Recovery day'],
        trackingMethods: ['App logging', 'Photo documentation', 'Measurement tracking'],
        motivationTips: ['Start small', 'Be consistent', 'Celebrate progress']
      },
      progressTracking: {
        metrics: ['Weight', 'Body measurements', 'Progress photos', 'Workout performance'],
        checkpoints: []
      }
    },
    creator: {
      name: 'Fitness Challenge Team',
      bio: 'Expert fitness professionals with years of experience in program design',
      credentials: ['Certified Personal Trainers', 'Nutrition Specialists', 'Sports Scientists'],
      profileImage: '/api/placeholder/100/100'
    }
  },
  {
    id: 'weight-loss-transformation',
    name: 'Weight Loss Transformation',
    description: 'A science-based approach to sustainable weight loss with nutrition guidance, workout plans, and progress tracking.',
    challengeType: 'weight-loss',
    challengeTypes: ['weight-loss'],
    gender: 'all',
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
      medicalClearance: true,
      requiresHealthBaseline: true,
      requiresBeforePhotos: true,
      requiresProgressPhotos: true,
      healthMetrics: {
        weight: true,
        height: true,
        bodyMeasurements: true,
        activityLevel: true,
        skillLevel: true
      },
      timeCommitment: 'high',
      location: 'anywhere',
      groupSize: 'individual'
    },
    tags: ['weight-loss', 'nutrition', 'transformation'],
    isPublic: true,
    createdBy: 'system',
    createdAt: Date.now(),
    usageCount: 0,
    marketplace: {
      isPublished: true,
      priceCents: 0,
      currency: 'USD',
      qualityTier: 'free',
      category: 'weight-loss',
      difficulty: 'beginner',
      estimatedResults: ['5-15 lbs weight loss', 'Improved nutrition', 'Better habits'],
      timeCommitment: 'high',
      equipmentRequired: ['scale', 'measuring tape', 'comfortable workout clothes'],
      successMetrics: { averageCompletionRate: 70, averageParticipantSatisfaction: 4.6, averageResults: '8 lbs weight loss', totalChallengesCreated: 0 },
      licensing: { type: 'free', terms: 'Free for personal use', attributionRequired: false, modificationAllowed: true, commercialUse: false }
    },
    content: { overview: 'Science-based weight loss transformation program.', weeklyPlans: [], nutritionGuidance: { mealPlans: [], supplements: [], hydration: '8-10 glasses of water daily' }, habitBuilding: { dailyHabits: [], weeklyHabits: [], trackingMethods: [], motivationTips: [] }, progressTracking: { metrics: [], checkpoints: [] } },
    creator: { name: 'Fitness Challenge Team', bio: 'Expert fitness professionals', credentials: ['Certified Personal Trainers', 'Nutrition Specialists'], profileImage: '/api/placeholder/100/100' }
  },
  {
    id: 'strength-building-program',
    name: 'Strength Building Program',
    description: 'Build muscle and increase strength with progressive resistance training. Suitable for intermediate to advanced fitness levels.',
    challengeType: 'strength',
    challengeTypes: ['strength'],
    gender: 'all',
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
      medicalClearance: true,
      requiresHealthBaseline: true,
      requiresBeforePhotos: true,
      requiresProgressPhotos: true,
      healthMetrics: {
        weight: true,
        height: true,
        bodyMeasurements: true,
        activityLevel: true,
        skillLevel: true
      },
      timeCommitment: 'high',
      location: 'gym',
      groupSize: 'individual'
    },
    tags: ['strength', 'muscle-gain', 'performance'],
    isPublic: true,
    createdBy: 'system',
    createdAt: Date.now(),
    usageCount: 0,
    marketplace: { isPublished: true, priceCents: 0, currency: 'USD', qualityTier: 'free', category: 'strength', difficulty: 'intermediate', estimatedResults: ['Increased strength', 'Muscle growth', 'Better form'], timeCommitment: 'high', equipmentRequired: ['dumbbells', 'resistance bands', 'bench'], successMetrics: { averageCompletionRate: 65, averageParticipantSatisfaction: 4.7, averageResults: 'Increased strength', totalChallengesCreated: 0 }, licensing: { type: 'free', terms: 'Free for personal use', attributionRequired: false, modificationAllowed: true, commercialUse: false } },
    content: { overview: 'Build muscle and increase strength with progressive resistance training.', weeklyPlans: [], nutritionGuidance: { mealPlans: [], supplements: [], hydration: '8-10 glasses of water daily' }, habitBuilding: { dailyHabits: [], weeklyHabits: [], trackingMethods: [], motivationTips: [] }, progressTracking: { metrics: [], checkpoints: [] } },
    creator: { name: 'Fitness Challenge Team', bio: 'Expert fitness professionals', credentials: ['Certified Personal Trainers', 'Strength Coaches'], profileImage: '/api/placeholder/100/100' }
  },
  {
    id: 'wellness-journey',
    name: 'Wellness Journey',
    description: 'Holistic approach to wellness including mental health, sleep, nutrition, and gentle movement. Perfect for stress relief and overall wellbeing.',
    challengeType: 'wellness',
    challengeTypes: ['wellness'],
    gender: 'all',
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
      medicalClearance: false,
      requiresHealthBaseline: false,
      requiresBeforePhotos: false,
      requiresProgressPhotos: false,
      healthMetrics: {
        weight: false,
        height: false,
        bodyMeasurements: false,
        activityLevel: true,
        skillLevel: false
      },
      timeCommitment: 'low',
      location: 'anywhere',
      groupSize: 'individual'
    },
    tags: ['mindfulness', 'stress-relief', 'lifestyle-change', 'habit-building'],
    isPublic: true,
    createdBy: 'system',
    createdAt: Date.now(),
    usageCount: 0,
    marketplace: { isPublished: true, priceCents: 0, currency: 'USD', qualityTier: 'free', category: 'wellness', difficulty: 'beginner', estimatedResults: ['Reduced stress', 'Better sleep', 'Improved mood'], timeCommitment: 'low', equipmentRequired: ['meditation app', 'journal', 'comfortable space'], successMetrics: { averageCompletionRate: 80, averageParticipantSatisfaction: 4.8, averageResults: 'Reduced stress', totalChallengesCreated: 0 }, licensing: { type: 'free', terms: 'Free for personal use', attributionRequired: false, modificationAllowed: true, commercialUse: false } },
    content: { overview: 'Holistic approach to wellness including mental health and stress relief.', weeklyPlans: [], nutritionGuidance: { mealPlans: [], supplements: [], hydration: '8-10 glasses of water daily' }, habitBuilding: { dailyHabits: [], weeklyHabits: [], trackingMethods: [], motivationTips: [] }, progressTracking: { metrics: [], checkpoints: [] } },
    creator: { name: 'Fitness Challenge Team', bio: 'Expert wellness professionals', credentials: ['Wellness Coaches', 'Mental Health Specialists'], profileImage: '/api/placeholder/100/100' }
  },
  {
    id: 'endurance-challenge',
    name: 'Endurance Challenge',
    description: 'Build cardiovascular endurance and stamina through running, cycling, and HIIT workouts. Challenge yourself to go further and faster.',
    challengeType: 'endurance',
    challengeTypes: ['endurance'],
    gender: 'all',
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
      medicalClearance: true,
      requiresHealthBaseline: true,
      requiresBeforePhotos: false,
      requiresProgressPhotos: true,
      healthMetrics: {
        weight: true,
        height: true,
        bodyMeasurements: false,
        activityLevel: true,
        skillLevel: true
      },
      timeCommitment: 'high',
      location: 'outdoor',
      groupSize: 'individual'
    },
    tags: ['endurance', 'cardio', 'hiit', 'performance'],
    isPublic: true,
    createdBy: 'system',
    createdAt: Date.now(),
    usageCount: 0,
    marketplace: { isPublished: true, priceCents: 0, currency: 'USD', qualityTier: 'free', category: 'endurance', difficulty: 'intermediate', estimatedResults: ['Improved endurance', 'Better stamina', 'Faster times'], timeCommitment: 'high', equipmentRequired: ['running shoes', 'fitness tracker', 'water bottle'], successMetrics: { averageCompletionRate: 70, averageParticipantSatisfaction: 4.6, averageResults: 'Improved endurance', totalChallengesCreated: 0 }, licensing: { type: 'free', terms: 'Free for personal use', attributionRequired: false, modificationAllowed: true, commercialUse: false } },
    content: { overview: 'Build cardiovascular endurance and stamina through running and HIIT workouts.', weeklyPlans: [], nutritionGuidance: { mealPlans: [], supplements: [], hydration: '8-10 glasses of water daily' }, habitBuilding: { dailyHabits: [], weeklyHabits: [], trackingMethods: [], motivationTips: [] }, progressTracking: { metrics: [], checkpoints: [] } },
    creator: { name: 'Fitness Challenge Team', bio: 'Expert endurance coaches', credentials: ['Running Coaches', 'Endurance Specialists'], profileImage: '/api/placeholder/100/100' }
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

