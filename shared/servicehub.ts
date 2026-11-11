export const portalIds = [
  'customer',
  'dispatch',
  'engineer',
  'insights',
] as const;
export type PortalId = (typeof portalIds)[number];
export const statusLabels: Record<string, string> = {
  pending: 'servicehub.unassigned',
  assigned: 'servicehub.assigned',
  working: 'servicehub.inProgressAlt',
  resolved: 'servicehub.awaitingReview',
  closed: 'servicehub.completedAlt',
};
export interface ServiceTicket {
  id: string;
  title: string;
  customerId: string;
  customerName: string;
  deviceId: string;
  deviceName: string;
  address: string;
  description: string;
  status: string;
  engineerId: string | null;
  engineerName: string | null;
  priority: string;
  resolution: string | null;
  rating: number | null;
  createdAt: string;
  statusChangedAt: string;
  lifecycleVersion: number;
}
export interface ServiceDevice {
  id: string;
  name: string;
  customerId: string;
  customerName: string;
  serial: string;
  address: string;
}
