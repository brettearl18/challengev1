import Link from 'next/link'
import { Button } from '@/src/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card'
import { Trophy, Users, Target, TrendingUp, Calendar, Award, ArrowRight, Star, Zap } from 'lucide-react'

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container-clean text-center">
          <div className="fade-in max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Transform Your Life
              <br />
              <span className="text-primary">One Challenge at a Time</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Join fitness challenges, track your progress, and compete with others. 
              Start your transformation journey today with our proven system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/challenges">
                <Button size="lg" className="text-lg px-8 py-3">
                  Browse Challenges
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="section-padding bg-white">
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
      <section className="section-padding bg-gray-50">
        <div className="container-clean">
          <div className="text-center mb-16 slide-up">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Why Choose Fitness Challenge?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our platform combines cutting-edge technology with proven fitness principles 
              to help you achieve your goals faster and more effectively.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="feature-card">
              <CardHeader>
                <div className="feature-icon">
                  <Trophy className="h-8 w-8" />
                </div>
                <CardTitle>Compete & Win</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Join challenges and compete with others to reach your fitness goals
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="feature-card">
              <CardHeader>
                <div className="feature-icon">
                  <Users className="h-8 w-8" />
                </div>
                <CardTitle>Community Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Connect with like-minded people and stay motivated together
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="feature-card">
              <CardHeader>
                <div className="feature-icon">
                  <Target className="h-8 w-8" />
                </div>
                <CardTitle>Track Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Monitor your daily activities and see your improvement over time
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="feature-card">
              <CardHeader>
                <div className="feature-icon">
                  <TrendingUp className="h-8 w-8" />
                </div>
                <CardTitle>Smart Scoring</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Advanced algorithms that reward consistency and effort
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="feature-card">
              <CardHeader>
                <div className="feature-icon">
                  <Calendar className="h-8 w-8" />
                </div>
                <CardTitle>Flexible Challenges</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Choose from various challenge types and durations
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="feature-card">
              <CardHeader>
                <div className="feature-icon">
                  <Award className="h-8 w-8" />
                </div>
                <CardTitle>Achievement System</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Unlock badges and rewards as you reach milestones
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-primary text-white">
        <div className="container-clean text-center">
          <div className="slide-up max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl mb-10 opacity-95 max-w-2xl mx-auto">
              Join thousands of people who have already transformed their lives through fitness challenges.
            </p>
            <Link href="/challenges">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3 bg-white text-primary hover:bg-gray-100">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container-clean">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Fitness Challenge</h3>
              <p className="text-gray-400 leading-relaxed">
                Transform your life through fitness challenges and community support.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a className="hover:text-white transition-colors" href="/challenges">Challenges</a></li>
                <li><a className="hover:text-white transition-colors" href="/dashboard">Dashboard</a></li>
                <li><a className="hover:text-white transition-colors" href="/leaderboard">Leaderboard</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a className="hover:text-white transition-colors" href="/help">Help Center</a></li>
                <li><a className="hover:text-white transition-colors" href="/contact">Contact Us</a></li>
                <li><a className="hover:text-white transition-colors" href="/faq">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a className="hover:text-white transition-colors" href="/privacy">Privacy Policy</a></li>
                <li><a className="hover:text-white transition-colors" href="/terms">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2024 Fitness Challenge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
