import { ServiceProvider } from '@nocobase/service-provider';
import type { AppPluginApplication } from '@nocobase/app-server/plugins';
import { portalCenterServiceToken } from '@nocobase/app-plugin-multi-portal/server';
import portal from '../../portal.js';
export class PortalProvider extends ServiceProvider<AppPluginApplication> {
  public readonly name: string = '@nocobase/app-portal-insights';
  public override register(): void {
    this.app.container
      .resolve(portalCenterServiceToken)
      .register({
        ...portal,
        packageName: '@nocobase/app-portal-insights',
        defaultInstalled: false,
      });
  }
}
