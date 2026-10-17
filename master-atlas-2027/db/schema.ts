import { sqliteTable, text, integer, primaryKey, index } from 'drizzle-orm/sqlite-core';
export const states = sqliteTable('atlas_states', {
  owner: text('owner').primaryKey(),
  body: text('body').notNull(),
  revision: integer('revision').notNull().default(0)
});
export const history = sqliteTable('atlas_history', {
  owner: text('owner').notNull(),
  revision: integer('revision').notNull(),
  body: text('body').notNull(),
  createdAt: text('created_at').notNull()
}, table => [primaryKey({columns:[table.owner, table.revision]})]);

export const accounts = sqliteTable('atlas_accounts', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  createdAt: text('created_at').notNull(),
  lastLoginAt: text('last_login_at')
});

export const passkeys = sqliteTable('atlas_passkeys', {
  credentialId: text('credential_id').primaryKey(),
  owner: text('owner').notNull().references(() => accounts.id, {onDelete:'cascade'}),
  publicKey: text('public_key').notNull(),
  counter: integer('counter').notNull().default(0),
  transports: text('transports').notNull().default('[]'),
  deviceType: text('device_type').notNull(),
  backedUp: integer('backed_up').notNull().default(0),
  createdAt: text('created_at').notNull()
}, table => [index('atlas_passkeys_owner_idx').on(table.owner)]);

export const authChallenges = sqliteTable('atlas_auth_challenges', {
  id: text('id').primaryKey(),
  challenge: text('challenge').notNull(),
  purpose: text('purpose').notNull(),
  owner: text('owner'),
  username: text('username'),
  expiresAt: integer('expires_at').notNull(),
  consumedAt: integer('consumed_at')
});

export const sessions = sqliteTable('atlas_sessions', {
  tokenHash: text('token_hash').primaryKey(),
  owner: text('owner').notNull().references(() => accounts.id, {onDelete:'cascade'}),
  persistent: integer('persistent').notNull().default(0),
  createdAt: integer('created_at').notNull(),
  expiresAt: integer('expires_at').notNull()
}, table => [index('atlas_sessions_owner_idx').on(table.owner)]);

export const authRateLimits = sqliteTable('atlas_auth_rate_limits', {
  key: text('key').primaryKey(),
  windowStart: integer('window_start').notNull(),
  attempts: integer('attempts').notNull().default(0)
});
