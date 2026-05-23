import { getPayload } from 'payload'
import config from '@payload-config'
import type { Team, Matchup } from '@/payload-types'

export type ResolvedTournamentMatchup = Omit<Matchup, 'homeTeam' | 'awayTeam'> & {
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

export type TeamSource = {
  type: 'team' | 'previousRoundWinner'
  team?: Team | number | null
  gameIndex?: number | null
}

export type ResolvedGame = {
  matchup?: ResolvedTournamentMatchup | null
  homeSource: TeamSource
  awaySource: TeamSource
  id?: string | null
}

export type ResolvedRound = {
  name: string
  date?: string | null
  games: ResolvedGame[]
  id?: string | null
}

export type ResolvedTournament = {
  id: number
  name: string
  league?: { id: number; name: string } | number | null
  rounds: ResolvedRound[]
  updatedAt: string
  createdAt: string
}

/**
 * Returns the tournament for a given league, or undefined if none exists.
 */
export async function getTournamentForLeague(
  leagueId: number,
): Promise<ResolvedTournament | undefined> {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'tournaments',
    where: {
      league: { equals: leagueId },
    },
    sort: '-createdAt',
    limit: 1,
    depth: 3,
  })

  if (docs.length === 0) return undefined

  return normalizeTournament(docs[0])
}

/**
 * Checks whether a tournament exists for the given league.
 */
export async function hasTournamentForLeague(leagueId: number): Promise<boolean> {
  const payload = await getPayload({ config })

  const { totalDocs } = await payload.find({
    collection: 'tournaments',
    where: {
      league: { equals: leagueId },
    },
    limit: 0,
  })

  return totalDocs > 0
}

/**
 * Determines the champion of a tournament.
 * The champion is the winner of the final round's (last round) final game (last game).
 */
export function getTournamentChampion(tournament: ResolvedTournament): Team | null {
  const rounds = tournament.rounds
  if (rounds.length === 0) return null

  const finalRound = rounds[rounds.length - 1]
  const games = finalRound.games
  if (games.length === 0) return null

  const finalGame = games[games.length - 1]
  if (!finalGame.matchup) return null

  const matchup = finalGame.matchup
  const isPlayed = !!matchup.date && new Date(matchup.date) <= new Date()
  if (!isPlayed) return null

  if (matchup.homeTeam.touchdowns > matchup.awayTeam.touchdowns) {
    return matchup.homeTeam.team
  }
  if (matchup.awayTeam.touchdowns > matchup.homeTeam.touchdowns) {
    return matchup.awayTeam.team
  }

  return null // Draw – shouldn't happen in tournament (overtime rule)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeTournament(doc: any): ResolvedTournament {
  const rounds: ResolvedRound[] = (doc.rounds ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (round: any) => ({
      name: round.name,
      date: round.date ?? null,
      id: round.id ?? null,
      games: (round.games ?? []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (game: any) => ({
          matchup: game.matchup && typeof game.matchup === 'object' ? game.matchup : null,
          homeSource: game.homeSource ?? { type: 'team' },
          awaySource: game.awaySource ?? { type: 'team' },
          id: game.id ?? null,
        }),
      ),
    }),
  )

  return {
    id: doc.id,
    name: doc.name,
    league: doc.league,
    rounds,
    updatedAt: doc.updatedAt,
    createdAt: doc.createdAt,
  }
}
