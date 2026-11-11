import type { ReactElement, ReactNode } from 'react';
import { useTranslation } from '@nocobase/i18n/client';
import {
  PortalLayout,
  ChartNoAxesCombined,
  type PortalNavigationItem,
} from '@nocobase/app-plugin-multi-portal/client/workspace';
import portal from '../portal.js';
export default function Layout({
  children,
}: {
  readonly children: ReactNode;
}): ReactElement {
  const { t } = useTranslation('@nocobase/app-plugin-multi-portal');
  const navigation: readonly PortalNavigationItem[] = [
    {
      path: portal.entry,
      title: t('overview'),
      icon: ChartNoAxesCombined,
      end: true,
    },
  ];
  return (
    <PortalLayout portal={portal} navigation={navigation}>
      {children}
    </PortalLayout>
  );
}
