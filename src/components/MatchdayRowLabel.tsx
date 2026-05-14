'use client'

import { useRowLabel } from '@payloadcms/ui'

const MatchdayRowLabel = () => {
  const { data } = useRowLabel<{ name?: string }>()
  return <span>{data?.name || 'Untitled Matchday'}</span>
}

export default MatchdayRowLabel
