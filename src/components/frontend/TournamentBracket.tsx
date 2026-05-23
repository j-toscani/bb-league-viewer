import React from 'react'
import type { Team } from '@/payload-types'
import { BracketMatchup } from './BracketMatchup'
import type { ResolvedTournament, ResolvedRound, ResolvedGame } from '@/lib/tournament'
import { getTournamentChampion } from '@/lib/tournament'

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
    <div className="flex items-center px-4">
      <div className="relative flex flex-col items-center border border-bb-gold bg-bb-dark p-6 shadow-[0_0_30px_var(--color-bb-gold-glow)]">
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

/*
 * Layout constants. CARD_HEIGHT must match the actual rendered height
 * of a BracketMatchup card (2 × TeamSlot + 1px divider).
 * Each TeamSlot: py-2 (16px) + name line (~20px) + coach line (~14px) = ~50px
 * Two slots: 100px + 1px border = ~101px. We use a safe round value.
 */
const CARD_HEIGHT = 100
const CARD_GAP = 32       // vertical gap between cards
const CONNECTOR_WIDTH = 48 // horizontal width of connector SVGs

/**
 * Computes Y positions for each game card in each round.
 * Anchors on the round with the most games, then spreads outward.
 */
function computePositions(rounds: ResolvedRound[]): number[][] {
  if (rounds.length === 0) return []

  let anchorIdx = 0
  let maxGames = 0
  for (let i = 0; i < rounds.length; i++) {
    if (rounds[i].games.length > maxGames) {
      maxGames = rounds[i].games.length
      anchorIdx = i
    }
  }

  const allPositions: (number[] | null)[] = rounds.map(() => null)

  // Anchor round: evenly spaced
  const anchorPos: number[] = []
  for (let i = 0; i < maxGames; i++) {
    anchorPos.push(i * (CARD_HEIGHT + CARD_GAP))
  }
  allPositions[anchorIdx] = anchorPos

  // Forward from anchor
  for (let ri = anchorIdx + 1; ri < rounds.length; ri++) {
    const prev = allPositions[ri - 1]!
    const round = rounds[ri]
    const pos: number[] = []

    for (let gi = 0; gi < round.games.length; gi++) {
      const game = round.games[gi]
      const feeders: number[] = []

      if (game.homeSource.type === 'previousRoundWinner') {
        const idx = game.homeSource.gameIndex ?? 0
        if (idx < prev.length) feeders.push(prev[idx])
      }
      if (game.awaySource.type === 'previousRoundWinner') {
        const idx = game.awaySource.gameIndex ?? 0
        if (idx < prev.length) feeders.push(prev[idx])
      }

      if (feeders.length >= 2) {
        pos.push((feeders[0] + feeders[1]) / 2)
      } else if (feeders.length === 1) {
        pos.push(feeders[0])
      } else {
        const center = (Math.min(...prev) + Math.max(...prev)) / 2
        if (round.games.length === 1) {
          pos.push(center)
        } else {
          const total = (round.games.length - 1) * (CARD_HEIGHT + CARD_GAP)
          pos.push(center - total / 2 + gi * (CARD_HEIGHT + CARD_GAP))
        }
      }
    }
    allPositions[ri] = pos
  }

  // Backward from anchor
  for (let ri = anchorIdx - 1; ri >= 0; ri--) {
    const nextPos = allPositions[ri + 1]!
    const nextRound = rounds[ri + 1]
    const currentRound = rounds[ri]
    const pos: number[] = new Array(currentRound.games.length).fill(0)
    const assigned: boolean[] = new Array(currentRound.games.length).fill(false)

    for (let ngi = 0; ngi < nextRound.games.length; ngi++) {
      const nextGame = nextRound.games[ngi]
      const feeding: number[] = []

      if (nextGame.homeSource.type === 'previousRoundWinner')
        feeding.push(nextGame.homeSource.gameIndex ?? 0)
      if (nextGame.awaySource.type === 'previousRoundWinner')
        feeding.push(nextGame.awaySource.gameIndex ?? 0)

      if (feeding.length === 1) {
        const idx = feeding[0]
        if (idx < pos.length) {
          pos[idx] = nextPos[ngi]
          assigned[idx] = true
        }
      } else if (feeding.length === 2) {
        const [a, b] = feeding.sort((x, y) => x - y)
        const center = nextPos[ngi]
        const offset = (CARD_HEIGHT + CARD_GAP) / 2
        if (a < pos.length) { pos[a] = center - offset; assigned[a] = true }
        if (b < pos.length) { pos[b] = center + offset; assigned[b] = true }
      }
    }

    for (let gi = 0; gi < pos.length; gi++) {
      if (!assigned[gi]) pos[gi] = gi * (CARD_HEIGHT + CARD_GAP)
    }
    allPositions[ri] = pos
  }

  const flat = (allPositions as number[][]).flat()
  const min = Math.min(...flat)
  return (allPositions as number[][]).map((rp) => rp.map((y) => y - min))
}

/**
 * SVG connector lines between two adjacent rounds.
 * The SVG sits between the round columns and spans the same
 * vertical area as the card containers (no header offset needed).
 */
function ConnectorSVG({
  fromPositions,
  toPositions,
  toRound,
  containerHeight,
}: {
  fromPositions: number[]
  toPositions: number[]
  toRound: ResolvedRound
  containerHeight: number
}) {
  const lines: React.ReactNode[] = []

  for (let gi = 0; gi < toRound.games.length; gi++) {
    const game = toRound.games[gi]
    const toCenter = toPositions[gi] + CARD_HEIGHT / 2

    const feederIndices: number[] = []
    if (game.homeSource.type === 'previousRoundWinner')
      feederIndices.push(game.homeSource.gameIndex ?? 0)
    if (game.awaySource.type === 'previousRoundWinner')
      feederIndices.push(game.awaySource.gameIndex ?? 0)

    if (feederIndices.length === 0) continue

    const feederCenters = feederIndices
      .filter((idx) => idx < fromPositions.length)
      .map((idx) => fromPositions[idx] + CARD_HEIGHT / 2)

    if (feederCenters.length === 2) {
      const y1 = Math.min(feederCenters[0], feederCenters[1])
      const y2 = Math.max(feederCenters[0], feederCenters[1])
      const midX = CONNECTOR_WIDTH / 2

      lines.push(
        <React.Fragment key={`pair-${gi}`}>
          {/* Horizontal from top feeder to midpoint */}
          <line x1={0} y1={y1} x2={midX} y2={y1}
            stroke="var(--color-bb-border)" strokeWidth={1.5} />
          {/* Horizontal from bottom feeder to midpoint */}
          <line x1={0} y1={y2} x2={midX} y2={y2}
            stroke="var(--color-bb-border)" strokeWidth={1.5} />
          {/* Vertical connecting both */}
          <line x1={midX} y1={y1} x2={midX} y2={y2}
            stroke="var(--color-bb-border)" strokeWidth={1.5} />
          {/* Horizontal from midpoint to next round */}
          <line x1={midX} y1={toCenter} x2={CONNECTOR_WIDTH} y2={toCenter}
            stroke="var(--color-bb-border)" strokeWidth={1.5} />
        </React.Fragment>
      )
    } else if (feederCenters.length === 1) {
      lines.push(
        <line key={`single-${gi}`}
          x1={0} y1={feederCenters[0]} x2={CONNECTOR_WIDTH} y2={toCenter}
          stroke="var(--color-bb-border)" strokeWidth={1.5} />
      )
    }
  }

  return (
    <svg
      width={CONNECTOR_WIDTH}
      height={containerHeight}
      className="shrink-0 self-end"
      aria-hidden="true"
    >
      {lines}
    </svg>
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

  const positions = computePositions(rounds)
  const containerHeight = Math.max(...positions.flat()) + CARD_HEIGHT

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex items-end" style={{ minWidth: 'max-content' }}>
        {rounds.map((round, roundIndex) => {
          const roundPositions = positions[roundIndex]
          const previousRound = roundIndex > 0 ? rounds[roundIndex - 1] : undefined

          return (
            <React.Fragment key={round.id ?? roundIndex}>
              {/* Round column */}
              <div className="shrink-0" style={{ width: '14rem' }}>
                {/* Round header – outside the positioned container */}
                <div className="mb-4 border-b-2 border-bb-crimson pb-2 text-center">
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

                {/* Cards container – same height across all rounds */}
                <div className="relative" style={{ height: `${containerHeight}px` }}>
                  {round.games.map((game, gameIndex) => (
                    <div
                      key={game.id ?? gameIndex}
                      className="absolute left-0 right-0"
                      style={{ top: `${roundPositions[gameIndex]}px` }}
                    >
                      <BracketMatchup
                        matchup={game.matchup}
                        homeLabel={
                          !game.matchup
                            ? getTbdLabel(game.homeSource, previousRound)
                            : undefined
                        }
                        awayLabel={
                          !game.matchup
                            ? getTbdLabel(game.awaySource, previousRound)
                            : undefined
                        }
                        isOvertime={
                          !!(game.matchup as Record<string, unknown>)?.overtime
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Connector SVG sits between round columns, aligned to the cards container */}
              {roundIndex < rounds.length - 1 && (
                <ConnectorSVG
                  fromPositions={positions[roundIndex]}
                  toPositions={positions[roundIndex + 1]}
                  toRound={rounds[roundIndex + 1]}
                  containerHeight={containerHeight}
                />
              )}
            </React.Fragment>
          )
        })}

        {champion && <ChampionDisplay champion={champion} />}
      </div>
    </div>
  )
}
