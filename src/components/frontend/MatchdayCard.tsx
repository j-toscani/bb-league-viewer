import React from 'react'
import type { Matchup, Team } from '@/payload-types'
import { MatchupRow } from './MatchupRow'

type ResolvedMatchup = Omit<Matchup, 'homeTeam' | 'awayTeam'> & {
  homeTeam: {
    team: Team
    touchdowns: number
    casualties: number
  }
  awayTeam: {
    team: Team
    touchdowns: number
    casualties: number
  }
}

interface MatchdayCardProps {
  name: string
  matchups: ResolvedMatchup[]
  index: number
}

export function MatchdayCard({ name, matchups, index }: MatchdayCardProps) {
  return (
    <section
      className="overflow-hidden border border-bb-border bg-bb-panel"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-bb-border bg-bb-surface px-5 py-3">
        <div className="flex h-7 w-7 items-center justify-center bg-bb-crimson text-xs font-bold text-white">
          {index + 1}
        </div>
        <h2 className="text-lg font-bold text-bb-gold">{name}</h2>
        <span className="ml-auto text-xs text-bb-text-muted">
          {matchups.length} {matchups.length === 1 ? 'Spiel' : 'Spiele'}
        </span>
      </div>

      {/* Matchups */}
      <div className="flex flex-col gap-2 p-3 sm:p-4">
        {matchups.length === 0 ? (
          <p className="py-4 text-center text-sm text-bb-text-muted">
            Noch keine Spiele an diesem Spieltag.
          </p>
        ) : (
          matchups.map((matchup) => (
            <MatchupRow key={matchup.id} matchup={matchup} />
          ))
        )}
      </div>
    </section>
  )
}
