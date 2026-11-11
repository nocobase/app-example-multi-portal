import { useTranslation } from '@nocobase/i18n/client';
import { useCan } from '@nocobase/app-plugin-authorization/client';
import { ServicePortalLayout } from './portal-layout.js';
import { portalPages } from './navigation.js';
import {
  TeamPanel,
  ServiceOverview,
  CustomerWelcome,
} from './workspace-panels.js';
import { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient, createUuid } from '@nocobase/app-client';
import {
  Headset,
  LayoutDashboard,
  Wrench,
  ChartNoAxesCombined,
  ArrowUpRight,
  Plus,
  MoreVertical,
  Coffee,
  MapPin,
  CheckCircle2,
  Clock3,
  ArrowRight,
} from 'lucide-react';
import { Button } from '#components/ui/button';
import { Input } from '#components/ui/input';
import { Textarea } from '#components/ui/textarea';
import { Badge } from '#components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '#components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '#components/ui/dropdown-menu';
import {
  type PortalId,
  type ServiceTicket,
  type ServiceDevice,
  statusLabels,
} from '../../../shared/servicehub.js';
import './servicehub.css';

function getPortals(tr: (key: string) => string) {
  return {
    customer: {
      title: tr('servicehub.customerPortal'),
      description: tr('servicehub.keepYourEquipmentRunning'),
      icon: Headset,
      kicker: 'CUSTOMER CARE',
      color: 'blue',
    },
    dispatch: {
      title: tr('servicehub.dispatchConsole'),
      description: tr('servicehub.keepEveryServiceRequestMoving'),
      icon: LayoutDashboard,
      kicker: 'SERVICE OPERATIONS',
      color: 'violet',
    },
    engineer: {
      title: tr('servicehub.engineerWorkspace'),
      description: tr('servicehub.yourTasksYourNextMove'),
      icon: Wrench,
      kicker: 'FIELD SERVICE',
      color: 'teal',
    },
    insights: {
      title: tr('servicehub.serviceInsights'),
      description: tr('servicehub.seeHowYourServiceTeamIsPerforming'),
      icon: ChartNoAxesCombined,
      kicker: 'SERVICE INSIGHTS',
      color: 'amber',
    },
  };
}
type Workspace = {
  tickets: ServiceTicket[];
  devices: ServiceDevice[];
  engineers: { id: string; name: string }[];
};
function errorText(error: unknown, tr: (key: string) => string): string {
  const status = (error as { status?: number })?.status;
  return status === 403
    ? tr('servicehub.youDoNotHaveAccessSignIn')
    : tr('servicehub.unableToCompleteThisActionRefreshAnd');
}
function useAccess() {
  const api = useApiClient();
  return useQuery({
    queryKey: ['servicehub-access'],
    queryFn: () =>
      api.request<{
        data: {
          portals: PortalId[];
          administrator: boolean;
          user: { name: string; id: string };
        };
      }>({ path: 'serviceHub/access' }),
  });
}
export function ServiceWorkbench() {
  const { t: tr } = useTranslation();
  const portals = getPortals(tr);
  const access = useAccess();
  const api = useApiClient();
  const cache = useQueryClient();
  const [reset, setReset] = useState(false);
  const [busy, setBusy] = useState(false);
  const [resetError, setResetError] = useState('');
  async function restore() {
    setBusy(true);
    setResetError('');
    try {
      await api.request({
        path: 'serviceHub/reset',
        method: 'POST',
        json: { confirm: 'RESET' },
      });
      await cache.invalidateQueries({ queryKey: ['servicehub'] });
      setReset(false);
    } catch (e) {
      setResetError(errorText(e, tr));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className='sh-workbench'>
      <div className='sh-eyebrow'>
        {tr('servicehub.servicehubEquipmentServices')}{' '}
      </div>
      <h1>
        {tr('servicehub.oneServiceHub')} <br />
        {tr('servicehub.aWorkspaceForEveryRole')}{' '}
      </h1>
      <p className='sh-intro'>
        {tr('servicehub.fromTheFirstRequestToTheFinal')}{' '}
      </p>
      {access.isPending ? (
        <p role='status'>{tr('servicehub.loadingYourWorkspace')} </p>
      ) : access.isError ? (
        <p role='alert'>{errorText(access.error, tr)}</p>
      ) : (
        <div className='sh-portal-grid'>
          {access.data?.data.portals.map((id) => {
            const portal = portals[id];
            const Icon = portal.icon;
            return (
              <Link
                key={id}
                to={'/portals/' + id}
                className={'sh-portal-card sh-' + portal.color}
              >
                <div className='sh-portal-icon'>
                  <Icon size={25} />
                </div>
                <span className='sh-eyebrow'>{portal.kicker}</span>
                <h2>{portal.title}</h2>
                <p>{portal.description}</p>
                <span className='sh-enter'>
                  {tr('servicehub.openPortal')} <ArrowUpRight size={17} />
                </span>
              </Link>
            );
          })}
        </div>
      )}
      {access.data?.data.administrator && (
        <div className='sh-admin-links'>
          <Button variant='outline' render={<Link to='/settings/portals' />}>
            {tr('servicehub.portalManagement')}{' '}
          </Button>
          <Button variant='ghost' onClick={() => setReset(true)}>
            {tr('servicehub.restoreDemoData')}{' '}
          </Button>
        </div>
      )}
      <Dialog
        open={reset}
        onOpenChange={(v) => {
          if (!busy) setReset(v);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tr('servicehub.restoreDemoDataAlt')} </DialogTitle>
            <DialogDescription>
              {tr('servicehub.replaceDemoDevicesTicketsAndServiceHistory')}{' '}
            </DialogDescription>
          </DialogHeader>
          {resetError && <p role='alert'>{resetError}</p>}
          <DialogFooter>
            <Button
              variant='outline'
              disabled={busy}
              onClick={() => setReset(false)}
            >
              {tr('servicehub.cancel')}{' '}
            </Button>
            <Button
              variant='destructive'
              disabled={busy}
              onClick={() => void restore()}
            >
              {busy ? tr('servicehub.restoring') : tr('servicehub.restoreData')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className='sh-story'>
        <span className='sh-eyebrow'>
          {tr('servicehub.theServiceJourney')}{' '}
        </span>
        <div>
          <span>{tr('servicehub.reportAFault')} </span>
          <ArrowRight />
          <span>{tr('servicehub.assignAnEngineer')} </span>
          <ArrowRight />
          <span>{tr('servicehub.resolveTheIssue')} </span>
          <ArrowRight />
          <span>{tr('servicehub.confirmAndRate')} </span>
        </div>
        <p>{tr('servicehub.oneTicketEachRoleSeesWhatMatters')} </p>
      </div>
    </section>
  );
}
export default function ServicePortal({ portalId }: { portalId: PortalId }) {
  const { t: tr } = useTranslation();
  const portals = getPortals(tr);
  const api = useApiClient();
  const cache = useQueryClient();
  const access = useAccess();
  const portal = portals[portalId];
  const { pathname } = useLocation();
  const subpage = pathname.slice(('/portals/' + portalId).length);
  const pageTitle = portalPages[portalId].find(
    (page) => page.path === subpage,
  )?.title;
  const isTeam = subpage === '/team';
  const isOverview = subpage === '/overview' || portalId === 'insights';
  const isDevices = subpage === '/devices';
  const isHistory = subpage === '/history';
  const Icon = portal.icon;
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<ServiceTicket | null>(null);
  const [create, setCreate] = useState(false);
  const [reportDevice, setReportDevice] = useState('');
  const reportKeyRef = useRef('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [resolution, setResolution] = useState('');
  const [engineer, setEngineer] = useState('engineer-1');
  const [rating, setRating] = useState('5');
  const workspace = useQuery({
    queryKey: ['servicehub', portalId, access.data?.data.user.id],
    enabled: !!access.data,
    queryFn: () =>
      api.request<{ data: Workspace }>({ path: 'serviceHub/' + portalId }),
  });
  const data = workspace.data?.data;
  const tickets = data?.tickets ?? [];
  const visible = tickets.filter(
    (t) =>
      (portalId !== 'engineer' ||
        (isHistory ? t.status === 'closed' : t.status !== 'closed')) &&
      (filter === 'all' || t.status === filter) &&
      [t.title, t.id, t.customerName].some((v) =>
        v.toLowerCase().includes(search.toLowerCase()),
      ),
  );
  const open = tickets.filter((t) => t.status !== 'closed');
  const active = tickets.filter((t) => t.status === 'working');
  const closed = tickets.filter((t) => t.status === 'closed');
  async function reload() {
    await cache.invalidateQueries({ queryKey: ['servicehub'] });
  }
  async function fire(transition: string) {
    if (!selected || pending) return;
    setPending(true);
    setError('');
    try {
      await api.request({
        path: `serviceHub/${portalId}/tickets/${selected.id}/fire`,
        method: 'POST',
        json: {
          transition,
          requestId: createUuid(),
          version: selected.lifecycleVersion,
          engineerId: engineer,
          resolution,
          rating: Number(rating),
        },
      });
      setSelected(null);
      await reload();
    } catch (e) {
      setError(errorText(e, tr));
    } finally {
      setPending(false);
    }
  }
  async function report(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError('');
    try {
      await api.request({
        path: 'serviceHub/customer/tickets',
        method: 'POST',
        headers: {
          'Idempotency-Key':
            (reportKeyRef.current ||= `${Date.now()}.${createUuid()}`),
        },
        json: {
          deviceId: form.get('deviceId'),
          title: form.get('title'),
          description: form.get('description'),
          priority: form.get('priority'),
        },
      });
      reportKeyRef.current = '';
      setCreate(false);
      await reload();
    } catch (e) {
      setError(errorText(e, tr));
    } finally {
      setPending(false);
    }
  }
  const actionCandidate = selected
    ? portalId === 'dispatch' && selected.status === 'pending'
      ? 'assign'
      : portalId === 'engineer' && selected.status === 'assigned'
        ? 'accept'
        : portalId === 'engineer' && selected.status === 'working'
          ? 'complete'
          : portalId === 'customer' && selected.status === 'resolved'
            ? 'confirm'
            : null
    : null;
  const { can: actionAllowed } = useCan({
    resource: { type: 'settings', id: 'servicehub.' + portalId },
    action: actionCandidate ?? 'read',
  });
  const action = actionAllowed ? actionCandidate : null;
  const { can: canReport } = useCan({
    resource: { type: 'settings', id: 'servicehub.customer' },
    action: 'create',
  });
  const actionLabels: Record<string, string> = {
    assign: tr('servicehub.assignEngineer'),
    accept: tr('servicehub.acceptAndStart'),
    complete: tr('servicehub.submitResolution'),
    confirm: tr('servicehub.confirmAndRateAlt'),
  };
  function view(ticket: ServiceTicket) {
    setSelected(ticket);
    setError('');
    setResolution('');
  }
  return (
    <ServicePortalLayout
      portalId={portalId}
      allowed={access.data?.data.portals ?? []}
    >
      <section className={'sh-page sh-' + portal.color}>
        <header className='sh-heading'>
          <div>
            <div className='sh-eyebrow'>
              <Icon size={14} />
              {portal.kicker}
            </div>
            <h1>
              {subpage && pageTitle
                ? tr('servicehub.' + pageTitle)
                : portalId === 'engineer'
                  ? tr('servicehub.greeting', {
                      name:
                        access.data?.data.user.name ??
                        tr('servicehub.engineer'),
                    })
                  : portal.title}
            </h1>
            <p>{portal.description}</p>
          </div>
          {portalId === 'customer' && canReport && (
            <Button
              onClick={() => {
                setError('');
                setCreate(true);
              }}
            >
              <Plus />
              {tr('servicehub.reportAFaultAlt')}{' '}
            </Button>
          )}
        </header>
        {workspace.isPending ? (
          <p role='status'>{tr('servicehub.loadingServiceRecords')} </p>
        ) : workspace.isError ? (
          <div className='sh-empty' role='alert'>
            <h2>{tr('servicehub.thisPortalIsUnavailable')} </h2>
            <p>{tr('servicehub.checkThatYourAccountHasAccessAnd')} </p>
            <Button variant='outline' onClick={() => void workspace.refetch()}>
              {tr('servicehub.reload')}{' '}
            </Button>
          </div>
        ) : (
          <>
            {portalId === 'customer' && !subpage && <CustomerWelcome />}
            <div className='sh-stats'>
              {[
                [
                  portalId === 'customer'
                    ? tr('servicehub.myDevices')
                    : tr('servicehub.openTickets'),
                  portalId === 'customer' ? data?.devices.length : open.length,
                  tr('servicehub.liveServiceRecords'),
                ],
                [
                  tr('servicehub.inProgress'),
                  active.length,
                  tr('servicehub.yourTeamIsOnIt'),
                ],
                [
                  tr('servicehub.completed'),
                  closed.length,
                  tr('servicehub.everyRequestResolved'),
                ],
              ].map(([label, value, note]) => (
                <div className='sh-stat' key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                  <small>{note}</small>
                </div>
              ))}
            </div>
            {portalId === 'customer' && subpage !== '/requests' && (
              <section className='sh-devices'>
                <div className='sh-section-title'>
                  <h2>{tr('servicehub.myDevices')} </h2>
                  <span>{tr('servicehub.keepYourBusinessMoving')} </span>
                </div>
                <div>
                  {data?.devices.map((d) => (
                    <article key={d.id}>
                      <Coffee />
                      <div>
                        <h3>{d.name}</h3>
                        <p>{d.serial}</p>
                        {isDevices && (
                          <p className='sh-device-address'>{d.address}</p>
                        )}
                        {isDevices && (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => {
                              setReportDevice(d.id);
                              setCreate(true);
                            }}
                          >
                            {tr('servicehub.reportAFaultAlt')}
                          </Button>
                        )}
                      </div>
                      <Badge variant='secondary'>
                        {tr('servicehub.covered')}{' '}
                      </Badge>
                    </article>
                  ))}
                </div>
              </section>
            )}
            {isTeam && (
              <TeamPanel
                engineers={data?.engineers ?? []}
                tickets={tickets}
                onSelect={view}
              />
            )}
            {isOverview && <ServiceOverview tickets={tickets} />}
            {!isTeam && !isDevices && !isOverview && (
              <>
                <div className='sh-section-title'>
                  <h2>
                    {portalId === 'engineer'
                      ? tr(
                          isHistory
                            ? 'servicehub.completedWork'
                            : 'servicehub.myServiceTasks',
                        )
                      : tr('servicehub.serviceTickets')}
                  </h2>
                  <span>
                    {tr('servicehub.recordCount', { count: visible.length })}
                  </span>
                </div>
                <div className='sh-toolbar'>
                  <Input
                    aria-label={tr('servicehub.searchTickets')}
                    placeholder={tr(
                      'servicehub.searchTicketsIssuesOrLocations',
                    )}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <div className='sh-filters'>
                    {[
                      ['all', tr('servicehub.all')],
                      ['pending', tr('servicehub.unassigned')],
                      ['working', tr('servicehub.inProgressAlt')],
                      ['resolved', tr('servicehub.awaitingReview')],
                      ['closed', tr('servicehub.completedAlt')],
                    ]
                      .filter(
                        ([value]) =>
                          portalId !== 'engineer' ||
                          (value !== 'pending' &&
                            (isHistory ? value === 'all' : value !== 'closed')),
                      )
                      .map(([value, label]) => (
                        <Button
                          key={value}
                          size='sm'
                          variant={filter === value ? 'secondary' : 'ghost'}
                          onClick={() => setFilter(value)}
                        >
                          {label}
                        </Button>
                      ))}
                  </div>
                </div>
                {visible.length === 0 ? (
                  <div className='sh-empty'>
                    <CheckCircle2 />
                    <h3>{tr('servicehub.noTicketsHereYet')} </h3>
                    <p>
                      {search
                        ? tr('servicehub.tryADifferentSearch')
                        : tr('servicehub.chooseAnotherFilterToSeeMoreService')}
                    </p>
                  </div>
                ) : portalId === 'engineer' ? (
                  <div className='sh-tasks'>
                    {visible.map((t) => (
                      <article key={t.id} className='sh-task'>
                        <div className='sh-section-title'>
                          <span className='sh-code'>{t.id}</span>
                          <Status status={t.status} />
                        </div>
                        <h3>{t.title}</h3>
                        <p>{t.customerName}</p>
                        <p className='sh-address'>
                          <MapPin size={14} />
                          {t.address}
                        </p>
                        <div className='sh-task-bottom'>
                          <span>{t.deviceName}</span>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => view(t)}
                          >
                            {tr('servicehub.viewTask')} <ArrowRight size={14} />
                          </Button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className='sh-table-wrap'>
                    <table className='sh-table'>
                      <thead>
                        <tr>
                          <th>{tr('servicehub.ticket')} </th>
                          <th className='sh-desktop'>
                            {tr('servicehub.customerDevice')}{' '}
                          </th>
                          <th>{tr('servicehub.status')} </th>
                          <th className='sh-desktop'>
                            {tr('servicehub.engineer')}{' '}
                          </th>
                          <th>
                            <span className='sr-only'>
                              {tr('servicehub.actions')}{' '}
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {visible.map((t) => (
                          <tr key={t.id}>
                            <td>
                              <button
                                className='sh-ticket-link'
                                onClick={() => view(t)}
                              >
                                {t.title}
                              </button>
                              <div className='sh-row-meta'>
                                {t.id}
                                {t.priority === 'urgent' && (
                                  <span className='sh-urgent'>
                                    {tr('servicehub.urgent')}{' '}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className='sh-desktop'>
                              {t.customerName}
                              <small>{t.deviceName}</small>
                            </td>
                            <td>
                              <Status status={t.status} />
                            </td>
                            <td className='sh-desktop'>
                              {t.engineerName ?? tr('servicehub.unassigned')}
                            </td>
                            <td>
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  render={
                                    <Button
                                      variant='ghost'
                                      size='icon-sm'
                                      aria-label={tr(
                                        'servicehub.ticketActions',
                                        {
                                          id: t.id,
                                        },
                                      )}
                                    />
                                  }
                                >
                                  <MoreVertical />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align='end'
                                  className='w-auto min-w-32'
                                >
                                  <DropdownMenuItem onClick={() => view(t)}>
                                    {tr('servicehub.viewDetails')}{' '}
                                  </DropdownMenuItem>
                                  {((portalId === 'dispatch' &&
                                    t.status === 'pending') ||
                                    (portalId === 'customer' &&
                                      t.status === 'resolved')) && (
                                    <DropdownMenuItem onClick={() => view(t)}>
                                      {portalId === 'dispatch'
                                        ? tr('servicehub.assignEngineerAlt')
                                        : tr('servicehub.confirmAndRateAltAlt')}
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </>
        )}
        <Dialog
          open={!!selected}
          onOpenChange={(value) => {
            if (!pending && !value) setSelected(null);
          }}
        >
          <DialogContent className='sm:max-w-xl'>
            <DialogHeader>
              <DialogTitle>{selected?.title}</DialogTitle>
              <DialogDescription>
                {selected?.id} · {selected?.customerName}
              </DialogDescription>
            </DialogHeader>
            {selected && (
              <div className='sh-detail'>
                <Status status={selected.status} />
                <div className='sh-detail-grid'>
                  <div>
                    <small>{tr('servicehub.device')} </small>
                    <p>{selected.deviceName}</p>
                  </div>
                  <div>
                    <small>{tr('servicehub.serviceEngineer')} </small>
                    <p>
                      {selected.engineerName ?? tr('servicehub.unassignedAlt')}
                    </p>
                  </div>
                </div>
                <p className='sh-address'>
                  <MapPin size={14} />
                  {selected.address}
                </p>
                <h3>{tr('servicehub.issueDescription')} </h3>
                <p>{selected.description}</p>
                <div className='sh-progress'>
                  {Object.entries(statusLabels).map(([key, label], i) => (
                    <div
                      key={key}
                      className={
                        i <= Object.keys(statusLabels).indexOf(selected.status)
                          ? 'done'
                          : ''
                      }
                    >
                      <CheckCircle2 size={16} />
                      <span>{tr(label)}</span>
                    </div>
                  ))}
                </div>
                {selected.resolution && (
                  <div className='sh-result'>
                    <h3>{tr('servicehub.resolution')} </h3>
                    <p>{selected.resolution}</p>
                    {selected.rating && (
                      <p>
                        {tr('servicehub.ratingResult', {
                          rating: '★'.repeat(selected.rating),
                        })}
                      </p>
                    )}
                  </div>
                )}
                {action === 'assign' && (
                  <label>
                    {tr('servicehub.assignEngineerAlt')}{' '}
                    <select
                      value={engineer}
                      onChange={(e) => setEngineer(e.target.value)}
                    >
                      {data?.engineers.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {action === 'complete' && (
                  <label>
                    {tr('servicehub.resolution')}{' '}
                    <Textarea
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      placeholder={tr(
                        'servicehub.describeTheCauseRepairAndTestResults',
                      )}
                    />
                  </label>
                )}
                {action === 'confirm' && (
                  <label>
                    {tr('servicehub.serviceRating')}{' '}
                    <select
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                    >
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>
                          {'★'.repeat(n)} ·{' '}
                          {n === 5
                            ? tr('servicehub.excellent')
                            : n === 4
                              ? tr('servicehub.good')
                              : tr('servicehub.couldBeBetter')}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {error && (
                  <p className='text-destructive' role='alert'>
                    {error}
                  </p>
                )}
              </div>
            )}
            <DialogFooter>
              <Button
                variant='outline'
                disabled={pending}
                onClick={() => setSelected(null)}
              >
                {tr('servicehub.close')}{' '}
              </Button>
              {action && (
                <Button
                  disabled={
                    pending || (action === 'complete' && !resolution.trim())
                  }
                  onClick={() => void fire(action)}
                >
                  {pending ? tr('servicehub.submitting') : actionLabels[action]}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog
          open={create}
          onOpenChange={(value) => {
            if (!pending) setCreate(value);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {tr('servicehub.reportAnEquipmentIssue')}{' '}
              </DialogTitle>
              <DialogDescription>
                {tr('servicehub.tellUsWhatHappenedSoWeCan')}{' '}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(event) => void report(event)} className='sh-form'>
              <label>
                {tr('servicehub.deviceAlt')}{' '}
                <select
                  name='deviceId'
                  required
                  defaultValue={reportDevice || undefined}
                >
                  {data?.devices.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} · {d.serial}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {tr('servicehub.issueTitle')}{' '}
                <Input
                  name='title'
                  required
                  minLength={2}
                  maxLength={120}
                  placeholder={tr(
                    'servicehub.forExampleEspressoMachineNotHeating',
                  )}
                />
              </label>
              <label>
                {tr('servicehub.description')}{' '}
                <Textarea
                  name='description'
                  required
                  minLength={5}
                  maxLength={3000}
                  placeholder={tr(
                    'servicehub.describeTheIssueAndWhenItStarted',
                  )}
                />
              </label>
              <label>
                {tr('servicehub.priority')}{' '}
                <select name='priority'>
                  <option value='normal'>
                    {tr('servicehub.normalBusinessCanContinue')}{' '}
                  </option>
                  <option value='urgent'>
                    {tr('servicehub.urgentBusinessIsDisrupted')}{' '}
                  </option>
                </select>
              </label>
              {error && (
                <p className='text-destructive' role='alert'>
                  {error}
                </p>
              )}
              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  disabled={pending}
                  onClick={() => setCreate(false)}
                >
                  {tr('servicehub.cancel')}{' '}
                </Button>
                <Button type='submit' disabled={pending}>
                  {pending
                    ? tr('servicehub.submitting')
                    : tr('servicehub.submitRequest')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <footer className='sh-footer'>
          <Clock3 size={13} />
          {tr('servicehub.servicehubServiceThatComesFullCircle')}{' '}
        </footer>
      </section>
    </ServicePortalLayout>
  );
}
function Status({ status }: { status: string }) {
  const { t: tr } = useTranslation();
  return (
    <span className={'sh-status sh-status-' + status}>
      {tr(statusLabels[status] ?? status)}
    </span>
  );
}
