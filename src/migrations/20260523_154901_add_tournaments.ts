import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`tournaments_rounds_games\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`matchup_id\` integer,
  	\`home_source_type\` text DEFAULT 'team' NOT NULL,
  	\`home_source_team_id\` integer,
  	\`home_source_game_index\` numeric,
  	\`away_source_type\` text DEFAULT 'team' NOT NULL,
  	\`away_source_team_id\` integer,
  	\`away_source_game_index\` numeric,
  	FOREIGN KEY (\`matchup_id\`) REFERENCES \`matchups\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`home_source_team_id\`) REFERENCES \`teams\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`away_source_team_id\`) REFERENCES \`teams\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tournaments_rounds\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tournaments_rounds_games_order_idx\` ON \`tournaments_rounds_games\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tournaments_rounds_games_parent_id_idx\` ON \`tournaments_rounds_games\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`tournaments_rounds_games_matchup_idx\` ON \`tournaments_rounds_games\` (\`matchup_id\`);`)
  await db.run(sql`CREATE INDEX \`tournaments_rounds_games_home_source_home_source_team_idx\` ON \`tournaments_rounds_games\` (\`home_source_team_id\`);`)
  await db.run(sql`CREATE INDEX \`tournaments_rounds_games_away_source_away_source_team_idx\` ON \`tournaments_rounds_games\` (\`away_source_team_id\`);`)
  await db.run(sql`CREATE TABLE \`tournaments_rounds\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`date\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tournaments\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tournaments_rounds_order_idx\` ON \`tournaments_rounds\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tournaments_rounds_parent_id_idx\` ON \`tournaments_rounds\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`tournaments\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`league_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`league_id\`) REFERENCES \`leagues\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`tournaments_league_idx\` ON \`tournaments\` (\`league_id\`);`)
  await db.run(sql`CREATE INDEX \`tournaments_updated_at_idx\` ON \`tournaments\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`tournaments_created_at_idx\` ON \`tournaments\` (\`created_at\`);`)
  await db.run(sql`ALTER TABLE \`matchups\` ADD \`overtime\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`tournaments_id\` integer REFERENCES tournaments(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_tournaments_id_idx\` ON \`payload_locked_documents_rels\` (\`tournaments_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`tournaments_rounds_games\`;`)
  await db.run(sql`DROP TABLE \`tournaments_rounds\`;`)
  await db.run(sql`DROP TABLE \`tournaments\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	\`teams_id\` integer,
  	\`matchups_id\` integer,
  	\`leagues_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`teams_id\`) REFERENCES \`teams\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`matchups_id\`) REFERENCES \`matchups\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`leagues_id\`) REFERENCES \`leagues\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id", "teams_id", "matchups_id", "leagues_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id", "teams_id", "matchups_id", "leagues_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_teams_id_idx\` ON \`payload_locked_documents_rels\` (\`teams_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_matchups_id_idx\` ON \`payload_locked_documents_rels\` (\`matchups_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_leagues_id_idx\` ON \`payload_locked_documents_rels\` (\`leagues_id\`);`)
  await db.run(sql`ALTER TABLE \`matchups\` DROP COLUMN \`overtime\`;`)
}
