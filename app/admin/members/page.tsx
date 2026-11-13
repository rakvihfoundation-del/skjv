'use client';
import type { MemberPublic } from '@/lib/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Search, Download, IdCard as IdIcon, Ban, CheckCircle2, Trash2, Users, Loader2, X } from 'lucide-react';
import { api, PageHead, Toast, Empty, type ToastMsg } from '@/components/admin/ui';
import { useDialog } from '@/components/site/Dialog';
import { Avatar } from '@/components/site/Cards';
import IdCard from '@/components/site/IdCard';
import { fmtDate, inr } from '@/lib/utils';

export default function Members() {
  const [items, setItems] = useState<MemberPublic[] | null>(null);
  const [wards, setWards] = useState<string[]>([]);
  const [q, setQ] = useState('');
  const [ward, setWard] = useState('');
  const [status, setStatus] = useState('');
  const [card, setCard] = useState<MemberPublic | null>(null);
  const [toast, setToast] = useState<ToastMsg>(null);
  const { ask } = useDialog();

  const load = useCallback(() => {
    const p = new URLSearchParams({ q, ward, status });
    void api<{ items: MemberPublic[] }>(`/api/admin/members?${p}`).then((d) => setItems(d.items));
  }, [q, ward, status]);
  // Load at once on open; wait briefly only while the admin is typing in the search box.
  const firstLoad = useRef(true);
  useEffect(() => {
    const id = setTimeout(load, firstLoad.current ? 0 : 250);
    firstLoad.current = false;
    return () => clearTimeout(id);
  }, [load]);
  useEffect(() => { void api<{ items: { name: string }[] }>('/api/admin/r/wards').then((d) => setWards(d.items.map((w) => w.name))); }, []);

  async function setMemberStatus(m: MemberPublic, s: 'active' | 'suspended') {
    const yes = await ask(s === 'suspended' ? {
      title: 'Suspend this member?',
      message: <><b>{m.name}</b> ({m.member_no}) will not be able to log in or register for events until you re-activate them.</>,
      confirmText: 'Suspend member', cancelText: 'Keep active', icon: Ban,
    } : {
      title: 'Re-activate this member?',
      message: <><b>{m.name}</b> ({m.member_no}) will be able to log in and register for events again.</>,
      confirmText: 'Re-activate', cancelText: 'Not now', tone: 'primary', icon: CheckCircle2,
    });
    if (!yes) return;
    try {
      await api(`/api/admin/members/${m.id}`, { method: 'PATCH', body: { status: s } });
      setToast({ text: s === 'active' ? `${m.name} re-activated` : `${m.name} suspended`, type: 'ok' });
      load();
    } catch (e) {
      setToast({ text: e instanceof Error ? e.message : 'Could not update', type: 'err' });
    }
  }
  async function remove(m: MemberPublic) {
    const yes = await ask({
      title: 'Delete this member?',
      message: <><b>{m.name}</b> ({m.member_no}) and their login will be removed permanently, along with their event registrations. Their payment record stays in Razorpay. This cannot be undone.</>,
      confirmText: 'Delete member', cancelText: 'Keep member', icon: Trash2,
    });
    if (!yes) return;
    try {
      await api(`/api/admin/members/${m.id}`, { method: 'DELETE' });
      setToast({ text: 'Member deleted', type: 'ok' });
      load();
    } catch (e) {
      setToast({ text: e instanceof Error ? e.message : 'Could not delete', type: 'err' });
    }
  }

  return (
    <>
      <PageHead title="Members" sub="Everyone who has joined the Vedike and paid the membership fee.">
        <a className="abtn abtn-soft" href="/api/admin/export/members"><Download size={16} />Export CSV</a>
      </PageHead>
      <section className="acard flush">
        <div className="atoolbar">
          <div className="ainput-icon search"><Search size={16} /><input className="ainput" placeholder="Search name, mobile, member no., pincode…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <select className="ainput auto" value={ward} onChange={(e) => setWard(e.target.value)}><option value="">All wards</option>{wards.map((w) => <option key={w}>{w}</option>)}</select>
          <select className="ainput auto" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Any status</option><option value="active">Active</option><option value="suspended">Suspended</option></select>
          <span className="amuted">{items ? `${items.length} members` : ''}</span>
        </div>
        {!items ? <div className="adm-pad"><Loader2 className="spin" /></div> : items.length === 0 ? (
          <Empty icon={Users} text={q || ward || status ? 'No members match these filters.' : 'No members yet. They will appear here as soon as someone signs up and pays.'} />
        ) : (
          <div className="atable-wrap">
            <table className="atable">
              <thead><tr><th>Member</th><th>Member no.</th><th>Mobile</th><th>Ward</th><th>Pincode</th><th>Joined</th><th>Fee</th><th>Status</th><th className="right">Actions</th></tr></thead>
              <tbody>
                {items.map((m) => (
                  <tr key={m.id}>
                    <td data-label="Member"><div className="aperson"><Avatar src={m.photo} name={m.name} className="asm" /><div><b>{m.name}</b><small>{m.email || '—'}</small></div></div></td>
                    <td data-label="Member no." className="mono">{m.member_no}</td>
                    <td data-label="Mobile">{m.phone}</td>
                    <td data-label="Ward">{m.ward}</td>
                    <td data-label="Pincode">{m.pincode}</td>
                    <td data-label="Joined">{fmtDate(m.created_at)}</td>
                    <td data-label="Fee">{inr(m.amount)}{m.payment_mode === 'demo' && <span className="abadge warn">demo</span>}</td>
                    <td data-label="Status"><span className={`abadge ${m.status === 'active' ? 'green' : 'red'}`}>{m.status}</span></td>
                    <td className="right nowrap">
                      <button className="aicon" title="View ID card" onClick={() => setCard(m)}><IdIcon size={16} /></button>
                      {m.status === 'active'
                        ? <button className="aicon warn" title="Suspend" onClick={() => setMemberStatus(m, 'suspended')}><Ban size={16} /></button>
                        : <button className="aicon ok" title="Re-activate" onClick={() => setMemberStatus(m, 'active')}><CheckCircle2 size={16} /></button>}
                      <button className="aicon danger" title="Delete" onClick={() => remove(m)}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {card && (
        <div className="amodal" role="dialog" aria-modal="true">
          <div className="amodal-bg" onClick={() => setCard(null)} />
          <div className="amodal-box wide">
            <header><h2>{card.name} · {card.member_no}</h2><button onClick={() => setCard(null)} aria-label="Close"><X size={20} /></button></header>
            <div className="amodal-body"><IdCard member={card} /></div>
          </div>
        </div>
      )}
      <Toast msg={toast} onDone={() => setToast(null)} />
    </>
  );
}
