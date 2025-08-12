'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { Input } from '@/src/components/ui/Input'
import { getChallenges, getChallengesByType } from '@/src/lib/challenges'
import { Challenge, ChallengeType } from '@/src/types'
import { Search, Filter, Calendar, Users, Target, DollarSign, TrendingUp, Dumbbell, Heart, Star, Settings, Download } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/src/lib/auth'
import { CalendarService } from '@/src/lib/calendar'

export default function ChallengesPage() {
  const { profile } = useAuth()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [filteredChallenges, setFilteredChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [populating, setPopulating] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<ChallengeType | 'all'>('all')

  useEffect(() => {
    loadChallenges()
  }, [])

  useEffect(() => {
    filterChallenges()
  }, [challenges, searchTerm, selectedType])

  const loadChallenges = async () => {
    try {
      console.log('🔍 Loading challenges...')
      const data = await getChallenges('published')
      console.log('📊 Challenges loaded:', data)
      console.log('📊 Number of challenges:', data.length)
      
      // Debug: Check the structure of the first challenge
      if (data.length > 0) {
        console.log('🔍 First challenge structure:', data[0])
        console.log('🔍 First challenge scoring:', data[0].scoring)
        console.log('🔍 First challenge has scoring property:', 'scoring' in data[0])
      }
      
      setChallenges(data)
    } catch (error) {
      console.error('❌ Error loading challenges:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterChallenges = () => {
    console.log('🔍 Filtering challenges...')
    console.log('🔍 Original challenges:', challenges)
    console.log('🔍 Selected type:', selectedType)
    console.log('🔍 Search term:', searchTerm)
    
    let filtered = challenges

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(challenge => challenge.challengeType === selectedType)
      console.log('🔍 After type filter:', filtered)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(challenge =>
        challenge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        challenge.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        challenge.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      console.log('🔍 After search filter:', filtered)
    }

    console.log('🔍 Final filtered challenges:', filtered)
    setFilteredChallenges(filtered)
  }

  const challengeTypes: { value: ChallengeType; label: string; color: string }[] = [
    { value: 'fitness', label: 'Fitness', color: 'bg-blue-100 text-blue-800' },
    { value: 'weight-loss', label: 'Weight Loss', color: 'bg-green-100 text-green-800' },
    { value: 'wellness', label: 'Wellness', color: 'bg-purple-100 text-purple-800' },
    { value: 'strength', label: 'Strength', color: 'bg-red-100 text-red-800' },
    { value: 'endurance', label: 'Endurance', color: 'bg-orange-100 text-orange-800' }
  ]

  const formatPrice = (priceCents: number, currency: string) => {
    // Ensure currency is valid, default to USD if not
    const validCurrency = currency && ['USD', 'AUD', 'EUR', 'GBP'].includes(currency) ? currency : 'USD'
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: validCurrency
    }).format(priceCents / 100)
  }

  const getProgressStatus = (challenge: Challenge) => {
    if (!challenge.startDate || !challenge.endDate) return 'Coming Soon'
    
    const now = new Date()
    const start = new Date(challenge.startDate)
    const end = new Date(challenge.endDate)
    
    if (now < start) return 'Coming Soon'
    if (now > end) return 'Completed'
    return 'Active'
  }

  const exportChallengeCalendar = (challenge: Challenge) => {
    try {
      const icsContent = CalendarService.generateChallengeCalendar(challenge, challenge.habits || [])
      const filename = `${challenge.name.replace(/[^a-z0-9]/gi, '_')}_calendar.ics`
      CalendarService.downloadCalendar(icsContent, filename)
    } catch (error) {
      console.error('Error exporting calendar:', error)
      alert('Failed to export calendar. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading challenges...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 opacity-90"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Transform Your Life
              <span className="block text-3xl md:text-4xl font-light mt-2">One Challenge at a Time</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              Join thousands of people achieving their fitness goals through our proven challenge system
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center space-x-2 text-blue-100">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Live Challenges</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-100">
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Expert Support</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-100">
                <div className="w-3 h-3 bg-pink-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Proven Results</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white opacity-10 rounded-full translate-x-24 translate-y-24"></div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{challenges.length}</div>
            <div className="text-gray-600 font-medium">Total Challenges</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {challenges.reduce((sum, c) => sum + (c.currentParticipants || 0), 0).toLocaleString()}
            </div>
            <div className="text-gray-600 font-medium">Active Participants</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {challenges.filter(c => c.status === 'published').length}
            </div>
            <div className="text-gray-600 font-medium">Live Now</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {challenges.filter(c => c.challengeType === 'fitness').length}
            </div>
            <div className="text-gray-600 font-medium">Fitness Focus</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search for challenges, goals, or activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {challengeTypes.map((type) => (
                <Button
                  key={type.value}
                  variant={selectedType === type.value ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => setSelectedType(selectedType === type.value ? 'all' : type.value)}
                  className={`rounded-full px-6 py-3 transition-all duration-200 ${
                    selectedType === type.value 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                      : 'hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-gray-900">Available Challenges</h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {filteredChallenges.length} of {challenges.length}
              </span>
            </div>
            {filteredChallenges.length > 0 && (
              <div className="text-sm text-gray-500">
                Ready to transform your life?
              </div>
            )}
          </div>
        </div>

        {/* Challenges Grid */}
        {filteredChallenges.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {challenges.length === 0 ? 'Ready to Get Started?' : 'No Matches Found'}
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {challenges.length === 0 
                  ? 'We\'re setting up amazing fitness challenges for you. Get ready to transform your life!'
                  : 'Try adjusting your search or filters to discover the perfect challenge for your goals.'
                }
              </p>
              {challenges.length === 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse mr-2"></div>
                    <span className="text-sm font-medium text-blue-800">Quick Setup</span>
                  </div>
                  <p className="text-blue-800 mb-6 text-sm">
                    Click below to instantly populate your app with 5 amazing fitness challenges and start your transformation journey!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={async () => {
                        setPopulating(true)
                        try {
                          const response = await fetch('/api/populate-demo', { method: 'POST' })
                          const result = await response.json()
                          if (result.success) {
                            alert('Demo challenges added successfully! Refreshing page...')
                            window.location.reload()
                          } else {
                            alert(result.message || 'Failed to add demo challenges')
                          }
                        } catch (error) {
                          alert('Error adding demo challenges. Please try again.')
                        } finally {
                          setPopulating(false)
                        }
                      }}
                      disabled={populating}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-blue-200"
                    >
                      {populating ? '⏳ Setting Up...' : '🚀 Launch Demo Challenges'}
                    </button>
                    <button
                      onClick={() => {
                        console.log('🔍 Manual refresh triggered')
                        loadChallenges()
                      }}
                      className="bg-white text-gray-700 px-6 py-3 rounded-full hover:bg-gray-50 transition-all duration-200 font-medium border border-gray-200"
                    >
                      🔄 Refresh
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredChallenges.map((challenge) => (
              <Card key={challenge.id} className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-0 bg-white overflow-hidden">
                {/* Banner Image */}
                {challenge.bannerUrl && (
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={challenge.bannerUrl}
                      alt={challenge.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                        challenge.challengeType === 'fitness' ? 'bg-blue-500' :
                        challenge.challengeType === 'weight-loss' ? 'bg-green-500' :
                        challenge.challengeType === 'strength' ? 'bg-red-500' :
                        challenge.challengeType === 'wellness' ? 'bg-purple-500' :
                        'bg-orange-500'
                      }`}>
                        {challengeTypes.find(t => t.value === challenge.challengeType)?.label}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        getProgressStatus(challenge) === 'Active' ? 'bg-green-500 text-white' :
                        getProgressStatus(challenge) === 'Coming Soon' ? 'bg-blue-500 text-white' :
                        'bg-gray-500 text-white'
                      }`}>
                        {getProgressStatus(challenge)}
                      </span>
                    </div>
                  </div>
                )}
                
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    {/* Challenge Thumbnail */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 overflow-hidden group-hover:scale-105 transition-transform duration-200">
                        {challenge.bannerUrl ? (
                          <img
                            src={challenge.bannerUrl}
                            alt={challenge.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                            {challenge.challengeType === 'fitness' ? (
                              <TrendingUp className="w-8 h-8 text-blue-600" />
                            ) : challenge.challengeType === 'weight-loss' ? (
                              <Target className="w-8 h-8 text-green-600" />
                            ) : challenge.challengeType === 'strength' ? (
                              <Dumbbell className="w-8 h-8 text-red-600" />
                            ) : challenge.challengeType === 'wellness' ? (
                              <Heart className="w-8 h-8 text-purple-600" />
                            ) : challenge.challengeType === 'endurance' ? (
                              <Star className="w-8 h-8 text-orange-600" />
                            ) : (
                              <Star className="w-8 h-8 text-gray-600" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Challenge Info */}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                        {challenge.name}
                      </CardTitle>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-500 font-medium">
                          {challenge.challengeType === 'fitness' ? 'Fitness Challenge' :
                           challenge.challengeType === 'weight-loss' ? 'Weight Loss Challenge' :
                           challenge.challengeType === 'strength' ? 'Strength Building Challenge' :
                           challenge.challengeType === 'wellness' ? 'Wellness Challenge' :
                           challenge.challengeType === 'endurance' ? 'Endurance Challenge' :
                           'Fitness Challenge'}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                          <span className="text-blue-700">Hosted by:</span>
                          <span className="font-semibold text-blue-800">
                            {challenge.challengeType === 'fitness' ? 'Coach Sarah' :
                             challenge.challengeType === 'weight-loss' ? 'Coach Mike' :
                             challenge.challengeType === 'strength' ? 'Coach Alex' :
                             challenge.challengeType === 'wellness' ? 'Coach Emma' :
                             challenge.challengeType === 'endurance' ? 'Coach David' :
                             'Coach Jordan'}
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {/* Challenge Stats */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <Calendar className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {challenge.startDate && challenge.endDate ? (
                            `${new Date(challenge.startDate).toLocaleDateString()} - ${new Date(challenge.endDate).toLocaleDateString()}`
                          ) : (
                            `${challenge.durationDays || 0} days`
                          )}
                        </div>
                        <div className="text-xs text-gray-500">Duration</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <Users className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {(challenge.currentParticipants || 0).toLocaleString()} / {challenge.maxParticipants ? challenge.maxParticipants.toLocaleString() : '∞'}
                        </div>
                        <div className="text-xs text-gray-500">Participants</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <Target className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {((challenge.scoring?.checkinPoints || 0) + ((challenge.scoring?.workoutPoints || 0) * 2) + (challenge.scoring?.nutritionPoints || 0))} pts/day
                        </div>
                        <div className="text-xs text-gray-500">Max Points</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Price and CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center text-2xl font-bold text-green-600">
                      <DollarSign className="w-5 h-5 mr-1" />
                      {formatPrice(challenge.priceCents, challenge.currency)}
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Calendar Export Button */}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => exportChallengeCalendar(challenge)}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-full"
                        title="Export Calendar"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      
                      {/* Settings button for coaches/admins */}
                      {(profile?.role === 'coach' || profile?.role === 'admin') && (
                        <Link href={`/challenge-settings/${challenge.id}`}>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-full"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                        </Link>
                      )}
                                              <Link href={`/challenge/${challenge.id}`}>
                          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-full font-medium shadow-lg shadow-blue-200">
                            View Details
                          </Button>
                        </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* Footer CTA */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-12 text-white">
            <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Life?</h3>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of people who have already achieved their fitness goals through our proven challenge system
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-full font-medium text-lg">
                Start Your Journey
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-full font-medium text-lg">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 