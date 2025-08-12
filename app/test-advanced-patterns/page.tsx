'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { Input } from '@/src/components/ui/Input'
import { 
  Target, 
  Calendar, 
  Clock, 
  Repeat, 
  Zap, 
  Star,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Settings,
  Play,
  Pause
} from 'lucide-react'

interface PatternRule {
  id: string
  type: 'weekly' | 'interval' | 'monthly' | 'conditional'
  config: any
  isActive: boolean
}

interface HabitPattern {
  id: string
  name: string
  description: string
  rules: PatternRule[]
  exceptions: string[]
  isActive: boolean
}

export default function TestAdvancedPatternsPage() {
  const [patterns, setPatterns] = useState<HabitPattern[]>([])
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null)
  const [isTesting, setIsTesting] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])

  // Sample patterns
  useState(() => {
    const samplePatterns: HabitPattern[] = [
      {
        id: '1',
        name: 'Alternate Day Workout',
        description: 'Workout every other day with weekend rest',
        rules: [
          {
            id: '1',
            type: 'interval',
            config: { intervalDays: 2, startDay: 1 },
            isActive: true
          }
        ],
        exceptions: ['saturday', 'sunday'],
        isActive: true
      },
      {
        id: '2',
        name: 'Weekday Morning Routine',
        description: 'Morning habits Monday through Friday',
        rules: [
          {
            id: '1',
            type: 'weekly',
            config: { days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] },
            isActive: true
          }
        ],
        exceptions: [],
        isActive: true
      },
      {
        id: '3',
        name: 'Monthly Milestone',
        description: 'Habits on specific dates each month',
        rules: [
          {
            id: '1',
            type: 'monthly',
            config: { dates: [1, 15, 30] },
            isActive: true
          }
        ],
        exceptions: [],
        isActive: true
      }
    ]
    setPatterns(samplePatterns)
  })

  const addPattern = () => {
    const newPattern: HabitPattern = {
      id: Date.now().toString(),
      name: 'New Pattern',
      description: 'Description of the new pattern',
      rules: [],
      exceptions: [],
      isActive: true
    }
    setPatterns(prev => [...prev, newPattern])
    setSelectedPattern(newPattern.id)
  }

  const deletePattern = (id: string) => {
    setPatterns(prev => prev.filter(p => p.id !== id))
    if (selectedPattern === id) {
      setSelectedPattern(null)
    }
  }

  const addRule = (patternId: string) => {
    const newRule: PatternRule = {
      id: Date.now().toString(),
      type: 'weekly',
      config: { days: ['monday'] },
      isActive: true
    }
    setPatterns(prev => prev.map(p => 
      p.id === patternId 
        ? { ...p, rules: [...p.rules, newRule] }
        : p
    ))
  }

  const updateRule = (patternId: string, ruleId: string, updates: Partial<PatternRule>) => {
    setPatterns(prev => prev.map(p => 
      p.id === patternId 
        ? {
            ...p,
            rules: p.rules.map(r => r.id === ruleId ? { ...r, ...updates } : r)
          }
        : p
    ))
  }

  const deleteRule = (patternId: string, ruleId: string) => {
    setPatterns(prev => prev.map(p => 
      p.id === patternId 
        ? { ...p, rules: p.rules.filter(r => r.id !== ruleId) }
        : p
    ))
  }

  const testPattern = async (pattern: HabitPattern) => {
    setIsTesting(true)
    setTestResults([])

    // Simulate testing the pattern
    await new Promise(resolve => setTimeout(resolve, 1000))

    const results = []
    const today = new Date()
    const nextWeek = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      return date
    })

    nextWeek.forEach(date => {
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase()
      const dateStr = date.toLocaleDateString()
      
      let shouldComplete = false
      let reason = ''

      pattern.rules.forEach(rule => {
        if (rule.type === 'weekly' && rule.config.days.includes(dayName)) {
          shouldComplete = true
          reason = `Weekly rule: ${dayName}`
        } else if (rule.type === 'interval') {
          const daysSinceStart = Math.floor((date.getTime() - new Date('2024-01-01').getTime()) / (1000 * 60 * 60 * 24))
          if (daysSinceStart % rule.config.intervalDays === 0) {
            shouldComplete = true
            reason = `Interval rule: every ${rule.config.intervalDays} days`
          }
        } else if (rule.type === 'monthly' && rule.config.dates.includes(date.getDate())) {
          shouldComplete = true
          reason = `Monthly rule: day ${date.getDate()}`
        }
      })

      // Check exceptions
      if (pattern.exceptions.includes(dayName)) {
        shouldComplete = false
        reason = `Exception: ${dayName}`
      }

      results.push({
        date: dateStr,
        day: dayName,
        shouldComplete,
        reason,
        status: shouldComplete ? 'active' : 'inactive'
      })
    })

    setTestResults(results)
    setIsTesting(false)
  }

  const getRuleDescription = (rule: PatternRule) => {
    switch (rule.type) {
      case 'weekly':
        return `Every ${rule.config.days.join(', ')}`
      case 'interval':
        return `Every ${rule.config.intervalDays} days`
      case 'monthly':
        return `Monthly on days: ${rule.config.dates.join(', ')}`
      case 'conditional':
        return 'Conditional rules'
      default:
        return 'Unknown rule type'
    }
  }

  const getRuleIcon = (type: string) => {
    switch (type) {
      case 'weekly':
        return <Calendar className="w-4 h-4 text-blue-600" />
      case 'interval':
        return <Repeat className="w-4 h-4 text-green-600" />
      case 'monthly':
        return <Star className="w-4 h-4 text-purple-600" />
      case 'conditional':
        return <Zap className="w-4 h-4 text-yellow-600" />
      default:
        return <Target className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Target className="w-12 h-12 text-purple-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Advanced Pattern Testing</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Test complex habit frequency patterns and scheduling rules
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Patterns Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-purple-600" />
                    Habit Patterns
                  </span>
                  <Button onClick={addPattern} size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Pattern
                  </Button>
                </CardTitle>
                <CardDescription>
                  Create and manage complex habit scheduling patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {patterns.map((pattern) => (
                    <div
                      key={pattern.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedPattern === pattern.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 bg-white hover:border-purple-300'
                      }`}
                      onClick={() => setSelectedPattern(pattern.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{pattern.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{pattern.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              pattern.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {pattern.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {pattern.rules.length} rules
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              testPattern(pattern)
                            }}
                            disabled={isTesting}
                          >
                            {isTesting ? (
                              <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              deletePattern(pattern.id)
                            }}
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

            {/* Pattern Details */}
            {selectedPattern && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2 text-purple-600" />
                    Pattern Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const pattern = patterns.find(p => p.id === selectedPattern)
                    if (!pattern) return null

                    return (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pattern Name
                          </label>
                          <Input
                            value={pattern.name}
                            onChange={(e) => {
                              setPatterns(prev => prev.map(p => 
                                p.id === selectedPattern ? { ...p, name: e.target.value } : p
                              ))
                            }}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                          </label>
                          <Input
                            value={pattern.description}
                            onChange={(e) => {
                              setPatterns(prev => prev.map(p => 
                                p.id === selectedPattern ? { ...p, description: e.target.value } : p
                              ))
                            }}
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Rules
                            </label>
                            <Button
                              size="sm"
                              onClick={() => addRule(selectedPattern)}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add Rule
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {pattern.rules.map((rule) => (
                              <div key={rule.id} className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    {getRuleIcon(rule.type)}
                                    <span className="text-sm font-medium text-gray-900">
                                      {getRuleDescription(rule)}
                                    </span>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => deleteRule(selectedPattern, rule.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Exceptions
                          </label>
                          <Input
                            value={pattern.exceptions.join(', ')}
                            onChange={(e) => {
                              const exceptions = e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                              setPatterns(prev => prev.map(p => 
                                p.id === selectedPattern ? { ...p, exceptions } : p
                              ))
                            }}
                            placeholder="saturday, sunday, holiday"
                          />
                        </div>
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Test Results */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Play className="w-5 h-5 mr-2 text-green-600" />
                  Test Results
                </CardTitle>
                <CardDescription>
                  See how your pattern will work over the next week
                </CardDescription>
              </CardHeader>
              <CardContent>
                {testResults.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>No test results yet</p>
                    <p className="text-sm">Select a pattern and click the test button</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {testResults.map((result, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          result.shouldComplete
                            ? 'bg-green-50 border-green-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            result.shouldComplete
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {result.shouldComplete ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{result.date}</div>
                            <div className="text-sm text-gray-600 capitalize">{result.day}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${
                            result.shouldComplete ? 'text-green-800' : 'text-gray-600'
                          }`}>
                            {result.shouldComplete ? 'Complete' : 'Skip'}
                          </div>
                          <div className="text-xs text-gray-500">{result.reason}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pattern Statistics */}
            {testResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="w-5 h-5 mr-2 text-yellow-600" />
                    Pattern Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {testResults.filter(r => r.shouldComplete).length}
                      </div>
                      <div className="text-sm text-blue-800">Active Days</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round((testResults.filter(r => r.shouldComplete).length / testResults.length) * 100)}%
                      </div>
                      <div className="text-sm text-green-800">Completion Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <a href="/">
            <Button className="bg-purple-600 hover:bg-purple-700">← Back to Home</Button>
          </a>
        </div>
      </div>
    </div>
  )
} 