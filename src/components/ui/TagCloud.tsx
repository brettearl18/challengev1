'use client'

import React, { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { ChallengeTag } from '@/src/types'

interface TagCloudProps {
  selectedTags: ChallengeTag[]
  onTagsChange: (tags: ChallengeTag[]) => void
  maxTags?: number
  className?: string
}

// Organized tag categories for better UX
const TAG_CATEGORIES = {
  'Demographics': [
    'ladies-only', 'men-only', 'community', 'online', 'in-person', 'hybrid'
  ] as ChallengeTag[],
  'Fitness Focus': [
    'strength', 'fitness', 'weight-loss', 'cardio', 'flexibility', 'balance', 'endurance'
  ] as ChallengeTag[],
  'Specialized Programs': [
    'yoga', 'pilates', 'crossfit', 'hiit', 'tabata', 'calisthenics', 'powerlifting', 'bodybuilding'
  ] as ChallengeTag[],
  'Health & Wellness': [
    'gut-health', 'nutrition', 'mindfulness', 'meditation', 'stress-relief', 'sleep-improvement', 'energy-boost'
  ] as ChallengeTag[],
  'Life Stages': [
    'beginner', 'intermediate', 'advanced', 'senior-friendly', 'prenatal', 'postpartum', 'teen-friendly'
  ] as ChallengeTag[],
  'Equipment & Environment': [
    'no-equipment', 'home-workout', 'gym-based', 'outdoor', 'indoor', 'travel-friendly'
  ] as ChallengeTag[],
  'Social & Motivation': [
    'team-challenge', 'individual', 'competitive', 'casual', 'accountability', 'support-group'
  ] as ChallengeTag[],
  'Goals & Outcomes': [
    'transformation', 'maintenance', 'performance', 'rehabilitation', 'lifestyle-change', 'habit-building',
    'muscle-gain', 'fat-loss', 'toning', 'posture-improvement', 'injury-prevention', 'recovery'
  ] as ChallengeTag[]
}

export default function TagCloud({ 
  selectedTags, 
  onTagsChange, 
  maxTags = 15, 
  className = '' 
}: TagCloudProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('Demographics')

  const handleTagToggle = (tag: ChallengeTag) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag))
    } else if (selectedTags.length < maxTags) {
      onTagsChange([...selectedTags, tag])
    }
  }

  const removeTag = (tagToRemove: ChallengeTag) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove))
  }

  const filteredTags = Object.entries(TAG_CATEGORIES).reduce((acc, [category, tags]) => {
    if (searchTerm === '' || category.toLowerCase().includes(searchTerm.toLowerCase()) || 
        tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) {
      acc[category] = tags
    }
    return acc
  }, {} as Record<string, ChallengeTag[]>)

  const formatTagLabel = (tag: string) => {
    return tag.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Category Navigation */}
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Search tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {Object.keys(TAG_CATEGORIES).map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                activeCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Selected Tags ({selectedTags.length}/{maxTags})
            </span>
            {selectedTags.length >= maxTags && (
              <span className="text-xs text-orange-600">
                Maximum tags reached
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                {formatTagLabel(tag)}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tag Selection */}
      <div className="space-y-4">
        {Object.entries(filteredTags).map(([category, tags]) => (
          <div key={category} className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">{category}</h4>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => {
                const isSelected = selectedTags.includes(tag)
                const isDisabled = !isSelected && selectedTags.length >= maxTags
                
                return (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    disabled={isDisabled}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : isDisabled
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {formatTagLabel(tag)}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Help Text */}
      <div className="text-xs text-gray-500">
        <p>• Select up to {maxTags} tags to help participants find your challenge</p>
        <p>• Mix different categories for better discoverability</p>
        <p>• Tags help with search, filtering, and challenge recommendations</p>
      </div>
    </div>
  )
}
