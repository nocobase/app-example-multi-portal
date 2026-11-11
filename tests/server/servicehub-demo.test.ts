import { expect } from 'vitest';
import { createAppTest } from '@nocobase/app-testing/server';
import { createStandaloneServer } from '../../server/standalone.js';
import englishSeed from '../../database/main/seeds/202611110002_servicehub_english_demo.js';
import { resetServiceData } from '../../server/servicehub/reset.js';

const test = createAppTest({
  createServer: createStandaloneServer,
  connections: ['main'],
  config: {
    app: { sampleData: true, publicOrigin: 'http://localhost' },
    auth: { secret: 'test-servicehub-secret-at-least-32-characters' },
  },
});

test('fresh demo data and restoration use English without changing account access', async ({
  connection,
}) => {
  const q = connection.query;
  const users = await q.selectFrom('user').selectAll().execute();
  expect(users.find((u) => u.id === 'engineer-1')?.name).toBe('Taylor Chen');
  const roles = await q
    .selectFrom('authorizationPermissionSetAssignments')
    .selectAll()
    .execute();
  const before = await q.selectFrom('serviceTickets').selectAll().execute();
  expect(before).toHaveLength(12);
  expect(JSON.stringify(before)).not.toMatch(/[\u4e00-\u9fff]/u);
  await connection.transaction(async (tx) => {
    await resetServiceData(tx.query);
  });
  expect(await q.selectFrom('user').selectAll().execute()).toEqual(users);
  expect(
    await q
      .selectFrom('authorizationPermissionSetAssignments')
      .selectAll()
      .execute(),
  ).toEqual(roles);
  const restored = await q.selectFrom('serviceTickets').selectAll().execute();
  expect(restored).toHaveLength(12);
  expect(JSON.stringify(restored)).not.toMatch(/[\u4e00-\u9fff]/u);
});

test('English upgrade preserves customized text and ticket progress and is repeatable', async ({
  connection,
}) => {
  const q = connection.query;
  await q
    .updateTable('user')
    .set({ name: '林晨' })
    .where('id', '=', 'engineer-1')
    .execute();
  await q
    .updateTable('serviceTickets')
    .set({
      title: 'Custom repair request',
      status: 'working',
      lifecycleVersion: 7,
      engineerName: '林晨',
    })
    .where('id', '=', 'SH-1001')
    .execute();
  const before = await q
    .selectFrom('serviceTickets')
    .selectAll()
    .where('id', '=', 'SH-1001')
    .executeTakeFirstOrThrow();
  const context = { query: q } as Parameters<typeof englishSeed.run>[0];
  await englishSeed.run(context);
  await englishSeed.run(context);
  const after = await q
    .selectFrom('serviceTickets')
    .selectAll()
    .where('id', '=', 'SH-1001')
    .executeTakeFirstOrThrow();
  expect(after).toEqual({ ...before, engineerName: 'Taylor Chen' });
  expect(
    (
      await q
        .selectFrom('user')
        .selectAll()
        .where('id', '=', 'engineer-1')
        .executeTakeFirstOrThrow()
    ).name,
  ).toBe('Taylor Chen');
});
