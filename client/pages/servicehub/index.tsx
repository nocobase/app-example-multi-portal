import { useCan } from '@nocobase/app-plugin-authorization/client';
import { HeaderActions } from '../../layouts/components/header-actions.js';
import { useState, useRef } from 'react';
import { Link } from 'react-router';
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

const portals = {
  customer: {
    title: '客户服务台',
    description: '设备保障，服务随行',
    icon: Headset,
    kicker: 'CUSTOMER CARE',
    color: 'blue',
  },
  dispatch: {
    title: '运营调度台',
    description: '每一次服务，都有序推进',
    icon: LayoutDashboard,
    kicker: 'SERVICE OPERATIONS',
    color: 'violet',
  },
  engineer: {
    title: '工程师工作台',
    description: '今天的任务，尽在掌握',
    icon: Wrench,
    kicker: 'FIELD SERVICE',
    color: 'teal',
  },
  insights: {
    title: '服务洞察',
    description: '用数据回顾服务表现',
    icon: ChartNoAxesCombined,
    kicker: 'SERVICE INSIGHTS',
    color: 'amber',
  },
};
type Workspace = {
  tickets: ServiceTicket[];
  devices: ServiceDevice[];
  engineers: { id: string; name: string }[];
};
function errorText(error: unknown): string {
  const status = (error as { status?: number })?.status;
  return status === 403
    ? '当前账号没有访问权限，请切换对应演示账号。'
    : '暂时无法完成操作，请刷新后重试。';
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
      setResetError(errorText(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className='sh-workbench'>
      <div className='sh-eyebrow'>SERVICEHUB / 设备服务中心</div>
      <h1>
        一个服务中心，
        <br />
        每个人的专属工作台。
      </h1>
      <p className='sh-intro'>
        从门店报修到现场处理，让服务在不同团队之间顺畅流转。
      </p>
      {access.isPending ? (
        <p role='status'>正在加载工作台…</p>
      ) : access.isError ? (
        <p role='alert'>{errorText(access.error)}</p>
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
                  进入门户 <ArrowUpRight size={17} />
                </span>
              </Link>
            );
          })}
        </div>
      )}
      {access.data?.data.administrator && (
        <div className='sh-admin-links'>
          <Button variant='outline' render={<Link to='/settings/portals' />}>
            门户管理
          </Button>
          <Button variant='ghost' onClick={() => setReset(true)}>
            恢复演示数据
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
            <DialogTitle>恢复演示数据？</DialogTitle>
            <DialogDescription>
              清除本 Demo 的设备、工单和处理记录，恢复为预置的 12
              张工单。账号、角色和门户安装状态会保留。
            </DialogDescription>
          </DialogHeader>
          {resetError && <p role='alert'>{resetError}</p>}
          <DialogFooter>
            <Button
              variant='outline'
              disabled={busy}
              onClick={() => setReset(false)}
            >
              取消
            </Button>
            <Button
              variant='destructive'
              disabled={busy}
              onClick={() => void restore()}
            >
              {busy ? '恢复中…' : '确认恢复'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className='sh-story'>
        <span className='sh-eyebrow'>一次报修的服务旅程</span>
        <div>
          <span>客户报修</span>
          <ArrowRight />
          <span>运营派单</span>
          <ArrowRight />
          <span>现场处理</span>
          <ArrowRight />
          <span>客户评价</span>
        </div>
        <p>同一张工单，在每个门户呈现与当前角色相关的信息。</p>
      </div>
    </section>
  );
}
export default function ServicePortal({ portalId }: { portalId: PortalId }) {
  const api = useApiClient();
  const cache = useQueryClient();
  const access = useAccess();
  const portal = portals[portalId];
  const Icon = portal.icon;
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<ServiceTicket | null>(null);
  const [create, setCreate] = useState(false);
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
      setError(errorText(e));
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
      setError(errorText(e));
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
    assign: '确认派单',
    accept: '接单并开始处理',
    complete: '提交处理结果',
    confirm: '确认完成并评价',
  };
  function view(ticket: ServiceTicket) {
    setSelected(ticket);
    setError('');
    setResolution('');
  }
  return (
    <section className={'sh-page sh-' + portal.color}>
      <div className='sh-topline'>
        <Link to='/'>
          ServiceHub <span>/ 工作台</span>
        </Link>
        <nav aria-label='切换门户'>
          {access.data?.data.portals.map((id) => (
            <Link
              key={id}
              to={'/portals/' + id}
              aria-current={id === portalId ? 'page' : undefined}
            >
              {portals[id].title}
            </Link>
          ))}
        </nav>
        <HeaderActions />
      </div>
      <header className='sh-heading'>
        <div>
          <div className='sh-eyebrow'>
            <Icon size={14} />
            {portal.kicker}
          </div>
          <h1>
            {portalId === 'engineer'
              ? `你好，${access.data?.data.user.name ?? '工程师'}`
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
            发起报修
          </Button>
        )}
      </header>
      {workspace.isPending ? (
        <p role='status'>正在加载服务记录…</p>
      ) : workspace.isError ? (
        <div className='sh-empty' role='alert'>
          <h2>暂时无法进入门户</h2>
          <p>请确认当前账号有访问权限，且管理员已安装此门户。</p>
          <Button variant='outline' onClick={() => void workspace.refetch()}>
            重新加载
          </Button>
        </div>
      ) : (
        <>
          <div className='sh-stats'>
            {[
              [
                portalId === 'customer' ? '我的设备' : '待处理工单',
                portalId === 'customer' ? data?.devices.length : open.length,
                '实时服务记录',
              ],
              ['正在处理', active.length, '工程师正在跟进'],
              ['服务已完成', closed.length, '每一次服务都有结果'],
            ].map(([label, value, note], i) => (
              <button
                type='button'
                className='sh-stat'
                key={label}
                onClick={() =>
                  setFilter(i === 1 ? 'working' : i === 2 ? 'closed' : 'all')
                }
              >
                <span>{label}</span>
                <strong>{value}</strong>
                <small>{note}</small>
              </button>
            ))}
          </div>
          {portalId === 'customer' && (
            <section className='sh-devices'>
              <div className='sh-section-title'>
                <h2>我的设备</h2>
                <span>持续保障门店运营</span>
              </div>
              <div>
                {data?.devices.map((d) => (
                  <article key={d.id}>
                    <Coffee />
                    <div>
                      <h3>{d.name}</h3>
                      <p>{d.serial}</p>
                    </div>
                    <Badge variant='secondary'>保障中</Badge>
                  </article>
                ))}
              </div>
            </section>
          )}
          <div className='sh-section-title'>
            <h2>
              {portalId === 'engineer'
                ? '我的服务任务'
                : portalId === 'insights'
                  ? '服务记录'
                  : '服务工单'}
            </h2>
            <span>{tickets.length} 条记录</span>
          </div>
          <div className='sh-toolbar'>
            <Input
              aria-label='搜索工单'
              placeholder='搜索工单编号、问题或门店'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className='sh-filters'>
              {[
                ['all', '全部'],
                ['pending', '待分配'],
                ['working', '处理中'],
                ['resolved', '待确认'],
                ['closed', '已完成'],
              ]
                .filter(
                  ([value]) => portalId !== 'engineer' || value !== 'pending',
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
              <h3>这里暂时没有工单</h3>
              <p>
                {search ? '试试其他关键词。' : '切换筛选查看其他服务记录。'}
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
                    <Button variant='outline' size='sm' onClick={() => view(t)}>
                      查看任务 <ArrowRight size={14} />
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
                    <th>工单</th>
                    <th className='sh-desktop'>客户 / 设备</th>
                    <th>状态</th>
                    <th className='sh-desktop'>工程师</th>
                    <th>
                      <span className='sr-only'>操作</span>
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
                            <span className='sh-urgent'>优先处理</span>
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
                        {t.engineerName ?? '待分配'}
                      </td>
                      <td>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant='ghost'
                                size='icon-sm'
                                aria-label={t.id + ' 的操作'}
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
                              查看详情
                            </DropdownMenuItem>
                            {((portalId === 'dispatch' &&
                              t.status === 'pending') ||
                              (portalId === 'customer' &&
                                t.status === 'resolved')) && (
                              <DropdownMenuItem onClick={() => view(t)}>
                                {portalId === 'dispatch'
                                  ? '分配工程师'
                                  : '确认并评价'}
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
                  <small>设备</small>
                  <p>{selected.deviceName}</p>
                </div>
                <div>
                  <small>服务工程师</small>
                  <p>{selected.engineerName ?? '等待分配'}</p>
                </div>
              </div>
              <p className='sh-address'>
                <MapPin size={14} />
                {selected.address}
              </p>
              <h3>问题描述</h3>
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
                    <span>{label}</span>
                  </div>
                ))}
              </div>
              {selected.resolution && (
                <div className='sh-result'>
                  <h3>处理结果</h3>
                  <p>{selected.resolution}</p>
                  {selected.rating && (
                    <p>服务评价：{'★'.repeat(selected.rating)}</p>
                  )}
                </div>
              )}
              {action === 'assign' && (
                <label>
                  分配工程师
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
                  处理结果
                  <Textarea
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    placeholder='记录故障原因、处理方式和试运行结果'
                  />
                </label>
              )}
              {action === 'confirm' && (
                <label>
                  服务评价
                  <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {'★'.repeat(n)} ·{' '}
                        {n === 5
                          ? '非常满意'
                          : n === 4
                            ? '满意'
                            : '还有提升空间'}
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
              关闭
            </Button>
            {action && (
              <Button
                disabled={
                  pending || (action === 'complete' && !resolution.trim())
                }
                onClick={() => void fire(action)}
              >
                {pending ? '正在提交…' : actionLabels[action]}
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
            <DialogTitle>发起设备报修</DialogTitle>
            <DialogDescription>
              描述遇到的问题，我们会尽快安排服务。
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(event) => void report(event)} className='sh-form'>
            <label>
              报修设备
              <select name='deviceId' required>
                {data?.devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} · {d.serial}
                  </option>
                ))}
              </select>
            </label>
            <label>
              问题标题
              <Input
                name='title'
                required
                minLength={2}
                maxLength={120}
                placeholder='例如：咖啡机无法加热'
              />
            </label>
            <label>
              详细描述
              <Textarea
                name='description'
                required
                minLength={5}
                maxLength={3000}
                placeholder='说明故障现象与发生时间'
              />
            </label>
            <label>
              紧急程度
              <select name='priority'>
                <option value='normal'>正常 · 不影响营业</option>
                <option value='urgent'>紧急 · 影响正常营业</option>
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
                取消
              </Button>
              <Button type='submit' disabled={pending}>
                {pending ? '正在提交…' : '提交报修'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <footer className='sh-footer'>
        <Clock3 size={13} /> ServiceHub · 让每一次服务都有回响
      </footer>
    </section>
  );
}
function Status({ status }: { status: string }) {
  return (
    <span className={'sh-status sh-status-' + status}>
      {statusLabels[status] ?? status}
    </span>
  );
}
