import type { ReactElement } from 'react';
import { Link, useLocation } from 'react-router';
import { NamespaceScope, useTranslation } from '@nocobase/i18n/client';
import packageMetadata from '../../package.json' with { type: 'json' };
import { type PortalLayoutProps } from '@nocobase/app-plugin-multi-portal/client/workspace';
import { useSidebar } from '#components/ui/sidebar';
import {
  AppSidebar,
  AppSidebarProvider,
  AppSidebarToggle,
} from './components/app-sidebar.js';
import { LayoutHeader } from './components/layout-header.js';
import { HeaderActions } from './components/header-actions.js';
import { AppSidebarFooter } from './components/sidebar-footer.js';
import { PortalSwitcher } from '@nocobase/app-plugin-multi-portal/client/switcher';

export function PortalShell(props: PortalLayoutProps): ReactElement {
  return (
    <NamespaceScope ns={packageMetadata.name}>
      <AppSidebarProvider>
        <PortalShellContent {...props} />
      </AppSidebarProvider>
    </NamespaceScope>
  );
}

function PortalShellContent({
  portal,
  navigation,
  children,
}: PortalLayoutProps): ReactElement {
  const { t: translatePortal } = useTranslation(portal.namespace);
  const { pathname } = useLocation();
  const { isMobile, state, setOpenMobile } = useSidebar();
  const collapsed = !isMobile && state === 'collapsed';
  const portalTitle = translatePortal('title');
  const selected = navigation.find((item) =>
    item.end
      ? pathname === item.path || pathname === `${item.path}/create`
      : pathname === item.path || pathname.startsWith(`${item.path}/`),
  );
  const closeMobile = () => setOpenMobile(false);
  const linkClass =
    'flex min-w-0 items-center gap-3 rounded-lg px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-sidebar-ring';
  return (
    <>
      <AppSidebar
        label={portalTitle}
        brand={
          <PortalSwitcher
            portal={portal}
            collapsed={collapsed}
            onNavigate={closeMobile}
          />
        }
        footer={<AppSidebarFooter />}
      >
        <nav aria-label={portalTitle} className='space-y-1 p-2'>
          {navigation.map(({ path, title, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              aria-label={title}
              title={collapsed ? title : undefined}
              onClick={closeMobile}
              className={`${linkClass} ${collapsed ? 'justify-center px-0' : ''} ${selected?.path === path ? 'bg-sidebar-primary font-medium text-sidebar-primary-foreground' : 'hover:bg-sidebar-accent'}`}
              aria-current={selected?.path === path ? 'page' : undefined}
            >
              <Icon className='size-4 shrink-0' />
              {!collapsed ? <span className='truncate'>{title}</span> : null}
            </Link>
          ))}
        </nav>
      </AppSidebar>
      <div className='flex min-w-0 flex-1 flex-col text-foreground'>
        <LayoutHeader className='sticky top-0 z-40 justify-between'>
          <div className='flex min-w-0 items-center gap-3'>
            <AppSidebarToggle />
            <div className='h-5 w-px shrink-0 bg-border' />
            <span className='truncate text-sm font-medium'>
              {selected?.title ?? portalTitle}
            </span>
          </div>
          <HeaderActions />
        </LayoutHeader>
        <main className='relative isolate min-w-0 flex-1 overflow-y-auto bg-background'>
          <NamespaceScope ns={portal.namespace}>{children}</NamespaceScope>
        </main>
      </div>
    </>
  );
}
