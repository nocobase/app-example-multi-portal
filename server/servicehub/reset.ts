import type { DatabaseConnection } from '@nocobase/db';
export async function resetServiceData(
  query: DatabaseConnection['query'],
): Promise<void> {
  const now = new Date();
  const users = [
    ['customer-1', 'Alex Morgan', 'customer', 'Harbor Coffee · London'],
    ['customer-2', 'Sofia Rivera', 'customer', 'Juniper Coffee · Amsterdam'],
    ['customer-3', 'Jamie Park', 'customer', 'Daylight Coffee · Singapore'],
    ['dispatcher', 'Jordan Lee', 'dispatch', ''],
    ['engineer-1', 'Taylor Chen', 'engineer', ''],
    ['engineer-2', 'Sam Patel', 'engineer', ''],
  ];

  await query
    .deleteFrom('lifecycleEffectRuns')
    .where('lifecycle', '=', 'serviceTickets')
    .execute();
  await query
    .deleteFrom('lifecycleTransitions')
    .where('lifecycle', '=', 'serviceTickets')
    .execute();
  await query.deleteFrom('serviceTickets').allowAllRows().execute();
  await query.deleteFrom('serviceDevices').allowAllRows().execute();
  for (let i = 0; i < 6; i++) {
    const customer = users[Math.floor(i / 2)];
    await query
      .insertInto('serviceDevices')
      .values({
        id: 'device-' + (i + 1),
        name: i % 2 === 0 ? 'Linea espresso machine' : 'EK43 coffee grinder',
        customerId: customer[0],
        customerName: customer[3],
        serial: 'SH-2026-00' + (i + 1),
        address: [
          '12 Harbor Lane, London, United Kingdom',
          '24 Canal Walk, Amsterdam, Netherlands',
          '8 Orchard Square, Singapore',
        ][Math.floor(i / 2)],
      })
      .execute();
  }
  const titles = [
    'Espresso machine not heating',
    'Unusual noise from grinder',
    'Inconsistent steam pressure',
    'Annual equipment service',
    'Water temperature too low',
    'Grinder calibration',
    'Water leaking from espresso machine',
    'Routine cleaning and inspection',
    'Display flickering intermittently',
    'No water flow after startup',
    'Replace worn seals',
    'Quarterly maintenance',
  ];
  const states = [
    'pending',
    'assigned',
    'working',
    'resolved',
    'closed',
    'closed',
    'pending',
    'assigned',
    'working',
    'closed',
    'closed',
    'closed',
  ];
  for (let i = 0; i < 12; i++) {
    const d = (i % 6) + 1;
    const c = users[Math.floor((d - 1) / 2)];
    const status = states[i];
    const created = new Date(now.getTime() - (i + 1) * 3600000 * 6);
    await query
      .insertInto('serviceTickets')
      .values({
        id: 'SH-' + (1001 + i),
        title: titles[i],
        customerId: c[0],
        customerName: c[3],
        deviceId: 'device-' + d,
        deviceName:
          d % 2 === 1 ? 'Linea espresso machine' : 'EK43 coffee grinder',
        address: [
          '12 Harbor Lane, London, United Kingdom',
          '24 Canal Walk, Amsterdam, Netherlands',
          '8 Orchard Square, Singapore',
        ][Math.floor((d - 1) / 2)],
        description:
          'Equipment needs attention during service. Please arrange an inspection. Opening hours: 08:00–20:00 local time.',
        status,
        engineerId:
          status === 'pending'
            ? null
            : [1, 8].includes(i)
              ? 'service-manager'
              : 'engineer-' + ((i % 2) + 1),
        engineerName:
          status === 'pending'
            ? null
            : [1, 8].includes(i)
              ? 'Morgan Brooks'
              : i % 2 === 0
                ? 'Taylor Chen'
                : 'Sam Patel',
        priority: i === 0 ? 'urgent' : 'normal',
        resolution: ['resolved', 'closed'].includes(status)
          ? 'Inspected the equipment, replaced worn parts, and verified normal operation.'
          : null,
        rating: status === 'closed' ? 5 : null,
        createdAt: created,
        statusChangedAt: created,
        lifecycleVersion: 0,
      })
      .execute();
  }
}
