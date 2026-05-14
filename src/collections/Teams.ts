import type { CollectionConfig } from 'payload'

export const Teams: CollectionConfig = {
  slug: 'teams',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Team Name',
    },
    {
      name: 'coachName',
      type: 'text',
      required: true,
      label: 'Coach Name',
    },
    {
      name: 'link',
      type: 'text',
      label: 'Team Link',
      admin: {
        description: 'Optional link to view the team externally',
      },
    },
  ],
}
