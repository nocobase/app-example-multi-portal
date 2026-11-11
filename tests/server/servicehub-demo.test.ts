import {
  signIn,
  DEFAULT_ADMIN_CREDENTIALS,
} from '@nocobase/app-plugin-authentication/testing';
import { randomUUID } from 'node:crypto';
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
  const managerTasks = restored.filter(
    (ticket) => ticket.engineerId === 'service-manager',
  );
  expect(managerTasks).toHaveLength(2);
  expect(
    managerTasks.every((ticket) => ticket.engineerName === 'Morgan Brooks'),
  ).toBe(true);
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

test('manager has explicit operational access without administrator or customer privileges', async ({
  connection,
}) => {
  const q = connection.query;
  const manager = await q
    .selectFrom('user')
    .selectAll()
    .where('id', '=', 'service-manager')
    .executeTakeFirstOrThrow();
  expect(manager.username).toBe('manager');
  const assignments = await q
    .selectFrom('authorizationPermissionSetAssignments')
    .selectAll()
    .where('subjectId', '=', 'service-manager')
    .execute();
  expect(assignments.map((a) => a.permissionSetKey)).toEqual([
    'servicehub-manager',
  ]);
  const role = await q
    .selectFrom('authorizationPermissionSets')
    .selectAll()
    .where('key', '=', 'servicehub-manager')
    .executeTakeFirstOrThrow();
  let grants = role.grants;
  while (typeof grants === 'string') grants = JSON.parse(grants);
  expect(grants).toEqual([
    {
      resource: { type: 'settings', id: 'servicehub.dispatch' },
      actions: [{ action: 'read' }, { action: 'assign' }],
    },
    {
      resource: { type: 'settings', id: 'servicehub.engineer' },
      actions: [
        { action: 'read' },
        { action: 'accept' },
        { action: 'complete' },
      ],
    },
    {
      resource: { type: 'settings', id: 'servicehub.insights' },
      actions: [{ action: 'read' }],
    },
  ]);
  const tasks = await q
    .selectFrom('serviceTickets')
    .selectAll()
    .where('engineerId', '=', 'service-manager')
    .execute();
  expect(tasks.map((t) => t.status).sort()).toEqual(['assigned', 'working']);
});

test('manager switches installed operational portals while API authorization remains enforced', async ({
  testApp,
}) => {
  const admin = await signIn(testApp, DEFAULT_ADMIN_CREDENTIALS);
  const catalog = await (await admin.fetch('/portalCenter/portals')).json();
  for (const portal of catalog.data) {
    if (!portal.installed && portal.id !== 'insights') {
      const response = await admin.fetch(
        '/portalCenter/portals/' + portal.id + '/installation',
        {
          method: 'PUT',
          headers: {
            'content-type': 'application/json',
            origin: 'http://localhost',
            'Idempotency-Key': `${Date.now()}.${randomUUID()}`,
          },
          body: JSON.stringify({ installed: true, revision: portal.revision }),
        },
      );
      expect(response.status).toBe(200);
    }
  }
  const manager = await signIn(testApp, {
    email: 'manager@servicehub.example',
    password: 'ServiceHub2026!',
  });
  const access = await (await manager.fetch('/serviceHub/access')).json();
  expect(access.data.administrator).toBe(false);
  expect(access.data.portals).toEqual(['dispatch', 'engineer']);
  expect((await manager.fetch('/serviceHub/dispatch')).status).toBe(200);
  const workspace = await (await manager.fetch('/serviceHub/engineer')).json();
  expect(workspace.data.tickets).toHaveLength(2);
  expect(
    workspace.data.tickets.every(
      (ticket: { engineerId: string }) =>
        ticket.engineerId === 'service-manager',
    ),
  ).toBe(true);
  expect((await manager.fetch('/serviceHub/customer')).status).toBe(403);
  expect((await manager.fetch('/portalCenter/portals')).status).toBe(403);
  expect((await manager.fetch('/serviceHub/insights')).status).toBe(409);
  expect(
    (
      await manager.fetch('/serviceHub/reset', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ confirm: 'RESET' }),
      })
    ).status,
  ).toBe(403);
});
