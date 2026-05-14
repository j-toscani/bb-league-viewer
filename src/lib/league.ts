import { getPayload } from 'payload'
import config from '@payload-config'
import type { League, Matchup, Team } from '@/payload-types'

export type ResolvedMatchup = Omit<Matchup, 'homeTeam' | 'awayTeam'> & {
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

export type ResolvedMatchday = {
  name: string
  matchups: ResolvedMatchup[]
  id?: string | null
}

export type ResolvedLeague = Omit<League, 'matchdays'> & {
  matchdays?: ResolvedMatchday[] | null
}

export async function getLatestLeague(): Promise<ResolvedLeague | undefined> {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'leagues',
    sort: '-createdAt',
    limit: 1,
    depth: 2,
  })

  return docs[0] as ResolvedLeague | undefined
}

export async function isAuthenticated(): Promise<boolean> {
  const { headers: getHeaders } = await import('next/headers')
  const headers = await getHeaders()
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers })
  return !!user
}
