import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/src/components/Navigation'
import AuthProvider from '@/src/components/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Fitness Challenge - Transform Your Life',
  description: 'Join fitness challenges, track your progress, and compete with others. Start your transformation today!',
  keywords: 'fitness, challenge, workout, health, wellness, transformation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body className={`${inter.className} cache-bust-${Date.now()}`}>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <Navigation />
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
} 