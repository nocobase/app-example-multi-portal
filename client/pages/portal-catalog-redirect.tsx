import type { ReactElement } from 'react';
import { Navigate } from 'react-router';
/** The shared portal uses /portals; management lives in System settings. */
export default function PortalCatalogRedirect(): ReactElement {
  return <Navigate to='/settings/portals' replace />;
}
