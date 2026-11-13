import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { PGlite } from '@electric-sql/pglite';

const SUPABASE_STUB = `
  create role anon nologin; create role authenticated nologin;
  create schema auth;
  create table auth.users (id uuid primary key);
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
  create publication supabase_realtime;
`;
const GRANTS = `
  grant usage on schema public to anon, authenticated;
  grant select, insert, update, delete on all tables in schema public to authenticated;
`;

const ALICE = '00000000-0000-0000-0000-00000000000a';
const BOB = '00000000-0000-0000-0000-00000000000b';

async function setup() {
  const db = new PGlite();
  await db.exec(SUPABASE_STUB);
  await db.exec(readFileSync(new URL('../migrations/20261113000000_init.sql', import.meta.url), 'utf8'));
  await db.exec(GRANTS);
  await db.exec(`insert into auth.users values ('${ALICE}'), ('${BOB}')`);
  return db;
}

async function as(db, user, sql, params = []) {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${user ?? ''}', false); set role ${user ? 'authenticated' : 'anon'};`);
  try {
    return await db.query(sql, params);
  } finally {
    await db.exec('reset role');
  }
}

test('a member sees only their own household data', async () => {
  const db = await setup();
  const aliceHome = (await as(db, ALICE, `select public.create_household('{"people":5}') as id`)).rows[0].id;
  await as(db, BOB, `select public.create_household('{"people":1}')`);
  await as(db, ALICE, `insert into public.recipes (id, household_id, data) values (gen_random_uuid(), $1, '{}')`, [aliceHome]);

  assert.equal((await as(db, BOB, 'select * from public.recipes')).rows.length, 0);
  assert.equal((await as(db, BOB, 'select * from public.households where id = $1', [aliceHome])).rows.length, 0);
  assert.equal((await as(db, ALICE, 'select * from public.recipes')).rows.length, 1);
});

test('a user cannot write into or join another household without an invite', async () => {
  const db = await setup();
  const aliceHome = (await as(db, ALICE, `select public.create_household('{}') as id`)).rows[0].id;

  await assert.rejects(as(db, BOB, `insert into public.recipes (id, household_id, data) values (gen_random_uuid(), $1, '{}')`, [aliceHome]));
  await assert.rejects(as(db, BOB, 'insert into public.household_members (household_id, user_id) values ($1, $2)', [aliceHome, BOB]));
  await assert.rejects(as(db, BOB, `select public.join_household('NOPE1234')`));
  const updated = await as(db, BOB, `update public.households set profile = '{"hacked":true}' where id = $1`, [aliceHome]);
  assert.equal(updated.affectedRows, 0);
});

test('an invite lets a second member share the shopping list', async () => {
  const db = await setup();
  const aliceHome = (await as(db, ALICE, `select public.create_household('{}') as id`)).rows[0].id;
  const code = (await as(db, ALICE, 'select public.create_invite() as code')).rows[0].code;
  await as(db, BOB, 'select public.join_household($1)', [code]);
  await as(db, ALICE, `insert into public.shopping_items (id, household_id, week_start, ingredient_id) values ('cream', $1, '2026-11-16', 'heavy_cream')`, [aliceHome]);

  await as(db, BOB, `update public.shopping_items set checked = true where id = 'cream'`);
  assert.equal((await as(db, ALICE, 'select checked from public.shopping_items')).rows[0].checked, true);
});

test('anonymous callers and import quotas are locked down', async () => {
  const db = await setup();
  await assert.rejects(as(db, null, `select public.create_household('{}')`));
  assert.equal((await as(db, ALICE, 'select public.bump_import_usage() as n')).rows[0].n, 1);
  assert.equal((await as(db, ALICE, 'select public.bump_import_usage() as n')).rows[0].n, 2);
  assert.equal((await as(db, BOB, 'select * from public.import_usage')).rows.length, 0);
});
