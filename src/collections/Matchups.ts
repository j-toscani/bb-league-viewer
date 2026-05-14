import type { CollectionConfig } from 'payload'

export const Matchups: CollectionConfig = {
  slug: 'matchups',
  admin: {
    useAsTitle: 'title',
  },
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        const homeTeamId =
          typeof data?.homeTeam?.team === 'object' ? data.homeTeam.team.id : data?.homeTeam?.team
        const awayTeamId =
          typeof data?.awayTeam?.team === 'object' ? data.awayTeam.team.id : data?.awayTeam?.team

        let homeName = 'TBD'
        let awayName = 'TBD'

        if (homeTeamId) {
          const homeTeam = await req.payload.findByID({ collection: 'teams', id: homeTeamId })
          homeName = homeTeam.name
        }
        if (awayTeamId) {
          const awayTeam = await req.payload.findByID({ collection: 'teams', id: awayTeamId })
          awayName = awayTeam.name
        }

        data.title = `${homeName} vs ${awayName}`
        return data
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
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
