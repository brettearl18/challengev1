'use client'

import { Button } from '@/src/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card'
import { Trophy, Users, Target, TrendingUp, Calendar, Award, ArrowRight, Star, Zap } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      <style jsx>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .hero-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%) !important;
          background-size: 200% 200% !important;
          animation: gradientShift 8s ease infinite !important;
        }
        
        .gradient-bg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          position: relative !important;
          overflow: hidden !important;
        }
        
        .modern-card {
          border-radius: 0.75rem !important;
          border: 1px solid #e5e7eb !important;
          background: white !important;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1) !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          position: relative !important;
          overflow: hidden !important;
        }
        
        .modern-card:hover {
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
          transform: translateY(-2px) !important;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: white !important;
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3) !important;
          border-radius: 0.5rem !important;
          font-weight: 500 !important;
          transition: all 0.3s ease !important;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4) !important;
        }
        
        .btn-secondary {
          background: rgba(255, 255, 255, 0.1) !important;
          color: white !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          backdrop-filter: blur(10px) !important;
          border-radius: 0.5rem !important;
          font-weight: 500 !important;
          transition: all 0.3s ease !important;
        }
        
        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.2) !important;
          transform: translateY(-2px) !important;
        }
      `}</style>
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <section className="hero-gradient min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="container-clean text-center relative z-10">
          <div className="fade-in max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
              Transform Your Life
              <br />
              <span className="text-yellow-300 drop-shadow-lg">One Challenge at a Time</span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 max-w-4xl mx-auto text-white/90 leading-relaxed drop-shadow-md">
              Join fitness challenges, track your progress, and compete with others. 
              Start your transformation journey today with our proven system.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/challenges">
                <Button className="btn-primary h-14 px-10 text-lg group">
                  Browse Challenges
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button className="btn-secondary h-14 px-10 text-lg bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-white rounded-full blur-lg"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white rounded-full blur-lg"></div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 opacity-20 animate-bounce">
          <Star className="h-8 w-8 text-yellow-300" />
        </div>
        <div className="absolute bottom-20 right-10 opacity-20 animate-bounce" style={{ animationDelay: '1s' }}>
          <Zap className="h-8 w-8 text-yellow-300" />
        </div>
      </section>

      {/* Statistics Section */}
      <section className="section-padding bg-white/80 backdrop-blur-sm">
        <div className="container-clean">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="stat-item">
              <div className="stat-number">10K+</div>
              <div className="text-gray-600 font-medium">Active Users</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="text-gray-600 font-medium">Challenges Completed</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">95%</div>
              <div className="text-gray-600 font-medium">Success Rate</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="text-gray-600 font-medium">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container-clean">
          <div className="text-center mb-20 slide-up">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Why Choose Fitness Challenge?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our platform combines cutting-edge technology with proven fitness principles 
              to help you achieve your goals faster and more effectively.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="modern-card feature-card">
              <CardHeader className="text-center pb-4">
                <div className="feature-icon">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-semibold">Compete & Win</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base">
                  Join challenges and compete with others to reach your fitness goals
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="modern-card feature-card">
              <CardHeader className="text-center pb-4">
                <div className="feature-icon">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-semibold">Community Support</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base">
                  Connect with like-minded people and stay motivated together
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="modern-card feature-card">
              <CardHeader className="text-center pb-4">
                <div className="feature-icon">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-semibold">Track Progress</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base">
                  Monitor your daily activities and see your improvement over time
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="modern-card feature-card">
              <CardHeader className="text-center pb-4">
                <div className="feature-icon">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-semibold">Smart Scoring</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base">
                  Advanced algorithms that reward consistency and effort
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="modern-card feature-card">
              <CardHeader className="text-center pb-4">
                <div className="feature-icon">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-semibold">Flexible Challenges</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base">
                  Choose from various challenge types and durations
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="modern-card feature-card">
              <CardHeader className="text-center pb-4">
                <div className="feature-icon">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-semibold">Achievement System</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base">
                  Unlock badges and rewards as you reach milestones
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-bg section-padding text-white relative overflow-hidden">
        <div className="container-clean text-center relative z-10">
          <div className="slide-up max-w-3xl mx-auto">
            <h2 className="text-5xl font-bold mb-6">Ready to Start Your Journey?</h2>
            <p className="text-xl mb-10 opacity-95 max-w-2xl mx-auto">
              Join thousands of people who have already transformed their lives through fitness challenges.
            </p>
            <Link href="/challenges">
              <Button className="btn-primary h-14 px-10 text-lg bg-white text-primary hover:bg-gray-100">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
        <div className="container-clean">
          <div className="grid md:grid-cols-5 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Fitness Challenge</h3>
              <p className="text-gray-400 leading-relaxed">
                Transform your life through fitness challenges and community support.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/challenges" className="hover:text-white transition-colors">Challenges</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-yellow-400">🚀 Dev Links</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/" className="hover:text-white transition-colors">🏠 Home (Public)</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">🔐 Login (Public)</Link></li>
                <li><Link href="/signup" className="hover:text-white transition-colors">📝 Signup (Public)</Link></li>
                <li><Link href="/challenges" className="hover:text-white transition-colors">🎯 Challenges (Public)</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">📊 Dashboard (Auth Required)</Link></li>
                <li><Link href="/admin" className="hover:text-white transition-colors">⚙️ Admin (Admin Only)</Link></li>
                <li><Link href="/leaderboard" className="hover:text-white transition-colors">🏆 Leaderboard (Public)</Link></li>
                <li><Link href="/checkin" className="hover:text-white transition-colors">✅ Check-in (Auth Required)</Link></li>
                <li><Link href="/join" className="hover:text-white transition-colors">➕ Join Challenge (Auth Required)</Link></li>
                <li><Link href="/challenge-settings/12-week-fitness" className="hover:text-white transition-colors">⚙️ Challenge Settings (Admin)</Link></li>
                <li><Link href="/my-challenges" className="hover:text-white transition-colors">📋 My Challenges (User)</Link></li>
                <li><Link href="/language-demo" className="hover:text-white transition-colors">🌍 Language Demo (Test)</Link></li>
                <li><Link href="/test-firebase" className="hover:text-white transition-colors">🔥 Firebase Test (Dev)</Link></li>
                <li><Link href="/test-advanced-patterns" className="hover:text-white transition-colors">🎯 Advanced Patterns (Test)</Link></li>
                <li><Link href="/test-leaderboard" className="hover:text-white transition-colors">🏆 Leaderboard Test (Dev)</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2024 Fitness Challenge. All rights reserved.</p>
            <p className="text-xs mt-2 text-gray-500">Dev Mode: No Authentication Required - All Pages Accessible</p>
            <p className="text-xs mt-1 text-gray-500">🚀 Additional Dev Tools: Language Demo, Firebase Tests, Pattern Testing</p>
          </div>
        </div>
      </footer>
    </div>
    </>
  )
} 