'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { Input } from '@/src/components/ui/Input'
import { 
  Trophy, 
  Medal, 
  Crown, 
  TrendingUp, 
  Users, 
  Target, 
  Star,
  Award,
  Zap,
  Flame,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'

interface LeaderboardEntry {
  id: string
  rank: number
  previousRank: number
  name: string
  avatar: string
  score: number
  streak: number
  level: number
  badges: string[]
  isCurrentUser: boolean
  progress: number
  lastActive: number
}

interface Challenge {
  id: string
  title: string
  participantsCount: number
  isActive: boolean
  endDate: number
}

export default function TestLeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [selectedChallenge, setSelectedChallenge] = useState<string>('')
  const [sortBy, setSortBy] = useState<'score' | 'streak' | 'level' | 'progress'>('score')
  const [filterBy, setFilterBy] = useState<'all' | 'top10' | 'friends' | 'level'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Sample data
  useEffect(() => {
    const sampleChallenges: Challenge[] = [
      {
        id: '1',
        title: '12-Week Fitness Transformation',
        participantsCount: 156,
        isActive: true,
        endDate: Date.now() + (70 * 24 * 60 * 60 * 1000)
      },
      {
        id: '2',
        title: '30-Day Weight Loss Challenge',
        participantsCount: 89,
        isActive: true,
        endDate: Date.now() + (25 * 24 * 60 * 60 * 1000)
      },
      {
        id: '3',
        title: 'Strength Building Program',
        participantsCount: 67,
        isActive: false,
        endDate: Date.now() + (49 * 24 * 60 * 60 * 1000)
      }
    ]
    setChallenges(sampleChallenges)
    setSelectedChallenge(sampleChallenges[0].id)

    const sampleLeaderboard: LeaderboardEntry[] = [
      {
        id: '1',
        rank: 1,
        previousRank: 1,
        name: 'Sarah Johnson',
        avatar: '👩‍💼',
        score: 15420,
        streak: 28,
        level: 15,
        badges: ['🏆', '🔥', '⭐'],
        isCurrentUser: false,
        progress: 95,
        lastActive: Date.now() - (2 * 60 * 60 * 1000)
      },
      {
        id: '2',
        rank: 2,
        previousRank: 3,
        name: 'Mike Chen',
        avatar: '👨‍💻',
        score: 14850,
        streak: 25,
        level: 14,
        badges: ['🥈', '🔥'],
        isCurrentUser: false,
        progress: 92,
        lastActive: Date.now() - (1 * 60 * 60 * 1000)
      },
      {
        id: '3',
        rank: 3,
        previousRank: 2,
        name: 'Emma Davis',
        avatar: '👩‍🎨',
        score: 14200,
        streak: 22,
        level: 13,
        badges: ['🥉', '⭐'],
        isCurrentUser: false,
        progress: 88,
        lastActive: Date.now() - (30 * 60 * 1000)
      },
      {
        id: '4',
        rank: 4,
        previousRank: 5,
        name: 'Alex Rodriguez',
        avatar: '👨‍🏫',
        score: 13850,
        streak: 20,
        level: 12,
        badges: ['🔥'],
        isCurrentUser: false,
        progress: 85,
        lastActive: Date.now() - (45 * 60 * 1000)
      },
      {
        id: '5',
        rank: 5,
        previousRank: 4,
        name: 'Lisa Wang',
        avatar: '👩‍⚕️',
        score: 13500,
        streak: 18,
        level: 11,
        badges: ['⭐'],
        isCurrentUser: false,
        progress: 82,
        lastActive: Date.now() - (1 * 60 * 60 * 1000)
      },
      {
        id: '6',
        rank: 23,
        previousRank: 25,
        name: 'You (Current User)',
        avatar: '👤',
        score: 8900,
        streak: 12,
        level: 8,
        badges: ['🎯'],
        isCurrentUser: true,
        progress: 65,
        lastActive: Date.now()
      }
    ]
    setLeaderboard(sampleLeaderboard)
  }, [])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>
    }
  }

  const getRankChange = (current: number, previous: number) => {
    if (current < previous) {
      return <ArrowUp className="w-4 h-4 text-green-500" />
    } else if (current > previous) {
      return <ArrowDown className="w-4 h-4 text-red-500" />
    } else {
      return <Minus className="w-4 h-4 text-gray-400" />
    }
  }

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case '🏆':
        return <Trophy className="w-4 h-4 text-yellow-500" />
      case '🥈':
        return <Medal className="w-4 h-4 text-gray-400" />
      case '🥉':
        return <Medal className="w-4 h-4 text-amber-600" />
      case '🔥':
        return <Flame className="w-4 h-4 text-orange-500" />
      case '⭐':
        return <Star className="w-4 h-4 text-yellow-400" />
      case '🎯':
        return <Target className="w-4 h-4 text-blue-500" />
      default:
        return <span className="text-sm">{badge}</span>
    }
  }

  const getLevelColor = (level: number) => {
    if (level >= 15) return 'bg-purple-100 text-purple-800'
    if (level >= 10) return 'bg-blue-100 text-blue-800'
    if (level >= 5) return 'bg-green-100 text-green-800'
    return 'bg-gray-100 text-gray-800'
  }

  const filteredLeaderboard = leaderboard
    .filter(entry => {
      if (searchQuery && !entry.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      if (filterBy === 'top10' && entry.rank > 10) return false
      if (filterBy === 'friends' && !entry.isCurrentUser) return false
      if (filterBy === 'level' && entry.level < 10) return false
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.score - a.score
        case 'streak':
          return b.streak - a.streak
        case 'level':
          return b.level - a.level
        case 'progress':
          return b.progress - a.progress
        default:
          return a.rank - b.rank
      }
    })

  const addRandomUser = () => {
    const names = ['John Smith', 'Maria Garcia', 'David Kim', 'Anna Wilson', 'James Brown']
    const randomName = names[Math.floor(Math.random() * names.length)]
    const randomScore = Math.floor(Math.random() * 15000) + 1000
    const randomStreak = Math.floor(Math.random() * 30) + 1
    const randomLevel = Math.floor(Math.random() * 15) + 1

    const newUser: LeaderboardEntry = {
      id: Date.now().toString(),
      rank: leaderboard.length + 1,
      previousRank: leaderboard.length + 1,
      name: randomName,
      avatar: '👤',
      score: randomScore,
      streak: randomStreak,
      level: randomLevel,
      badges: ['🎯'],
      isCurrentUser: false,
      progress: Math.floor(Math.random() * 100) + 1,
      lastActive: Date.now() - (Math.random() * 24 * 60 * 60 * 1000)
    }

    setLeaderboard(prev => [...prev, newUser])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="w-12 h-12 text-yellow-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Leaderboard Test Suite</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Test and debug leaderboard functionality with comprehensive tools
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Controls Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2 text-blue-600" />
                  Test Controls
                </CardTitle>
                <CardDescription>
                  Manage leaderboard data and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Challenge Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Challenge
                  </label>
                  <select
                    value={selectedChallenge}
                    onChange={(e) => setSelectedChallenge(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {challenges.map((challenge) => (
                      <option key={challenge.id} value={challenge.id}>
                        {challenge.title} ({challenge.participantsCount} participants)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="score">Score (High to Low)</option>
                    <option value="streak">Streak (High to Low)</option>
                    <option value="level">Level (High to Low)</option>
                    <option value="progress">Progress (High to Low)</option>
                  </select>
                </div>

                {/* Filter Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter By
                  </label>
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Participants</option>
                    <option value="top10">Top 10 Only</option>
                    <option value="friends">Friends Only</option>
                    <option value="level">Level 10+ Only</option>
                  </select>
                </div>

                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Users
                  </label>
                  <Input
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Add Random User */}
                <Button onClick={addRandomUser} className="w-full">
                  <Users className="w-4 h-4 mr-2" />
                  Add Random User
                </Button>
              </CardContent>
            </Card>

            {/* Leaderboard Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                  Leaderboard Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-blue-800">Total Participants</span>
                    <span className="text-sm font-bold text-blue-600">{leaderboard.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-green-800">Average Score</span>
                    <span className="text-sm font-bold text-green-600">
                      {Math.round(leaderboard.reduce((sum, entry) => sum + entry.score, 0) / leaderboard.length)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <span className="text-sm font-medium text-yellow-800">Highest Streak</span>
                    <span className="text-sm font-bold text-yellow-600">
                      {Math.max(...leaderboard.map(entry => entry.streak))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm font-medium text-purple-800">Highest Level</span>
                    <span className="text-sm font-bold text-purple-600">
                      {Math.max(...leaderboard.map(entry => entry.level))}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard Display */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
                    Leaderboard
                  </span>
                  <span className="text-sm text-gray-500">
                    {filteredLeaderboard.length} of {leaderboard.length} participants
                  </span>
                </CardTitle>
                <CardDescription>
                  {challenges.find(c => c.id === selectedChallenge)?.title}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredLeaderboard.map((entry, index) => (
                    <div
                      key={entry.id}
                      className={`flex items-center space-x-4 p-4 rounded-lg border transition-colors ${
                        entry.isCurrentUser
                          ? 'bg-blue-50 border-blue-200 shadow-sm'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {/* Rank */}
                      <div className="flex items-center justify-center w-12">
                        {getRankIcon(entry.rank)}
                      </div>

                      {/* Rank Change */}
                      <div className="flex items-center justify-center w-8">
                        {getRankChange(entry.rank, entry.previousRank)}
                      </div>

                      {/* Avatar & Name */}
                      <div className="flex items-center space-x-3 flex-1">
                        <span className="text-2xl">{entry.avatar}</span>
                        <div>
                          <div className="font-medium text-gray-900">
                            {entry.name}
                            {entry.isCurrentUser && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            Level {entry.level} • {entry.streak} day streak
                          </div>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex items-center space-x-1">
                        {entry.badges.map((badge, badgeIndex) => (
                          <div key={badgeIndex} className="flex items-center justify-center w-6 h-6">
                            {getBadgeIcon(badge)}
                          </div>
                        ))}
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{entry.score.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">{entry.progress}% complete</div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredLeaderboard.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>No participants match the current filters</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <a href="/">
            <Button className="bg-yellow-600 hover:bg-yellow-700">← Back to Home</Button>
          </a>
        </div>
      </div>
    </div>
  )
} 