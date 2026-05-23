import React from 'react'
import type { Team } from '@/payload-types'
import { BracketMatchup } from './BracketMatchup'
import type { ResolvedTournament, ResolvedRound, ResolvedGame } from '@/lib/tournament'
import { getTournamentChampion } from '@/lib/tournament'

/**
 * Generates a label for a TBD team slot based on the game's source configuration.
 */
function getTbdLabel(
  source: ResolvedGame['homeSource'],
  previousRound?: ResolvedRound,
): string {
  if (source.type === 'team') {
    if (source.team && typeof source.team === 'object') {
      return (source.team as Team).name
    }
    return 'TBD'
  }
  if (source.type === 'previousRoundWinner' && previousRound) {
    const idx = source.gameIndex ?? 0
    return `Sieger Spiel ${idx + 1}`
  }
  return 'TBD'
}

function ChampionDisplay({ champion }: { champion: Team }) {
  return (
    <div className="flex flex-col items-center justify-center px-6">
      <div className="relative flex flex-col items-center border border-bb-gold bg-bb-dark p-6 shadow-[0_0_30px_var(--color-bb-gold-glow)]">
        {/* Trophy icon */}
        <div className="mb-3 text-4xl" role="img" aria-label="Pokal">
          🏆
        </div>
        <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-bb-gold-dim">
          Champion
        </div>
        <div className="text-center text-lg font-bold text-bb-gold">
          {champion.name}
        </div>
        <div className="mt-0.5 text-xs text-bb-text-muted">
          {champion.coachName}
        </div>
      </div>
    </div>
  )
}

function RoundColumn({
  round,
  roundIndex,
  totalRounds,
  previousRound,
}: {
  round: ResolvedRound
  roundIndex: number
  totalRounds: number
  previousRound?: ResolvedRound
}) {
  const games = round.games
  const isFinal = roundIndex === totalRounds - 1

  // Calculate vertical spacing to center games relative to previous round
  // Each subsequent round should have its games centered between pairs of previous round games
  const spacingMultiplier = Math.pow(2, roundIndex)

  return (
    <div className="flex flex-col">
      {/* Round header */}
      <div className="mb-6 border-b-2 border-bb-crimson pb-2 text-center">
        <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-bb-text-muted">
          {round.name}
        </h3>
        {round.date && (
          <div className="mt-1 text-[10px] text-bb-text-dim">
            {new Date(round.date).toLocaleDateString('de-DE', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </div>
        )}
      </div>

      {/* Games */}
      <div
        className="flex flex-1 flex-col justify-around"
        style={{
          gap: `${spacingMultiplier * 1.5}rem`,
          paddingTop: `${(spacingMultiplier - 1) * 1.5}rem`,
        }}
      >
        {games.map((game, gameIndex) => (
          <div key={game.id ?? gameIndex} className="relative flex items-center">
            {/* Connector line from previous round */}
            {roundIndex > 0 && (
              <div
                className="absolute -left-8 top-1/2 h-px w-8 bg-bb-border"
                aria-hidden="true"
              />
            )}

            <BracketMatchup
              matchup={game.matchup}
              homeLabel={!game.matchup ? getTbdLabel(game.homeSource, previousRound) : undefined}
              awayLabel={!game.matchup ? getTbdLabel(game.awaySource, previousRound) : undefined}
              isOvertime={!!(game.matchup as Record<string, unknown>)?.overtime}
            />

            {/* Connector line to next round */}
            {!isFinal && (
              <div
                className="absolute -right-8 top-1/2 h-px w-8 bg-bb-border"
                aria-hidden="true"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Renders vertical connector lines between rounds.
 * For each pair of games in round N that feeds into one game in round N+1,
 * draws a vertical bracket connecting them.
 */
function RoundConnectors({
  gamesCount,
  roundIndex,
}: {
  gamesCount: number
  roundIndex: number
}) {
  if (gamesCount <= 1) return null

  const pairs = Math.floor(gamesCount / 2)
  const spacingMultiplier = Math.pow(2, roundIndex)

  return (
    <div
      className="flex w-6 flex-col justify-around"
      style={{
        gap: `${spacingMultiplier * 1.5}rem`,
        paddingTop: `${(spacingMultiplier - 1) * 1.5}rem`,
      }}
    >
      {Array.from({ length: pairs }).map((_, i) => (
        <div
          key={i}
          className="relative"
          style={{
            height: `${spacingMultiplier * 3}rem`,
          }}
        >
          {/* Vertical line connecting two games */}
          <div
            className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-bb-border"
            aria-hidden="true"
          />
        </div>
      ))}
    </div>
  )
}

export function TournamentBracket({ tournament }: { tournament: ResolvedTournament }) {
  const rounds = tournament.rounds
  const champion = getTournamentChampion(tournament)

  if (rounds.length === 0) {
    return (
      <div className="border border-bb-border bg-bb-panel p-12 text-center">
        <p className="text-bb-text-muted">
          Noch keine Runden in diesem Turnier angelegt.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex items-start gap-2 pb-4" style={{ minWidth: 'max-content' }}>
        {rounds.map((round, roundIndex) => (
          <React.Fragment key={round.id ?? roundIndex}>
            <RoundColumn
              round={round}
              roundIndex={roundIndex}
              totalRounds={rounds.length}
              previousRound={roundIndex > 0 ? rounds[roundIndex - 1] : undefined}
            />
            {/* Add connectors between rounds (not after the last round) */}
            {roundIndex < rounds.length - 1 && (
              <RoundConnectors
                gamesCount={round.games.length}
                roundIndex={roundIndex}
              />
            )}
          </React.Fragment>
        ))}

        {/* Champion display */}
        {champion && <ChampionDisplay champion={champion} />}
      </div>
    </div>
  )
}
