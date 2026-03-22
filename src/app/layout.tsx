import type { Metadata } from 'next'
import { DM_Sans, DM_Mono, Instrument_Serif } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

const dmSans = DM_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
})

const dmMono = DM_Mono({
  variable: '--font-mono',
  weight: ['400', '500'],
  subsets: ['latin'],
})

const instrumentSerif = Instrument_Serif({
  variable: '--font-display',
  weight: '400',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'The Pass',
  description: 'Build sheets for service.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${dmMono.variable} ${instrumentSerif.variable} antialiased`}
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
