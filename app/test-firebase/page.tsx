'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { getGlobalLeaderboard, getChallengeLeaderboard } from '@/src/lib/leaderboard.service'
import { getChallenges } from '@/src/lib/challenges'
import { Challenge } from '@/src/types'
import { Database, Trophy, Users, CheckCircle, AlertCircle } from 'lucide-react'

export default function TestFirebasePage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{
    globalLeaderboard: any
    challenges: any
    challengeLeaderboard: any
    errors: string[]
  }>({
    globalLeaderboard: null,
    challenges: null,
    challengeLeaderboard: null,
    errors: []
  })

  const runTests = async () => {
    setLoading(true)
    const errors: string[] = []
    let globalLeaderboard = null
    let challenges = null
    let challengeLeaderboard = null

    try {
      // Test 1: Fetch challenges
      console.log('Testing: Fetching challenges...')
      challenges = await getChallenges('published')
      console.log('✅ Challenges fetched:', challenges?.length || 0)
    } catch (error) {
      const errorMsg = `Failed to fetch challenges: ${error}`
      console.error('❌', errorMsg)
      errors.push(errorMsg)
    }

    try {
      // Test 2: Fetch global leaderboard
      console.log('Testing: Fetching global leaderboard...')
      globalLeaderboard = await getGlobalLeaderboard(10)
      console.log('✅ Global leaderboard fetched:', globalLeaderboard?.length || 0)
    } catch (error) {
      const errorMsg = `Failed to fetch global leaderboard: ${error}`
      console.error('❌', errorMsg)
      errors.push(errorMsg)
    }

    try {
      // Test 3: Fetch challenge-specific leaderboard (if challenges exist)
      if (challenges && challenges.length > 0) {
        console.log('Testing: Fetching challenge-specific leaderboard...')
        challengeLeaderboard = await getChallengeLeaderboard(challenges[0].id)
        console.log('✅ Challenge leaderboard fetched:', challengeLeaderboard ? 'Success' : 'No data')
      } else {
        console.log('⚠️ Skipping challenge leaderboard test - no challenges available')
      }
    } catch (error) {
      const errorMsg = `Failed to fetch challenge leaderboard: ${error}`
      console.error('❌', errorMsg)
      errors.push(errorMsg)
    }

    setResults({
      globalLeaderboard,
      challenges,
      challengeLeaderboard,
      errors
    })
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Database className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Firebase Database Test</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Test the Firebase database connections and verify data is being fetched correctly for leaderboards
          </p>
        </div>

        {/* Test Button */}
        <div className="text-center mb-12">
          <Button
            onClick={runTests}
            disabled={loading}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25 text-lg font-semibold py-4 px-8 rounded-2xl"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Running Tests...
              </>
            ) : (
              <>
                <Database className="w-5 h-5 mr-3" />
                Run Firebase Tests
              </>
            )}
          </Button>
        </div>

        {/* Results */}
        {results.challenges !== null || results.globalLeaderboard !== null || results.errors.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Challenges Test */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm rounded-3xl">
              <CardHeader className="pb-6 bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  Challenges Test
                </CardTitle>
                <CardDescription>
                  Fetching published challenges from Firebase
                </CardDescription>
              </CardHeader>
              <CardContent>
                {results.challenges ? (
                  <div className="space-y-4">
                    <div className="text-3xl font-bold text-green-600">
                      ✅ {results.challenges.length} Challenges Found
                    </div>
                    <div className="text-sm text-gray-600">
                      Successfully connected to challenges collection
                    </div>
                    {results.challenges.length > 0 && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="font-semibold text-gray-900 mb-2">Sample Challenge:</div>
                        <div className="text-sm text-gray-600">
                          <div><strong>Name:</strong> {results.challenges[0].name}</div>
                          <div><strong>Type:</strong> {results.challenges[0].challengeType}</div>
                          <div><strong>Status:</strong> {results.challenges[0].status}</div>
                          <div><strong>Participants:</strong> {results.challenges[0].currentParticipants || 0}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    No challenges data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Global Leaderboard Test */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm rounded-3xl">
              <CardHeader className="pb-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Trophy className="w-6 h-6 text-blue-600" />
                  Global Leaderboard Test
                </CardTitle>
                <CardDescription>
                  Fetching global leaderboard data across all challenges
                </CardDescription>
              </CardHeader>
              <CardContent>
                {results.globalLeaderboard ? (
                  <div className="space-y-4">
                    <div className="text-3xl font-bold text-blue-600">
                      ✅ {results.globalLeaderboard.length} Entries Found
                    </div>
                    <div className="text-sm text-gray-600">
                      Successfully aggregated data from multiple challenges
                    </div>
                    {results.globalLeaderboard.length > 0 && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="font-semibold text-gray-900 mb-2">Top Performer:</div>
                        <div className="text-sm text-gray-600">
                          <div><strong>Rank:</strong> #{results.globalLeaderboard[0].rank}</div>
                          <div><strong>Score:</strong> {results.globalLeaderboard[0].totalScore.toLocaleString()}</div>
                          <div><strong>Challenges:</strong> {results.globalLeaderboard[0].challengesCount}</div>
                          <div><strong>Check-ins:</strong> {results.globalLeaderboard[0].totalCheckins}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    No global leaderboard data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Challenge Leaderboard Test */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm rounded-3xl">
              <CardHeader className="pb-6 bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Users className="w-6 h-6 text-purple-600" />
                  Challenge Leaderboard Test
                </CardTitle>
                <CardDescription>
                  Fetching leaderboard data for a specific challenge
                </CardDescription>
              </CardHeader>
              <CardContent>
                {results.challengeLeaderboard ? (
                  <div className="space-y-4">
                    <div className="text-3xl font-bold text-purple-600">
                      ✅ {results.challengeLeaderboard.participants.length} Participants
                    </div>
                    <div className="text-sm text-gray-600">
                      Successfully fetched challenge-specific rankings
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="font-semibold text-gray-900 mb-2">Challenge Details:</div>
                      <div className="text-sm text-gray-600">
                        <div><strong>Name:</strong> {results.challengeLeaderboard.challenge.name}</div>
                        <div><strong>Total Participants:</strong> {results.challengeLeaderboard.totalParticipants}</div>
                        <div><strong>Top Score:</strong> {results.challengeLeaderboard.topScore.toLocaleString()}</div>
                        <div><strong>Average Score:</strong> {results.challengeLeaderboard.averageScore.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    No challenge leaderboard data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Errors */}
            {results.errors.length > 0 && (
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm rounded-3xl lg:col-span-2">
                <CardHeader className="pb-6 bg-gradient-to-r from-red-50 to-pink-50">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                    Test Errors
                  </CardTitle>
                  <CardDescription>
                    Issues encountered during testing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {results.errors.map((error, index) => (
                      <div key={index} className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="text-sm text-red-800 font-medium">
                          Error {index + 1}: {error}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : null}

        {/* Instructions */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-12 border border-blue-100">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Database className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">How to Use This Test</h3>
            <p className="text-gray-600 mb-8 text-lg max-w-3xl mx-auto">
              Click the "Run Firebase Tests" button to verify that your Firebase database connections are working correctly. 
              This will test fetching challenges, global leaderboards, and challenge-specific leaderboards.
            </p>
            <div className="text-sm text-gray-500 space-y-2">
              <div>✅ Green: Challenges collection is accessible</div>
              <div>🔵 Blue: Global leaderboard aggregation is working</div>
              <div>🟣 Purple: Challenge-specific leaderboards are functional</div>
              <div>❌ Red: Any errors that need to be addressed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 