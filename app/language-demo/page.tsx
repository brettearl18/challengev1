'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { Globe, Languages, Flag, BookOpen, MessageCircle } from 'lucide-react'

// Language configurations
const languages = {
  en: {
    name: 'English',
    flag: '🇺🇸',
    greeting: 'Hello! Welcome to our fitness challenge platform.',
    description: 'This is a demonstration of our multi-language support system.',
    features: 'Features',
    challenges: 'Challenges',
    leaderboard: 'Leaderboard',
    dashboard: 'Dashboard',
    join: 'Join Challenge',
    checkin: 'Daily Check-in',
    motivation: 'Stay motivated and track your progress!',
    language: 'Language',
    selectLanguage: 'Select your preferred language:'
  },
  es: {
    name: 'Español',
    flag: '🇪🇸',
    greeting: '¡Hola! Bienvenido a nuestra plataforma de desafíos fitness.',
    description: 'Esta es una demostración de nuestro sistema de soporte multi-idioma.',
    features: 'Características',
    challenges: 'Desafíos',
    leaderboard: 'Clasificación',
    dashboard: 'Panel de Control',
    join: 'Unirse al Desafío',
    checkin: 'Registro Diario',
    motivation: '¡Mantente motivado y rastrea tu progreso!',
    language: 'Idioma',
    selectLanguage: 'Selecciona tu idioma preferido:'
  },
  fr: {
    name: 'Français',
    flag: '🇫🇷',
    greeting: 'Bonjour ! Bienvenue sur notre plateforme de défis fitness.',
    description: 'Ceci est une démonstration de notre système de support multilingue.',
    features: 'Fonctionnalités',
    challenges: 'Défis',
    leaderboard: 'Classement',
    dashboard: 'Tableau de Bord',
    join: 'Rejoindre le Défi',
    checkin: 'Pointage Quotidien',
    motivation: 'Restez motivé et suivez vos progrès !',
    language: 'Langue',
    selectLanguage: 'Sélectionnez votre langue préférée :'
  },
  de: {
    name: 'Deutsch',
    flag: '🇩🇪',
    greeting: 'Hallo! Willkommen auf unserer Fitness-Herausforderungsplattform.',
    description: 'Dies ist eine Demonstration unseres mehrsprachigen Unterstützungssystems.',
    features: 'Funktionen',
    challenges: 'Herausforderungen',
    leaderboard: 'Rangliste',
    dashboard: 'Dashboard',
    join: 'Herausforderung Beitreten',
    checkin: 'Täglicher Check-in',
    motivation: 'Bleiben Sie motiviert und verfolgen Sie Ihren Fortschritt!',
    language: 'Sprache',
    selectLanguage: 'Wählen Sie Ihre bevorzugte Sprache:'
  },
  ja: {
    name: '日本語',
    flag: '🇯🇵',
    greeting: 'こんにちは！フィットネスチャレンジプラットフォームへようこそ。',
    description: 'これは多言語サポートシステムのデモンストレーションです。',
    features: '機能',
    challenges: 'チャレンジ',
    leaderboard: 'リーダーボード',
    dashboard: 'ダッシュボード',
    join: 'チャレンジに参加',
    checkin: 'デイリーチェックイン',
    motivation: 'モチベーションを保ち、進歩を追跡しましょう！',
    language: '言語',
    selectLanguage: 'お好みの言語を選択してください：'
  },
  zh: {
    name: '中文',
    flag: '🇨🇳',
    greeting: '你好！欢迎来到我们的健身挑战平台。',
    description: '这是我们多语言支持系统的演示。',
    features: '功能',
    challenges: '挑战',
    leaderboard: '排行榜',
    dashboard: '仪表板',
    join: '加入挑战',
    checkin: '每日签到',
    motivation: '保持动力，跟踪您的进度！',
    language: '语言',
    selectLanguage: '选择您偏好的语言：'
  }
}

export default function LanguageDemoPage() {
  const [currentLanguage, setCurrentLanguage] = useState('en')
  const [showAllLanguages, setShowAllLanguages] = useState(false)

  const t = languages[currentLanguage as keyof typeof languages]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Globe className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Language Demo</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience our multi-language support system with real-time language switching
          </p>
        </div>

        {/* Language Selector */}
        <Card className="max-w-4xl mx-auto mb-8">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center">
              <Languages className="w-6 h-6 mr-2 text-blue-600" />
              {t.language}
            </CardTitle>
            <CardDescription>{t.selectLanguage}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {Object.entries(languages).map(([code, lang]) => (
                <button
                  key={code}
                  onClick={() => setCurrentLanguage(code)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                    currentLanguage === code
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{lang.flag}</div>
                  <div className="text-sm font-medium text-gray-900">{lang.name}</div>
                  <div className="text-xs text-gray-500">{code.toUpperCase()}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Content Demo */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Welcome Section */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-green-600" />
                Welcome Message
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-lg font-medium text-gray-900">{t.greeting}</div>
              <p className="text-gray-600">{t.description}</p>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 italic">{t.motivation}</p>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Demo */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
                Navigation Elements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{t.challenges}</span>
                  <span className="text-sm text-gray-500">/challenges</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{t.leaderboard}</span>
                  <span className="text-sm text-gray-500">/leaderboard</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{t.dashboard}</span>
                  <span className="text-sm text-gray-500">/dashboard</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{t.join}</span>
                  <span className="text-sm text-gray-500">/join</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{t.checkin}</span>
                  <span className="text-sm text-gray-500">/checkin</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Language Info */}
        <Card className="max-w-4xl mx-auto mt-8">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center">
              <Globe className="w-6 h-6 mr-2 text-indigo-600" />
              Language Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Current Language</h4>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <span className="text-2xl">{t.flag}</span>
                  <div>
                    <div className="font-medium text-gray-900">{t.name}</div>
                    <div className="text-sm text-gray-500">Code: {currentLanguage}</div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Available Languages</h4>
                <div className="text-sm text-gray-600">
                  <p>• English (en) - Primary language</p>
                  <p>• Español (es) - Spanish support</p>
                  <p>• Français (fr) - French support</p>
                  <p>• Deutsch (de) - German support</p>
                  <p>• 日本語 (ja) - Japanese support</p>
                  <p>• 中文 (zh) - Chinese support</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <a href="/">
            <Button className="bg-blue-600 hover:bg-blue-700">← Back to Home</Button>
          </a>
        </div>
      </div>
    </div>
  )
} 