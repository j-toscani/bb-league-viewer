import { getPayload } from 'payload'
import config from '@payload-config'
import type { League, Matchup, Team } from '@/payload-types'
import { EmptyState } from '@/components/frontend/EmptyState'
import { MatchdayCard } from '@/components/frontend/MatchdayCard'

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

type ResolvedMatchday = {
  name: string
  matchups: ResolvedMatchup[]
  id?: string | null
}

async function getLatestLeague() {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'leagues',
    sort: '-createdAt',
    limit: 1,
    depth: 2,
  })

  return docs[0] as
    | (Omit<League, 'matchdays'> & { matchdays?: ResolvedMatchday[] | null })
    | undefined
}

export default async function HomePage() {
  const league = await getLatestLeague()

  if (!league) {
    return <EmptyState />
  }

  const matchdays = league.matchdays ?? []

  return (
    <div>
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <div className="h-1 w-8 bg-bb-red" />
          <span className="text-xs font-semibold uppercase tracking-widest text-bb-text-muted">
            Aktuelle Liga
          </span>
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-bb-text sm:text-4xl lg:text-5xl">
          {league.name}
        </h1>
        <p className="mt-2 text-sm text-bb-text-muted">
          {matchdays.length} {matchdays.length === 1 ? 'Spieltag' : 'Spieltage'}
        </p>
      </header>

      {matchdays.length === 0 ? (
        <div className="border border-bb-border bg-bb-panel p-12 text-center">
          <p className="text-bb-text-muted">
            Noch keine Spieltage in dieser Liga angelegt.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {matchdays.map((matchday, index) => (
            <MatchdayCard
              key={matchday.id ?? index}
              name={matchday.name}
              matchups={matchday.matchups ?? []}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  )
}
