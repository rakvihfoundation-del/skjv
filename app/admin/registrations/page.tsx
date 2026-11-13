'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Download, CalendarCheck2, Loader2, Trash2 } from 'lucide-react';
import { api, PageHead, Empty, Toast, type ToastMsg } from '@/components/admin/ui';
import { useDialog } from '@/components/site/Dialog';
import { fmtDate } from '@/lib/utils';
import type { RegistrationRow } from '@/lib/types';

type EventOption = { id: number; title: string; start_date: string; count: number };

export default function Registrations() {
  const [items, setItems] = useState<RegistrationRow[] | null>(null);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [campaign, setCampaign] = useState('');
  const [q, setQ] = useState('');
  const [toast, setToast] = useState<ToastMsg>(null);
  const { ask } = useDialog();

  const load = useCallback(() => {
    setItems(null);
    return api<{ items: RegistrationRow[]; events: EventOption[] }>(`/api/admin/registrations${campaign ? `?campaign=${campaign}` : ''}`)
      .then((d) => { setItems(d.items); setEvents(d.events); });
  }, [campaign]);
  useEffect(() => { void load(); }, [load]);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!items || !s) return items ?? [];
    return items.filter((r) => [r.name, r.phone, r.member_no, r.ward, r.campaign].some((v) => String(v ?? '').toLowerCase().includes(s)));
  }, [items, q]);

  async function remove(r: RegistrationRow) {
    const yes = await ask({
      title: 'Remove this registration?',
      message: <><b>{r.name}</b> ({r.member_no}) will be taken off the list for <b>{r.campaign}</b>. They can register again from the website.</>,
      confirmText: 'Remove', cancelText: 'Keep', icon: Trash2,
    });
    if (!yes) return;
    try {
      await api(`/api/admin/registrations/${r.id}`, { method: 'DELETE' });
      setToast({ text: 'Registration removed', type: 'ok' });
      void load();
    } catch (e) {
      setToast({ text: e instanceof Error ? e.message : 'Could not remove', type: 'err' });
    }
  }

  return (
    <>
      <PageHead title="Event Registrations" sub="Members and volunteers who registered to take part in each campaign or event.">
        <a className="abtn abtn-soft" href={`/api/admin/export/registrations${campaign ? `?campaign=${campaign}` : ''}`}><Download size={16} />Export CSV</a>
      </PageHead>
      <section className="acard flush">
        <div className="atoolbar">
          <select className="ainput auto" value={campaign} onChange={(e) => setCampaign(e.target.value)}>
            <option value="">All events ({events.reduce((a, e) => a + e.count, 0)})</option>
            {events.map((e) => <option key={e.id} value={e.id}>{e.title} · {fmtDate(e.start_date)} ({e.count})</option>)}
          </select>
          <div className="ainput-icon search"><Search size={16} /><input className="ainput" placeholder="Search name, mobile, member ID, ward…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <span className="atotal">Registered <b>{list.length}</b></span>
        </div>
        {!items ? <div className="adm-pad"><Loader2 className="spin" /></div> : list.length === 0 ? (
          <Empty icon={CalendarCheck2} text={items.length ? 'No matches for your search.' : 'No registrations yet.'} />
        ) : (
          <div className="atable-wrap">
            <table className="atable">
              <thead><tr><th>Person</th><th>Mobile</th><th>Ward</th><th>Event</th><th>Registered</th><th className="right">Actions</th></tr></thead>
              <tbody>
                {list.map((r) => (
                  <tr key={r.id}>
                    <td data-label="Person"><b>{r.name}</b>{r.status === 'suspended' && <span className="abadge warn">suspended</span>}
                      <small className="ablock"><span className={`abadge ${r.kind === 'volunteer' ? 'vol' : 'mem'}`}>{r.kind === 'volunteer' ? 'Volunteer' : 'Member'}</span> <span className="mono">{r.member_no}</span></small></td>
                    <td data-label="Mobile">{r.phone}</td>
                    <td data-label="Ward">{r.ward || '—'}</td>
                    <td data-label="Event">{r.campaign}</td>
                    <td data-label="Registered">{fmtDate(r.created_at)}</td>
                    <td className="right nowrap"><button className="aicon danger" title="Remove" onClick={() => remove(r)}><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <Toast msg={toast} onDone={() => setToast(null)} />
    </>
  );
}
