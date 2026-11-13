import { fail, adminRoute } from '@/lib/http';
import { createClient } from '@/lib/supabase/server';
import { loadRegistrations } from '@/lib/registrations';

type Params = { type: string };
type Cell = string | number | boolean | null | undefined;

const cell = (v: Cell): string => {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) || /^[=+\-@]/.test(s) ? `"${s.replace(/^([=+\-@])/, "'$1").replace(/"/g, '""')}"` : s;
};

async function rows(type: string, url: URL): Promise<Record<string, Cell>[] | null> {
  const supabase = await createClient();
  if (type === 'registrations') {
    const list = await loadRegistrations(supabase, Number(url.searchParams.get('campaign')) || null);
    return list.map((r) => ({ event: r.campaign, type: r.kind, id_no: r.member_no, name: r.name, phone: r.phone, ward: r.ward, status: r.status, registered_at: r.created_at }));
  }
  if (type === 'volunteers') {
    const { data, error } = await supabase.from('volunteers')
      .select('volunteer_no, name, phone, email, ward, pincode, proof_type, verified, status, created_at').order('id');
    if (error) throw new Error(error.message);
    return data;
  }
  if (type === 'members') {
    const { data, error } = await supabase.from('members')
      .select('member_no, name, phone, email, ward, pincode, status, amount, payment_id, payment_mode, created_at').order('id');
    if (error) throw new Error(error.message);
    return data;
  }
  if (type === 'donations') {
    const { data, error } = await supabase.from('donations')
      .select('receipt_no, name, phone, email, pan, amount, message, anonymous, payment_id, payment_mode, created_at, campaigns(title_en)').order('id');
    if (error) throw new Error(error.message);
    return (data ?? []).map(({ campaigns, ...d }) => ({ ...d, campaign: campaigns?.title_en ?? '' }));
  }
  if (type === 'messages') {
    const { data, error } = await supabase.from('messages').select('name, email, phone, subject, message, created_at').order('id');
    if (error) throw new Error(error.message);
    return data;
  }
  return null;
}

export const GET = adminRoute<Params>(async (req, { params }) => {
  const { type } = await params;
  const data = await rows(type, new URL(req.url));
  if (!data) return fail('Unknown export', 404);
  const cols = data[0] ? Object.keys(data[0]) : [];
  const csv = '﻿' + [cols.join(','), ...data.map((r) => cols.map((c) => cell(r[c])).join(','))].join('\n');
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="skjv-${type}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
});
