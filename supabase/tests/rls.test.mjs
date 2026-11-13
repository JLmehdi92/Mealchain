import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

import { PGlite } from '@electric-sql/pglite';

const SUPABASE_STUB = `
  create role anon nologin; create role authenticated nologin; create role service_role nologin;
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
const CAROL = '00000000-0000-0000-0000-00000000000c';
const CODE = /^[0-9A-HJKMNP-TV-Z]{12}$/;

async function setup() {
  const db = new PGlite();
  await db.exec(SUPABASE_STUB);
  const dir = new URL('../migrations/', import.meta.url);
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()) {
    await db.exec(readFileSync(new URL(file, dir), 'utf8'));
  }
  await db.exec(GRANTS);
  await db.exec(`insert into auth.users values ('${ALICE}'), ('${BOB}'), ('${CAROL}')`);
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
  assert.equal((await as(db, BOB, `select public.join_household('NOPE1234NOPE') as id`)).rows[0].id, null);
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

const join = async (db, user, code) => (await as(db, user, 'select public.join_household($1) as id', [code])).rows[0].id;
const invite = async (db, user, target = null) => (await as(db, user, 'select public.create_invite($1) as code', [target])).rows[0].code;
const home = async (db, user) => (await as(db, user, `select public.create_household('{}') as id`)).rows[0].id;

test('invite codes are 12 Crockford characters and work only once', async () => {
  const db = await setup();
  const aliceHome = await home(db, ALICE);
  const code = await invite(db, ALICE);
  assert.match(code, CODE);
  assert.equal(await join(db, BOB, code), aliceHome);
  assert.equal(await join(db, CAROL, code), null);
});

test('an invite expires after 48 hours and expired ones are purged', async () => {
  const db = await setup();
  await home(db, ALICE);
  const code = await invite(db, ALICE);
  const { hours } = (await db.query('select round(extract(epoch from expires_at - now()) / 3600) as hours from public.household_invites')).rows[0];
  assert.equal(Number(hours), 48);
  await db.query(`update public.household_invites set expires_at = now() - interval '1 second'`);
  assert.equal(await join(db, BOB, code), null);
  await invite(db, ALICE);
  assert.equal((await db.query('select * from public.household_invites where code = $1', [code])).rows.length, 0);
});

test('five failed join attempts in an hour lock the account out, even with a valid code', async () => {
  const db = await setup();
  await home(db, ALICE);
  const code = await invite(db, ALICE);
  for (let i = 0; i < 5; i += 1) assert.equal(await join(db, BOB, `WRONG${i}WRONG0`), null);
  await assert.rejects(join(db, BOB, code), /too many attempts/);
  await db.query(`update public.join_attempts set at = now() - interval '61 minutes'`);
  assert.ok(await join(db, BOB, code));
  assert.equal((await as(db, BOB, 'select * from public.join_attempts')).rows.length, 0);
});

test('create_invite uses the owned household passed in, else the oldest owned one', async () => {
  const db = await setup();
  const first = await home(db, ALICE);
  const second = await home(db, ALICE);
  const bobHome = await home(db, BOB);
  await db.query(`update public.households set created_at = now() - interval '1 day' where id = $1`, [first]);
  const codeFor = async (target) => {
    const code = await invite(db, ALICE, target);
    return (await db.query('select household_id from public.household_invites where code = $1', [code])).rows[0].household_id;
  };
  assert.equal(await codeFor(second), second);
  assert.equal(await codeFor(null), first);
  assert.equal(await codeFor(bobHome), first);
});

test('only the owner can revoke an invite', async () => {
  const db = await setup();
  await home(db, ALICE);
  const code = await invite(db, ALICE);
  await join(db, BOB, code);
  const other = await invite(db, ALICE);
  assert.equal((await as(db, BOB, 'delete from public.household_invites where code = $1', [other])).affectedRows, 0);
  assert.equal((await as(db, ALICE, 'delete from public.household_invites where code = $1', [other])).affectedRows, 1);
});

test('recipes and households of another household cannot be changed', async () => {
  const db = await setup();
  const aliceHome = await home(db, ALICE);
  const bobHome = await home(db, BOB);
  const id = (await as(db, ALICE, `insert into public.recipes (id, household_id, data) values (gen_random_uuid(), $1, '{"t":1}') returning id`, [aliceHome])).rows[0].id;
  assert.equal((await as(db, BOB, `update public.recipes set data = '{"t":2}' where id = $1`, [id])).affectedRows, 0);
  assert.equal((await as(db, BOB, 'delete from public.recipes where id = $1', [id])).affectedRows, 0);
  await assert.rejects(as(db, ALICE, 'update public.recipes set household_id = $1 where id = $2', [bobHome, id]));
  await assert.rejects(as(db, ALICE, 'update public.households set id = $1 where id = $2', [bobHome, aliceHome]));
  assert.equal((await as(db, BOB, `update public.households set profile = '{}' where id = $1`, [aliceHome])).affectedRows, 0);
});

test('a member can leave but cannot remove someone else', async () => {
  const db = await setup();
  await home(db, ALICE);
  await join(db, BOB, await invite(db, ALICE));
  await join(db, CAROL, await invite(db, ALICE));
  assert.equal((await as(db, BOB, 'delete from public.household_members where user_id = $1', [ALICE])).affectedRows, 0);
  assert.equal((await as(db, BOB, 'delete from public.household_members where user_id = $1', [CAROL])).affectedRows, 0);
  assert.equal((await as(db, BOB, 'delete from public.household_members where user_id = $1', [BOB])).affectedRows, 1);
});

test('anonymous callers cannot execute any function', async () => {
  const db = await setup();
  for (const call of [`public.create_household('{}')`, 'public.create_invite(null)', `public.join_household('A')`, 'public.bump_import_usage()', 'public.is_member(null)', 'public.is_owner(null)']) {
    await assert.rejects(as(db, null, `select ${call}`), /permission denied/);
  }
});

test('deleting an owner hands a shared household to its oldest remaining member and drops a solo one', async () => {
  const db = await setup();
  const shared = await home(db, ALICE);
  const solo = await home(db, ALICE);
  await join(db, CAROL, await invite(db, ALICE, shared));
  await join(db, BOB, await invite(db, ALICE, shared));
  await db.query(`update public.household_members set joined_at = now() - interval '1 day' where user_id = $1`, [BOB]);
  await db.query('select public.release_households($1)', [ALICE]);
  const owners = await db.query(`select household_id, user_id from public.household_members where role = 'owner'`);
  assert.deepEqual(owners.rows, [{ household_id: shared, user_id: BOB }]);
  assert.equal((await db.query('select * from public.households where id = $1', [solo])).rows.length, 0);
});

test('Apple tokens and household release are out of reach of app clients', async () => {
  const db = await setup();
  await db.query(`insert into public.apple_tokens (user_id, refresh_token) values ($1, 'secret')`, [ALICE]);
  assert.equal((await as(db, ALICE, 'select * from public.apple_tokens')).rows.length, 0);
  await assert.rejects(as(db, ALICE, `insert into public.apple_tokens (user_id, refresh_token) values ($1, 'x')`, [BOB]));
  await assert.rejects(as(db, ALICE, 'select public.release_households($1)', [BOB]), /permission denied/);
  await assert.rejects(as(db, null, 'select public.release_households($1)', [BOB]), /permission denied/);
});
