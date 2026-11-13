'use client';
import type { Tables } from '@/lib/supabase/database.types';

type DonationRow = Tables<'donations'> & { campaign: string | null };
import { useEffect, useRef, useState } from 'react';
import { Search, Download, HandCoins, Loader2 } from 'lucide-react';
import { api, PageHead, Empty } from '@/components/admin/ui';
import { fmtDate, inr } from '@/lib/utils';

export default function Donations() {
  const [items, setItems] = useState<DonationRow[] | null>(null);
  const [q, setQ] = useState('');
  const firstLoad = useRef(true);
  useEffect(() => {
    const delay = firstLoad.current ? 0 : 250; // load at once on open; debounce only while typing
    firstLoad.current = false;
    const id = setTimeout(() => api<{ items: DonationRow[] }>(`/api/admin/donations?q=${encodeURIComponent(q)}`).then((d) => setItems(d.items)), delay);
    return () => clearTimeout(id);
  }, [q]);
  const total = (items || []).reduce((a, d) => a + d.amount, 0);
  return (
    <>
      <PageHead title="Donations" sub="Every successful donation with its receipt number.">
        <a className="abtn abtn-soft" href="/api/admin/export/donations"><Download size={16} />Export CSV</a>
      </PageHead>
      <section className="acard flush">
        <div className="atoolbar">
          <div className="ainput-icon search"><Search size={16} /><input className="ainput" placeholder="Search donor, mobile, receipt…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <span className="atotal">Total <b>{inr(total)}</b></span>
        </div>
        {!items ? <div className="adm-pad"><Loader2 className="spin" /></div> : items.length === 0 ? <Empty icon={HandCoins} text="No donations yet." /> : (
          <div className="atable-wrap">
            <table className="atable">
              <thead><tr><th>Receipt</th><th>Donor</th><th>Mobile</th><th>Amount</th><th>Towards</th><th>PAN</th><th>Date</th><th>Payment</th></tr></thead>
              <tbody>
                {items.map((d) => (
                  <tr key={d.id} title={d.message || ''}>
                    <td data-label="Receipt" className="mono">{d.receipt_no}</td>
                    <td data-label="Donor"><b>{d.name}</b>{d.anonymous ? <span className="abadge">anonymous</span> : null}<small className="ablock">{d.email}</small></td>
                    <td data-label="Mobile">{d.phone}</td>
                    <td data-label="Amount"><b className="agreen">{inr(d.amount)}</b></td>
                    <td data-label="Towards">{d.campaign || 'General fund'}</td>
                    <td data-label="PAN" className="mono">{d.pan || '—'}</td>
                    <td data-label="Date">{fmtDate(d.created_at)}</td>
                    <td data-label="Payment" className="mono small">{d.payment_id}{d.payment_mode === 'demo' && <span className="abadge warn">demo</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
