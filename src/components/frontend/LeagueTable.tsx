import type { StandingsGroup, TeamStanding } from '@/lib/standings'

const rankColors: Record<StandingsGroup['type'], string> = {
  playoffs: 'bg-green-600',
  wildcard: 'bg-yellow-500',
  out: 'bg-red-600',
}

const groupHeaderColors: Record<StandingsGroup['type'], string> = {
  playoffs: 'border-green-600/30 bg-green-950/30',
  wildcard: 'border-yellow-600/30 bg-yellow-950/30',
  out: 'border-red-600/30 bg-red-950/30',
}

function StreakBadge({ streak }: { streak: string }) {
  const type = streak.charAt(0)
  const colorMap: Record<string, string> = {
    W: 'text-bb-win',
    L: 'text-bb-loss',
    T: 'text-bb-draw',
  }
  return <span className={`font-semibold ${colorMap[type] ?? 'text-bb-text-muted'}`}>{streak}</span>
}

function TeamRow({
  standing,
  rank,
  groupType,
}: {
  standing: TeamStanding
  rank: number
  groupType: StandingsGroup['type']
}) {
  return (
    <tr className="border-b border-bb-border/50 transition-colors hover:bg-bb-surface/50">
      <td className="px-3 py-2.5 text-center">
        <span
          className={`inline-flex h-6 w-6 items-center justify-center text-xs font-bold text-white ${rankColors[groupType]}`}
        >
          {rank}
        </span>
      </td>
      <td className="px-3 py-2.5 font-semibold text-bb-text">{standing.team.name}</td>
      <td className="px-3 py-2.5 text-sm text-bb-text-muted">{standing.team.coachName}</td>
      <td className="px-3 py-2.5 text-center font-bold text-bb-gold">{standing.ligaPoints}</td>
      <td className="px-3 py-2.5 text-center text-sm">{standing.games}</td>
      <td className="px-3 py-2.5 text-center text-sm">{standing.wins}</td>
      <td className="px-3 py-2.5 text-center text-sm">{standing.losses}</td>
      <td className="px-3 py-2.5 text-center text-sm">{standing.ties}</td>
      <td className="px-3 py-2.5 text-center text-sm">{standing.pointsFor}</td>
      <td className="px-3 py-2.5 text-center text-sm">{standing.pointsAgainst}</td>
      <td className="px-3 py-2.5 text-center text-sm">{standing.casualtiesFor}</td>
      <td className="px-3 py-2.5 text-center text-sm">
        <StreakBadge streak={standing.streak} />
      </td>
    </tr>
  )
}

function GroupSeparator({ label, type }: { label: string; type: StandingsGroup['type'] }) {
  return (
    <tr>
      <td colSpan={12} className={`border-y px-3 py-1.5 ${groupHeaderColors[type]}`}>
        <span className="text-xs font-bold uppercase tracking-wider text-bb-text-muted">
          {label}
        </span>
      </td>
    </tr>
  )
}

export function LeagueTable({ groups }: { groups: StandingsGroup[] }) {
  let globalRank = 0

  return (
    <div className="overflow-x-auto border border-bb-border bg-bb-panel">
      <table className="w-full min-w-[700px] text-sm">
        <thead>
          <tr className="border-b border-bb-border bg-bb-surface text-bb-text-muted">
            <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider">
              #
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider">
              Team
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider">
              Coach
            </th>
            <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider">
              LigaP
            </th>
            <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider">
              G
            </th>
            <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider">
              W
            </th>
            <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider">
              L
            </th>
            <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider">
              T
            </th>
            <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider">
              PF
            </th>
            <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider">
              PA
            </th>
            <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider">
              CF
            </th>
            <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider">
              STRK
            </th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => {
            const rows = group.teams.map((standing) => {
              globalRank++
              return (
                <TeamRow
                  key={standing.team.id}
                  standing={standing}
                  rank={globalRank}
                  groupType={group.type}
                />
              )
            })
            return [
              <GroupSeparator key={`sep-${group.label}`} label={group.label} type={group.type} />,
              ...rows,
            ]
          })}
        </tbody>
      </table>
    </div>
  )
}
