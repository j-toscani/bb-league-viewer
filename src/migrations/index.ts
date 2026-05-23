import * as migration_20260514_121022 from './20260514_121022';
import * as migration_20260523_154901_add_tournaments from './20260523_154901_add_tournaments';
import * as migration_20260523_155050 from './20260523_155050';

export const migrations = [
  {
    up: migration_20260514_121022.up,
    down: migration_20260514_121022.down,
    name: '20260514_121022',
  },
  {
    up: migration_20260523_154901_add_tournaments.up,
    down: migration_20260523_154901_add_tournaments.down,
    name: '20260523_154901_add_tournaments',
  },
  {
    up: migration_20260523_155050.up,
    down: migration_20260523_155050.down,
    name: '20260523_155050'
  },
];
