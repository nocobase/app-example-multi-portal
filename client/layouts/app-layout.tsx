import { RouteLeaveBoundary } from '../routing/route-leave-boundary.js';
import { useRouteNavigation } from '../routing/route-navigation.js';
import { usePortalSync } from '@nocobase/app-plugin-multi-portal/client/data';
import { useSyncServerLocale } from '@nocobase/app-plugin-i18n/client';
import { PageBreadcrumbProvider } from '@nocobase/app-client';
import type { AppClientRegisteredRoute } from '@nocobase/app-client/plugins';
import { useMemo, type ReactElement } from 'react';
import { Outlet, useLocation } from 'react-router';
import { PortalLayoutHost } from '@nocobase/app-plugin-multi-portal/client/workspace';
import { PortalShell } from './portal-shell.js';
import { RouteTreeProvider } from '../routing/route-context.js';
import { SystemLayout } from './system-layout.js';
export interface AppLayoutProps {
  readonly routes: readonly AppClientRegisteredRoute[];
}
export function AppLayout({ routes }: AppLayoutProps): ReactElement {
  useSyncServerLocale();
  usePortalSync();
  const { pathname } = useLocation();
  return pathname.startsWith('/portals/') ? (
    <PortalAppLayout routes={routes} />
  ) : (
    <SystemLayout routes={routes} />
  );
}

function PortalAppLayout({ routes }: AppLayoutProps): ReactElement {
  const { denied, loading } = useRouteNavigation(routes);
  const access = useMemo(() => ({ denied, loading }), [denied, loading]);
  return (
    <RouteTreeProvider routes={routes} access={access}>
      <PageBreadcrumbProvider>
        <PortalLayoutHost value={renderPortalLayout}>
          <RouteLeaveBoundary hidden={loading}>
            <Outlet />
          </RouteLeaveBoundary>
        </PortalLayoutHost>
      </PageBreadcrumbProvider>
    </RouteTreeProvider>
  );
}

function renderPortalLayout(
  props: import('@nocobase/app-plugin-multi-portal/client/workspace').PortalLayoutProps,
): ReactElement {
  return <PortalShell {...props} />;
}
