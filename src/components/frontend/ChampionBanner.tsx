import React from 'react'
import type { Team } from '@/payload-types'
import Link from 'next/link'

export function ChampionBanner({
  champion,
  tournamentName,
}: {
  champion: Team
  tournamentName: string
}) {
  return (
    <Link
      href="/tournament"
      className="group mb-6 block border border-bb-gold bg-bb-dark p-4 transition-colors hover:border-bb-gold-light"
    >
      <div className="flex items-center justify-center gap-4">
        <span className="text-2xl" role="img" aria-label="Pokal">🏆</span>
        <div className="text-center">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-bb-gold-dim">
            {tournamentName} Champion
          </div>
          <div className="text-lg font-bold text-bb-gold group-hover:text-bb-gold-light">
            {champion.name}
          </div>
          <div className="text-xs text-bb-text-muted">
            Coach {champion.coachName}
          </div>
        </div>
        <span className="text-2xl" role="img" aria-label="Pokal">🏆</span>
      </div>
    </Link>
  )
}
