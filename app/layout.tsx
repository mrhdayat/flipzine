import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FLIPZINE - 3D Digital Magazine Platform',
  description: 'Create and share interactive 3D digital magazines with realistic page-flip animations',
  keywords: ['digital magazine', '3D flipbook', 'interactive magazine', 'page flip'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
