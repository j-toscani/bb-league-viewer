import React from 'react'
import type { Matchup, Team } from '@/payload-types'

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

function getMatchResult(home: number, away: number): 'home' | 'away' | 'draw' {
  if (home > away) return 'home'
  if (away > home) return 'away'
  return 'draw'
}

export function MatchupRow({ matchup }: { matchup: ResolvedMatchup }) {
  const { homeTeam, awayTeam } = matchup
  const result = getMatchResult(homeTeam.touchdowns, awayTeam.touchdowns)

  const homeHighlight = result === 'home' ? 'text-bb-gold font-bold' : result === 'away' ? 'text-bb-text-muted' : 'text-bb-gold-dim'
  const awayHighlight = result === 'away' ? 'text-bb-gold font-bold' : result === 'home' ? 'text-bb-text-muted' : 'text-bb-gold-dim'

  return (
    <div className="group flex items-center gap-3 border border-bb-border bg-bb-dark px-4 py-3 transition-colors hover:border-bb-gold-dim hover:bg-bb-surface sm:px-6">
      <div className="flex flex-1 flex-col items-end gap-0.5 text-right">
        <span className={`text-sm font-semibold sm:text-base ${homeHighlight}`}>
          {homeTeam.team.name}
        </span>
        <span className="text-xs text-bb-text-muted">
          {homeTeam.team.coachName}
        </span>
      </div>

      <div className="flex flex-col items-center">
        <div className="flex items-center gap-1.5 bg-bb-surface px-3 py-1.5 font-mono text-lg font-bold tabular-nums">
          <span className={homeHighlight}>{homeTeam.touchdowns}</span>
          <span className="text-bb-text-muted">:</span>
          <span className={awayHighlight}>{awayTeam.touchdowns}</span>
        </div>
        <div className="mt-1 flex items-center gap-1 text-[10px] text-bb-text-muted">
          <span title="Casualties Home">💀 {homeTeam.casualties}</span>
          <span>–</span>
          <span title="Casualties Away">{awayTeam.casualties} 💀</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-start gap-0.5">
        <span className={`text-sm font-semibold sm:text-base ${awayHighlight}`}>
          {awayTeam.team.name}
        </span>
        <span className="text-xs text-bb-text-muted">
          {awayTeam.team.coachName}
        </span>
      </div>
    </div>
  )
}
