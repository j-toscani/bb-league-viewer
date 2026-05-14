import { Team } from '@/payload-types'
import type { ResolvedMatchday, ResolvedMatchup } from './league'

export type { ResolvedMatchday, ResolvedMatchup }

type GameResult = 'W' | 'L' | 'T'

export type TeamStanding = {
  team: Team
  games: number
  wins: number
  losses: number
  ties: number
  ligaPoints: number
  pointsFor: number
  pointsAgainst: number
  casualtiesFor: number
  streak: string
}

export type StandingsGroup = {
  label: string
  type: 'playoffs' | 'wildcard' | 'out'
  teams: TeamStanding[]
}

export function computeStandings(matchdays: ResolvedMatchday[]): StandingsGroup[] {
  const statsMap = new Map<
    number,
    {
      team: Team
      wins: number
      losses: number
      ties: number
      pointsFor: number
      pointsAgainst: number
      casualtiesFor: number
      results: GameResult[]
    }
  >()

  function getOrCreate(team: Team) {
    if (!statsMap.has(team.id)) {
      statsMap.set(team.id, {
        team,
        wins: 0,
        losses: 0,
        ties: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        casualtiesFor: 0,
        results: [],
      })
    }
    return statsMap.get(team.id)!
  }

  for (const matchday of matchdays) {
    for (const matchup of matchday.matchups) {
      const home = getOrCreate(matchup.homeTeam.team)
      const away = getOrCreate(matchup.awayTeam.team)

      const isPlayed = !!matchup.date && new Date(matchup.date) <= new Date()
      if (!isPlayed) continue

      home.pointsFor += matchup.homeTeam.touchdowns
      home.pointsAgainst += matchup.awayTeam.touchdowns
      home.casualtiesFor += matchup.homeTeam.casualties

      away.pointsFor += matchup.awayTeam.touchdowns
      away.pointsAgainst += matchup.homeTeam.touchdowns
      away.casualtiesFor += matchup.awayTeam.casualties

      if (matchup.homeTeam.touchdowns > matchup.awayTeam.touchdowns) {
        home.wins++
        away.losses++
        home.results.push('W')
        away.results.push('L')
      } else if (matchup.homeTeam.touchdowns < matchup.awayTeam.touchdowns) {
        home.losses++
        away.wins++
        home.results.push('L')
        away.results.push('W')
      } else {
        home.ties++
        away.ties++
        home.results.push('T')
        away.results.push('T')
      }
    }
  }

  const standings: TeamStanding[] = Array.from(statsMap.values()).map((s) => ({
    team: s.team,
    games: s.wins + s.losses + s.ties,
    wins: s.wins,
    losses: s.losses,
    ties: s.ties,
    ligaPoints: s.wins * 3 + s.ties,
    pointsFor: s.pointsFor,
    pointsAgainst: s.pointsAgainst,
    casualtiesFor: s.casualtiesFor,
    streak: computeStreak(s.results),
  }))

  standings.sort((a, b) => {
    if (b.ligaPoints !== a.ligaPoints) return b.ligaPoints - a.ligaPoints
    const diffA = a.pointsFor - a.pointsAgainst
    const diffB = b.pointsFor - b.pointsAgainst
    if (diffB !== diffA) return diffB - diffA
    return b.pointsFor - a.pointsFor
  })

  return groupStandings(standings)
}

function computeStreak(results: GameResult[]): string {
  if (results.length === 0) return '-'
  const last = results[results.length - 1]
  let count = 0
  for (let i = results.length - 1; i >= 0; i--) {
    if (results[i] === last) count++
    else break
  }
  return `${last}${count}`
}

function groupStandings(standings: TeamStanding[]): StandingsGroup[] {
  const total = standings.length
  if (total === 0) return []

  const playoffCount = Math.max(1, Math.ceil(total / 2))
  const wildcardCount = Math.max(0, Math.min(2, total - playoffCount - 1))
  const outCount = total - playoffCount - wildcardCount

  const groups: StandingsGroup[] = []

  if (playoffCount > 0) {
    groups.push({
      label: 'Playoffs',
      type: 'playoffs',
      teams: standings.slice(0, playoffCount),
    })
  }

  if (wildcardCount > 0) {
    groups.push({
      label: 'Wildcard',
      type: 'wildcard',
      teams: standings.slice(playoffCount, playoffCount + wildcardCount),
    })
  }

  if (outCount > 0) {
    groups.push({
      label: 'Out',
      type: 'out',
      teams: standings.slice(playoffCount + wildcardCount),
    })
  }

  return groups
}
