import { defineSeed } from '@nocobase/db';
import { hashPassword } from 'better-auth/crypto';
import { encodeAuthorizationTitle } from '@nocobase/authorization/core';

export default defineSeed({
  name: '202611110003_servicehub_manager',
  sample: true,
  transaction: true,
  async run({ query }) {
    const now = new Date();
    await query
      .insertInto('user')
      .values({
        id: 'service-manager',
        name: 'Morgan Brooks',
        username: 'manager',
        email: 'manager@servicehub.example',
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
      })
      .execute();
    await query
      .insertInto('account')
      .values({
        id: 'account-service-manager',
        accountId: 'service-manager',
        providerId: 'credential',
        userId: 'service-manager',
        password: await hashPassword('ServiceHub2026!'),
        createdAt: now,
        updatedAt: now,
      })
      .execute();
    await query
      .insertInto('authorizationPermissionSets')
      .values({
        id: 'servicehub-manager',
        key: 'servicehub-manager',
        title: encodeAuthorizationTitle('Service manager'),
        grants: JSON.stringify([
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
        ]),
        createdAt: now,
        updatedAt: now,
      })
      .execute();
    await query
      .insertInto('authorizationPermissionSetAssignments')
      .values({
        id: 'servicehub-manager-assignment',
        permissionSetKey: 'servicehub-manager',
        subjectType: 'user',
        subjectId: 'service-manager',
        createdAt: now,
        updatedAt: now,
      })
      .execute();
    // A manager also does field work. Move only the untouched sample assignments.
    for (const [id, engineer, status] of [
      ['SH-1002', 'engineer-2', 'assigned'],
      ['SH-1009', 'engineer-1', 'working'],
    ] as const) {
      await query
        .updateTable('serviceTickets')
        .set({ engineerId: 'service-manager', engineerName: 'Morgan Brooks' })
        .where('id', '=', id)
        .where('engineerId', '=', engineer)
        .where('status', '=', status)
        .where('lifecycleVersion', '=', 0)
        .execute();
    }
  },
});
