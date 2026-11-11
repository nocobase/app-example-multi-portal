import { defineSeed } from '@nocobase/db';
import { encodeAuthorizationTitle } from '@nocobase/authorization/core';

// Update only unchanged, known sample values. Never reset tickets, passwords, roles, or assignments.
export default defineSeed({
  name: '202611110002_servicehub_english_demo',
  sample: true,
  transaction: true,
  async run({ query }) {
    const translations = [
      ['陈小满', 'Alex Morgan'],
      ['周晴', 'Sofia Rivera'],
      ['许乐', 'Jamie Park'],
      ['沈悦', 'Jordan Lee'],
      ['林晨', 'Taylor Chen'],
      ['顾川', 'Sam Patel'],
      ['星河咖啡 · 滨江店', 'Harbor Coffee · London'],
      ['山野咖啡 · 西湖店', 'Juniper Coffee · Amsterdam'],
      ['白昼咖啡 · 城西店', 'Daylight Coffee · Singapore'],
      ['Linea 商用咖啡机', 'Linea espresso machine'],
      ['EK43 咖啡磨豆机', 'EK43 coffee grinder'],
      ['滨江区江南大道 128 号', '12 Harbor Lane, London, United Kingdom'],
      ['西湖区文三路 66 号', '24 Canal Walk, Amsterdam, Netherlands'],
      ['余杭区文一西路 88 号', '8 Orchard Square, Singapore'],
      ['咖啡机无法加热', 'Espresso machine not heating'],
      ['磨豆机出现异响', 'Unusual noise from grinder'],
      ['蒸汽压力不稳定', 'Inconsistent steam pressure'],
      ['设备年度保养', 'Annual equipment service'],
      ['出水温度偏低', 'Water temperature too low'],
      ['磨盘精度校准', 'Grinder calibration'],
      ['咖啡机漏水', 'Water leaking from espresso machine'],
      ['日常清洁与检查', 'Routine cleaning and inspection'],
      ['显示屏间歇闪烁', 'Display flickering intermittently'],
      ['开机后无法出水', 'No water flow after startup'],
      ['更换密封圈', 'Replace worn seals'],
      ['完成季度维护', 'Quarterly maintenance'],
      [
        '营业期间发现设备异常，希望尽快安排检查。门店工作时间 08:00–20:00。',
        'Equipment needs attention during service. Please arrange an inspection. Opening hours: 08:00–20:00 local time.',
      ],
      [
        '已检查设备并更换磨损部件，试运行正常。',
        'Inspected the equipment, replaced worn parts, and verified normal operation.',
      ],
    ] as const;
    for (const [before, after] of translations) {
      await query
        .updateTable('user')
        .set({ name: after })
        .where('id', 'in', [
          'customer-1',
          'customer-2',
          'customer-3',
          'dispatcher',
          'engineer-1',
          'engineer-2',
        ])
        .where('name', '=', before)
        .execute();
    }
    for (const [before, after] of translations) {
      await query
        .updateTable('serviceDevices')
        .set({ name: after })
        .where('id', 'in', [
          'device-1',
          'device-2',
          'device-3',
          'device-4',
          'device-5',
          'device-6',
        ])
        .where('name', '=', before)
        .execute();
      await query
        .updateTable('serviceDevices')
        .set({ customerName: after })
        .where('id', 'in', [
          'device-1',
          'device-2',
          'device-3',
          'device-4',
          'device-5',
          'device-6',
        ])
        .where('customerName', '=', before)
        .execute();
      await query
        .updateTable('serviceDevices')
        .set({ address: after })
        .where('id', 'in', [
          'device-1',
          'device-2',
          'device-3',
          'device-4',
          'device-5',
          'device-6',
        ])
        .where('address', '=', before)
        .execute();
    }
    for (const [before, after] of translations) {
      await query
        .updateTable('serviceTickets')
        .set({ title: after })
        .where('id', 'in', [
          'SH-1001',
          'SH-1002',
          'SH-1003',
          'SH-1004',
          'SH-1005',
          'SH-1006',
          'SH-1007',
          'SH-1008',
          'SH-1009',
          'SH-1010',
          'SH-1011',
          'SH-1012',
        ])
        .where('title', '=', before)
        .execute();
      await query
        .updateTable('serviceTickets')
        .set({ customerName: after })
        .where('id', 'in', [
          'SH-1001',
          'SH-1002',
          'SH-1003',
          'SH-1004',
          'SH-1005',
          'SH-1006',
          'SH-1007',
          'SH-1008',
          'SH-1009',
          'SH-1010',
          'SH-1011',
          'SH-1012',
        ])
        .where('customerName', '=', before)
        .execute();
      await query
        .updateTable('serviceTickets')
        .set({ deviceName: after })
        .where('id', 'in', [
          'SH-1001',
          'SH-1002',
          'SH-1003',
          'SH-1004',
          'SH-1005',
          'SH-1006',
          'SH-1007',
          'SH-1008',
          'SH-1009',
          'SH-1010',
          'SH-1011',
          'SH-1012',
        ])
        .where('deviceName', '=', before)
        .execute();
      await query
        .updateTable('serviceTickets')
        .set({ address: after })
        .where('id', 'in', [
          'SH-1001',
          'SH-1002',
          'SH-1003',
          'SH-1004',
          'SH-1005',
          'SH-1006',
          'SH-1007',
          'SH-1008',
          'SH-1009',
          'SH-1010',
          'SH-1011',
          'SH-1012',
        ])
        .where('address', '=', before)
        .execute();
      await query
        .updateTable('serviceTickets')
        .set({ description: after })
        .where('id', 'in', [
          'SH-1001',
          'SH-1002',
          'SH-1003',
          'SH-1004',
          'SH-1005',
          'SH-1006',
          'SH-1007',
          'SH-1008',
          'SH-1009',
          'SH-1010',
          'SH-1011',
          'SH-1012',
        ])
        .where('description', '=', before)
        .execute();
      await query
        .updateTable('serviceTickets')
        .set({ resolution: after })
        .where('id', 'in', [
          'SH-1001',
          'SH-1002',
          'SH-1003',
          'SH-1004',
          'SH-1005',
          'SH-1006',
          'SH-1007',
          'SH-1008',
          'SH-1009',
          'SH-1010',
          'SH-1011',
          'SH-1012',
        ])
        .where('resolution', '=', before)
        .execute();
      await query
        .updateTable('serviceTickets')
        .set({ engineerName: after })
        .where('id', 'in', [
          'SH-1001',
          'SH-1002',
          'SH-1003',
          'SH-1004',
          'SH-1005',
          'SH-1006',
          'SH-1007',
          'SH-1008',
          'SH-1009',
          'SH-1010',
          'SH-1011',
          'SH-1012',
        ])
        .where('engineerName', '=', before)
        .execute();
    }
    await query
      .updateTable('authorizationPermissionSets')
      .set({ title: encodeAuthorizationTitle('Customer') })
      .where('key', '=', 'servicehub-customer')
      .where('title', '=', encodeAuthorizationTitle('客户'))
      .execute();
    await query
      .updateTable('authorizationPermissionSets')
      .set({ title: encodeAuthorizationTitle('Dispatcher') })
      .where('key', '=', 'servicehub-dispatch')
      .where('title', '=', encodeAuthorizationTitle('调度员'))
      .execute();
    await query
      .updateTable('authorizationPermissionSets')
      .set({ title: encodeAuthorizationTitle('Engineer') })
      .where('key', '=', 'servicehub-engineer')
      .where('title', '=', encodeAuthorizationTitle('工程师'))
      .execute();
  },
});
