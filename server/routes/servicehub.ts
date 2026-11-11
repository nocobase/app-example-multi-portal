import { resetServiceData } from '../servicehub/reset.js';
import { LifecycleError } from '@nocobase/lifecycle';
import type { Application } from '@nocobase/app-server/application';
import { randomUUID } from 'node:crypto';
import { Hono } from 'hono';
import { z } from 'zod';
import {
  authenticationToken,
  type AuthEnv,
} from '@nocobase/app-plugin-authentication';
import {
  authorizationToken,
  type AuthorizationEnv,
} from '@nocobase/app-plugin-authorization';
import { databaseManagerToken } from '@nocobase/db';
import { portalCenterServiceToken } from '@nocobase/app-plugin-multi-portal/server';
import {
  defineApiRoutes,
  describeRoute,
  apiValidator,
  dataResponse,
  apiErrorResponses,
  ApiError,
  executeIdempotentMutation,
  apiErrorHandler,
} from '@nocobase/app-server/router';
import { serviceLifecycleToken } from '../servicehub/provider.js';
import { portalIds } from '../../shared/servicehub.js';
const Portal = z.enum(portalIds);
const Result = z.object({}).passthrough();
const denied = () =>
  new ApiError({
    status: 'PERMISSION_DENIED',
    reason: 'SERVICE_ACCESS_DENIED',
    domain: 'servicehub',
    message: 'This service operation is not allowed.',
  });
export default defineApiRoutes<Application>((app) => {
  const router = new Hono<AuthEnv & AuthorizationEnv>();
  router.onError((error, c) =>
    apiErrorHandler(
      error instanceof LifecycleError
        ? new ApiError({
            status:
              error.code === 'CONFLICT' ? 'ABORTED' : 'FAILED_PRECONDITION',
            reason: error.code,
            domain: 'servicehub',
            message: error.message,
          })
        : error,
      c,
    ),
  );
  const auth = app.container.resolve(authenticationToken);
  const authz = app.container.resolve(authorizationToken);
  const db = app.container.resolve(databaseManagerToken);
  const portals = app.container.resolve(portalCenterServiceToken);
  router.use('/serviceHub/*', auth.required(), authz.middleware());
  router.use('/serviceHub/:portal/*', async (c, next) => {
    const portal = c.req.param('portal');
    if (!portalIds.some((id) => id === portal)) {
      await next();
      return;
    }
    await c.get('authz').require({
      resource: { type: 'settings', id: 'servicehub.' + portal },
      action: 'read',
    });
    await portals.requireInstalled(portal);
    await next();
  });
  const metadata = (id: string, summary: string) =>
    describeRoute({
      tags: ['ServiceHub'],
      summary,
      operationId: id,
      description:
        'Requires an authenticated user and the matching ServiceHub business permission. Record access is restricted to the customer or assigned engineer.',
      responses: { 200: dataResponse(Result), ...apiErrorResponses },
    });
  router.get(
    '/serviceHub/access',
    metadata('serviceHubGetAccess', 'Get accessible service portals'),
    async (c) => {
      const allowed = [];
      const installed = new Set(
        (await portals.list()).filter((p) => p.installed).map((p) => p.id),
      );
      for (const id of portalIds)
        if (
          installed.has(id) &&
          (await c.get('authz').can({
            resource: { type: 'settings', id: 'servicehub.' + id },
            action: 'read',
          }))
        )
          allowed.push(id);
      return c.json({
        data: {
          portals: allowed,
          user: c.get('auth')?.user,
          administrator: (await c.get('authz').snapshot()).unrestricted,
        },
      });
    },
  );
  router.post(
    '/serviceHub/reset',
    async (c, next) => {
      if (
        app.config.get('app.sampleData') !== true ||
        !(await c.get('authz').snapshot()).unrestricted
      )
        throw denied();
      await next();
    },
    metadata('serviceHubResetDemo', 'Restore synthetic service records'),
    apiValidator('json', z.object({ confirm: z.literal('RESET') })),
    async (c) => {
      await db.connection().transaction(async (tx) => {
        await resetServiceData(tx.query);
      });
      return c.json({ data: { restored: true } });
    },
  );
  router.get(
    '/serviceHub/:portal',
    metadata('serviceHubGetWorkspace', 'Get service workspace'),
    apiValidator('param', z.object({ portal: Portal })),
    async (c) => {
      const { portal } = c.req.valid('param');
      await c.get('authz').require({
        resource: { type: 'settings', id: 'servicehub.' + portal },
        action: 'read',
      });
      await portals.requireInstalled(portal);
      const userId = String(c.get('auth')!.user.id);
      const q = db.connection().query;
      let tickets = q.selectFrom('serviceTickets').selectAll();
      let devices = q.selectFrom('serviceDevices').selectAll();
      if (portal === 'customer') {
        tickets = tickets.where('customerId', '=', userId);
        devices = devices.where('customerId', '=', userId);
      }
      if (portal === 'engineer')
        tickets = tickets.where('engineerId', '=', userId);
      const rows = await tickets
        .orderBy('createdAt', 'desc')
        .limit(100)
        .execute();
      const engineers =
        portal === 'dispatch'
          ? await q
              .selectFrom('user')
              .select(['id', 'name'])
              .where('id', 'in', [
                'engineer-1',
                'engineer-2',
                'service-manager',
              ])
              .execute()
          : [];
      return c.json({
        data: {
          tickets: rows,
          devices: portal === 'customer' ? await devices.execute() : [],
          engineers,
        },
      });
    },
  );
  router.post(
    '/serviceHub/customer/tickets',
    metadata('serviceHubReportFault', 'Report a device fault'),
    apiValidator(
      'json',
      z.object({
        deviceId: z.string(),
        title: z.string().trim().min(2).max(120),
        description: z.string().trim().min(5).max(3000),
        priority: z.enum(['normal', 'urgent']),
      }),
    ),
    async (c) => {
      await c.get('authz').require({
        resource: { type: 'settings', id: 'servicehub.customer' },
        action: 'create',
      });
      await portals.requireInstalled('customer');
      const body = c.req.valid('json');
      const userId = String(c.get('auth')!.user.id);
      const device = await db
        .connection()
        .query.selectFrom('serviceDevices')
        .selectAll()
        .where('id', '=', body.deviceId)
        .where('customerId', '=', userId)
        .executeTakeFirst();
      if (!device) throw denied();
      const result = await executeIdempotentMutation({
        connection: db.connection(),
        key: c.req.header('Idempotency-Key') ?? '',
        principal: userId,
        operation: 'serviceHub.report',
        input: body,
        authorize: async () => {
          await c.get('authz').require({
            resource: { type: 'settings', id: 'servicehub.customer' },
            action: 'create',
          });
          await portals.requireInstalled('customer');
        },
        authorizeReplay: async () => {},
        execute: async (transaction) => {
          const row = await app.container.resolve(serviceLifecycleToken).create(
            'serviceTickets',
            {
              id: 'SH-' + randomUUID().slice(0, 8).toUpperCase(),
              ...body,
              customerId: userId,
              customerName: device.customerName,
              deviceName: device.name,
              address: device.address,
              createdAt: new Date(),
              engineerId: null,
              engineerName: null,
              resolution: null,
              rating: null,
            },
            { actor: { id: userId }, transaction },
          );
          return row;
        },
      });
      return c.json({ data: result.data });
    },
  );
  router.post(
    '/serviceHub/:portal/tickets/:id/fire',
    metadata('serviceHubAdvanceTicket', 'Advance a service ticket'),
    apiValidator('param', z.object({ portal: Portal, id: z.string() })),
    apiValidator(
      'json',
      z.object({
        transition: z.enum(['assign', 'accept', 'complete', 'confirm']),
        requestId: z.string().min(1),
        version: z.number().int().nonnegative(),
        engineerId: z.string().optional(),
        resolution: z.string().trim().max(3000).optional(),
        rating: z.number().int().min(1).max(5).optional(),
      }),
    ),
    async (c) => {
      const { portal, id } = c.req.valid('param');
      const body = c.req.valid('json');
      const expected = {
        assign: 'dispatch',
        accept: 'engineer',
        complete: 'engineer',
        confirm: 'customer',
      }[body.transition];
      if (portal !== expected) throw denied();
      await c.get('authz').require({
        resource: { type: 'settings', id: 'servicehub.' + portal },
        action: body.transition,
      });
      await portals.requireInstalled(portal);
      const userId = String(c.get('auth')!.user.id);
      const q = db.connection().query;
      let ticketQuery = q
        .selectFrom('serviceTickets')
        .selectAll()
        .where('id', '=', id);
      if (portal === 'customer')
        ticketQuery = ticketQuery.where('customerId', '=', userId);
      if (portal === 'engineer')
        ticketQuery = ticketQuery.where('engineerId', '=', userId);
      if (!(await ticketQuery.executeTakeFirst())) throw denied();
      let input: Record<string, string | number | null> = {};
      if (body.transition === 'assign') {
        const engineer = await q
          .selectFrom('user')
          .select(['id', 'name'])
          .where('id', '=', body.engineerId ?? '')
          .where('id', 'in', ['engineer-1', 'engineer-2', 'service-manager'])
          .executeTakeFirst();
        if (!engineer)
          throw new ApiError({
            status: 'INVALID_ARGUMENT',
            reason: 'INVALID_ENGINEER',
            domain: 'servicehub',
            message: 'Choose a demo engineer.',
          });
        input = {
          engineerId: String(engineer.id),
          engineerName: String(engineer.name),
        };
      }
      if (body.transition === 'complete')
        input = { resolution: body.resolution ?? '' };
      if (body.transition === 'confirm') input = { rating: body.rating ?? 5 };
      const runtime = app.container.resolve(serviceLifecycleToken);
      await runtime.fire('serviceTickets', id, body.transition, {
        actor: { id: userId },
        manual: true,
        input,
        requestId: body.requestId,
        expect: { version: body.version },
      });
      return c.json({
        data: await q
          .selectFrom('serviceTickets')
          .selectAll()
          .where('id', '=', id)
          .executeTakeFirst(),
      });
    },
  );
  return new Hono().route('/', router);
});
