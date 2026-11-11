# Multi-portal composition

The template baseline is OSS Default at `2d18eb2c48955f4a8fc453e5e7d37aac8b7ea73c`. Preserve the commercial composition when reconciling later Default changes. The template's own package/version is the upgrade baseline after create-app scaffolds it.

`client/plugins.ts` and `server/plugins.ts` register the management plugin after authentication and authorization. `pnpm create @nocobase/portal <name>` writes and registers a minimal local portal. Keep portal dependencies in workspace form inside the source workspace. The generator leaves portals uninstalled; administrators explicitly install them.

`client/pages/workbench.tsx` shows the plugin workbench only to unrestricted administrators, retaining the standard homepage for other users. The catalog is a System settings contribution at `/settings/portals`; `/portals` redirects there for shared portal links. Management APIs independently enforce administrator access.

`client/layouts/app-layout.tsx` supplies `PortalLayoutHost` for `/portals/<id>` pages and delegates other pages to `SystemLayout`. `PortalShell` composes the same sidebar, account menu and header as the standard shell, with a portal switcher in its brand slot. The portal supplies navigation and content. Retain route authorization, leave guards, responsive sidebar state and namespace boundaries. The plugin coordinates cross-tab installation invalidation. Tailwind scans the plugin and local `packages/` sources.

Portals declare named host connections through `database.connections`. The host owns configuration, authentication, permissions, and the shared submission receipt migration. Uninstallation retains portal data and migration history. Do not seed roles onto every authenticated user or remove historical migration files.
