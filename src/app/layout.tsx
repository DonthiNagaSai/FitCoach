import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FitCoach AI',
  description: 'AI-generated workout and diet plans with a coach that learns.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
