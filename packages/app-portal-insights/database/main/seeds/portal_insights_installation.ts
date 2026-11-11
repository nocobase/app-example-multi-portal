import { defineSeed, type SeedDefinition } from '@nocobase/db';
import { seedPortalInstallation } from '@nocobase/app-plugin-multi-portal/server';
const seed: SeedDefinition = defineSeed({
  name: 'portal_insights_installation',
  async run(context) {
    await seedPortalInstallation(context, 'insights', false);
  },
});
export default seed;
