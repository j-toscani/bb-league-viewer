import { getLatestLeague, isAuthenticated } from '@/lib/league'
import { computeStandings } from '@/lib/standings'
import { EmptyState } from '@/components/frontend/EmptyState'
import { LeagueTable } from '@/components/frontend/LeagueTable'
import { Header } from '@/components/frontend/Header'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [league, loggedIn] = await Promise.all([getLatestLeague(), isAuthenticated()])

  if (!league) {
    return <EmptyState />
  }

  const matchdays = league.matchdays ?? []

  return (
    <div>
      <Header leagueName={league.name} isLoggedIn={loggedIn} />

      {matchdays.length === 0 ? (
        <div className="border border-bb-border bg-bb-panel p-12 text-center">
          <p className="text-bb-text-muted">
            Noch keine Spieltage in dieser Liga angelegt.
          </p>
        </div>
      ) : (
        <LeagueTable groups={computeStandings(matchdays)} />
      )}
    </div>
  )
}
