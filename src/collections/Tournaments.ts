import type { CollectionConfig } from 'payload'
import { handleTournamentChange } from '@/lib/tournament-hooks'

const teamSourceFields = (prefix: 'home' | 'away') => [
  {
    name: `${prefix}Source`,
    type: 'group' as const,
    label: prefix === 'home' ? 'Heimteam-Quelle' : 'Auswärtsteam-Quelle',
    fields: [
      {
        name: 'type',
        type: 'select' as const,
        required: true,
        defaultValue: 'team',
        label: 'Typ',
        options: [
          { label: 'Team direkt auswählen', value: 'team' },
          { label: 'Sieger aus vorheriger Runde', value: 'previousRoundWinner' },
        ],
      },
      {
        name: 'team',
        type: 'relationship' as const,
        relationTo: 'teams' as const,
        label: 'Team',
        admin: {
          condition: (_: unknown, siblingData: Record<string, unknown>) =>
            siblingData?.type === 'team',
        },
      },
      {
        name: 'gameIndex',
        type: 'number' as const,
        label: 'Spiel-Index in vorheriger Runde (0-basiert)',
        min: 0,
        admin: {
          description: '0 = erstes Spiel, 1 = zweites Spiel, usw.',
          condition: (_: unknown, siblingData: Record<string, unknown>) =>
            siblingData?.type === 'previousRoundWinner',
        },
      },
    ],
  },
]

export const Tournaments: CollectionConfig = {
  slug: 'tournaments',
  admin: {
    useAsTitle: 'name',
  },
  hooks: {
    afterChange: [handleTournamentChange],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Turniername',
    },
    {
      name: 'league',
      type: 'relationship',
      relationTo: 'leagues',
      label: 'Verknüpfte Liga',
    },
    {
      name: 'rounds',
      type: 'array',
      label: 'Runden',
      admin: {
        components: {
          RowLabel: {
            path: '@/components/RoundRowLabel',
          },
        },
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          label: 'Rundenname',
        },
        {
          name: 'date',
          type: 'date',
          label: 'Datum',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'games',
          type: 'array',
          label: 'Spiele',
          admin: {
            components: {
              RowLabel: {
                path: '@/components/GameRowLabel',
              },
            },
          },
          fields: [
            {
              name: 'matchup',
              type: 'relationship',
              relationTo: 'matchups',
              label: 'Verknüpftes Matchup',
              admin: {
                readOnly: true,
                description: 'Wird automatisch erstellt, wenn beide Teams feststehen.',
              },
            },
            ...teamSourceFields('home'),
            ...teamSourceFields('away'),
          ],
        },
      ],
    },
  ],
}
