'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Tabelle' },
  { href: '/matchdays', label: 'Spieltage' },
]

export function Header({ leagueName }: { leagueName?: string }) {
  const pathname = usePathname()

  return (
    <header className="mb-8 border-b border-bb-border pb-6">
      <div className="flex items-center gap-3">
        <div className="h-1 w-8 bg-bb-red" />
        <span className="text-xs font-semibold uppercase tracking-widest text-bb-text-muted">
          Aktuelle Liga
        </span>
      </div>
      {leagueName && (
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-bb-text sm:text-4xl lg:text-5xl">
          {leagueName}
        </h1>
      )}

      <nav className="mt-4 flex gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-bb-red text-white'
                  : 'text-bb-text-muted hover:bg-bb-surface hover:text-bb-text'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
