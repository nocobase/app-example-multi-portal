import { defineMigration } from '@nocobase/db';
export default defineMigration({
  name: '202611110001_servicehub',
  async up({ builder }) {
    await builder.createCollection('serviceDevices', (t) => {
      t.string('id').primary().notNull();
      t.string('name').notNull();
      t.string('customerId').notNull();
      t.string('customerName').notNull();
      t.string('serial').notNull();
      t.string('address').notNull();
      t.index('customerId');
    });
    await builder.createCollection('serviceTickets', (t) => {
      t.string('id').primary().notNull();
      t.string('title').notNull();
      t.string('customerId').notNull();
      t.string('customerName').notNull();
      t.string('deviceId').notNull();
      t.string('deviceName').notNull();
      t.string('address').notNull();
      t.text('description').notNull();
      t.string('status').notNull();
      t.string('engineerId');
      t.string('engineerName');
      t.string('priority').notNull();
      t.text('resolution');
      t.integer('rating');
      t.datetimeTz('createdAt').notNull();
      t.datetimeTz('statusChangedAt').notNull();
      t.integer('lifecycleVersion').notNull().defaultTo(0);
      t.index('customerId');
      t.index('engineerId');
      t.index(['status', 'statusChangedAt']);
    });
    await builder.createCollection('lifecycleTransitions', (table) => {
      table.bigInt('id').primary().autoIncrement().notNull();
      table.string('lifecycle').notNull();
      table.string('recordId').notNull();
      table.string('transition').notNull();
      // Null on the entry runtime.create() writes.
      table.string('from');
      table.string('to').notNull();
      table.string('actorId').notNull();
      table.json('input').notNull().defaultTo({});
      table.datetimeTz('at').notNull();
      table.integer('version').notNull();
      table.string('requestId');
      // The request id, or `$v:<version>` without one: never null, so one
      // unique index means the same on every dialect.
      table.string('requestKey').notNull();
      table.unique(['lifecycle', 'recordId', 'version']);
      table.unique(['lifecycle', 'recordId', 'requestKey']);
    });
    await builder.createCollection('lifecycleEffectRuns', (table) => {
      table.bigInt('id').primary().autoIncrement().notNull();
      table.bigInt('transitionId').notNull();
      table.string('lifecycle').notNull();
      table.string('recordId').notNull();
      table.string('effect').notNull();
      table.boolean('stayBound').notNull();
      table.string('status').notNull();
      table.integer('attempts').notNull().defaultTo(0);
      table.integer('maxAttempts').notNull().defaultTo(1);
      table.json('result');
      table.text('error');
      table.datetimeTz('createdAt').notNull();
      table.datetimeTz('updatedAt').notNull();
      table.datetimeTz('claimedAt');
      table.datetimeTz('runAfter');
      // A continuation waiting to be tried again, and when it is due: null
      // exactly when nothing is pending, so the sweep finds the due ones.
      table.json('continuation');
      table.datetimeTz('continuationDueAt');
      // When the sweep gave up on it: null unless it did.
      table.datetimeTz('continuationAbandonedAt');
    });
  },
  async down({ builder }) {
    for (const name of [
      'lifecycleEffectRuns',
      'lifecycleTransitions',
      'serviceTickets',
      'serviceDevices',
    ])
      await builder.dropCollection(name);
  },
});
