import type { DatabaseConnection } from '@nocobase/db';
export async function resetServiceData(
  query: DatabaseConnection['query'],
): Promise<void> {
  const now = new Date();
  const users = [
    ['customer-1', '陈小满', 'customer', '星河咖啡 · 滨江店'],
    ['customer-2', '周晴', 'customer', '山野咖啡 · 西湖店'],
    ['customer-3', '许乐', 'customer', '白昼咖啡 · 城西店'],
    ['dispatcher', '沈悦', 'dispatch', ''],
    ['engineer-1', '林晨', 'engineer', ''],
    ['engineer-2', '顾川', 'engineer', ''],
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
        name: i % 2 === 0 ? 'Linea 商用咖啡机' : 'EK43 咖啡磨豆机',
        customerId: customer[0],
        customerName: customer[3],
        serial: 'SH-2026-00' + (i + 1),
        address: [
          '滨江区江南大道 128 号',
          '西湖区文三路 66 号',
          '余杭区文一西路 88 号',
        ][Math.floor(i / 2)],
      })
      .execute();
  }
  const titles = [
    '咖啡机无法加热',
    '磨豆机出现异响',
    '蒸汽压力不稳定',
    '设备年度保养',
    '出水温度偏低',
    '磨盘精度校准',
    '咖啡机漏水',
    '日常清洁与检查',
    '显示屏间歇闪烁',
    '开机后无法出水',
    '更换密封圈',
    '完成季度维护',
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
        deviceName: d % 2 === 1 ? 'Linea 商用咖啡机' : 'EK43 咖啡磨豆机',
        address: [
          '滨江区江南大道 128 号',
          '西湖区文三路 66 号',
          '余杭区文一西路 88 号',
        ][Math.floor((d - 1) / 2)],
        description:
          '营业期间发现设备异常，希望尽快安排检查。门店工作时间 08:00–20:00。',
        status,
        engineerId: status === 'pending' ? null : 'engineer-' + ((i % 2) + 1),
        engineerName:
          status === 'pending' ? null : i % 2 === 0 ? '林晨' : '顾川',
        priority: i === 0 ? 'urgent' : 'normal',
        resolution: ['resolved', 'closed'].includes(status)
          ? '已检查设备并更换磨损部件，试运行正常。'
          : null,
        rating: status === 'closed' ? 5 : null,
        createdAt: created,
        statusChangedAt: created,
        lifecycleVersion: 0,
      })
      .execute();
  }
}
