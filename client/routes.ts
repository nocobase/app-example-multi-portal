import databaseExplorerRoutes from './pages/settings/database-explorer/routes.js';
import { createAppClientConfig } from '@nocobase/app-client';
import { readAppClientRuntimeConfig } from '@nocobase/app-client/runtime';
import { includeNotificationTemplateRoutes } from './pages/settings/notification-routes.js';
import settingsRoutes from './pages/settings/routes.js';
import { Home, Blocks } from 'lucide-react';
import settingsShellRoutes from './pages/settings/shell-routes.js';
import {
  defineAppRoutes,
  type AppClientRouteContribution,
} from '@nocobase/app-client/plugins';

const appRoutes: AppClientRouteContribution = defineAppRoutes([
  {
    name: 'servicehubcustomer',
    path: '/portals/customer',
    auth: 'required',
    authz: {
      resource: { type: 'settings', id: 'servicehub.customer' },
      action: 'read',
    },
    componentLoader: () => import('./pages/servicehub/customer.js'),
  },
  {
    name: 'servicehubdispatch',
    path: '/portals/dispatch',
    auth: 'required',
    authz: {
      resource: { type: 'settings', id: 'servicehub.dispatch' },
      action: 'read',
    },
    componentLoader: () => import('./pages/servicehub/dispatch.js'),
  },
  {
    name: 'servicehubengineer',
    path: '/portals/engineer',
    auth: 'required',
    authz: {
      resource: { type: 'settings', id: 'servicehub.engineer' },
      action: 'read',
    },
    componentLoader: () => import('./pages/servicehub/engineer.js'),
  },
  {
    name: 'servicehubinsights',
    path: '/portals/insights',
    auth: 'required',
    authz: {
      resource: { type: 'settings', id: 'servicehub.insights' },
      action: 'read',
    },
    componentLoader: () => import('./pages/servicehub/insights.js'),
  },
  {
    name: 'servicehubcustomerdevices',
    path: '/portals/customer/devices',
    auth: 'required',
    authz: {
      resource: { type: 'settings', id: 'servicehub.customer' },
      action: 'read',
    },
    componentLoader: () => import('./pages/servicehub/customer.js'),
  },
  {
    name: 'servicehubcustomerrequests',
    path: '/portals/customer/requests',
    auth: 'required',
    authz: {
      resource: { type: 'settings', id: 'servicehub.customer' },
      action: 'read',
    },
    componentLoader: () => import('./pages/servicehub/customer.js'),
  },
  {
    name: 'servicehubdispatchteam',
    path: '/portals/dispatch/team',
    auth: 'required',
    authz: {
      resource: { type: 'settings', id: 'servicehub.dispatch' },
      action: 'read',
    },
    componentLoader: () => import('./pages/servicehub/dispatch.js'),
  },
  {
    name: 'servicehubdispatchoverview',
    path: '/portals/dispatch/overview',
    auth: 'required',
    authz: {
      resource: { type: 'settings', id: 'servicehub.dispatch' },
      action: 'read',
    },
    componentLoader: () => import('./pages/servicehub/dispatch.js'),
  },
  {
    name: 'servicehubengineerhistory',
    path: '/portals/engineer/history',
    auth: 'required',
    authz: {
      resource: { type: 'settings', id: 'servicehub.engineer' },
      action: 'read',
    },
    componentLoader: () => import('./pages/servicehub/engineer.js'),
  },
  {
    // Every signed-in user reaches the landing page. `authz: 'skip'` takes it out of page authorization entirely, so
    // no permission change can leave a user signed in with nowhere to land.
    authz: 'skip',
    auth: 'required',
    componentLoader: () => import('./pages/workbench.js'),
    name: 'home',
    navigation: { title: 'navigation.home', icon: Home },
    path: '/',
  },
  {
    name: 'portalCatalogRedirect',
    path: '/portals',
    auth: 'required',
    authz: 'unrestricted',
    breadcrumb: { title: 'multiPortal.catalog' },
    componentLoader: () => import('./pages/portal-catalog-redirect.js'),
  },
  {
    parent: 'settingsSystem',
    name: 'portalCatalog',
    path: '/portals',
    auth: 'required',
    authz: 'unrestricted',
    navigation: {
      title: 'multiPortal.catalog',
      description: 'multiPortal.description',
      icon: Blocks,
    },
    breadcrumb: { title: 'multiPortal.catalog' },
    componentLoader: () => import('./pages/portal-catalog.js'),
  },
  {
    // Declares no navigation, so the application decides where its entry goes (for example a sidebar item with an
    // unread badge). The plugin's API answers each person's own messages only, so the page needs no authorization of
    // its own.
    authz: 'skip',
    auth: 'required',
    componentLoader: () => import('./pages/inbox.js'),
    name: 'inbox',
    path: '/inbox',
  },
  {
    auth: 'guest',
    authz: 'skip',
    componentLoader: () => import('./pages/auth/login.js'),
    name: 'login',
    path: '/login',
  },
  {
    auth: 'guest',
    authz: 'skip',
    componentLoader: () => import('./pages/auth/register.js'),
    name: 'register',
    path: '/register',
  },
  {
    auth: 'guest',
    authz: 'skip',
    componentLoader: () => import('./pages/auth/forgot-password.js'),
    name: 'forgot-password',
    path: '/forgot-password',
  },
  {
    auth: 'guest',
    authz: 'skip',
    componentLoader: () => import('./pages/auth/reset-password.js'),
    name: 'reset-password',
    path: '/reset-password',
  },
  {
    // Where a command line's sign-in sends the person to approve it (`pages/auth/device.tsx`). Optional rather than
    // required so it renders outside the shell, like the sign-in pages; the page sends a guest to sign in and back.
    auth: 'optional',
    authz: 'skip',
    componentLoader: () => import('./pages/auth/device.js'),
    name: 'device',
    path: '/device',
  },
]);

// The System settings shell stays registered: it shows only the modules a viewer may open, and none until the
// application or its plugins contribute one. Business administration such as `./pages/settings/routes.js` joins it.
export function createApplicationRoutes(
  rawConfig: unknown = readAppClientRuntimeConfig(),
): readonly AppClientRouteContribution[] {
  const config = createAppClientConfig({ rawConfig });
  return includeNotificationTemplateRoutes(
    [appRoutes, settingsShellRoutes, settingsRoutes, databaseExplorerRoutes],
    config.get<boolean>('notificationTemplates.invitationConfigured') === true,
  );
}

const routes: readonly AppClientRouteContribution[] = createApplicationRoutes();

export default routes;
