import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DPC Cost Comparator - Compare Healthcare Costs | Ignite Health',
  description: 'Compare traditional health insurance costs with Direct Primary Care (DPC) model. Make informed healthcare decisions with real-time pricing data.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-foreground`}>
        <ErrorBoundary level="root">
          <div className="min-h-screen">
            {/* Navigation */}
            <nav className="bg-card border-b border-border">
              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Ignite flame icon */}
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-5 h-5 text-primary-foreground"
                      >
                        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                      </svg>
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-foreground">DPC Cost Comparator</h1>
                      <p className="text-xs text-muted-foreground">by Ignite Health</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground hidden sm:block">
                    Compare healthcare costs intelligently
                  </p>
                </div>
              </div>
            </nav>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 animate-fade-in-up">
              {children}
            </main>

            {/* Footer */}
            <footer className="bg-card border-t border-border mt-16">
              <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    Direct Primary Care Cost Comparator - Helping you make informed healthcare decisions
                  </p>
                  <a
                    href="https://ignitehealthsystems.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    ignitehealthsystems.com
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </ErrorBoundary>
      </body>
    </html>
  )
}
