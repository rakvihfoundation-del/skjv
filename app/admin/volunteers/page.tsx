'use client';
import type { VolunteerPublic } from '@/lib/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Search, Download, Ban, CheckCircle2, Trash2, Loader2, X, HeartHandshake, FileSearch, ShieldCheck, ShieldOff, ExternalLink, FileText,
} from 'lucide-react';
import { api, PageHead, Toast, Empty, type ToastMsg } from '@/components/admin/ui';
import { useDialog } from '@/components/site/Dialog';
import { Avatar } from '@/components/site/Cards';
import { fmtDate } from '@/lib/utils';

const PROOF_LABEL: Record<string, string> = { aadhaar: 'Aadhaar card', voter: 'Voter ID', driving: 'Driving Licence', pan: 'PAN card' };
type ProofView = { v: VolunteerPublic; url: string; pdf: boolean } | null;

export default function Volunteers() {
  const [items, setItems] = useState<VolunteerPublic[] | null>(null);
  const [wards, setWards] = useState<string[]>([]);
  const [q, setQ] = useState('');
  const [ward, setWard] = useState('');
  const [status, setStatus] = useState('');
  const [proof, setProof] = useState<ProofView>(null);
  const [opening, setOpening] = useState<number | null>(null);
  const [toast, setToast] = useState<ToastMsg>(null);
  const { ask } = useDialog();

  const load = useCallback(() => {
    const p = new URLSearchParams({ q, ward, status });
    void api<{ items: VolunteerPublic[] }>(`/api/admin/volunteers?${p}`).then((d) => setItems(d.items));
  }, [q, ward, status]);
  // Load at once on open; wait briefly only while the admin is typing.
  const firstLoad = useRef(true);
  useEffect(() => {
    const id = setTimeout(load, firstLoad.current ? 0 : 250);
    firstLoad.current = false;
    return () => clearTimeout(id);
  }, [load]);
  useEffect(() => { void api<{ items: { name: string }[] }>('/api/admin/r/wards').then((d) => setWards(d.items.map((w) => w.name))); }, []);

  async function patch(v: VolunteerPublic, body: { status?: string; verified?: boolean }, done: string) {
    try {
      const d = await api<{ item: VolunteerPublic }>(`/api/admin/volunteers/${v.id}`, { method: 'PATCH', body });
      setItems((xs) => xs?.map((x) => (x.id === v.id ? d.item : x)) ?? xs);
      setProof((p) => (p && p.v.id === v.id ? { ...p, v: d.item } : p));
      setToast({ text: done, type: 'ok' });
    } catch (e) {
      setToast({ text: e instanceof Error ? e.message : 'Could not update', type: 'err' });
    }
  }

  async function viewProof(v: VolunteerPublic) {
    setOpening(v.id);
    try {
      const d = await api<{ url: string; pdf: boolean }>(`/api/admin/volunteers/${v.id}/proof`);
      setProof({ v, url: d.url, pdf: d.pdf });
    } catch (e) {
      setToast({ text: e instanceof Error ? e.message : 'Could not open the ID proof', type: 'err' });
    } finally {
      setOpening(null);
    }
  }

  async function verify(v: VolunteerPublic, value: boolean) {
    const yes = await ask(value ? {
      title: 'Mark as verified?', tone: 'primary', icon: ShieldCheck,
      message: <>Confirm that you have checked the <b>{PROOF_LABEL[v.proof_type] ?? 'ID proof'}</b> of <b>{v.name}</b> ({v.volunteer_no}).</>,
      confirmText: 'Mark verified', cancelText: 'Not yet',
    } : {
      title: 'Remove verification?', icon: ShieldOff,
      message: <><b>{v.name}</b> will show as “Verification pending” again.</>,
      confirmText: 'Remove', cancelText: 'Keep verified',
    });
    if (yes) await patch(v, { verified: value }, value ? `${v.name} verified` : `${v.name} marked unverified`);
  }

  async function setVolunteerStatus(v: VolunteerPublic, s: 'active' | 'suspended') {
    const yes = await ask(s === 'suspended' ? {
      title: 'Suspend this volunteer?', icon: Ban,
      message: <><b>{v.name}</b> ({v.volunteer_no}) will not be able to log in or register for events until you re-activate them.</>,
      confirmText: 'Suspend volunteer', cancelText: 'Keep active',
    } : {
      title: 'Re-activate this volunteer?', tone: 'primary', icon: CheckCircle2,
      message: <><b>{v.name}</b> ({v.volunteer_no}) will be able to log in and register for events again.</>,
      confirmText: 'Re-activate', cancelText: 'Not now',
    });
    if (yes) await patch(v, { status: s }, s === 'active' ? `${v.name} re-activated` : `${v.name} suspended`);
  }

  async function remove(v: VolunteerPublic) {
    const yes = await ask({
      title: 'Delete this volunteer?', icon: Trash2,
      message: <><b>{v.name}</b> ({v.volunteer_no}), their login, event registrations and uploaded ID proof will be removed permanently. This cannot be undone.</>,
      confirmText: 'Delete volunteer', cancelText: 'Keep volunteer',
    });
    if (!yes) return;
    try {
      await api(`/api/admin/volunteers/${v.id}`, { method: 'DELETE' });
      setProof(null);
      setToast({ text: 'Volunteer deleted', type: 'ok' });
      load();
    } catch (e) {
      setToast({ text: e instanceof Error ? e.message : 'Could not delete', type: 'err' });
    }
  }

  const pending = items?.filter((v) => !v.verified).length ?? 0;

  return (
    <>
      <PageHead title="Volunteers" sub="People who signed up to volunteer for free. Check their ID proof and mark them verified.">
        <a className="abtn abtn-soft" href="/api/admin/export/volunteers"><Download size={16} />Export CSV</a>
      </PageHead>
      <section className="acard flush">
        <div className="atoolbar">
          <div className="ainput-icon search"><Search size={16} /><input className="ainput" placeholder="Search name, mobile, volunteer ID, pincode…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <select className="ainput auto" value={ward} onChange={(e) => setWard(e.target.value)}><option value="">All wards</option>{wards.map((w) => <option key={w}>{w}</option>)}</select>
          <select className="ainput auto" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Everyone</option><option value="unverified">Verification pending</option><option value="verified">Verified</option>
            <option value="active">Active</option><option value="suspended">Suspended</option>
          </select>
          <span className="amuted">{items ? `${items.length} volunteers${pending ? ` · ${pending} to verify` : ''}` : ''}</span>
        </div>
        {!items ? <div className="adm-pad"><Loader2 className="spin" /></div> : items.length === 0 ? (
          <Empty icon={HeartHandshake} text={q || ward || status ? 'No volunteers match these filters.' : 'No volunteers yet. They will appear here when someone signs up as a volunteer.'} />
        ) : (
          <div className="atable-wrap">
            <table className="atable">
              <thead><tr><th>Volunteer</th><th>Volunteer ID</th><th>Mobile</th><th>Ward</th><th>ID proof</th><th>Verification</th><th>Joined</th><th>Status</th><th className="right">Actions</th></tr></thead>
              <tbody>
                {items.map((v) => (
                  <tr key={v.id}>
                    <td data-label="Volunteer"><div className="aperson"><Avatar name={v.name} className="asm" /><div><b>{v.name}</b><small>{v.email || '—'}</small></div></div></td>
                    <td data-label="Volunteer ID" className="mono">{v.volunteer_no}</td>
                    <td data-label="Mobile">{v.phone}</td>
                    <td data-label="Ward">{v.ward}</td>
                    <td data-label="ID proof">
                      <button className="aproof" onClick={() => viewProof(v)} disabled={opening === v.id}>
                        {opening === v.id ? <Loader2 className="spin" size={15} /> : <FileSearch size={15} />}{PROOF_LABEL[v.proof_type] ?? v.proof_type}
                      </button>
                    </td>
                    <td data-label="Verification">{v.verified
                      ? <span className="abadge green"><ShieldCheck size={13} />Verified</span>
                      : <span className="abadge warn">Pending</span>}</td>
                    <td data-label="Joined">{fmtDate(v.created_at)}</td>
                    <td data-label="Status"><span className={`abadge ${v.status === 'active' ? 'green' : 'red'}`}>{v.status}</span></td>
                    <td className="right nowrap">
                      {v.verified
                        ? <button className="aicon" title="Remove verification" onClick={() => verify(v, false)}><ShieldOff size={16} /></button>
                        : <button className="aicon ok" title="Mark verified" onClick={() => verify(v, true)}><ShieldCheck size={16} /></button>}
                      {v.status === 'active'
                        ? <button className="aicon warn" title="Suspend" onClick={() => setVolunteerStatus(v, 'suspended')}><Ban size={16} /></button>
                        : <button className="aicon ok" title="Re-activate" onClick={() => setVolunteerStatus(v, 'active')}><CheckCircle2 size={16} /></button>}
                      <button className="aicon danger" title="Delete" onClick={() => remove(v)}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {proof && (
        <div className="amodal" role="dialog" aria-modal="true" aria-label="ID proof">
          <div className="amodal-bg" onClick={() => setProof(null)} />
          <div className="amodal-box wide">
            <header>
              <h2>{proof.v.name} · {PROOF_LABEL[proof.v.proof_type] ?? 'ID proof'}</h2>
              <button onClick={() => setProof(null)} aria-label="Close"><X size={20} /></button>
            </header>
            <div className="amodal-body proof-view">
              {proof.pdf
                ? <div className="proof-pdf"><FileText size={42} /><p>This ID proof is a PDF.</p></div>
                : <img src={proof.url} alt={`ID proof of ${proof.v.name}`} />}
              <p className="amuted small">Private link · expires in 2 minutes · only admins can open it.</p>
              <div className="proof-actions">
                <a className="abtn abtn-soft" href={proof.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} />Open in new tab</a>
                {proof.v.verified
                  ? <span className="abadge green big"><ShieldCheck size={15} />Verified</span>
                  : <button className="abtn abtn-primary" onClick={() => verify(proof.v, true)}><ShieldCheck size={16} />Mark verified</button>}
              </div>
            </div>
          </div>
        </div>
      )}
      <Toast msg={toast} onDone={() => setToast(null)} />
    </>
  );
}
