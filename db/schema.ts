import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
export const preferences = sqliteTable('preferences', { userId: text('user_id').primaryKey(), data: text('data').notNull() });
export const doses = sqliteTable('doses', { userId: text('user_id').notNull(), date: text('date').notNull(), slot: text('slot').notNull(), taken: integer('taken').notNull(), dose: text('dose') }, t => [primaryKey({columns:[t.userId,t.date,t.slot]})]);
