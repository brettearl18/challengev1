'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { getChallenge, getChallengeParticipants, getUserEnrolments } from '@/src/lib/challenges'
import { useAuth } from '@/src/lib/auth'
import { Challenge, ChallengeType, Enrolment } from '@/src/types'
import { Calendar, Users, Target, DollarSign, Clock, Award, CheckCircle, Star, TrendingUp, BarChart3, Trophy, Settings } from 'lucide-react'
import Link from 'next/link'
import CalendarView from '@/src/components/CalendarView'

export default function ChallengeDetailPage() {
  const params = useParams()
  const { user, profile } = useAuth()
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [participants, setParticipants] = useState<any[]>([])
  const [userEnrolment, setUserEnrolment] = useState<Enrolment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      loadChallenge(params.id as string)
    }
  }, [params.id])

  const loadChallenge = async (id: string) => {
    try {
      setLoading(true)
      const challengeData = await getChallenge(id)
      if (challengeData) {
        setChallenge(challengeData)
        // Load participants
        const participantsData = await getChallengeParticipants(id)
        setParticipants(participantsData)
      } else {
        setError('Challenge not found')
      }
    } catch (err) {
      setError('Failed to load challenge')
      console.error('Error loading challenge:', err)
    } finally {
      setLoading(false)
    }
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

  const getProgressPercentage = (challenge: Challenge) => {
    if (!challenge.startDate || !challenge.endDate) return 0
    
    const now = new Date()
    const start = new Date(challenge.startDate)
    const end = new Date(challenge.endDate)
    
    if (now < start) return 0
    if (now > end) return 100
    
    const totalDuration = end.getTime() - start.getTime()
    const elapsed = now.getTime() - start.getTime()
    
    return Math.round((elapsed / totalDuration) * 100)
  }

  const challengeTypes: { value: ChallengeType; label: string; color: string; description: string }[] = [
    { value: 'fitness', label: 'Fitness', color: 'bg-blue-100 text-blue-800', description: 'General fitness and wellness challenges' },
    { value: 'weight-loss', label: 'Weight Loss', color: 'bg-green-100 text-green-800', description: 'Focused on healthy weight management' },
    { value: 'wellness', label: 'Wellness', color: 'bg-purple-100 text-purple-800', description: 'Mental and physical wellness focus' },
    { value: 'strength', label: 'Strength', color: 'bg-red-100 text-red-800', description: 'Building muscle and strength' },
    { value: 'endurance', label: 'Endurance', color: 'bg-orange-100 text-orange-800', description: 'Improving stamina and endurance' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Challenge</h2>
          <p className="text-gray-600">Preparing your transformation journey...</p>
        </div>
      </div>
    )
  }

  if (error || !challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Target className="w-12 h-12 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Challenge Not Found</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">{error || 'The challenge you are looking for does not exist.'}</p>
          <Link href="/challenges">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full font-medium shadow-lg shadow-blue-200">
              ← Back to Challenges
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const challengeType = challengeTypes.find(t => t.value === challenge.challengeType)
  const progressStatus = getProgressStatus(challenge)
  const progressPercentage = getProgressPercentage(challenge)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Challenge Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 opacity-3"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-indigo-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
        
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-7xl mx-auto">
            {/* Enhanced Breadcrumb */}
            <div className="mb-8">
              <Link href="/challenges" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-all duration-200 hover:gap-3 group">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <span className="text-lg">←</span>
                </div>
                <span>Back to Challenges</span>
              </Link>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8 lg:gap-16 items-start">
              {/* Left Column - Challenge Info */}
              <div className="lg:col-span-2 min-w-0">
                {/* Enhanced Badges */}
                <div className="flex flex-wrap items-center gap-4 mb-8">
                  <span className={`px-6 py-3 rounded-full text-sm font-bold text-white shadow-lg whitespace-nowrap ${
                    challenge.challengeType === 'fitness' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                    challenge.challengeType === 'weight-loss' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                    challenge.challengeType === 'strength' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                    challenge.challengeType === 'wellness' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                    'bg-gradient-to-r from-orange-500 to-orange-600'
                  }`}>
                    {challengeType?.label}
                  </span>
                  <span className={`px-6 py-3 rounded-full text-sm font-bold shadow-lg whitespace-nowrap ${
                    progressStatus === 'Active' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' :
                    progressStatus === 'Coming Soon' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' :
                    'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                  }`}>
                    {progressStatus}
                  </span>
                  
                  {/* Settings button for coaches/admins */}
                  {(profile?.role === 'coach' || profile?.role === 'admin') && (
                    <Link 
                      href={`/challenge-settings/${challenge.id}`}
                      className="px-4 py-3 rounded-full text-sm font-bold bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-lg transition-all duration-200 border border-gray-200/50 flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                  )}
                </div>
                
                {/* Enhanced Title */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 bg-clip-text text-transparent break-words">
                  {challenge.name}
                </h1>
                {challenge.description && (
                  <p className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-10 leading-relaxed max-w-4xl break-words">
                    {challenge.description}
                  </p>
                )}
                
                {/* Enhanced Progress Section */}
                {challenge.startDate && challenge.endDate && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 mb-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">Challenge Progress</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {progressPercentage}%
                        </div>
                        <div className="text-sm text-gray-500">Complete</div>
                      </div>
                    </div>
                    
                    {/* Enhanced Progress Bar */}
                    <div className="w-full bg-gray-100 rounded-2xl h-6 mb-8 p-1">
                      <div 
                        className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 h-full rounded-xl transition-all duration-1000 ease-out shadow-lg"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                    
                    {/* Enhanced Progress Stats */}
                    <div className="grid grid-cols-3 gap-6">
                      <div className="text-center group">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                          <Calendar className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                          {challenge.startDate && challenge.endDate ? (
                            Math.ceil((new Date(challenge.endDate).getTime() - new Date(challenge.startDate).getTime()) / (1000 * 60 * 60 * 24))
                          ) : (
                            challenge.durationDays || 0
                          )}
                        </div>
                        <div className="text-sm text-gray-500 font-medium">Total Days</div>
                      </div>
                      
                      <div className="text-center group">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                          <Clock className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                          {challenge.startDate ? Math.ceil((new Date().getTime() - new Date(challenge.startDate).getTime()) / (1000 * 60 * 60 * 24)) : 0}
                        </div>
                        <div className="text-sm text-gray-500 font-medium">Days Elapsed</div>
                      </div>
                      
                      <div className="text-center group">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                          <Target className="w-8 h-8 text-purple-600" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                          {challenge.endDate ? Math.ceil((new Date(challenge.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0}
                        </div>
                        <div className="text-sm text-gray-500 font-medium">Days Remaining</div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Enhanced Challenge Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                  <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                      <Calendar className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {challenge.startDate && challenge.endDate ? (
                        `${new Date(challenge.startDate).toLocaleDateString()} - ${new Date(challenge.endDate).toLocaleDateString()}`
                      ) : (
                        `${challenge.durationDays || 0} days`
                      )}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Duration</div>
                  </div>
                  
                  <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                      <Users className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {(challenge.currentParticipants || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Participants</div>
                  </div>
                  
                  <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                      <Target className="w-8 h-8 text-purple-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {((challenge.scoring?.checkinPoints || 0) + ((challenge.scoring?.workoutPoints || 0) * 2) + (challenge.scoring?.nutritionPoints || 0))}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Max Points/Day</div>
                  </div>
                </div>
                
                {/* Enhanced CTA Section */}
                <div className="relative bg-gradient-to-r from-green-50 via-blue-50 to-indigo-50 rounded-3xl p-10 border border-green-200/50 overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl"></div>
                  
                  <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center">
                          <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                          Free Challenge
                        </div>
                      </div>
                      <p className="text-xl text-gray-700 leading-relaxed max-w-2xl">
                        Join thousands of participants and start your transformation today! This is your opportunity to achieve your fitness goals with expert guidance and community support.
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <Link href={`/join/${challenge.id}`}>
                        <Button size="lg" className="bg-gradient-to-r from-green-600 via-blue-600 to-indigo-600 hover:from-green-700 hover:via-blue-700 hover:to-indigo-700 text-white px-10 py-5 rounded-full font-bold text-xl shadow-2xl shadow-green-300/50 hover:shadow-green-400/50 transition-all duration-300 hover:scale-105">
                          🚀 Join Challenge Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Column - Hosted By Coach Section */}
              <div className="hidden lg:block flex-shrink-0">
                <div className="sticky top-8">
                  <div className="relative">
                    {/* Main Coach Profile Card */}
                    <div className="w-64 lg:w-72 xl:w-80 bg-gradient-to-br from-white via-blue-50/50 to-indigo-50/50 rounded-3xl p-8 shadow-2xl border border-white/20 relative overflow-hidden">
                      {/* Background Pattern */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 opacity-5"></div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-2xl"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-200/20 to-blue-200/20 rounded-full blur-2xl"></div>
                      
                      {/* Hosted By Header */}
                      <div className="text-center mb-6 relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white text-sm font-semibold mb-4">
                          <Star className="w-4 h-4" />
                          Hosted By
                        </div>
                      </div>
                      
                      {/* Coach Avatar */}
                      <div className="flex justify-center mb-6 relative z-10">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                          <Users className="w-12 h-12 text-white" />
                        </div>
                      </div>
                      
                      {/* Coach Info */}
                      <div className="text-center relative z-10">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Coach Name</h3>
                        <p className="text-sm text-blue-600 font-medium mb-3">Certified Personal Trainer</p>
                        <p className="text-sm text-gray-600 leading-relaxed mb-4">
                          Specializing in fitness challenges and transformation programs. Helping clients achieve their goals through structured, motivating challenges.
                        </p>
                        
                        {/* Coach Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">50+</div>
                            <div className="text-xs text-gray-500">Challenges</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">1.2k+</div>
                            <div className="text-xs text-gray-500">Participants</div>
                          </div>
                        </div>
                        
                        {/* Follow Button */}
                        <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 hover:shadow-lg hover:scale-105">
                          Follow Coach
                        </button>
                      </div>
                      
                      {/* Floating Elements */}
                      <div className="absolute top-8 left-8 w-3 h-3 bg-blue-400/20 rounded-full animate-pulse"></div>
                      <div className="absolute top-16 right-8 w-2 h-2 bg-purple-400/20 rounded-full animate-pulse delay-1000"></div>
                      <div className="absolute bottom-8 left-12 w-2.5 h-2.5 bg-indigo-400/20 rounded-full animate-pulse delay-500"></div>
                    </div>
                    
                    {/* Decorative Elements */}
                    <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-green-200 to-blue-200 rounded-full opacity-40 blur-xl"></div>
                    <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-40 blur-xl"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Scoring System */}
            <Card className="border-0 shadow-lg bg-white rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                  </div>
                  Scoring System
                </CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Understand how points are awarded for different activities and maximize your daily score
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 mb-4 text-lg">Daily Activities</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="font-medium text-gray-900">Daily Check-in</span>
                        </div>
                        <span className="text-xl font-bold text-blue-600">{challenge.scoring?.checkinPoints || 0} pts</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="font-medium text-gray-900">Workouts (max 2/day)</span>
                        </div>
                        <span className="text-xl font-bold text-green-600">{challenge.scoring?.workoutPoints || 0} pts each</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Star className="w-4 h-4 text-purple-600" />
                          </div>
                          <span className="font-medium text-gray-900">Nutrition Score</span>
                        </div>
                        <span className="text-xl font-bold text-purple-600">Up to {challenge.scoring?.nutritionPoints || 0} pts</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 mb-4 text-lg">Bonus Points</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Target className="w-4 h-4 text-orange-600" />
                          </div>
                          <span className="font-medium text-gray-900">Steps Buckets</span>
                        </div>
                        <span className="text-xl font-bold text-orange-600">2 pts per bucket</span>
                      </div>
                      
                      {challenge.scoring?.weightLossPoints && (
                        <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                              <TrendingUp className="w-4 h-4 text-red-600" />
                            </div>
                            <span className="font-medium text-gray-900">Weight Loss</span>
                          </div>
                          <span className="text-xl font-bold text-red-600">{challenge.scoring.weightLossPoints} pts</span>
                        </div>
                      )}
                      
                      {challenge.scoring?.consistencyBonus && (
                        <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                              <Award className="w-4 h-4 text-indigo-600" />
                            </div>
                            <span className="font-medium text-gray-900">Consistency Bonus</span>
                          </div>
                          <span className="text-xl font-bold text-indigo-600">{challenge.scoring.consistencyBonus} pts</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {challenge.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {challenge.requirements.fitnessLevel && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Fitness Level:</span>
                        <span className="capitalize">{challenge.requirements.fitnessLevel}</span>
                      </div>
                    )}
                    {challenge.requirements.minAge && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Minimum Age:</span>
                        <span>{challenge.requirements.minAge} years</span>
                      </div>
                    )}
                    {challenge.requirements.equipment && challenge.requirements.equipment.length > 0 && (
                      <div>
                        <span className="font-medium">Equipment Needed:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {challenge.requirements.equipment.map((item, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 rounded text-sm">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {challenge.requirements.medicalClearance && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Medical Clearance:</span>
                        <span className="text-amber-600">Required</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Prizes */}
            {challenge.prizes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Prizes & Rewards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {challenge.prizes.firstPlace && (
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl mb-2">🥇</div>
                        <div className="font-semibold">1st Place</div>
                        <div className="text-sm text-gray-600">{challenge.prizes.firstPlace}</div>
                      </div>
                    )}
                    {challenge.prizes.secondPlace && (
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl mb-2">🥈</div>
                        <div className="font-semibold">2nd Place</div>
                        <div className="text-sm text-gray-600">{challenge.prizes.secondPlace}</div>
                      </div>
                    )}
                    {challenge.prizes.thirdPlace && (
                      <div className="text-center p-4 bg-amber-50 rounded-lg">
                        <div className="text-2xl mb-2">🥉</div>
                        <div className="font-semibold">3rd Place</div>
                        <div className="text-sm text-gray-600">{challenge.prizes.thirdPlace}</div>
                      </div>
                    )}
                  </div>
                  {challenge.prizes.participation && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg text-center">
                      <div className="font-semibold text-green-800">Participation Reward</div>
                      <div className="text-sm text-green-600">{challenge.prizes.participation}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Challenge Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type</span>
                  <span className="font-medium">{challengeType?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">
                    {challenge.startDate && challenge.endDate ? (
                      `${Math.ceil((new Date(challenge.endDate).getTime() - new Date(challenge.startDate).getTime()) / (1000 * 60 * 60 * 24))} days`
                    ) : (
                      `${challenge.durationDays} days`
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Participants</span>
                  <span className="font-medium">{challenge.maxParticipants || 'Unlimited'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Timezone</span>
                  <span className="font-medium">{challenge.timezone}</span>
                </div>
              </CardContent>
            </Card>

            {/* Participants */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Participants</CardTitle>
                <CardDescription>
                  {participants.length} people joined
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {participants.slice(0, 5).map((participant, index) => (
                    <div key={participant.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium text-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{participant.displayName || 'Anonymous'}</div>
                        <div className="text-sm text-gray-500">{participant.totalScore || 0} points</div>
                      </div>
                    </div>
                  ))}
                  {participants.length > 5 && (
                    <div className="text-center text-sm text-gray-500 pt-2">
                      +{participants.length - 5} more participants
                    </div>
                  )}
                </div>
                <Link href={`/leaderboard/${challenge.id}`} className="w-full mt-4">
                  <Button variant="outline" className="w-full">
                    View Full Leaderboard
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Tags */}
            {challenge.tags && challenge.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {challenge.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Challenge Calendar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Challenge Calendar
                </CardTitle>
                <CardDescription>
                  View your habits and challenge milestones. Export to sync with your phone calendar.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CalendarView 
                  challenge={challenge} 
                  habits={challenge.habits || []} 
                />
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Enhanced Footer CTA */}
        <div className="mt-24 text-center">
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-16 text-white overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
            
            <div className="relative">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-4xl md:text-5xl font-bold">Ready to Start Your Transformation?</h3>
              </div>
              <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
                Join this challenge and become part of a community dedicated to achieving their fitness goals. Your journey to a healthier, stronger you starts right here.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-4 rounded-full font-bold text-xl shadow-2xl shadow-white/20 hover:shadow-white/30 transition-all duration-300 hover:scale-105">
                  🚀 Join Challenge Now
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-10 py-4 rounded-full font-bold text-xl transition-all duration-300 hover:scale-105">
                  View All Challenges
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 