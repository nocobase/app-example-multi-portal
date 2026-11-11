import { apiClientToken } from '@nocobase/app-client';
import {
  AuthenticationProvider,
  authenticationClientToken,
} from '@nocobase/app-plugin-authentication/client';
import {
  AuthorizationClient,
  authorizationClientToken,
} from '@nocobase/app-plugin-authorization/client';
import multiPortal from '@nocobase/app-plugin-multi-portal/client';
import { answerApi, renderWithApp } from '@nocobase/app-testing/client';
import { screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import Workbench from '../../client/pages/workbench.js';
import enUS from '../../client/locales/en-US.js';
import packageMetadata from '../../package.json' with { type: 'json' };

async function renderWorkbench(unrestricted: boolean) {
  const api = vi.fn(({ path }: { path: string }) => {
    if (path === 'authorization/permissions')
      return { data: { unrestricted, permissions: [] } };
    if (path === 'portalCenter/portals') return { data: [] };
    return new Response(null, { status: 404 });
  });
  const plugin = multiPortal();
  const messages = await plugin.locales!['en-US']!();
  await renderWithApp(
    <AuthenticationProvider>
      <Workbench />
    </AuthenticationProvider>,
    {
      namespace: packageMetadata.name,
      namespaces: {
        [packageMetadata.name]: enUS,
        '@nocobase/app-plugin-multi-portal':
          'default' in messages ? messages.default : messages,
      },
      fetch: answerApi(api),
      services: (app) => {
        app.container.instance(authenticationClientToken, {
          getSession: async () => ({
            data: {
              user: { id: 'test-user' },
              session: { id: 'test-session' },
            },
          }),
        });
        app.container.singleton(
          authorizationClientToken,
          (resolver) =>
            new AuthorizationClient(resolver.resolve(apiClientToken)),
        );
      },
    },
  );
  return api;
}

it('shows the empty portal workbench to administrators', async () => {
  const api = await renderWorkbench(true);
  expect(
    await screen.findByText('Install your first portal to get started.'),
  ).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /portal/i })).toHaveAttribute(
    'href',
    '/portals',
  );
  expect(api).toHaveBeenCalledWith({
    method: 'GET',
    path: 'portalCenter/portals',
  });
});

it('keeps the homepage available without requesting management data for ordinary users', async () => {
  const api = await renderWorkbench(false);
  await waitFor(() =>
    expect(api).toHaveBeenCalledWith({
      method: 'GET',
      path: 'authorization/permissions',
    }),
  );
  expect(
    screen.queryByText('Install your first portal to get started.'),
  ).not.toBeInTheDocument();
  expect(
    api.mock.calls.some(([call]) => call.path === 'portalCenter/portals'),
  ).toBe(false);
});
