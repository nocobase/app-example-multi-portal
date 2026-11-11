import { defineSeed, type SeedDefinition } from '@nocobase/db';
import { seedPortalInstallation } from '@nocobase/app-plugin-multi-portal/server';
const seed: SeedDefinition = defineSeed({
  name: 'portal_dispatch_installation',
  async run(context) {
    await seedPortalInstallation(context, 'dispatch', true);
  },
});
export default seed;
