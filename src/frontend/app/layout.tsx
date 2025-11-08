import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DPC Cost Comparator - Compare Healthcare Costs',
  description: 'Compare traditional health insurance costs with Direct Primary Care (DPC) model',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary level="root">
          <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            <nav className="bg-white shadow-sm border-b">
              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-blue-600">DPC Cost Comparator</h1>
                  <p className="text-sm text-muted-foreground">Compare healthcare costs intelligently</p>
                </div>
              </div>
            </nav>
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
            <footer className="bg-white border-t mt-16">
              <div className="container mx-auto px-4 py-6">
                <p className="text-center text-sm text-muted-foreground">
                  Direct Primary Care Cost Comparator - Helping you make informed healthcare decisions
                </p>
              </div>
            </footer>
          </div>
        </ErrorBoundary>
      </body>
    </html>
  )
}
