import type { AppPluginProviderConstructor } from '@nocobase/app-server/plugins';
import { PortalProvider } from './portal.js';
const providers: readonly AppPluginProviderConstructor[] = [PortalProvider];
export default providers;
