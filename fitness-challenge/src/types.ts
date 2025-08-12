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
  }
  timezone: string // cohort timezone
  status: 'draft' | 'published' | 'archived' | 'completed'
  createdAt: number
  tags?: string[]
  requirements?: {
    minAge?: number
    fitnessLevel?: 'beginner' | 'intermediate' | 'advanced'
    equipment?: string[]
    medicalClearance?: boolean
  }
  prizes?: {
    firstPlace?: string
    secondPlace?: string
    thirdPlace?: string
    participation?: string
  }
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