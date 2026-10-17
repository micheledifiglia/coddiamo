import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
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
