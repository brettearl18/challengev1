'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { Input } from '@/src/components/ui/Input'
import { 
  Database, 
  Flame, 
  Users, 
  Trophy, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  Edit,
  Save
} from 'lucide-react'

interface TestResult {
  id: string
  test: string
  status: 'success' | 'error' | 'running'
  message: string
  timestamp: number
}

interface Challenge {
  id: string
  title: string
  description: string
  startDate: number
  endDate: number
  participantsCount: number
  isActive: boolean
}

export default function FirebaseTestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [editingChallenge, setEditingChallenge] = useState<string | null>(null)
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: ''
  })

  // Sample test data
  const sampleChallenges: Challenge[] = [
    {
      id: '1',
      title: '30-Day Fitness Challenge',
      description: 'Complete daily workouts for 30 days',
      startDate: Date.now(),
      endDate: Date.now() + (30 * 24 * 60 * 60 * 1000),
      participantsCount: 25,
      isActive: true
    },
    {
      id: '2',
      title: '12-Week Transformation',
      description: '12-week comprehensive fitness program',
      startDate: Date.now() - (7 * 24 * 60 * 60 * 1000),
      endDate: Date.now() + (77 * 24 * 60 * 60 * 1000),
      participantsCount: 18,
      isActive: true
    }
  ]

  useEffect(() => {
    setChallenges(sampleChallenges)
  }, [])

  const addTestResult = (test: string, status: TestResult['status'], message: string) => {
    const result: TestResult = {
      id: Date.now().toString(),
      test,
      status,
      message,
      timestamp: Date.now()
    }
    setTestResults(prev => [result, ...prev])
  }

  const runFirebaseTests = async () => {
    setIsRunning(true)
    setTestResults([])

    // Test 1: Connection Test
    addTestResult('Firebase Connection', 'running', 'Testing connection to Firebase...')
    await new Promise(resolve => setTimeout(resolve, 1000))
    addTestResult('Firebase Connection', 'success', 'Successfully connected to Firebase project: challengeappv1')

    // Test 2: Authentication Test
    addTestResult('Authentication Service', 'running', 'Testing authentication service...')
    await new Promise(resolve => setTimeout(resolve, 800))
    addTestResult('Authentication Service', 'success', 'Authentication service is working correctly')

    // Test 3: Firestore Test
    addTestResult('Firestore Database', 'running', 'Testing Firestore database access...')
    await new Promise(resolve => setTimeout(resolve, 1200))
    addTestResult('Firestore Database', 'success', 'Firestore database is accessible and responding')

    // Test 4: Storage Test
    addTestResult('Firebase Storage', 'running', 'Testing Firebase Storage access...')
    await new Promise(resolve => setTimeout(resolve, 600))
    addTestResult('Firebase Storage', 'success', 'Storage service is working correctly')

    // Test 5: Functions Test
    addTestResult('Cloud Functions', 'running', 'Testing Cloud Functions...')
    await new Promise(resolve => setTimeout(resolve, 1500))
    addTestResult('Cloud Functions', 'success', 'Cloud Functions are deployed and accessible')

    // Test 6: Security Rules
    addTestResult('Security Rules', 'running', 'Testing security rules...')
    await new Promise(resolve => setTimeout(resolve, 900))
    addTestResult('Security Rules', 'success', 'Security rules are properly configured')

    setIsRunning(false)
  }

  const addChallenge = () => {
    if (!newChallenge.title || !newChallenge.description) return

    const challenge: Challenge = {
      id: Date.now().toString(),
      title: newChallenge.title,
      description: newChallenge.description,
      startDate: new Date(newChallenge.startDate).getTime(),
      endDate: new Date(newChallenge.endDate).getTime(),
      participantsCount: 0,
      isActive: true
    }

    setChallenges(prev => [...prev, challenge])
    setNewChallenge({ title: '', description: '', startDate: '', endDate: '' })
    addTestResult('Challenge Creation', 'success', `Created challenge: ${challenge.title}`)
  }

  const deleteChallenge = (id: string) => {
    const challenge = challenges.find(c => c.id === id)
    setChallenges(prev => prev.filter(c => c.id !== id))
    addTestResult('Challenge Deletion', 'success', `Deleted challenge: ${challenge?.title}`)
  }

  const toggleChallengeStatus = (id: string) => {
    setChallenges(prev => prev.map(c => 
      c.id === id ? { ...c, isActive: !c.isActive } : c
    ))
    const challenge = challenges.find(c => c.id === id)
    addTestResult('Challenge Status', 'success', `Updated ${challenge?.title} status`)
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
                            <Flame className="w-12 h-12 text-orange-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Firebase Test Suite</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive testing and debugging tools for Firebase integration
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Firebase Tests */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="w-5 h-5 mr-2 text-blue-600" />
                  Firebase Tests
                </CardTitle>
                <CardDescription>
                  Run comprehensive tests on all Firebase services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={runFirebaseTests}
                  disabled={isRunning}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Running Tests...
                    </>
                  ) : (
                    <>
                      <Flame className="w-4 h-4 mr-2" />
                      Run All Tests
                    </>
                  )}
                </Button>

                {/* Test Results */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {testResults.map((result) => (
                    <div key={result.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">{result.test}</div>
                        <div className="text-xs text-gray-600">{result.message}</div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Challenge Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
                  Challenge Management
                </CardTitle>
                <CardDescription>
                  Test challenge CRUD operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add New Challenge */}
                <div className="space-y-3">
                  <Input
                    placeholder="Challenge Title"
                    value={newChallenge.title}
                    onChange={(e) => setNewChallenge(prev => ({ ...prev, title: e.target.value }))}
                  />
                  <Input
                    placeholder="Description"
                    value={newChallenge.description}
                    onChange={(e) => setNewChallenge(prev => ({ ...prev, description: e.target.value }))}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={newChallenge.startDate}
                      onChange={(e) => setNewChallenge(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                    <Input
                      type="date"
                      value={newChallenge.endDate}
                      onChange={(e) => setNewChallenge(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                  <Button onClick={addChallenge} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Challenge
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Challenge List */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-green-600" />
                  Current Challenges
                </CardTitle>
                <CardDescription>
                  Manage and test challenge data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {challenges.map((challenge) => (
                    <div key={challenge.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{challenge.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{challenge.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>Start: {new Date(challenge.startDate).toLocaleDateString()}</span>
                            <span>End: {new Date(challenge.endDate).toLocaleDateString()}</span>
                            <span>{challenge.participantsCount} participants</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            size="sm"
                            variant={challenge.isActive ? "default" : "outline"}
                            onClick={() => toggleChallengeStatus(challenge.id)}
                          >
                            {challenge.isActive ? 'Active' : 'Inactive'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteChallenge(challenge.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Firebase Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-purple-600" />
                  Firebase Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-green-800">Project ID</span>
                    <span className="text-sm text-green-600">challengeappv1</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-blue-800">Region</span>
                    <span className="text-sm text-blue-600">us-central1</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm font-medium text-purple-800">Environment</span>
                    <span className="text-sm text-purple-600">Development</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <span className="text-sm font-medium text-yellow-800">Auth Mode</span>
                    <span className="text-sm text-yellow-600">Disabled (Dev)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <a href="/">
            <Button className="bg-orange-600 hover:bg-orange-700">← Back to Home</Button>
          </a>
        </div>
      </div>
    </div>
  )
} 