import path from 'node:path';
import {
  defineServerPlugin,
  type AppServerPlugin,
} from '@nocobase/app-server/plugins';
import serviceProviders from './providers/index.js';
const plugin: AppServerPlugin = defineServerPlugin({
  packageName: '@nocobase/app-portal-engineer',
  baseDir: path.resolve(import.meta.dirname, '..'),
  serviceProviders,
  database: { connections: { main: {} } },
});
export default plugin;
