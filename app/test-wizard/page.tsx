'use client'

import { useState } from 'react'
import EnhancedChallengeWizard from '@/src/components/challenge-wizard/EnhancedChallengeWizard'

export default function TestWizardPage() {
  const [showWizard, setShowWizard] = useState(false)

  if (showWizard) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => setShowWizard(false)}
            className="mb-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            ← Back to Test
          </button>
        </div>
        <EnhancedChallengeWizard />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-6">Challenge Wizard Test</h1>
        <p className="text-gray-600 mb-8">
          Click the button below to test the Challenge Wizard
        </p>
        <button
          onClick={() => setShowWizard(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg"
        >
          Launch Challenge Wizard
        </button>
      </div>
    </div>
  )
}
