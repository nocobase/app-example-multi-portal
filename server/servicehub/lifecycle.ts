import { defineLifecycle, type LifecycleRecord } from '@nocobase/lifecycle';
interface Ticket extends LifecycleRecord {
  customerId: string;
  engineerId: string | null;
  engineerName: string | null;
  resolution: string | null;
  rating: number | null;
}
interface TicketTypes {
  record: Ticket;
  state: 'pending' | 'assigned' | 'working' | 'resolved' | 'closed';
  parameters: Record<string, never>;
  services: Record<string, never>;
}
export const ticketLifecycle = defineLifecycle<TicketTypes>({
  name: 'serviceTickets',
  initial: 'pending',
  states: [
    'pending',
    'assigned',
    'working',
    'resolved',
    { name: 'closed', final: true },
  ],
  transitions: {
    assign: {
      from: 'pending',
      to: 'assigned',
      accept: ['engineerId', 'engineerName'],
    },
    accept: {
      from: 'assigned',
      to: 'working',
      guard: ({ record, actor }) =>
        record.engineerId === actor.id || actor.system === true,
    },
    complete: {
      from: 'working',
      to: 'resolved',
      accept: ['resolution'],
      validate: (input) =>
        typeof input.resolution === 'string' &&
        input.resolution.trim().length > 0
          ? []
          : [{ field: 'resolution', message: 'Describe the completed work.' }],
      guard: ({ record, actor }) =>
        record.engineerId === actor.id || actor.system === true,
    },
    confirm: {
      from: 'resolved',
      to: 'closed',
      accept: ['rating'],
      guard: ({ record, actor }) =>
        record.customerId === actor.id || actor.system === true,
    },
  },
});
