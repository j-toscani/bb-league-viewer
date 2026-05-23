'use client'

import { useRowLabel } from '@payloadcms/ui'

const RoundRowLabel = () => {
  const { data } = useRowLabel<{ name?: string }>()
  return <span>{data?.name || 'Unbenannte Runde'}</span>
}

export default RoundRowLabel
