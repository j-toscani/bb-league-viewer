import React from 'react'
import localFont from 'next/font/local'
import './styles.css'

const chakraPetch = localFont({
  src: [
    { path: '../../fonts/ChakraPetch-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../../fonts/ChakraPetch-Medium.ttf', weight: '500', style: 'normal' },
    { path: '../../fonts/ChakraPetch-SemiBold.ttf', weight: '600', style: 'normal' },
    { path: '../../fonts/ChakraPetch-Bold.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-chakra',
  display: 'swap',
})

export const metadata = {
  title: 'BB League Viewer',
  description: 'Blood Bowl Liga Übersicht – Spieltage, Ergebnisse und Tabellen.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={chakraPetch.variable}>
      <body className="min-h-screen">
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  )
}
