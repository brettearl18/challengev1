import { format, formatInTimeZone, utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz'
import { addDays, startOfDay, endOfDay, differenceInDays, isSameDay } from 'date-fns'

export interface TimezoneInfo {
  name: string
  offset: number // minutes from UTC
  abbreviation: string
}

export interface CohortDayBoundary {
  start: Date
  end: Date
  localDate: string // yyyy-mm-dd in cohort timezone
}

/**
 * Get timezone information for a given timezone
 */
export function getTimezoneInfo(timezone: string): TimezoneInfo {
  try {
    const now = new Date()
    const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000))
    const targetTime = new Date(utc.toLocaleString('en-US', { timeZone: timezone }))
    const offset = (targetTime.getTime() - utc.getTime()) / 60000
    
    // Get timezone abbreviation
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      timeZoneName: 'short'
    })
    const parts = formatter.formatToParts(now)
    const abbreviation = parts.find(part => part.type === 'timeZoneName')?.value || 'UTC'
    
    return {
      name: timezone,
      offset: Math.round(offset),
      abbreviation
    }
  } catch (error) {
    console.warn(`Invalid timezone: ${timezone}, falling back to UTC`)
    return {
      name: 'UTC',
      offset: 0,
      abbreviation: 'UTC'
    }
  }
}

/**
 * Convert UTC date to cohort timezone
 */
export function toCohortTimezone(date: Date, cohortTimezone: string): Date {
  try {
    return utcToZonedTime(date, cohortTimezone)
  } catch (error) {
    console.warn(`Failed to convert to timezone ${cohortTimezone}, using UTC`)
    return date
  }
}

/**
 * Convert cohort timezone date to UTC
 */
export function fromCohortTimezone(date: Date, cohortTimezone: string): Date {
  try {
    return zonedTimeToUtc(date, cohortTimezone)
  } catch (error) {
    console.warn(`Failed to convert from timezone ${cohortTimezone}, using UTC`)
    return date
  }
}

/**
 * Get the start and end of a day in the cohort's timezone
 */
export function getCohortDayBoundary(
  date: string | Date, 
  cohortTimezone: string
): CohortDayBoundary {
  const localDate = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd')
  
  // Create date in cohort timezone
  const cohortDate = new Date(`${localDate}T00:00:00`)
  const cohortStart = utcToZonedTime(cohortDate, cohortTimezone)
  const cohortEnd = endOfDay(cohortStart)
  
  // Convert back to UTC for storage
  const utcStart = zonedTimeToUtc(cohortStart, cohortTimezone)
  const utcEnd = zonedTimeToUtc(cohortEnd, cohortTimezone)
  
  return {
    start: utcStart,
    end: utcEnd,
    localDate
  }
}

/**
 * Check if a given time falls within a cohort day
 */
export function isWithinCohortDay(
  timestamp: Date | number,
  date: string,
  cohortTimezone: string
): boolean {
  const boundary = getCohortDayBoundary(date, cohortTimezone)
  const time = typeof timestamp === 'number' ? new Date(timestamp) : timestamp
  
  return time >= boundary.start && time <= boundary.end
}

/**
 * Get the current date in cohort timezone
 */
export function getCurrentCohortDate(cohortTimezone: string): string {
  try {
    return formatInTimeZone(new Date(), cohortTimezone, 'yyyy-MM-dd')
  } catch (error) {
    console.warn(`Failed to get current date in timezone ${cohortTimezone}, using UTC`)
    return format(new Date(), 'yyyy-MM-dd')
  }
}

/**
 * Get the number of days since challenge start in cohort timezone
 */
export function getDaysSinceChallengeStart(
  startDate: string,
  cohortTimezone: string
): number {
  try {
    const start = new Date(`${startDate}T00:00:00`)
    const startInCohortTz = utcToZonedTime(start, cohortTimezone)
    const nowInCohortTz = utcToZonedTime(new Date(), cohortTimezone)
    
    return differenceInDays(nowInCohortTz, startInCohortTz)
  } catch (error) {
    console.warn(`Failed to calculate days since start, using UTC`)
    const start = new Date(`${startDate}T00:00:00`)
    return differenceInDays(new Date(), start)
  }
}

/**
 * Get the number of days remaining in challenge
 */
export function getDaysRemainingInChallenge(
  endDate: string,
  cohortTimezone: string
): number {
  try {
    const end = new Date(`${endDate}T23:59:59`)
    const endInCohortTz = utcToZonedTime(end, cohortTimezone)
    const nowInCohortTz = utcToZonedTime(new Date(), cohortTimezone)
    
    const remaining = differenceInDays(endInCohortTz, nowInCohortTz)
    return Math.max(0, remaining)
  } catch (error) {
    console.warn(`Failed to calculate days remaining, using UTC`)
    const end = new Date(`${endDate}T23:59:59`)
    const remaining = differenceInDays(end, new Date())
    return Math.max(0, remaining)
  }
}

/**
 * Check if challenge is active (within start/end dates in cohort timezone)
 */
export function isChallengeActive(
  startDate: string,
  endDate: string,
  cohortTimezone: string
): boolean {
  try {
    const now = new Date()
    const start = new Date(`${startDate}T00:00:00`)
    const end = new Date(`${endDate}T23:59:59`)
    
    const startInCohortTz = utcToZonedTime(start, cohortTimezone)
    const endInCohortTz = utcToZonedTime(end, cohortTimezone)
    const nowInCohortTz = utcToZonedTime(now, cohortTimezone)
    
    return nowInCohortTz >= startInCohortTz && nowInCohortTz <= endInCohortTz
  } catch (error) {
    console.warn(`Failed to check challenge status, using UTC`)
    const now = new Date()
    const start = new Date(`${startDate}T00:00:00`)
    const end = new Date(`${endDate}T23:59:59`)
    
    return now >= start && now <= end
  }
}

/**
 * Get the next check-in date in cohort timezone
 */
export function getNextCheckinDate(
  lastCheckinDate: string,
  cohortTimezone: string
): string {
  try {
    const lastDate = new Date(`${lastCheckinDate}T00:00:00`)
    const lastInCohortTz = utcToZonedTime(lastDate, cohortTimezone)
    const nextInCohortTz = addDays(lastInCohortTz, 1)
    
    return formatInTimeZone(nextInCohortTz, cohortTimezone, 'yyyy-MM-dd')
  } catch (error) {
    console.warn(`Failed to get next check-in date, using UTC`)
    const lastDate = new Date(`${lastCheckinDate}T00:00:00`)
    const nextDate = addDays(lastDate, 1)
    return format(nextDate, 'yyyy-MM-dd')
  }
}

/**
 * Format a date for display in user's timezone
 */
export function formatForUserTimezone(
  date: Date | string | number,
  userTimezone: string,
  formatString: string = 'PPP'
): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : 
                   typeof date === 'number' ? new Date(date) : date
    
    return formatInTimeZone(dateObj, userTimezone, formatString)
  } catch (error) {
    console.warn(`Failed to format date for timezone ${userTimezone}, using UTC`)
    const dateObj = typeof date === 'string' ? new Date(date) : 
                   typeof date === 'number' ? new Date(date) : date
    
    return format(dateObj, formatString)
  }
}

/**
 * Get timezone options for common Australian timezones
 */
export const AUSTRALIAN_TIMEZONES: TimezoneInfo[] = [
  { name: 'Australia/Perth', offset: 480, abbreviation: 'AWST' },
  { name: 'Australia/Adelaide', offset: 630, abbreviation: 'ACST' },
  { name: 'Australia/Darwin', offset: 570, abbreviation: 'ACST' },
  { name: 'Australia/Brisbane', offset: 600, abbreviation: 'AEST' },
  { name: 'Australia/Sydney', offset: 660, abbreviation: 'AEDT' },
  { name: 'Australia/Melbourne', offset: 660, abbreviation: 'AEDT' },
  { name: 'Australia/Hobart', offset: 660, abbreviation: 'AEDT' }
]

/**
 * Validate if a timezone string is valid
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone })
    return true
  } catch {
    return false
  }
} 