'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, X, Check } from 'lucide-react'
import { ChallengeType } from '@/src/types'

interface MultiSelectProps {
  options: { value: ChallengeType; label: string; description?: string }[]
  selectedValues: ChallengeType[]
  onChange: (values: ChallengeType[]) => void
  placeholder?: string
  maxSelections?: number
  className?: string
}

export default function MultiSelect({
  options,
  selectedValues,
  onChange,
  placeholder = "Select options...",
  maxSelections = 5,
  className = ""
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggle = (value: ChallengeType) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value))
    } else if (selectedValues.length < maxSelections) {
      onChange([...selectedValues, value])
    }
  }

  const removeSelection = (valueToRemove: ChallengeType) => {
    onChange(selectedValues.filter(v => v !== valueToRemove))
  }

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const isDisabled = (value: ChallengeType) => 
    !selectedValues.includes(value) && selectedValues.length >= maxSelections

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected Values Display */}
      {selectedValues.length > 0 && (
        <div className="mb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Selected ({selectedValues.length}/{maxSelections})
            </span>
            {selectedValues.length >= maxSelections && (
              <span className="text-xs text-orange-600">
                Maximum selections reached
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedValues.map(value => {
              const option = options.find(o => o.value === value)
              return (
                <span
                  key={value}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {option?.label || value}
                  <button
                    onClick={() => removeSelection(value)}
                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <span className={selectedValues.length === 0 ? "text-gray-500" : "text-gray-900"}>
          {selectedValues.length === 0 
            ? placeholder 
            : `${selectedValues.length} selected`
          }
        </span>
        <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {/* Search Input */}
          <div className="sticky top-0 bg-white p-3 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search options..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Options List */}
          <div className="py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-gray-500 text-sm">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selectedValues.includes(option.value)
                const disabled = isDisabled(option.value)
                
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleToggle(option.value)}
                    disabled={disabled}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isSelected ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{option.label}</div>
                        {option.description && (
                          <div className="text-sm text-gray-500 mt-1">
                            {option.description}
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-blue-600 ml-2" />
                      )}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
