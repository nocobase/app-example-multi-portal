import {
  ServiceProvider,
  createServiceToken,
} from '@nocobase/service-provider';
import type { Application } from '@nocobase/app-server/application';
import { authorizationToken } from '@nocobase/app-plugin-authorization';
import { databaseManagerToken } from '@nocobase/db';
import {
  LifecycleRuntime,
  createRepositoryLifecycleStore,
} from '@nocobase/lifecycle';
import { ticketLifecycle } from './lifecycle.js';
export const serviceLifecycleToken = createServiceToken<LifecycleRuntime>(
  'servicehub/lifecycle',
);
export default class ServiceHubProvider extends ServiceProvider<Application> {
  readonly name = 'app/servicehub';
  override register(): void {
    this.app.container.singleton(serviceLifecycleToken, () => {
      const runtime = new LifecycleRuntime({
        store: createRepositoryLifecycleStore(
          this.app.container.resolve(databaseManagerToken),
        ),
      });
      runtime.register(ticketLifecycle, { services: {} });
      return runtime;
    });
  }
  override async boot(): Promise<void> {
    const title = (key: string) => ({
      key: 'servicehub.' + key,
      ns: '@nocobase/app-template-multi-portal',
    });
    const authz = this.app.container.resolve(authorizationToken);
    authz.ui.sections.add({
      name: 'servicehub',
      title: title('equipmentService'),
      parent: 'administration',
    });
    const labels: Record<string, string> = {
      read: 'accessPortal',
      create: 'submitRequest',
      assign: 'assignEngineer',
      accept: 'acceptTask',
      complete: 'submitResolution',
      confirm: 'confirmAndRate',
    };
    for (const [name, titleKey, actions] of [
      ['customer', 'customerPortal', ['read', 'create', 'confirm']],
      ['dispatch', 'dispatchConsole', ['read', 'assign']],
      ['engineer', 'engineerWorkspace', ['read', 'accept', 'complete']],
      ['insights', 'serviceInsights', ['read']],
    ] as const) {
      authz.settings.add({
        id: 'servicehub.' + name,
        title: title(titleKey),
        actions: actions.map((name) => ({
          name,
          title: title(labels[name] ?? name),
        })),
      });
      authz.ui.place(
        { type: 'settings', id: 'servicehub.' + name },
        { section: 'servicehub' },
      );
    }
  }
}
