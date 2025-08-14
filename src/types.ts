export type Role = 'participant' | 'coach' | 'admin'

export type ChallengeType = 'fitness' | 'weight-loss' | 'wellness' | 'strength' | 'endurance'

export interface UserProfile {
  uid: string
  displayName?: string
  photoURL?: string
  email?: string
  role: Role
  timezone?: string
  createdAt: number // ms epoch
  preferences?: {
    notifications: boolean
    emailUpdates: boolean
    privacyLevel: 'public' | 'friends' | 'private'
  }
  stats?: {
    totalChallenges: number
    totalCheckins: number
    currentStreak: number
    longestStreak: number
    totalPoints: number
  }
}

export interface Challenge {
  id: string
  name: string
  description?: string
  bannerUrl?: string
  startDate?: string // ISO; used when cohort has fixed start
  endDate?: string
  durationDays?: number // alternative to fixed dates
  priceCents: number
  currency: 'AUD' | 'USD'
  challengeType: ChallengeType
  maxParticipants?: number
  currentParticipants: number
  scoring: {
    checkinPoints: number
    workoutPoints: number
    nutritionPoints: number
    stepsBuckets: number[] // e.g. [5000, 8000, 10000]
    weightLossPoints?: number
    consistencyBonus?: number
    streakMultiplier?: number
    // Progressive completion bonuses
    healthProfileBonus?: number // Percentage of max points (1-3%)
    beforePhotosBonus?: number // Percentage of max points (1-3%)
    progressPhotosBonus?: number // Percentage of max points (1-3%)
  }
  timezone: string // cohort timezone
  status: 'draft' | 'published' | 'archived' | 'completed'
  createdAt: number
  tags?: string[]
  requirements: {
    minAge?: number
    fitnessLevel: 'beginner' | 'intermediate' | 'advanced'
    equipment: string[]
    medicalClearance: boolean
    // New: Health baseline requirements
    requiresHealthBaseline: boolean
    requiresBeforePhotos: boolean
    requiresProgressPhotos: boolean
    healthMetrics: {
      weight: boolean
      height: boolean
      bodyMeasurements: boolean
      activityLevel: boolean
      skillLevel: boolean
    }
  }
  prizes?: {
    firstPlace: string
    secondPlace: string
    thirdPlace: string
    participation: string
  }
  termsAndConditions?: string
  privacyPolicy?: string
  habits?: Habit[]
  updatedAt?: number
  version?: number
}

export interface Habit {
  id: string
  name: string
  description: string
  category: 'fitness' | 'nutrition' | 'wellness' | 'lifestyle'
  frequency: 'daily' | 'weekly' | 'custom'
  customFrequency?: {
    days: number[]
    times: string[]
  }
  target: {
    type: 'count' | 'duration' | 'boolean' | 'range'
    value: number
    unit?: string
    min?: number
    max?: number
  }
  points: number
  streakBonus: number
  reminder: boolean
  reminderTime?: string
  active: boolean
  calendarIntegration?: {
    enabled: boolean
    eventTitle?: string
    eventDescription?: string
    reminderMinutes?: number
    color?: string
  }
  createdAt: number
  updatedAt: number
}

export interface Enrolment {
  id: string
  userId: string
  challengeId: string
  paymentStatus: 'pending' | 'paid' | 'refunded'
  createdAt: number
  startDate?: string
  lastCheckinDate?: string
  totalScore: number
  rank?: number
  progress?: {
    daysCompleted: number
    totalDays: number
    currentStreak: number
    longestStreak: number
  }
  // New: Health baseline completion tracking
  healthBaseline?: HealthBaseline
  beforePhotos?: string[] // storage paths
  progressPhotos?: string[] // storage paths
  completionBonuses?: {
    healthProfile: boolean
    beforePhotos: boolean
    progressPhotos: boolean
  }
}

// New: Health baseline data structure
export interface HealthBaseline {
  // Basic measurements
  weight?: {
    value: number
    unit: 'kg' | 'lbs'
    date: string
  }
  height?: {
    value: number
    unit: 'cm' | 'ft' | 'in'
    date: string
  }
  
  // Body measurements (circumference)
  bodyMeasurements?: {
    chest?: number // cm
    waist?: number // cm
    hips?: number // cm
    biceps?: number // cm
    thighs?: number // cm
    calves?: number // cm
    date: string
  }
  
  // Activity & skill levels
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active'
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  
  // Additional health info
  fitnessGoals?: string[]
  medicalConditions?: string[]
  medications?: string[]
  allergies?: string[]
  
  // Metadata
  completedAt: number
  updatedAt: number
}

// New: Invite acceptance tracking
export interface InviteAcceptance {
  id: string
  challengeId: string
  email: string
  acceptedAt: number
  expiresAt: number
  status: 'pending' | 'accepted' | 'expired'
  signupCompleted?: boolean
  userId?: string // Set when user completes signup
}

export interface Checkin {
  id: string
  enrolmentId: string
  challengeId: string
  userId: string
  period: 'daily' | 'weekly'
  date: string // yyyy-mm-dd in challenge timezone
  weightKg?: number
  steps?: number
  workouts?: number
  nutritionScore?: number // 0-10 self-report
  sleepHours?: number
  waterIntake?: number // in liters
  meditationMinutes?: number
  photos?: string[] // storage paths
  notes?: string
  autoScore?: number
  coachScore?: number
  scoreBreakdown?: {
    checkin: number
    workouts: number
    nutrition: number
    steps: number
    weightLoss?: number
    consistency?: number
    streak?: number
  }
  createdAt: number
  updatedAt?: number
}

export interface LeaderboardEntry {
  enrolmentId: string
  userId: string
  challengeId: string
  displayName?: string
  photoURL?: string
  totalScore: number
  checkinsCount: number
  lastCheckin?: string
  rank: number
  progress: {
    daysCompleted: number
    totalDays: number
    currentStreak: number
    longestStreak: number
  }
}

export interface Notification {
  id: string
  userId: string
  type: 'reminder' | 'achievement' | 'announcement' | 'challenge_update'
  title: string
  message: string
  read: boolean
  createdAt: number
  actionUrl?: string
  metadata?: Record<string, any>
}

export interface Achievement {
  id: string
  userId: string
  challengeId: string
  type: 'streak' | 'milestone' | 'challenge_completion' | 'perfect_score'
  title: string
  description: string
  icon: string
  points: number
  unlockedAt: number
  metadata?: Record<string, any>
}

export interface ChallengeTemplate {
  id: string
  name: string
  description: string
  challengeType: ChallengeType
  durationDays: number
  scoring: Challenge['scoring']
  requirements: Challenge['requirements']
  tags: string[]
  isPublic: boolean
  createdBy: string
  createdAt: number
  usageCount: number
  
  // New: Marketplace features
  marketplace: {
    isPublished: boolean
    priceCents: number
    currency: 'USD' | 'AUD'
    qualityTier: 'free' | 'premium' | 'expert' | 'platinum'
    category: 'fitness' | 'weight-loss' | 'strength' | 'endurance' | 'wellness' | 'nutrition' | 'mindfulness'
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    estimatedResults: string[]
    timeCommitment: 'low' | 'medium' | 'high'
    equipmentRequired: string[]
    previewImages?: string[]
    demoVideo?: string
    testimonials?: Array<{
      coachName: string
      rating: number
      comment: string
      date: number
    }>
    successMetrics: {
      averageCompletionRate: number
      averageParticipantSatisfaction: number
      averageResults: string
      totalChallengesCreated: number
    }
  }
  
  // Template content
  content: {
    overview: string
    weeklyPlans: Array<{
      week: number
      title: string
      description: string
      focus: string[]
      workouts: Array<{
        day: number
        name: string
        description: string
        exercises: Array<{
          name: string
          sets: number
          reps: string
          rest: string
          notes?: string
        }>
      }>
    }>
    nutritionGuidance?: {
      mealPlans: Array<{
        week: number
        focus: string
        guidelines: string[]
        sampleMeals: Array<{
          meal: string
          description: string
          macros: {
            protein: string
            carbs: string
            fat: string
            calories: string
          }
        }>
      }>
      supplements?: string[]
      hydration?: string
    }
    habitBuilding?: {
      dailyHabits: string[]
      weeklyHabits: string[]
      trackingMethods: string[]
      motivationTips: string[]
    }
    progressTracking?: {
      metrics: string[]
      checkpoints: Array<{
        week: number
        measurements: string[]
        photos: boolean
        assessments: string[]
      }>
    }
  }
  
  // Licensing and usage
  licensing: {
    type: 'free' | 'single-use' | 'unlimited' | 'subscription'
    terms: string
    attributionRequired: boolean
    modificationAllowed: boolean
    commercialUse: boolean
    expirationDate?: number
  }
  
  // Creator information
  creator: {
    name: string
    bio: string
    credentials: string[]
    profileImage?: string
    website?: string
    socialMedia?: {
      instagram?: string
      youtube?: string
      linkedin?: string
    }
  }
}

// New: Template purchase/download tracking
export interface TemplatePurchase {
  id: string
  templateId: string
  coachId: string
  purchaseDate: number
  priceCents: number
  currency: 'USD' | 'AUD'
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  paymentMethod?: string
  transactionId?: string
  downloadCount: number
  lastDownloaded?: number
  challengesCreated: number
}

// New: Template search and filter options
export interface TemplateFilters {
  category?: string
  difficulty?: string
  qualityTier?: string
  priceRange?: {
    min: number
    max: number
  }
  duration?: {
    min: number
    max: number
  }
  challengeType?: string
  equipmentRequired?: string[]
  tags?: string[]
  creatorId?: string
  rating?: number
  freeOnly?: boolean
}

export interface UserProgress {
  userId: string
  challengeId: string
  currentStreak: number
  longestStreak: number
  totalPoints: number
  averageDailyScore: number
  completionRate: number
  lastUpdated: number
}

export interface ChallengeStats {
  challengeId: string
  totalParticipants: number
  activeParticipants: number
  averageScore: number
  totalCheckins: number
  averageCompletionRate: number
  topScores: Array<{
    userId: string
    score: number
    rank: number
  }>
  lastUpdated: number
} 