'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { Progress } from '@/src/components/ui/Progress'
import { 
  Trophy, 
  Calendar, 
  Users, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  Clock,
  Star,
  Award,
  BarChart3,
  Zap,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

interface MyChallenge {
  id: string
  title: string
  description: string
  startDate: number
  endDate: number
  totalDays: number
  currentDay: number
  progress: number
  participantsCount: number
  myRank: number
  myScore: number
  totalScore: number
  streak: number
  isActive: boolean
  category: 'fitness' | 'weight-loss' | 'strength' | 'endurance' | 'wellness'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  habits: {
    id: string
    name: string
    target: number
    completed: number
    streak: number
  }[]
}

export default function MyChallengesPage() {
  const [challenges, setChallenges] = useState<MyChallenge[]>([])
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'upcoming'>('active')

  // Sample data
  useEffect(() => {
    const sampleChallenges: MyChallenge[] = [
      {
        id: '1',
        title: '12-Week Fitness Transformation',
        description: 'Comprehensive fitness program with daily workouts and nutrition guidance',
        startDate: Date.now() - (14 * 24 * 60 * 60 * 1000), // Started 2 weeks ago
        endDate: Date.now() + (70 * 24 * 60 * 60 * 1000), // 10 weeks remaining
        totalDays: 84,
        currentDay: 14,
        progress: 16.7,
        participantsCount: 156,
        myRank: 23,
        myScore: 2450,
        totalScore: 15000,
        streak: 12,
        isActive: true,
        category: 'fitness',
        difficulty: 'intermediate',
        habits: [
          { id: '1', name: 'Daily Workout', target: 14, completed: 12, streak: 12 },
          { id: '2', name: 'Water Intake', target: 14, completed: 14, streak: 14 },
          { id: '3', name: 'Sleep 8 Hours', target: 14, completed: 10, streak: 8 }
        ]
      },
      {
        id: '2',
        title: '30-Day Weight Loss Challenge',
        description: 'Focused weight loss program with calorie tracking and exercise',
        startDate: Date.now() - (5 * 24 * 60 * 60 * 1000), // Started 5 days ago
        endDate: Date.now() + (25 * 24 * 60 * 60 * 1000), // 25 days remaining
        totalDays: 30,
        currentDay: 5,
        progress: 16.7,
        participantsCount: 89,
        myRank: 7,
        myScore: 850,
        totalScore: 5000,
        streak: 5,
        isActive: true,
        category: 'weight-loss',
        difficulty: 'beginner',
        habits: [
          { id: '1', name: 'Calorie Deficit', target: 5, completed: 5, streak: 5 },
          { id: '2', name: 'Cardio Exercise', target: 5, completed: 4, streak: 4 },
          { id: '3', name: 'No Junk Food', target: 5, completed: 5, streak: 5 }
        ]
      },
      {
        id: '3',
        title: 'Strength Building Program',
        description: 'Progressive strength training for muscle building and toning',
        startDate: Date.now() + (7 * 24 * 60 * 60 * 1000), // Starts in 1 week
        endDate: Date.now() + (49 * 24 * 60 * 60 * 1000), // 6 weeks total
        totalDays: 42,
        currentDay: 0,
        progress: 0,
        participantsCount: 67,
        myRank: 0,
        myScore: 0,
        totalScore: 0,
        streak: 0,
        isActive: false,
        category: 'strength',
        difficulty: 'advanced',
        habits: [
          { id: '1', name: 'Strength Training', target: 0, completed: 0, streak: 0 },
          { id: '2', name: 'Protein Intake', target: 0, completed: 0, streak: 0 },
          { id: '3', name: 'Rest Days', target: 0, completed: 0, streak: 0 }
        ]
      }
    ]
    setChallenges(sampleChallenges)
  }, [])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fitness':
        return <Trophy className="w-5 h-5 text-blue-600" />
      case 'weight-loss':
        return <TrendingUp className="w-5 h-5 text-green-600" />
      case 'strength':
        return <Target className="w-5 h-5 text-red-600" />
      case 'endurance':
        return <Zap className="w-5 h-5 text-yellow-600" />
      case 'wellness':
        return <Star className="w-5 h-5 text-purple-600" />
      default:
        return <Trophy className="w-5 h-5 text-gray-600" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'advanced':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'fitness':
        return 'bg-blue-100 text-blue-800'
      case 'weight-loss':
        return 'bg-green-100 text-green-800'
      case 'strength':
        return 'bg-red-100 text-red-800'
      case 'endurance':
        return 'bg-yellow-100 text-yellow-800'
      case 'wellness':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredChallenges = challenges.filter(challenge => {
    switch (activeTab) {
      case 'active':
        return challenge.isActive && challenge.progress > 0 && challenge.progress < 100
      case 'completed':
        return challenge.progress >= 100
      case 'upcoming':
        return !challenge.isActive && challenge.progress === 0
      default:
        return true
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">My Challenges</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track your progress, manage your habits, and see how you rank among participants
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8 max-w-6xl mx-auto">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {challenges.filter(c => c.isActive).length}
              </div>
              <div className="text-sm text-gray-600">Active Challenges</div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {challenges.reduce((sum, c) => sum + c.streak, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Streak Days</div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center mb-2">
                <Award className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {challenges.reduce((sum, c) => sum + c.myScore, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Points</div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center mb-2">
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(challenges.reduce((sum, c) => sum + c.progress, 0) / Math.max(challenges.length, 1))}%
              </div>
              <div className="text-sm text-gray-600">Avg. Progress</div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
            {[
              { key: 'active', label: 'Active', count: challenges.filter(c => c.isActive && c.progress > 0 && c.progress < 100).length },
              { key: 'upcoming', label: 'Upcoming', count: challenges.filter(c => !c.isActive && c.progress === 0).length },
              { key: 'completed', label: 'Completed', count: challenges.filter(c => c.progress >= 100).length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Challenges List */}
        <div className="max-w-6xl mx-auto space-y-6">
          {filteredChallenges.map((challenge) => (
            <Card key={challenge.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getCategoryIcon(challenge.category)}
                      <div>
                        <CardTitle className="text-xl">{challenge.title}</CardTitle>
                        <CardDescription className="text-base">{challenge.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Day {challenge.currentDay} of {challenge.totalDays}
                      </span>
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {challenge.participantsCount} participants
                      </span>
                      <span className="flex items-center">
                        <Target className="w-4 h-4 mr-1" />
                        Rank #{challenge.myRank}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(challenge.category)}`}>
                      {challenge.category.replace('-', ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm text-gray-600">{challenge.progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={challenge.progress} className="h-2" />
                </div>

                {/* Habits Progress */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Daily Habits</h4>
                  <div className="space-y-2">
                    {challenge.habits.map((habit) => (
                      <div key={habit.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-900">{habit.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-600">
                            {habit.completed}/{habit.target}
                          </span>
                          <span className="text-xs text-blue-600 font-medium">
                            {habit.streak} day streak
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Star className="w-4 h-4 mr-1 text-yellow-500" />
                      {challenge.myScore} points
                    </span>
                    <span className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                      {challenge.streak} day streak
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Clock className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                    <Link href="/checkin">
                      <Button size="sm">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Check In
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredChallenges.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No {activeTab} challenges
                </h3>
                <p className="text-gray-600 mb-4">
                  {activeTab === 'active' && "You don't have any active challenges yet."}
                  {activeTab === 'upcoming' && "You don't have any upcoming challenges."}
                  {activeTab === 'completed' && "You haven't completed any challenges yet."}
                </p>
                <Link href="/challenges">
                  <Button>
                    Browse Challenges
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link href="/">
            <Button variant="outline">← Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 