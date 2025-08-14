'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { Badge } from '@/src/components/ui/Badge'
import { Input } from '@/src/components/ui/Input'
import { 
  ArrowLeft,
  Users,
  UserPlus,
  UserMinus,
  Mail,
  MessageSquare,
  MoreVertical,
  Search,
  Filter,
  Calendar,
  Target,
  TrendingUp,
  Activity,
  Crown,
  Star
} from 'lucide-react'
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/src/lib/firebase.client'

export default function ChallengeParticipantsPage() {
  const params = useParams()
  const router = useRouter()
  const [participants, setParticipants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const challengeId = params.id as string

  useEffect(() => {
    if (!challengeId) return

    const unsubscribe = onSnapshot(
      query(
        collection(db, 'enrolments'),
        where('challengeId', '==', challengeId),
        orderBy('enrolledAt', 'desc')
      ),
      (snapshot) => {
        const participantData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setParticipants(participantData)
        setLoading(false)
      },
      (error) => {
        console.error('Error fetching participants:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [challengeId])

  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = participant.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participant.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || participant.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const updateParticipantStatus = async (participantId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'enrolments', participantId), {
        status: newStatus,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error updating participant status:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status || 'Unknown'}</Badge>
    }
  }

  const getActivityLevel = (lastCheckin: any) => {
    if (!lastCheckin) return 'inactive'
    const daysSince = Math.floor((Date.now() - lastCheckin.toDate()) / (1000 * 60 * 60 * 24))
    if (daysSince === 0) return 'today'
    if (daysSince <= 3) return 'recent'
    if (daysSince <= 7) return 'moderate'
    return 'inactive'
  }

  const getActivityIcon = (level: string) => {
    switch (level) {
      case 'today':
        return <Activity className="w-4 h-4 text-green-500" />
      case 'recent':
        return <TrendingUp className="w-4 h-4 text-blue-500" />
      case 'moderate':
        return <Star className="w-4 h-4 text-yellow-500" />
      default:
        return <Calendar className="w-4 h-4 text-gray-400" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Loading Participants...</h2>
          <p className="text-gray-500">Fetching participant data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/challenge-dashboard/${challengeId}`)}
                className="hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Challenge
              </Button>
              <div className="border-l border-gray-300 h-12"></div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Manage Participants</h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  View and manage challenge participants
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                className="hover:bg-gray-50 transition-colors"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Message
              </Button>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Invite More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-blue-100" />
                <div className="text-2xl font-bold">{participants.length}</div>
                <div className="text-blue-100">Total Participants</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Target className="w-8 h-8 mx-auto mb-2 text-green-100" />
                <div className="text-2xl font-bold">
                  {participants.filter(p => p.status === 'active').length}
                </div>
                <div className="text-green-100">Active</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-100" />
                <div className="text-2xl font-bold">
                  {participants.filter(p => getActivityLevel(p.lastCheckin) === 'today').length}
                </div>
                <div className="text-purple-100">Active Today</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Crown className="w-8 h-8 mx-auto mb-2 text-amber-100" />
                <div className="text-2xl font-bold">
                  {participants.filter(p => p.status === 'completed').length}
                </div>
                <div className="text-amber-100">Completed</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search participants by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                    <option value="completed">Completed</option>
                  </select>
                  <Button variant="outline" className="hover:bg-gray-50">
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Participants List */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                Participant List
                <Badge className="ml-2">{filteredParticipants.length} participants</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filteredParticipants.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Participants Found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || filterStatus !== 'all' 
                      ? 'Try adjusting your search or filters' 
                      : 'Share your challenge invite link to start recruiting participants'
                    }
                  </p>
                  {!searchTerm && filterStatus === 'all' && (
                    <Button 
                      onClick={() => router.push(`/challenge-dashboard/${challengeId}`)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Back to Challenge
                    </Button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredParticipants.map((participant) => (
                    <div key={participant.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {(participant.userName || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {participant.userName || 'Anonymous User'}
                              </h3>
                              {getStatusBadge(participant.status)}
                              {getActivityIcon(getActivityLevel(participant.lastCheckin))}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>{participant.userEmail || 'No email'}</span>
                              <span>Score: {participant.totalScore || 0}</span>
                              <span>Check-ins: {participant.checkinsCompleted || 0}</span>
                              {participant.enrolledAt && (
                                <span>Joined: {participant.enrolledAt.toDate?.()?.toLocaleDateString() || 'Unknown'}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="hover:bg-blue-50"
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Message
                          </Button>
                          <select
                            value={participant.status || 'active'}
                            onChange={(e) => updateParticipantStatus(participant.id, e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="suspended">Suspended</option>
                            <option value="completed">Completed</option>
                          </select>
                          <Button size="sm" variant="outline" className="hover:bg-gray-50">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
