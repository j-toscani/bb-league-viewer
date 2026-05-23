import { getLatestLeague, isAuthenticated } from '@/lib/league'
import { getTournamentForLeague } from '@/lib/tournament'
import { EmptyState } from '@/components/frontend/EmptyState'
import { Header } from '@/components/frontend/Header'
import { TournamentBracket } from '@/components/frontend/TournamentBracket'

export const dynamic = 'force-dynamic'

export default async function TournamentPage() {
  const [league, loggedIn] = await Promise.all([getLatestLeague(), isAuthenticated()])

  if (!league) {
    return <EmptyState />
  }

  const tournament = await getTournamentForLeague(league.id)

  return (
    <div>
      <Header leagueName={league.name} isLoggedIn={loggedIn} hasTournament={!!tournament} />

      {!tournament ? (
        <div className="border border-bb-border bg-bb-panel p-12 text-center">
          <p className="text-bb-text-muted">
            Noch kein Turnier für diese Liga angelegt.
          </p>
        </div>
      ) : (
        <section>
          <div className="mb-6 flex items-center gap-3">
            <div className="h-1 w-8 bg-bb-crimson" />
            <h2 className="text-xl font-bold text-bb-gold">{tournament.name}</h2>
          </div>
          <TournamentBracket tournament={tournament} />
        </section>
      )}
    </div>
  )
}
