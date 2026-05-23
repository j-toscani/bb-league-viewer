import type { CollectionAfterChangeHook, PayloadRequest } from 'payload'
import type { Matchup, Tournament } from '@/payload-types'

/**
 * Determines the winner of a matchup based on touchdowns.
 * Returns the winning team's ID, or null if it's a draw.
 */
function getWinnerTeamId(matchup: Matchup): number | null {
  const homeTeamId =
    typeof matchup.homeTeam.team === 'object' ? matchup.homeTeam.team.id : matchup.homeTeam.team
  const awayTeamId =
    typeof matchup.awayTeam.team === 'object' ? matchup.awayTeam.team.id : matchup.awayTeam.team

  if (matchup.homeTeam.touchdowns > matchup.awayTeam.touchdowns) return homeTeamId
  if (matchup.awayTeam.touchdowns > matchup.homeTeam.touchdowns) return awayTeamId
  return null // Draw – no auto-advancement
}

type TeamSource = {
  type: 'team' | 'previousRoundWinner'
  team?: number | { id: number } | null
  gameIndex?: number | null
}

type Game = {
  matchup?: number | { id: number } | null
  homeSource: TeamSource
  awaySource: TeamSource
  id?: string | null
}

type Round = {
  name: string
  date?: string | null
  games?: Game[] | null
  id?: string | null
}

type TournamentDoc = {
  id: number
  rounds?: Round[] | null
}

/**
 * Resolves a team ID from a game's source definition.
 * For 'team' type, returns the team ID directly.
 * For 'previousRoundWinner', looks up the winner of the referenced game in the previous round.
 */
function resolveTeamId(
  source: TeamSource,
  previousRound: Round | undefined,
  winnerCache: Map<string, number | null>,
): number | null {
  if (source.type === 'team') {
    if (!source.team) return null
    return typeof source.team === 'object' ? source.team.id : source.team
  }

  if (source.type === 'previousRoundWinner' && previousRound) {
    const gameIndex = source.gameIndex ?? 0
    const prevGame = previousRound.games?.[gameIndex]
    if (!prevGame) return null

    const matchupId = prevGame.matchup
    if (!matchupId) return null

    const key = typeof matchupId === 'object' ? String(matchupId.id) : String(matchupId)
    return winnerCache.get(key) ?? null
  }

  return null
}

/**
 * afterChange hook for the Matchups collection.
 * When a matchup result changes, this hook:
 * 1. Finds any tournament game referencing this matchup
 * 2. Determines the winner
 * 3. Checks the next round for games that depend on this result
 * 4. Auto-creates the next matchup if both teams are now known
 * 5. Cascades updates if subsequent matchups already exist
 */
export const handleMatchupResultChange: CollectionAfterChangeHook<Matchup> = async ({
  doc,
  req,
}) => {
  const matchupId = doc.id

  // Find all tournaments that reference this matchup
  const { docs: tournaments } = await req.payload.find({
    collection: 'tournaments',
    depth: 2,
    limit: 100,
    where: {
      'rounds.games.matchup': { equals: matchupId },
    },
  })

  if (tournaments.length === 0) return doc

  const winner = getWinnerTeamId(doc)
  if (winner === null) return doc // Draw – skip auto-advancement

  for (const tournament of tournaments as unknown as TournamentDoc[]) {
    const rounds = tournament.rounds ?? []

    // Find which round and game this matchup belongs to
    let sourceRoundIndex = -1
    let sourceGameIndex = -1

    for (let ri = 0; ri < rounds.length; ri++) {
      const games = rounds[ri].games ?? []
      for (let gi = 0; gi < games.length; gi++) {
        const gameMatchupId = games[gi].matchup
        const gmId = typeof gameMatchupId === 'object' ? gameMatchupId?.id : gameMatchupId
        if (gmId === matchupId) {
          sourceRoundIndex = ri
          sourceGameIndex = gi
          break
        }
      }
      if (sourceRoundIndex >= 0) break
    }

    if (sourceRoundIndex < 0) continue

    // Build a winner cache for all matchups in the tournament
    const winnerCache = new Map<string, number | null>()

    for (const round of rounds) {
      for (const game of round.games ?? []) {
        if (!game.matchup) continue
        const gmId = typeof game.matchup === 'object' ? game.matchup.id : game.matchup
        if (gmId === matchupId) {
          winnerCache.set(String(gmId), winner)
        } else {
          // Fetch this matchup to determine its winner
          try {
            const m = await req.payload.findByID({
              collection: 'matchups',
              id: gmId,
              depth: 0,
            })
            winnerCache.set(String(gmId), getWinnerTeamId(m))
          } catch {
            winnerCache.set(String(gmId), null)
          }
        }
      }
    }

    // Check next rounds for games that depend on this result
    let needsTournamentUpdate = false
    const updatedRounds = [...rounds]

    for (let ri = sourceRoundIndex + 1; ri < updatedRounds.length; ri++) {
      const currentRound = updatedRounds[ri]
      const previousRound = updatedRounds[ri - 1]
      const games = currentRound.games ?? []

      for (let gi = 0; gi < games.length; gi++) {
        const game = games[gi]

        // Check if this game references the source game via previousRoundWinner
        const homeReferences =
          game.homeSource?.type === 'previousRoundWinner' &&
          game.homeSource?.gameIndex === sourceGameIndex &&
          ri === sourceRoundIndex + 1
        const awayReferences =
          game.awaySource?.type === 'previousRoundWinner' &&
          game.awaySource?.gameIndex === sourceGameIndex &&
          ri === sourceRoundIndex + 1

        if (!homeReferences && !awayReferences) continue

        // Resolve both team IDs
        const homeTeamId = resolveTeamId(game.homeSource, previousRound, winnerCache)
        const awayTeamId = resolveTeamId(game.awaySource, previousRound, winnerCache)

        if (homeTeamId && awayTeamId) {
          const existingMatchupId = game.matchup
          const existingId =
            typeof existingMatchupId === 'object' ? existingMatchupId?.id : existingMatchupId

          if (existingId) {
            // Update existing matchup if the teams changed
            const existing = await req.payload.findByID({
              collection: 'matchups',
              id: existingId,
              depth: 0,
            })
            const existingHomeId =
              typeof existing.homeTeam.team === 'object'
                ? existing.homeTeam.team.id
                : existing.homeTeam.team
            const existingAwayId =
              typeof existing.awayTeam.team === 'object'
                ? existing.awayTeam.team.id
                : existing.awayTeam.team

            if (existingHomeId !== homeTeamId || existingAwayId !== awayTeamId) {
              await req.payload.update({
                collection: 'matchups',
                id: existingId,
                data: {
                  homeTeam: { ...existing.homeTeam, team: homeTeamId },
                  awayTeam: { ...existing.awayTeam, team: awayTeamId },
                },
              })
            }
          } else {
            // Create new matchup
            const newMatchup = await req.payload.create({
              collection: 'matchups',
              data: {
                date: currentRound.date || undefined,
                homeTeam: { team: homeTeamId, touchdowns: 0, casualties: 0 },
                awayTeam: { team: awayTeamId, touchdowns: 0, casualties: 0 },
              },
            })

            // Update the game to reference the new matchup
            const updatedGames = [...(currentRound.games ?? [])]
            updatedGames[gi] = { ...game, matchup: newMatchup.id }
            updatedRounds[ri] = { ...currentRound, games: updatedGames }
            needsTournamentUpdate = true

            // Add to winner cache
            winnerCache.set(String(newMatchup.id), null)
          }
        }
      }
    }

    if (needsTournamentUpdate) {
      await req.payload.update({
        collection: 'tournaments',
        id: tournament.id,
        data: {
          rounds: updatedRounds,
        },
        depth: 0,
      })
    }
  }

  return doc
}

/**
 * Resolves a team ID from a source, using the payload API to look up
 * winners of previous round matchups when needed.
 */
async function resolveTeamIdAsync(
  source: TeamSource,
  previousRound: Round | undefined,
  req: PayloadRequest,
): Promise<number | null> {
  if (source.type === 'team') {
    if (!source.team) return null
    return typeof source.team === 'object' ? source.team.id : source.team
  }

  if (source.type === 'previousRoundWinner' && previousRound) {
    const gameIndex = source.gameIndex ?? 0
    const prevGame = previousRound.games?.[gameIndex]
    if (!prevGame?.matchup) return null

    const matchupId =
      typeof prevGame.matchup === 'object' ? prevGame.matchup.id : prevGame.matchup

    try {
      const matchup = await req.payload.findByID({
        collection: 'matchups',
        id: matchupId,
        depth: 0,
      })
      return getWinnerTeamId(matchup)
    } catch {
      return null
    }
  }

  return null
}

/**
 * afterChange hook for the Tournaments collection.
 * When a tournament is saved, this hook iterates all games and:
 * 1. For games where both team sources resolve to known teams
 *    and no matchup is linked → creates a Matchup automatically
 * 2. Links the new matchup back to the game
 *
 * This handles:
 * - Initial setup: editor creates games with type='team' → matchups created on save
 * - Cascading: if a previousRoundWinner can be resolved because the
 *   referenced game now has a completed matchup → next matchup created
 */
export const handleTournamentChange: CollectionAfterChangeHook<Tournament> = async ({
  doc,
  req,
}) => {
  const rounds = (doc.rounds ?? []) as Round[]
  let needsUpdate = false
  const updatedRounds = rounds.map((r) => ({ ...r, games: [...(r.games ?? [])] }))

  for (let ri = 0; ri < updatedRounds.length; ri++) {
    const round = updatedRounds[ri]
    const previousRound = ri > 0 ? updatedRounds[ri - 1] : undefined
    const games = round.games ?? []

    for (let gi = 0; gi < games.length; gi++) {
      const game = games[gi]

      // Skip if matchup already exists
      if (game.matchup) continue

      // Resolve both team sources
      const homeTeamId = await resolveTeamIdAsync(game.homeSource, previousRound, req)
      const awayTeamId = await resolveTeamIdAsync(game.awaySource, previousRound, req)

      if (!homeTeamId || !awayTeamId) continue

      // Both teams known → create matchup
      const newMatchup = await req.payload.create({
        collection: 'matchups',
        data: {
          date: round.date || undefined,
          homeTeam: { team: homeTeamId, touchdowns: 0, casualties: 0 },
          awayTeam: { team: awayTeamId, touchdowns: 0, casualties: 0 },
        },
      })

      updatedRounds[ri].games[gi] = { ...game, matchup: newMatchup.id }
      needsUpdate = true
    }
  }

  if (needsUpdate) {
    await req.payload.update({
      collection: 'tournaments',
      id: doc.id,
      data: {
        rounds: updatedRounds,
      },
      depth: 0,
    })
  }

  return doc
}
