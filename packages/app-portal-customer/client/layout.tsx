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
    <div className='sh-customer-layout'>
      <header className='sh-customer-header'>
        <div className='sh-brand'>{brand}</div>
        <div className='sh-layout-tools'>
          {switcher}
          {account}
        </div>
      </header>
      <div className='sh-customer-navigation'>{navigation}</div>
      <main className='sh-customer-content'>{children}</main>
      <footer className='sh-layout-footer'>{footer}</footer>
    </div>
  );
}
