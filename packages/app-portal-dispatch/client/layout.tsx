import type { ReactElement, ReactNode } from 'react';

export interface LayoutProps {
  readonly children: ReactNode;
  readonly brand: ReactNode;
  readonly switcher: ReactNode;
  readonly navigation: ReactNode;
  readonly account: ReactNode;
  readonly footer: ReactNode;
}

export default function Layout({
  children,
  brand,
  switcher,
  navigation,
  account,
  footer,
}: LayoutProps): ReactElement {
  return (
    <div className='sh-operations-layout sh-dispatch-layout'>
      <aside className='sh-operations-sidebar'>
        <div className='sh-brand'>{brand}</div>
        {switcher}
        {navigation}
        <div className='sh-sidebar-foot'>{footer}</div>
      </aside>
      <div className='sh-operations-content'>
        <header className='sh-operations-header'>
          <div className='sh-mobile-switcher'>{switcher}</div>
          <div className='sh-header-context'>{brand}</div>
          {account}
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
