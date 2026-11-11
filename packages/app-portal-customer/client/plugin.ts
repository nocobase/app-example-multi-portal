import {
  defineClientPlugin,
  type AppClientPluginFactory,
} from '@nocobase/app-client/plugins';
import locales from './locales/index.js';
import routes from './routes.js';
const plugin: AppClientPluginFactory = defineClientPlugin({
  packageName: '@nocobase/app-portal-customer',
  locales,
  routes,
});
export default plugin;
