import type { CollectionConfig } from 'payload'

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
        },
      ],
    },
  ],
}
