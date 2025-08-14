import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore'
import { db } from './firebase.client'
import { Challenge, Enrolment, Checkin, UserProfile } from '../types'

export interface LeaderboardParticipant {
  userId: string
  displayName?: string
  photoURL?: string
  totalScore: number
  checkinsCount: number
  rank: number
  lastCheckin?: Date
  streak?: number
  enrolmentId: string
  challengeId: string
}

export interface GlobalLeaderboardEntry {
  userId: string
  displayName?: string
  photoURL?: string
  totalScore: number
  challengesCount: number
  totalCheckins: number
  rank: number
  averageScore: number
  lastActivity?: Date
}

export interface ChallengeLeaderboard {
  challenge: Challenge
  participants: LeaderboardParticipant[]
  totalParticipants: number
  averageScore: number
  topScore: number
}

/**
 * Fetch challenge-specific leaderboard data
 */
export const getChallengeLeaderboard = async (challengeId: string): Promise<ChallengeLeaderboard | null> => {
  try {
    // 1. Get challenge details
    const challengeRef = doc(db, 'challenges', challengeId)
    const challengeSnap = await getDoc(challengeRef)
    
    if (!challengeSnap.exists()) {
      console.error('Challenge not found:', challengeId)
      return null
    }
    
    const challenge = { id: challengeSnap.id, ...challengeSnap.data() } as Challenge

    // 2. Get all paid enrolments for this challenge
    const enrolmentsQuery = query(
      collection(db, 'enrolments'),
      where('challengeId', '==', challengeId),
      where('paymentStatus', '==', 'paid')
    )
    const enrolmentsSnap = await getDocs(enrolmentsQuery)
    const enrolments = enrolmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enrolment))

    if (enrolments.length === 0) {
      return {
        challenge,
        participants: [],
        totalParticipants: 0,
        averageScore: 0,
        topScore: 0
      }
    }

    // 3. Fetch check-ins and calculate scores for each participant
    const participantsData: { [userId: string]: LeaderboardParticipant } = {}
    
    for (const enrolment of enrolments) {
      const checkinsQuery = query(
        collection(db, 'checkins'),
        where('enrolmentId', '==', enrolment.id),
        orderBy('date', 'desc')
      )
      const checkinsSnap = await getDocs(checkinsQuery)
      const checkins = checkinsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Checkin))
      
      const totalScore = checkins.reduce((sum, checkin) => sum + (checkin.autoScore || 0), 0)
      const lastCheckin = checkins.length > 0 ? new Date(checkins[0].date) : undefined
      
      // Calculate streak
      const streak = calculateStreak(checkins)
      
      participantsData[enrolment.userId] = {
        userId: enrolment.userId,
        totalScore,
        checkinsCount: checkins.length,
        lastCheckin,
        streak,
        enrolmentId: enrolment.id,
        challengeId: challengeId,
        rank: 0, // Will be assigned after sorting
        displayName: undefined, // Will be populated later
        photoURL: undefined
      }
    }
    
    // 4. Sort participants by score and assign ranks
    const sortedParticipants = Object.values(participantsData)
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((participant, index) => ({
        ...participant,
        rank: index + 1
      }))
    
    // 5. Populate user details
    await populateUserDetails(sortedParticipants)
    
    // 6. Calculate statistics
    const totalParticipants = sortedParticipants.length
    const averageScore = totalParticipants > 0 
      ? Math.round(sortedParticipants.reduce((sum, p) => sum + p.totalScore, 0) / totalParticipants)
      : 0
    const topScore = totalParticipants > 0 ? sortedParticipants[0].totalScore : 0
    
    return {
      challenge,
      participants: sortedParticipants,
      totalParticipants,
      averageScore,
      topScore
    }
    
  } catch (error) {
    console.error('Error fetching challenge leaderboard:', error)
    return null
  }
}

/**
 * Fetch global leaderboard across all challenges
 */
export const getGlobalLeaderboard = async (limitCount: number = 50): Promise<GlobalLeaderboardEntry[]> => {
  try {
    // 1. Get all published challenges
    const challengesQuery = query(
      collection(db, 'challenges'),
      where('status', '==', 'published')
    )
    const challengesSnap = await getDocs(challengesQuery)
    const challenges = challengesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Challenge))
    
    // 2. Aggregate scores across all challenges
    const globalScores: { [userId: string]: { 
      score: number; 
      challenges: number; 
      checkins: number;
      lastActivity?: Date;
    } } = {}
    
    for (const challenge of challenges) {
      const challengeLeaderboard = await getChallengeLeaderboard(challenge.id)
      if (!challengeLeaderboard) continue
      
      for (const participant of challengeLeaderboard.participants) {
        if (!globalScores[participant.userId]) {
          globalScores[participant.userId] = { 
            score: 0, 
            challenges: 0, 
            checkins: 0,
            lastActivity: undefined
          }
        }
        
        globalScores[participant.userId].score += participant.totalScore
        globalScores[participant.userId].challenges += 1
        globalScores[participant.userId].checkins += participant.checkinsCount
        
        // Track most recent activity
        if (participant.lastCheckin && 
            (!globalScores[participant.userId].lastActivity || 
             participant.lastCheckin > globalScores[participant.userId].lastActivity!)) {
          globalScores[participant.userId].lastActivity = participant.lastCheckin
        }
      }
    }
    
    // 3. Convert to leaderboard entries and sort
    const globalEntries: GlobalLeaderboardEntry[] = Object.entries(globalScores)
      .map(([userId, data]) => ({
        userId,
        totalScore: data.score,
        challengesCount: data.challenges,
        totalCheckins: data.checkins,
        lastActivity: data.lastActivity,
        averageScore: Math.round(data.score / data.challenges),
        rank: 0, // Will be assigned after sorting
        displayName: undefined, // Will be populated later
        photoURL: undefined
      }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limitCount)
    
    // 4. Assign ranks
    globalEntries.forEach((entry, index) => {
      entry.rank = index + 1
    })
    
    // 5. Populate user details
    await populateUserDetails(globalEntries)
    
    return globalEntries
    
  } catch (error) {
    console.error('Error fetching global leaderboard:', error)
    return []
  }
}

/**
 * Get real-time updates for a challenge leaderboard
 */
export const subscribeToChallengeLeaderboard = (
  challengeId: string, 
  callback: (leaderboard: ChallengeLeaderboard | null) => void
): Unsubscribe => {
  // For real-time updates, we'll need to set up listeners on multiple collections
  // This is a simplified version - in production you might want to use a more sophisticated approach
  
  const unsubscribe = onSnapshot(
    query(
      collection(db, 'checkins'),
      where('challengeId', '==', challengeId),
      orderBy('date', 'desc')
    ),
    async () => {
      // Refetch the entire leaderboard when check-ins change
      const leaderboard = await getChallengeLeaderboard(challengeId)
      callback(leaderboard)
    },
    (error) => {
      console.error('Error in leaderboard subscription:', error)
      callback(null)
    }
  )
  
  return unsubscribe
}

/**
 * Get user's ranking in a specific challenge
 */
export const getUserChallengeRank = async (userId: string, challengeId: string): Promise<number | null> => {
  try {
    const leaderboard = await getChallengeLeaderboard(challengeId)
    if (!leaderboard) return null
    
    const userRank = leaderboard.participants.find(p => p.userId === userId)
    return userRank ? userRank.rank : null
    
  } catch (error) {
    console.error('Error getting user challenge rank:', error)
    return null
  }
}

/**
 * Get user's global ranking
 */
export const getUserGlobalRank = async (userId: string): Promise<number | null> => {
  try {
    const globalLeaderboard = await getGlobalLeaderboard(1000) // Get more entries to find user
    const userRank = globalLeaderboard.find(entry => entry.userId === userId)
    return userRank ? userRank.rank : null
    
  } catch (error) {
    console.error('Error getting user global rank:', error)
    return null
  }
}

/**
 * Helper function to calculate streak from check-ins
 */
const calculateStreak = (checkins: Checkin[]): number => {
  if (checkins.length === 0) return 0
  
  const sortedCheckins = checkins.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  
  let currentStreak = 0
  let lastDate: Date | null = null
  
  for (const checkin of sortedCheckins) {
    const checkinDate = new Date(checkin.date)
    if (!checkinDate) continue
    
    if (!lastDate) {
      lastDate = checkinDate
      currentStreak = 1
    } else {
      const diffTime = Math.abs(lastDate.getTime() - checkinDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays <= 1) {
        currentStreak++
        lastDate = checkinDate
      } else {
        break
      }
    }
  }
  
  return currentStreak
}

/**
 * Helper function to populate user details
 */
const populateUserDetails = async (participants: Array<{ userId: string; displayName?: string; photoURL?: string }>) => {
  const uniqueUserIds = Array.from(new Set(participants.map(p => p.userId)))
  
  for (const userId of uniqueUserIds) {
    try {
      const userRef = doc(db, 'users', userId)
      const userSnap = await getDoc(userRef)
      
      if (userSnap.exists()) {
        const userData = userSnap.data() as UserProfile
        const displayName = userData.displayName || userData.email || 'Anonymous'
        const photoURL = userData.photoURL
        
        // Update all participants with this userId
        participants.forEach(participant => {
          if (participant.userId === userId) {
            participant.displayName = displayName
            participant.photoURL = photoURL
          }
        })
      }
    } catch (error) {
      console.error('Error fetching user details for:', userId, error)
    }
  }
}

/**
 * Get leaderboard statistics for a challenge
 */
export const getChallengeLeaderboardStats = async (challengeId: string) => {
  try {
    const leaderboard = await getChallengeLeaderboard(challengeId)
    if (!leaderboard) return null
    
    return {
      totalParticipants: leaderboard.totalParticipants,
      averageScore: leaderboard.averageScore,
      topScore: leaderboard.topScore,
      scoreDistribution: calculateScoreDistribution(leaderboard.participants),
      participationTrend: await getParticipationTrend(challengeId)
    }
  } catch (error) {
    console.error('Error getting leaderboard stats:', error)
    return null
  }
}

/**
 * Calculate score distribution for analytics
 */
const calculateScoreDistribution = (participants: LeaderboardParticipant[]) => {
  if (participants.length === 0) return {}
  
  const scores = participants.map(p => p.totalScore)
  const min = Math.min(...scores)
  const max = Math.max(...scores)
  const range = max - min
  
  const buckets = 5
  const bucketSize = range / buckets
  
  const distribution: { [key: string]: number } = {}
  
  for (let i = 0; i < buckets; i++) {
    const bucketStart = min + (i * bucketSize)
    const bucketEnd = min + ((i + 1) * bucketSize)
    const bucketKey = `${Math.round(bucketStart)}-${Math.round(bucketEnd)}`
    
    distribution[bucketKey] = scores.filter(score => 
      score >= bucketStart && score < bucketEnd
    ).length
  }
  
  return distribution
}

/**
 * Get participation trend over time
 */
const getParticipationTrend = async (challengeId: string) => {
  try {
    const checkinsQuery = query(
      collection(db, 'checkins'),
      where('challengeId', '==', challengeId),
      orderBy('date', 'asc')
    )
    const checkinsSnap = await getDocs(checkinsQuery)
    const checkins = checkinsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Checkin))
    
    // Group check-ins by date
    const dailyCheckins: { [date: string]: number } = {}
    
    checkins.forEach(checkin => {
      const date = checkin.date || 'unknown'
      dailyCheckins[date] = (dailyCheckins[date] || 0) + 1
    })
    
    return dailyCheckins
    
  } catch (error) {
    console.error('Error getting participation trend:', error)
    return {}
  }
}
