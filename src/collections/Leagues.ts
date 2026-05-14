import type { League } from '@/payload-types'
import type { CollectionConfig, FilterOptionsProps } from 'payload'

type Matchday = NonNullable<League['matchdays']>[number]

export const Leagues: CollectionConfig = {
  slug: 'leagues',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'League Name',
    },
    {
      name: 'matchdays',
      type: 'array',
      label: 'Matchdays',
      admin: {
        components: {
          RowLabel: {
            path: '@/components/MatchdayRowLabel',
          },
        },
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          label: 'Matchday Name',
        },
        {
          name: 'matchups',
          type: 'relationship',
          relationTo: 'matchups',
          hasMany: true,
          label: 'Matchups',
          filterOptions: ({ data, siblingData }: FilterOptionsProps<League>) => {
            const matchdays = data?.matchdays ?? []
            const allUsedIds = matchdays
              .flatMap((md) => md.matchups ?? [])
              .filter((id): id is number => typeof id === 'number')

            const sibling = siblingData as Partial<Matchday> | undefined
            const currentIds =
              sibling?.matchups?.filter((id): id is number => typeof id === 'number') ?? []

            const idsToExclude = allUsedIds.filter((id) => !currentIds.includes(id))

            return {
              id: { not_in: idsToExclude },
            }
          },
        },
      ],
    },
  ],
}
