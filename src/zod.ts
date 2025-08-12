import { z } from 'zod'

// Base schemas
export const UserProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  photoURL: z.string().url().optional(),
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/).optional(),
  role: z.enum(['participant', 'coach', 'moderator', 'admin']),
  timezone: z.string().default('Australia/Perth'),
  locale: z.string().default('en-AU'),
  marketingConsents: z.object({
    email: z.boolean(),
    sms: z.boolean(),
    push: z.boolean()
  }),
  preferences: z.object({
    notifications: z.array(z.enum(['email', 'push', 'sms', 'whatsapp'])),
    reminderTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional()
  })
})

export const ChallengeSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  bannerUrl: z.string().url().optional(),
  rules: z.string().min(1).max(5000),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  durationDays: z.number().int().min(1).max(365),
  timezone: z.string(),
  priceCents: z.number().int().min(0),
  currency: z.enum(['AUD', 'USD']),
  capacity: z.number().int().min(1).max(10000),
  visibility: z.enum(['public', 'private', 'invite-only']),
  status: z.enum(['draft', 'published', 'active', 'completed', 'archived']),
  scoring: z.object({
    checkinPoints: z.number().int().min(0).max(100),
    workoutPoints: z.number().int().min(0).max(50),
    nutritionPoints: z.number().int().min(0).max(50),
    stepsBuckets: z.array(z.number().int().min(0).max(100000)),
    progressPoints: z.number().int().min(0).max(20),
    streakBonus: z.number().int().min(0).max(10),
    teamBonus: z.number().int().min(0).max(20)
  }),
  antiCheat: z.object({
    photoRequired: z.boolean(),
    exifCheck: z.boolean(),
    duplicateDetection: z.boolean(),
    cooldownMinutes: z.number().int().min(0).max(1440),
    anomalyThreshold: z.number().min(0).max(1)
  }),
  prizes: z.object({
    firstPlace: z.number().int().min(0).optional(),
    secondPlace: z.number().int().min(0).optional(),
    thirdPlace: z.number().int().min(0).optional(),
    participation: z.number().int().min(0).optional(),
    teamPrize: z.number().int().min(0).optional()
  })
})

export const CheckinSchema = z.object({
  enrolmentId: z.string().min(1),
  challengeId: z.string().min(1),
  period: z.enum(['daily', 'weekly']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  weightKg: z.number().min(20).max(300).optional(),
  measurements: z.object({
    chest: z.number().min(50).max(200).optional(),
    waist: z.number().min(50).max(200).optional(),
    hips: z.number().min(50).max(200).optional(),
    arms: z.number().min(20).max(100).optional(),
    thighs: z.number().min(30).max(150).optional()
  }).optional(),
  steps: z.number().int().min(0).max(100000).optional(),
  workouts: z.number().int().min(0).max(10).optional(),
  nutritionScore: z.number().int().min(0).max(10).optional(),
  photos: z.array(z.instanceof(File)).max(4).optional(),
  notes: z.string().max(500).optional(),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    accuracy: z.number().min(0).max(1000).optional()
  }).optional()
})

export const TeamSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  logoUrl: z.string().url().optional(),
  maxMembers: z.number().int().min(2).max(50)
})

export const AnnouncementSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
  attachments: z.array(z.string().url()).max(5).optional(),
  target: z.enum(['all', 'participants', 'coaches', 'specific-cohort']),
  scheduledFor: z.number().optional()
})

export const PaymentRefundSchema = z.object({
  amountCents: z.number().int().min(1),
  reason: z.string().min(1).max(500)
})

// Validation helpers
export const validateTimezone = (timezone: string): boolean => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone })
    return true
  } catch {
    return false
  }
}

export const validateDateRange = (startDate: string, endDate: string, durationDays: number): boolean => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays === durationDays
}

// Anti-cheat validation
export const validatePhotoUpload = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 10MB limit' }
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' }
  }
  
  return { valid: true }
}

export const validateCheckinCooldown = (
  lastCheckinTime: number,
  cooldownMinutes: number
): { canCheckin: boolean; waitMinutes: number } => {
  const now = Date.now()
  const timeSinceLastCheckin = now - lastCheckinTime
  const cooldownMs = cooldownMinutes * 60 * 1000
  
  if (timeSinceLastCheckin < cooldownMs) {
    const waitMinutes = Math.ceil((cooldownMs - timeSinceLastCheckin) / (60 * 1000))
    return { canCheckin: false, waitMinutes }
  }
  
  return { canCheckin: true, waitMinutes: 0 }
}

// Export types
export type UserProfileInput = z.infer<typeof UserProfileSchema>
export type ChallengeInput = z.infer<typeof ChallengeSchema>
export type CheckinInput = z.infer<typeof CheckinSchema>
export type TeamInput = z.infer<typeof TeamSchema>
export type AnnouncementInput = z.infer<typeof AnnouncementSchema>
export type PaymentRefundInput = z.infer<typeof PaymentRefundSchema> 