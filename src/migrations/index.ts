import * as migration_20260514_121022 from './20260514_121022';

export const migrations = [
  {
    up: migration_20260514_121022.up,
    down: migration_20260514_121022.down,
    name: '20260514_121022'
  },
];
