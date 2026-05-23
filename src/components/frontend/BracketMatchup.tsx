import React from 'react'
import type { Team } from '@/payload-types'
import type { ResolvedTournamentMatchup } from '@/lib/tournament'

type Props = {
  matchup?: ResolvedTournamentMatchup | null
  homeLabel?: string
  awayLabel?: string
  isOvertime?: boolean
}

function getMatchResult(home: number, away: number): 'home' | 'away' | 'draw' {
  if (home > away) return 'home'
  if (away > home) return 'away'
  return 'draw'
}

function TeamSlot({
  team,
  label,
  touchdowns,
  casualties,
  highlight,
  isPlayed,
}: {
  team?: Team | null
  label?: string
  touchdowns?: number
  casualties?: number
  highlight: 'winner' | 'loser' | 'neutral' | 'tbd'
  isPlayed: boolean
}) {
  const nameClass =
    highlight === 'winner'
      ? 'text-bb-gold font-bold'
      : highlight === 'loser'
        ? 'text-bb-text-muted'
        : highlight === 'tbd'
          ? 'text-bb-text-dim italic'
          : 'text-bb-text'

  const scoreClass =
    highlight === 'winner'
      ? 'text-bb-gold font-bold'
      : highlight === 'loser'
        ? 'text-bb-text-muted'
        : 'text-bb-text-dim'

  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2">
      <div className="min-w-0 flex-1">
        <div className={`truncate text-sm ${nameClass}`}>
          {team ? team.name : label || 'TBD'}
        </div>
        {team && (
          <div className="truncate text-[10px] text-bb-text-dim">
            {team.coachName}
          </div>
        )}
      </div>
      {isPlayed && touchdowns !== undefined ? (
        <div className="flex items-center gap-2">
          <span className={`font-mono text-lg tabular-nums ${scoreClass}`}>
            {touchdowns}
          </span>
          {casualties !== undefined && casualties > 0 && (
            <span className="text-[10px] text-bb-text-dim" title="Casualties">
              💀{casualties}
            </span>
          )}
        </div>
      ) : (
        <span className="font-mono text-sm text-bb-text-dim">–</span>
      )}
    </div>
  )
}

export function BracketMatchup({ matchup, homeLabel, awayLabel, isOvertime }: Props) {
  if (!matchup) {
    // TBD state – no matchup created yet
    return (
      <div className="w-56 border border-dashed border-bb-tbd bg-bb-dark/50">
        <TeamSlot label={homeLabel || 'TBD'} highlight="tbd" isPlayed={false} />
        <div className="border-t border-dashed border-bb-tbd" />
        <TeamSlot label={awayLabel || 'TBD'} highlight="tbd" isPlayed={false} />
      </div>
    )
  }

  const { homeTeam, awayTeam } = matchup
  const isPlayed = !!matchup.date && new Date(matchup.date) <= new Date()
  const result = isPlayed ? getMatchResult(homeTeam.touchdowns, awayTeam.touchdowns) : null

  const homeHighlight: 'winner' | 'loser' | 'neutral' =
    result === 'home' ? 'winner' : result === 'away' ? 'loser' : 'neutral'
  const awayHighlight: 'winner' | 'loser' | 'neutral' =
    result === 'away' ? 'winner' : result === 'home' ? 'loser' : 'neutral'

  return (
    <div
      className={`w-56 border transition-colors ${
        result
          ? 'border-bb-border bg-bb-dark hover:border-bb-gold-dim'
          : 'border-bb-border bg-bb-dark'
      }`}
    >
      <TeamSlot
        team={homeTeam.team}
        touchdowns={homeTeam.touchdowns}
        casualties={homeTeam.casualties}
        highlight={homeHighlight}
        isPlayed={isPlayed}
      />
      <div className="relative border-t border-bb-border">
        {isOvertime && (
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-bb-dark px-1.5 text-[9px] font-bold uppercase tracking-wider text-bb-crimson">
            OT
          </span>
        )}
      </div>
      <TeamSlot
        team={awayTeam.team}
        touchdowns={awayTeam.touchdowns}
        casualties={awayTeam.casualties}
        highlight={awayHighlight}
        isPlayed={isPlayed}
      />
    </div>
  )
}
