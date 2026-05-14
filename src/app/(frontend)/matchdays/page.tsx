import { getLatestLeague } from '@/lib/league'
import { EmptyState } from '@/components/frontend/EmptyState'
import { MatchdayCard } from '@/components/frontend/MatchdayCard'
import { Header } from '@/components/frontend/Header'

export const dynamic = 'force-dynamic'

export default async function SpieltagePage() {
  const league = await getLatestLeague()

  if (!league) {
    return <EmptyState />
  }

  const matchdays = league.matchdays ?? []

  return (
    <div>
      <Header leagueName={league.name} />

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
