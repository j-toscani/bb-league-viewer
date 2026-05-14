import React from 'react'
import './styles.css'

export const metadata = {
  title: 'BB League Viewer',
  description: 'Blood Bowl Liga Übersicht – Spieltage, Ergebnisse und Tabellen.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="min-h-screen">
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  )
}
