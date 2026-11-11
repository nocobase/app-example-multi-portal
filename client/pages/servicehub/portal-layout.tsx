import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router';
import { useTranslation } from '@nocobase/i18n/client';
import { ArrowUpRight, ChevronDown, Wrench } from 'lucide-react';
import { portalTitles, portalPages } from './navigation.js';
import { Button } from '#components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '#components/ui/dropdown-menu';
import { HeaderActions } from '../../layouts/components/header-actions.js';
import CustomerLayout from '../../../packages/app-portal-customer/client/layout.js';
import DispatchLayout from '../../../packages/app-portal-dispatch/client/layout.js';
import EngineerLayout from '../../../packages/app-portal-engineer/client/layout.js';
import InsightsLayout from '../../../packages/app-portal-insights/client/layout.js';
import type { PortalId } from '../../../shared/servicehub.js';

const layouts = {
  customer: CustomerLayout,
  dispatch: DispatchLayout,
  engineer: EngineerLayout,
  insights: InsightsLayout,
};

/** Portal packages own their layout; the host supplies authenticated navigation and account controls. */
export function ServicePortalLayout({
  portalId,
  allowed,
  children,
}: {
  portalId: PortalId;
  allowed: PortalId[];
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const Layout = layouts[portalId];
  const base = '/portals/' + portalId;
  const switcher = (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant='outline'
            className='sh-switcher'
            aria-label={t('servicehub.switchPortal')}
          />
        }
      >
        <span>
          <small>{t('servicehub.switchPortal')}</small>
          {t('servicehub.' + portalTitles[portalId])}
        </span>
        <ChevronDown size={16} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='min-w-64'>
        {allowed.map((id) => (
          <DropdownMenuItem
            key={id}
            render={<Link to={'/portals/' + id} />}
            aria-current={id === portalId ? 'page' : undefined}
          >
            {t('servicehub.' + portalTitles[id])}
            {id === portalId && (
              <span className='sr-only'>{t('servicehub.currentPortal')}</span>
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link to='/' />}>
          {t('servicehub.allWorkspaces')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
  const navigation = (
    <nav aria-label={t('servicehub.portalNavigation')}>
      {portalPages[portalId].map(({ path, title, icon: Icon }) => (
        <Link
          key={path}
          to={base + path}
          aria-current={pathname === base + path ? 'page' : undefined}
        >
          <Icon size={18} />
          <span>{t('servicehub.' + title)}</span>
        </Link>
      ))}
    </nav>
  );
  return (
    <Layout
      brand={
        <Link to='/'>
          <span className='sh-brand-mark'>
            <Wrench size={18} />
          </span>
          <span>
            ServiceHub<small>{t('servicehub.' + portalTitles[portalId])}</small>
          </span>
        </Link>
      }
      switcher={switcher}
      navigation={navigation}
      account={<HeaderActions />}
      footer={
        <Link to='/'>
          {t('servicehub.allWorkspaces')} <ArrowUpRight size={14} />
        </Link>
      }
    >
      {children}
    </Layout>
  );
}
