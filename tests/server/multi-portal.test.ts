import { expect } from 'vitest';
import { createAppTest } from '@nocobase/app-testing/server';
import {
  signIn,
  DEFAULT_ADMIN_CREDENTIALS,
} from '@nocobase/app-plugin-authentication/testing';
import { createStandaloneServer } from '../../server/standalone.js';

const test = createAppTest({
  createServer: createStandaloneServer,
  config: {
    app: { publicOrigin: 'http://localhost' },
    auth: { secret: 'multi-portal-template-fixture-secret-32' },
  },
});

test('boots an empty portal catalog and protects management from anonymous callers', async ({
  testApp,
}) => {
  const guest = await testApp.request('/portalCenter/portals');
  expect(guest.status).toBe(401);
  const admin = await signIn(testApp, DEFAULT_ADMIN_CREDENTIALS);
  const response = await admin.fetch('/portalCenter/portals');
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({ data: [] });
});
