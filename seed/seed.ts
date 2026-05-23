import { getPayload } from 'payload'
import config from '../src/payload.config'

async function seed() {
  const payload = await getPayload({ config })

  console.log('🏈 Seeding Blood Bowl League data...\n')

  // --- 1. Create 5 Teams ---
  console.log('Creating teams...')
  const teamData = [
    { name: 'Reikland Reavers', coachName: 'Coach Grünwald' },
    { name: 'Orcland Raiders', coachName: 'Coach Grimjaw' },
    { name: 'Skavenblight Scramblers', coachName: 'Coach Snikkit' },
    { name: 'Darkside Cowboys', coachName: 'Coach Mordrek' },
    { name: 'Grudgebearers', coachName: 'Coach Thorgrim' },
  ]

  const teams = []
  for (const data of teamData) {
    const team = await payload.create({ collection: 'teams', data })
    console.log(`  ✅ ${team.name} (ID: ${team.id})`)
    teams.push(team)
  }

  // --- 2. Create Matchups for a league season ---
  // We need standings that produce a clear ranking: 1st through 5th
  // Each team plays every other team once = 4 matchdays, 2 games each (+ 1 bye per day)
  // With 5 teams, we'll have 10 total matchups (round robin)

  console.log('\nCreating matchups for league season...')

  // Results designed to produce this standing:
  // 1st: Reikland Reavers (4W) = 12 pts
  // 2nd: Orcland Raiders (3W 1L) = 9 pts
  // 3rd: Skavenblight Scramblers (2W 2L) = 6 pts
  // 4th: Darkside Cowboys (1W 3L) = 3 pts
  // 5th: Grudgebearers (0W 4L) = 0 pts

  const now = new Date()
  const pastDate = (daysAgo: number) => {
    const d = new Date(now)
    d.setDate(d.getDate() - daysAgo)
    return d.toISOString()
  }

  type MatchupInput = {
    homeIdx: number
    awayIdx: number
    homeScore: number
    awayScore: number
    homeCas: number
    awayCas: number
  }

  // Matchday 1 (4 weeks ago): 2 games
  const matchday1: MatchupInput[] = [
    { homeIdx: 0, awayIdx: 4, homeScore: 3, awayScore: 1, homeCas: 2, awayCas: 0 }, // Reikland beats Grudgebearers
    { homeIdx: 1, awayIdx: 3, homeScore: 2, awayScore: 1, homeCas: 1, awayCas: 1 }, // Orcland beats Darkside
  ]

  // Matchday 2 (3 weeks ago): 2 games
  const matchday2: MatchupInput[] = [
    { homeIdx: 0, awayIdx: 2, homeScore: 2, awayScore: 1, homeCas: 1, awayCas: 2 }, // Reikland beats Skaven
    { homeIdx: 3, awayIdx: 4, homeScore: 3, awayScore: 0, homeCas: 3, awayCas: 0 }, // Darkside beats Grudgebearers
  ]

  // Matchday 3 (2 weeks ago): 2 games
  const matchday3: MatchupInput[] = [
    { homeIdx: 0, awayIdx: 1, homeScore: 2, awayScore: 1, homeCas: 0, awayCas: 1 }, // Reikland beats Orcland
    { homeIdx: 2, awayIdx: 4, homeScore: 4, awayScore: 1, homeCas: 2, awayCas: 0 }, // Skaven beats Grudgebearers
  ]

  // Matchday 4 (1 week ago): 2 games
  const matchday4: MatchupInput[] = [
    { homeIdx: 0, awayIdx: 3, homeScore: 3, awayScore: 2, homeCas: 1, awayCas: 2 }, // Reikland beats Darkside
    { homeIdx: 1, awayIdx: 2, homeScore: 2, awayScore: 1, homeCas: 1, awayCas: 1 }, // Orcland beats Skaven
  ]

  // Matchday 5 (this week): 2 games
  const matchday5: MatchupInput[] = [
    { homeIdx: 1, awayIdx: 4, homeScore: 3, awayScore: 0, homeCas: 2, awayCas: 0 }, // Orcland beats Grudgebearers
    { homeIdx: 2, awayIdx: 3, homeScore: 2, awayScore: 0, homeCas: 1, awayCas: 0 }, // Skaven beats Darkside
  ]

  const allMatchdays = [
    { name: 'Spieltag 1', matches: matchday1, daysAgo: 28 },
    { name: 'Spieltag 2', matches: matchday2, daysAgo: 21 },
    { name: 'Spieltag 3', matches: matchday3, daysAgo: 14 },
    { name: 'Spieltag 4', matches: matchday4, daysAgo: 7 },
    { name: 'Spieltag 5', matches: matchday5, daysAgo: 2 },
  ]

  const leagueMatchdays = []

  for (const md of allMatchdays) {
    const matchupIds: number[] = []
    for (const m of md.matches) {
      const matchup = await payload.create({
        collection: 'matchups',
        data: {
          date: pastDate(md.daysAgo),
          homeTeam: {
            team: teams[m.homeIdx].id,
            touchdowns: m.homeScore,
            casualties: m.homeCas,
          },
          awayTeam: {
            team: teams[m.awayIdx].id,
            touchdowns: m.awayScore,
            casualties: m.awayCas,
          },
        },
      })
      matchupIds.push(matchup.id)
      console.log(`  ✅ ${matchup.title}`)
    }
    leagueMatchdays.push({ name: md.name, matchups: matchupIds })
  }

  // --- 3. Create League ---
  console.log('\nCreating league...')
  const league = await payload.create({
    collection: 'leagues',
    data: {
      name: 'Blood Bowl Liga Saison 1',
      matchdays: leagueMatchdays,
    },
  })
  console.log(`  ✅ Liga: ${league.name} (ID: ${league.id})`)

  // --- 4. Create Tournament ---
  // Standing: 1st Reikland, 2nd Orcland, 3rd Skaven, 4th Darkside, 5th Grudgebearers
  console.log('\nCreating tournament...')

  const tournament = await payload.create({
    collection: 'tournaments',
    data: {
      name: 'Super Bowl Saison 1',
      league: league.id,
      rounds: [
        {
          name: 'Wildcard',
          date: pastDate(-7), // 1 week in the future
          games: [
            {
              homeSource: { type: 'team', team: teams[3].id }, // 4th: Darkside Cowboys
              awaySource: { type: 'team', team: teams[4].id }, // 5th: Grudgebearers
            },
          ],
        },
        {
          name: 'Halbfinale',
          date: pastDate(-14), // 2 weeks in the future
          games: [
            {
              homeSource: { type: 'previousRoundWinner', gameIndex: 0 }, // Wildcard Winner
              awaySource: { type: 'team', team: teams[2].id }, // 3rd: Skaven
            },
            {
              homeSource: { type: 'team', team: teams[0].id }, // 1st: Reikland
              awaySource: { type: 'team', team: teams[1].id }, // 2nd: Orcland
            },
          ],
        },
        {
          name: 'Super Bowl Finale',
          date: pastDate(-14),
          games: [
            {
              homeSource: { type: 'previousRoundWinner', gameIndex: 0 }, // HF1 Winner
              awaySource: { type: 'previousRoundWinner', gameIndex: 1 }, // HF2 Winner
            },
          ],
        },
      ],
    },
  })
  console.log(`  ✅ Turnier: ${tournament.name} (ID: ${tournament.id})`)

  // Verify: check which matchups were auto-created
  const savedTournament = await payload.findByID({
    collection: 'tournaments',
    id: tournament.id,
    depth: 2,
  })

  console.log('\n📋 Turnier-Status:')
  for (const round of savedTournament.rounds ?? []) {
    console.log(`\n  Runde: ${round.name}`)
    for (const game of round.games ?? []) {
      if (game.matchup && typeof game.matchup === 'object') {
        console.log(`    ✅ Matchup: ${game.matchup.title}`)
      } else {
        console.log(`    ⏳ Matchup: TBD (wird nach vorheriger Runde erstellt)`)
      }
    }
  }

  console.log('\n🏈 Seeding complete!\n')
  console.log('Standings (expected):')
  console.log('  1. Reikland Reavers     – 12 Pts (4W 0L)')
  console.log('  2. Orcland Raiders      – 9 Pts  (3W 1L)')
  console.log('  3. Skavenblight Scramblers – 6 Pts (2W 2L)')
  console.log('  4. Darkside Cowboys     – 3 Pts  (1W 3L)')
  console.log('  5. Grudgebearers        – 0 Pts  (0W 4L)')
  console.log('\nTournament bracket:')
  console.log('  Wildcard: Darkside Cowboys vs Grudgebearers')
  console.log('  HF 1: WC Winner vs Skavenblight Scramblers')
  console.log('  HF 2: Reikland Reavers vs Orcland Raiders')
  console.log('  Finale: HF1 Winner vs HF2 Winner')

  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
