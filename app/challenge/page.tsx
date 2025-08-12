'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { db } from '@/src/lib/firebase.client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { Input } from '@/src/components/ui/Input'
import Link from 'next/link'
import { Search, Filter, Calendar, Users, Target, DollarSign, ArrowRight, TrendingUp } from 'lucide-react'

interface Challenge {
  id: string
  name: string
  description?: string
  startDate?: string
  endDate?: string
  durationDays?: number
  priceCents: number
  currency: string
  status: 'draft' | 'published' | 'archived'
  participantsCount?: number
  challengeType?: string
  tags?: string[]
}

export default function ChallengePage() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [filteredChallenges, setFilteredChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const challengesQuery = query(
          collection(db, 'challenges'),
          where('status', '==', 'published'),
          orderBy('startDate', 'desc')
        )
        const challengesSnap = await getDocs(challengesQuery)
        
        const challengesData = challengesSnap.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            participantsCount: data.participantsCount || 0
          } as Challenge
        })
        
        setChallenges(challengesData)
        setFilteredChallenges(challengesData)
      } catch (error) {
        console.error('Error fetching challenges:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchChallenges()
  }, [])

  useEffect(() => {
    filterChallenges()
  }, [challenges, searchTerm, selectedType])

  const filterChallenges = () => {
    let filtered = challenges

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(challenge => challenge.challengeType === selectedType)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(challenge =>
        challenge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        challenge.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        challenge.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    setFilteredChallenges(filtered)
  }

  const challengeTypes = [
    { value: 'all', label: 'All Types', color: 'bg-gray-100 text-gray-800' },
    { value: 'fitness', label: 'Fitness', color: 'bg-blue-100 text-blue-800' },
    { value: 'weight-loss', label: 'Weight Loss', color: 'bg-green-100 text-green-800' },
    { value: 'wellness', label: 'Wellness', color: 'bg-purple-100 text-purple-800' },
    { value: 'strength', label: 'Strength', color: 'bg-red-100 text-red-800' },
    { value: 'endurance', label: 'Endurance', color: 'bg-orange-100 text-orange-800' }
  ]

  const getProgressStatus = (challenge: Challenge) => {
    if (!challenge.startDate || !challenge.endDate) return 'Coming Soon'
    
    const now = new Date()
    const start = new Date(challenge.startDate)
    const end = new Date(challenge.endDate)
    
    if (now < start) return 'Coming Soon'
    if (now > end) return 'Completed'
    return 'Active Now'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active Now':
        return 'bg-green-100 text-green-800'
      case 'Coming Soon':
        return 'bg-blue-100 text-blue-800'
      case 'Completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Fitness Challenges</h1>
        </div>
        <p className="text-gray-600 text-lg">
          Join exciting fitness challenges and transform your life with our community
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search challenges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            {challengeTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  selectedType === type.value
                    ? 'bg-blue-600 text-white'
                    : type.color
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Challenges Grid */}
      {filteredChallenges.length === 0 ? (
        <div className="text-center py-12">
          <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No challenges found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || selectedType !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'There are currently no active fitness challenges'
            }
          </p>
          {(searchTerm || selectedType !== 'all') && (
            <Button
              onClick={() => {
                setSearchTerm('')
                setSelectedType('all')
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((challenge) => {
            const status = getProgressStatus(challenge)
            const statusColor = getStatusColor(status)
            
            return (
              <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{challenge.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {challenge.description || 'Join this fitness challenge and transform your life!'}
                      </CardDescription>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                      {status}
                    </span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{challenge.participantsCount} participants</span>
                    </div>
                    
                    {challenge.startDate && challenge.endDate && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>
                          {new Date(challenge.startDate).toLocaleDateString()} - {new Date(challenge.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    
                    {challenge.durationDays && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Target className="h-4 w-4 mr-2" />
                        <span>{challenge.durationDays} days</span>
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span className="font-medium">
                        ${(challenge.priceCents / 100).toFixed(2)} {challenge.currency}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Link href={`/challenge/${challenge.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    
                    <Link href={`/join/${challenge.id}`} className="flex-1">
                      <Button className="w-full">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Join Now
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Call to Action */}
      <div className="mt-12 text-center">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Ready to start your fitness journey?
          </h3>
          <p className="text-gray-600 mb-6">
            Join a challenge today and connect with like-minded people who share your fitness goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/leaderboard">
              <Button variant="outline" size="lg">
                View Leaderboards
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
} 