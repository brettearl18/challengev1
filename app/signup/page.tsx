'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { Input } from '@/src/components/ui/Input'
import { signUp } from '@/src/lib/auth'
import { Eye, EyeOff, Lock, Mail, User, CheckCircle } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'participant' as 'participant' | 'coach'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    if (name === 'password') {
      setPasswordStrength({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /\d/.test(value),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(value)
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    const result = await signUp(formData.email, formData.password, formData.displayName, formData.role)
    
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  const isPasswordValid = Object.values(passwordStrength).every(Boolean)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">FC</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join fitness challenges and transform your life
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Fill in your details to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="displayName"
                    name="displayName"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.displayName}
                    onChange={handleInputChange}
                    className="pl-10"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                
                {/* Password strength indicator */}
                <div className="mt-2 space-y-1">
                  <div className="flex items-center text-xs">
                    <CheckCircle className={`h-3 w-3 mr-2 ${passwordStrength.length ? 'text-green-500' : 'text-gray-300'}`} />
                    <span className={passwordStrength.length ? 'text-green-600' : 'text-gray-500'}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <CheckCircle className={`h-3 w-3 mr-2 ${passwordStrength.uppercase ? 'text-green-500' : 'text-gray-300'}`} />
                    <span className={passwordStrength.uppercase ? 'text-green-600' : 'text-gray-500'}>
                      One uppercase letter
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <CheckCircle className={`h-3 w-3 mr-2 ${passwordStrength.lowercase ? 'text-green-500' : 'text-gray-300'}`} />
                    <span className={passwordStrength.lowercase ? 'text-green-600' : 'text-gray-500'}>
                      One lowercase letter
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <CheckCircle className={`h-3 w-3 mr-2 ${passwordStrength.number ? 'text-green-500' : 'text-gray-300'}`} />
                    <span className={passwordStrength.number ? 'text-green-600' : 'text-gray-500'}>
                      One number
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <CheckCircle className={`h-3 w-3 mr-2 ${passwordStrength.special ? 'text-green-500' : 'text-gray-300'}`} />
                    <span className={passwordStrength.special ? 'text-green-600' : 'text-gray-500'}>
                      One special character
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  I want to join as a
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="relative flex cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm focus:outline-none">
                    <input
                      type="radio"
                      name="role"
                      value="participant"
                      checked={formData.role === 'participant'}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className="flex flex-1">
                      <div className="flex flex-col">
                        <span className={`block text-sm font-medium ${
                          formData.role === 'participant' ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          🏃‍♂️ Participant
                        </span>
                        <span className={`mt-1 flex items-center text-sm ${
                          formData.role === 'participant' ? 'text-blue-700' : 'text-gray-500'
                        }`}>
                          Join challenges and track progress
                        </span>
                      </div>
                    </div>
                    <div className={`ml-3 flex h-5 w-5 items-center justify-center ${
                      formData.role === 'participant' ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                      {formData.role === 'participant' ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-gray-300"></div>
                      )}
                    </div>
                  </label>

                  <label className="relative flex cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm focus:outline-none">
                    <input
                      type="radio"
                      name="role"
                      value="coach"
                      checked={formData.role === 'coach'}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className="flex flex-1">
                      <div className="flex flex-col">
                        <span className={`block text-sm font-medium ${
                          formData.role === 'coach' ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          🎯 Coach
                        </span>
                        <span className={`mt-1 flex items-center text-sm ${
                          formData.role === 'coach' ? 'text-blue-700' : 'text-gray-500'
                        }`}>
                          Create and manage challenges
                        </span>
                      </div>
                    </div>
                    <div className={`ml-3 flex h-5 w-5 items-center justify-center ${
                      formData.role === 'coach' ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                      {formData.role === 'coach' ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-gray-300"></div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                  I agree to the{' '}
                  <Link href="/terms" className="font-medium text-blue-600 hover:text-blue-500">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="font-medium text-blue-600 hover:text-blue-500">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !isPasswordValid}
              >
                {loading ? 'Creating account...' : 'Create account'}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 