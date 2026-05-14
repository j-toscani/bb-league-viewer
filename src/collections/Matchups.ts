import type { CollectionConfig } from 'payload'

export const Matchups: CollectionConfig = {
  slug: 'matchups',
  admin: {
    useAsTitle: 'date',
  },
  fields: [
    {
      name: 'date',
      type: 'date',
      label: 'Match Date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'homeTeam',
      type: 'group',
      label: 'Home Team',
      fields: [
        {
          name: 'team',
          type: 'relationship',
          relationTo: 'teams',
          required: true,
          label: 'Team',
        },
        {
          name: 'touchdowns',
          type: 'number',
          required: true,
          defaultValue: 0,
          min: 0,
          label: 'Touchdowns',
        },
        {
          name: 'casualties',
          type: 'number',
          required: true,
          defaultValue: 0,
          min: 0,
          label: 'Casualties',
        },
      ],
    },
    {
      name: 'awayTeam',
      type: 'group',
      label: 'Away Team',
      fields: [
        {
          name: 'team',
          type: 'relationship',
          relationTo: 'teams',
          required: true,
          label: 'Team',
        },
        {
          name: 'touchdowns',
          type: 'number',
          required: true,
          defaultValue: 0,
          min: 0,
          label: 'Touchdowns',
        },
        {
          name: 'casualties',
          type: 'number',
          required: true,
          defaultValue: 0,
          min: 0,
          label: 'Casualties',
        },
      ],
    },
  ],
}
