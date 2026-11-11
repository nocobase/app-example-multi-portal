import { defineSeed, type SeedDefinition } from '@nocobase/db';
import { seedPortalInstallation } from '@nocobase/app-plugin-multi-portal/server';
const seed: SeedDefinition = defineSeed({
  name: 'portal_customer_installation',
  async run(context) {
    await seedPortalInstallation(context, 'customer', true);
  },
});
export default seed;
