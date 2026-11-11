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
    <div className='sh-field-layout'>
      <header className='sh-field-header'>
        <div className='sh-brand'>{brand}</div>
        {account}
      </header>
      <div className='sh-field-switcher'>{switcher}</div>
      <main className='sh-field-content'>{children}</main>
      <footer className='sh-layout-footer'>{footer}</footer>
      <div className='sh-field-navigation'>{navigation}</div>
    </div>
  );
}
