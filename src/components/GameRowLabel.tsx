'use client'

import { useRowLabel } from '@payloadcms/ui'

type GameRowData = {
  homeSource?: { type?: string; team?: { name?: string } | number }
  awaySource?: { type?: string; team?: { name?: string } | number }
  matchup?: { title?: string } | number
}

function getTeamLabel(source?: GameRowData['homeSource']): string {
  if (!source?.type) return '?'
  if (source.type === 'team') {
    if (typeof source.team === 'object' && source.team?.name) {
      return source.team.name
    }
    return 'Team'
  }
  return 'TBD'
}

const GameRowLabel = () => {
  const { data } = useRowLabel<GameRowData>()

  if (typeof data?.matchup === 'object' && data.matchup?.title) {
    return <span>{data.matchup.title}</span>
  }

  const home = getTeamLabel(data?.homeSource)
  const away = getTeamLabel(data?.awaySource)

  return <span>{home} vs {away}</span>
}

export default GameRowLabel
