import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nordhaven Logistics',
  description: 'Pan-European overnight freight, full-truck-load and last-mile delivery.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
