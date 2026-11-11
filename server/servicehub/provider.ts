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
    const authz = this.app.container.resolve(authorizationToken);
    authz.ui.sections.add({
      name: 'servicehub',
      title: '设备服务',
      parent: 'administration',
    });
    const labels: Record<string, string> = {
      read: '访问门户',
      create: '提交报修',
      assign: '分配工程师',
      accept: '接单',
      complete: '提交处理结果',
      confirm: '确认并评价',
    };
    for (const [name, title, actions] of [
      ['customer', '客户服务台', ['read', 'create', 'confirm']],
      ['dispatch', '运营调度台', ['read', 'assign']],
      ['engineer', '工程师工作台', ['read', 'accept', 'complete']],
      ['insights', '服务洞察', ['read']],
    ] as const) {
      authz.settings.add({
        id: 'servicehub.' + name,
        title,
        actions: actions.map((name) => ({ name, title: labels[name] ?? name })),
      });
      authz.ui.place(
        { type: 'settings', id: 'servicehub.' + name },
        { section: 'servicehub' },
      );
    }
  }
}
