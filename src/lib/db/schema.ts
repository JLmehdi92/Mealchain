import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const household = sqliteTable('household', {
  id: integer('id').primaryKey(),
  data: text('data').notNull(),
});

export const recipes = sqliteTable('recipes', {
  id: text('id').primaryKey(),
  data: text('data').notNull(),
  createdAt: integer('created_at').notNull(),
});

export const plans = sqliteTable('plans', {
  weekStart: text('week_start').primaryKey(),
  data: text('data').notNull(),
});

export const shoppingChecks = sqliteTable(
  'shopping_checks',
  {
    weekStart: text('week_start').notNull(),
    itemId: text('item_id').notNull(),
    checked: integer('checked', { mode: 'boolean' }).notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (t) => [primaryKey({ columns: [t.weekStart, t.itemId] })],
);

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});
