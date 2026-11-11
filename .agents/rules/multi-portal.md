# Multi-portal composition

The template baseline is OSS Default at `2d18eb2c48955f4a8fc453e5e7d37aac8b7ea73c`. Preserve the commercial composition when reconciling later Default changes. The template's own package/version is the upgrade baseline after create-app scaffolds it.

`client/plugins.ts` and `server/plugins.ts` register the management plugin after authentication and authorization. `pnpm create @nocobase/portal <name>` writes and registers a minimal local portal. Keep portal dependencies in workspace form inside the source workspace. The generator leaves portals uninstalled; administrators explicitly install them.

`client/pages/workbench.tsx` shows ServiceHub's permission-aware workbench to all signed-in users. Only unrestricted administrators see portal management and demo reset. The catalog remains a System settings contribution at `/settings/portals`; management APIs independently enforce administrator access.

`client/layouts/app-layout.tsx` retains the route leave boundary for business portal pages and delegates other pages to `SystemLayout`. Each local portal owns its actual layout in `packages/app-portal-*/client/layout.tsx`: customer top navigation, dispatch/insights sidebars, engineer bottom navigation. `client/pages/servicehub/portal-layout.tsx` supplies authenticated account controls and links. Application-owned routes retain explicit authorization; local portal plugin routes remain empty. Keep layouts independent when adding pages rather than wrapping all portals in one standard shell.

The business switcher uses `/serviceHub/access`, which intersects installed portals with the current user's business permissions. Do not replace it with an administrator-only catalog request: ordinary multi-role users must be able to switch. The manager demo role explicitly grants dispatch, engineer and insights capabilities, but no customer or administrative permission. Engineer data remains restricted to the signed-in user's assignments. Installation checks are enforced on the server as well as in navigation.

Portals declare named host connections through `database.connections`. The host owns configuration, authentication, permissions, and the shared submission receipt migration. Uninstallation retains portal data and migration history. Do not seed roles onto every authenticated user or remove historical migration files.
