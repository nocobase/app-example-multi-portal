import { useTranslation } from '@nocobase/i18n/client';
import { Link } from 'react-router';
import { ArrowUpRight, Wrench, CheckCircle2, MapPin } from 'lucide-react';
import { Button } from '#components/ui/button';
import type { ServiceTicket } from '../../../shared/servicehub.js';
import { statusLabels } from '../../../shared/servicehub.js';

export function TeamPanel({
  engineers,
  tickets,
  onSelect,
}: {
  engineers: { id: string; name: string }[];
  tickets: ServiceTicket[];
  onSelect: (ticket: ServiceTicket) => void;
}) {
  const { t } = useTranslation();
  return (
    <section className='sh-team-panel'>
      <div className='sh-section-title'>
        <h2>{t('servicehub.engineerTeam')}</h2>
        <span>{t('servicehub.teamHint')}</span>
      </div>
      <div className='sh-team-grid'>
        {engineers.map((engineer) => {
          const assigned = tickets.filter(
            (ticket) =>
              ticket.engineerId === engineer.id && ticket.status !== 'closed',
          );
          return (
            <article key={engineer.id}>
              <div className='sh-person'>
                <span className='sh-person-avatar'>
                  {engineer.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </span>
                <div>
                  <h3>{engineer.name}</h3>
                  <span>{t('servicehub.engineer')}</span>
                </div>
              </div>
              <div className='sh-team-count'>
                <strong>{assigned.length}</strong>
                <span>{t('servicehub.activeAssignments')}</span>
              </div>
              {assigned.length ? (
                assigned.map((ticket) => (
                  <button
                    key={ticket.id}
                    className='sh-team-ticket'
                    onClick={() => onSelect(ticket)}
                  >
                    <span>
                      {ticket.title}
                      <small>{ticket.customerName}</small>
                    </span>
                    <ArrowUpRight size={16} />
                  </button>
                ))
              ) : (
                <p className='sh-team-available'>
                  <CheckCircle2 size={16} />
                  {t('servicehub.availableForAssignment')}
                </p>
              )}
            </article>
          );
        })}
      </div>
      <p className='sh-team-note'>{t('servicehub.teamAssignmentHint')}</p>
    </section>
  );
}

export function ServiceOverview({ tickets }: { tickets: ServiceTicket[] }) {
  const { t } = useTranslation();
  const locations = [...new Set(tickets.map((ticket) => ticket.customerName))];
  return (
    <section className='sh-overview-panels'>
      <article>
        <h2>{t('servicehub.pipeline')}</h2>
        <p>{t('servicehub.pipelineHint')}</p>
        <div className='sh-pipeline'>
          {Object.entries(statusLabels).map(([status, label]) => {
            const count = tickets.filter(
              (ticket) => ticket.status === status,
            ).length;
            return (
              <div key={status}>
                <span>{t(label)}</span>
                <div className='sh-bar-track'>
                  <div
                    style={{
                      width: `${tickets.length ? (count / tickets.length) * 100 : 0}%`,
                    }}
                  />
                </div>
                <strong>{count}</strong>
              </div>
            );
          })}
        </div>
      </article>
      <article>
        <h2>{t('servicehub.locations')}</h2>
        <p>{t('servicehub.locationsHint')}</p>
        {locations.map((location) => {
          const rows = tickets.filter(
            (ticket) => ticket.customerName === location,
          );
          return (
            <div className='sh-location-row' key={location}>
              <MapPin size={17} />
              <span>
                {location}
                <small>
                  {t('servicehub.recordCount', { count: rows.length })}
                </small>
              </span>
              <strong>
                {rows.filter((ticket) => ticket.status === 'closed').length}/
                {rows.length}
              </strong>
            </div>
          );
        })}
      </article>
    </section>
  );
}

export function CustomerWelcome() {
  const { t } = useTranslation();
  return (
    <div className='sh-customer-welcome'>
      <div>
        <span className='sh-eyebrow'>{t('servicehub.customerPromise')}</span>
        <h2>{t('servicehub.customerWelcome')}</h2>
        <p>{t('servicehub.customerWelcomeDescription')}</p>
        <Button
          variant='outline'
          render={<Link to='/portals/customer/requests' />}
        >
          {t('servicehub.trackRequests')}
          <ArrowUpRight size={16} />
        </Button>
      </div>
      <div className='sh-welcome-art' aria-hidden='true'>
        <Wrench size={90} strokeWidth={1} />
        <span>ServiceHub</span>
      </div>
    </div>
  );
}
