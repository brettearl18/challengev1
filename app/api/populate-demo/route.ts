import { NextResponse } from 'next/server'
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/src/lib/firebase.client'

export async function POST() {
  try {
    // Check if challenges already exist
    const challengesQuery = query(collection(db, 'challenges'), where('status', '==', 'published'))
    const existingChallenges = await getDocs(challengesQuery)
    
    if (!existingChallenges.empty) {
      return NextResponse.json({ 
        success: false, 
        message: 'Challenges already exist in the database' 
      })
    }

    // Demo challenges data
    const demoChallenges = [
      {
        name: "12-Week Fitness Transformation",
        description: "A comprehensive 12-week program designed to transform your fitness level through progressive workouts, nutrition guidance, and habit building. Perfect for beginners and intermediate fitness enthusiasts looking to build strength, endurance, and healthy habits.",
        challengeType: "fitness",
        status: "published",
        startDate: new Date('2024-01-15').getTime(),
        endDate: new Date('2024-04-08').getTime(),
        durationDays: 84,
        maxParticipants: 200,
        currentParticipants: 156,
        priceCents: 0,
        currency: "USD",
        bannerUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop",
        tags: ["fitness", "transformation", "12-weeks", "beginner-friendly"],
        scoring: {
          checkinPoints: 10,
          workoutPoints: 15,
          nutritionPoints: 10,
          bonusPoints: 5,
          streakBonus: true,
          streakMultiplier: 1.5
        },
        habits: [
          { name: "Daily Workout", description: "Complete a workout session", frequency: "daily", target: 1, points: 15 },
          { name: "Water Intake", description: "Drink 8 glasses of water", frequency: "daily", target: 8, points: 10 },
          { name: "Sleep 8 Hours", description: "Get adequate sleep", frequency: "daily", target: 8, points: 10 }
        ],
        prizes: {
          firstPlace: "Fitness tracker and 3 months gym membership",
          secondPlace: "Premium workout equipment",
          thirdPlace: "Nutrition consultation session"
        },
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        name: "30-Day Weight Loss Challenge",
        description: "Intensive 30-day weight loss program focusing on calorie deficit, cardio exercise, and healthy eating habits. Includes meal planning, workout routines, and daily check-ins to keep you accountable.",
        challengeType: "weight-loss",
        status: "published",
        startDate: new Date('2024-01-20').getTime(),
        endDate: new Date('2024-02-19').getTime(),
        durationDays: 30,
        maxParticipants: 150,
        currentParticipants: 89,
        priceCents: 0,
        currency: "USD",
        bannerUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=400&fit=crop",
        tags: ["weight-loss", "30-days", "intensive", "calorie-deficit"],
        scoring: {
          checkinPoints: 15,
          workoutPoints: 20,
          nutritionPoints: 15,
          bonusPoints: 10,
          streakBonus: true,
          streakMultiplier: 2.0
        },
        habits: [
          { name: "Calorie Deficit", description: "Maintain daily calorie deficit", frequency: "daily", target: 1, points: 15 },
          { name: "Cardio Exercise", description: "Complete cardio workout", frequency: "daily", target: 1, points: 20 },
          { name: "No Junk Food", description: "Avoid processed foods", frequency: "daily", target: 1, points: 15 }
        ],
        prizes: {
          firstPlace: "Personal training sessions and meal plan",
          secondPlace: "Fitness equipment package",
          thirdPlace: "Nutrition consultation"
        },
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        name: "Strength Building Program",
        description: "6-week strength training program designed to build muscle mass and increase overall strength. Includes progressive overload principles, proper form guidance, and recovery strategies.",
        challengeType: "strength",
        status: "published",
        startDate: new Date('2024-02-01').getTime(),
        endDate: new Date('2024-03-14').getTime(),
        durationDays: 42,
        maxParticipants: 100,
        currentParticipants: 67,
        priceCents: 0,
        currency: "USD",
        bannerUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&h=400&fit=crop",
        tags: ["strength", "muscle-building", "6-weeks", "progressive"],
        scoring: {
          checkinPoints: 12,
          workoutPoints: 25,
          nutritionPoints: 12,
          bonusPoints: 8,
          streakBonus: true,
          streakMultiplier: 1.8
        },
        habits: [
          { name: "Strength Training", description: "Complete strength workout", frequency: "every-other-day", target: 1, points: 25 },
          { name: "Protein Intake", description: "Consume adequate protein", frequency: "daily", target: 1, points: 12 },
          { name: "Rest Days", description: "Take proper rest days", frequency: "weekly", target: 2, points: 8 }
        ],
        prizes: {
          firstPlace: "Home gym equipment set",
          secondPlace: "Personal training package",
          thirdPlace: "Recovery tools and supplements"
        },
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        name: "Wellness & Mindfulness Challenge",
        description: "A holistic 21-day challenge focusing on mental health, stress reduction, and overall wellness. Includes meditation, journaling, gratitude practices, and gentle physical activities.",
        challengeType: "wellness",
        status: "published",
        startDate: new Date('2024-01-25').getTime(),
        endDate: new Date('2024-02-15').getTime(),
        durationDays: 21,
        maxParticipants: 120,
        currentParticipants: 78,
        priceCents: 0,
        currency: "USD",
        bannerUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop",
        tags: ["wellness", "mindfulness", "21-days", "holistic"],
        scoring: {
          checkinPoints: 8,
          workoutPoints: 10,
          nutritionPoints: 8,
          bonusPoints: 5,
          streakBonus: true,
          streakMultiplier: 1.3
        },
        habits: [
          { name: "Meditation", description: "Practice mindfulness meditation", frequency: "daily", target: 1, points: 10 },
          { name: "Gratitude Journal", description: "Write 3 things you're grateful for", frequency: "daily", target: 1, points: 8 },
          { name: "Gentle Movement", description: "Light stretching or yoga", frequency: "daily", target: 1, points: 8 }
        ],
        prizes: {
          firstPlace: "Wellness retreat weekend",
          secondPlace: "Meditation app subscription",
          thirdPlace: "Wellness book collection"
        },
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        name: "Endurance Running Challenge",
        description: "8-week progressive running program designed to build endurance and prepare participants for their first 5K or improve their running performance. Includes structured training plans and recovery strategies.",
        challengeType: "endurance",
        status: "published",
        startDate: new Date('2024-02-05').getTime(),
        endDate: new Date('2024-03-26').getTime(),
        durationDays: 56,
        maxParticipants: 80,
        currentParticipants: 45,
        priceCents: 0,
        currency: "USD",
        bannerUrl: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=400&fit=crop",
        tags: ["endurance", "running", "8-weeks", "5K-training"],
        scoring: {
          checkinPoints: 10,
          workoutPoints: 18,
          nutritionPoints: 10,
          bonusPoints: 6,
          streakBonus: true,
          streakMultiplier: 1.6
        },
        habits: [
          { name: "Running Session", description: "Complete scheduled run", frequency: "every-other-day", target: 1, points: 18 },
          { name: "Hydration", description: "Stay properly hydrated", frequency: "daily", target: 1, points: 10 },
          { name: "Recovery Stretching", description: "Post-run stretching routine", frequency: "daily", target: 1, points: 6 }
        ],
        prizes: {
          firstPlace: "Professional running shoes and gear",
          secondPlace: "Running watch and accessories",
          thirdPlace: "Running coaching session"
        },
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ]

    // Add all demo challenges to the database
    const addedChallenges = []
    for (const challenge of demoChallenges) {
      const docRef = await addDoc(collection(db, 'challenges'), challenge)
      addedChallenges.push({ id: docRef.id, name: challenge.name })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully added ${addedChallenges.length} demo challenges`,
      challenges: addedChallenges
    })

  } catch (error) {
    console.error('Error populating demo challenges:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to populate demo challenges',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
