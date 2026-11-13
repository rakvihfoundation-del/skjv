import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './supabase/database.types';
import type { ResourceConfig } from './resources';
import { parseList, slugify, campaignStatus } from './utils';

type Db = SupabaseClient<Database>;
export type Row = Record<string, string | number | boolean | string[] | null>;

/** Keep only the fields declared in the resource config, coerced to the right type. */
export function cleanRow(R: ResourceConfig, input: Record<string, unknown>): { row: Row; error?: undefined } | { row?: undefined; error: string } {
  const row: Row = {};
  for (const f of R.fields) {
    const raw = input[f.name];
    let v: string | number | boolean | string[] | null;
    switch (f.type) {
      case 'bool':
        v = raw === true || raw === 1 || raw === '1' || raw === 'true';
        break;
      case 'number': {
        const n = raw === '' || raw == null ? Number(f.default ?? 0) : Number(raw);
        if (!Number.isFinite(n)) return { error: `${f.label} must be a number` };
        v = Math.trunc(n);
        break;
      }
      case 'images':
        v = parseList(raw).map((x) => x.trim()).filter(Boolean).slice(0, 30);
        break;
      default: {
        const s = raw == null ? '' : String(raw).trim();
        v = s === '' ? null : s;
        if (f.type === 'date' && v && !/^\d{4}-\d{2}-\d{2}$/.test(v)) return { error: `${f.label} must be a valid date` };
      }
    }
    if (f.type === 'select' && typeof v === 'string' && f.options && !f.options.includes(v)) return { error: `Invalid ${f.label}` };
    if (f.required && (v === null || v === '')) return { error: `${f.label} is required` };
    row[f.name] = v;
  }
  if (R.requireOneOf && !R.requireOneOf.some((k) => row[k])) {
    const names = R.requireOneOf.map((k) => R.fields.find((f) => f.name === k)?.label.split(' (')[0].toLowerCase() ?? k);
    return { error: `Please add a ${names.join(' or a ')}` };
  }
  if (R.table === 'campaigns' && row.end_date && row.start_date && String(row.end_date) < String(row.start_date)) {
    return { error: 'End date cannot be before the start date' };
  }
  return { row };
}

/** A slug that is not used yet in the table (adds -2, -3 … when needed). */
export async function uniqueSlug(db: Db, table: 'news' | 'campaigns', text: string, exceptId?: number): Promise<string> {
  const base = slugify(text);
  let q = db.from(table).select('id, slug').like('slug', `${base}%`);
  if (exceptId) q = q.neq('id', exceptId);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  const taken = new Set((data ?? []).map((r) => r.slug));
  if (!taken.has(base)) return base;
  for (let i = 2; ; i++) if (!taken.has(`${base}-${i}`)) return `${base}-${i}`;
}

/** Lists a resource for the admin panel, in its configured order. */
export async function listResource(db: Db, R: ResourceConfig): Promise<Row[]> {
  let q = db.from(R.table).select('*');
  for (const [col, asc] of R.order) q = q.order(col, { ascending: asc });
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  let items = (data ?? []) as unknown as Row[];
  if (R.rank) {
    const { column, values } = R.rank;
    const rank = (r: Row) => {
      const i = values.indexOf(String(r[column]));
      return i === -1 ? values.length : i;
    };
    items = [...items].sort((a, b) => rank(a) - rank(b));
  }
  if (R.table === 'campaigns') {
    items = items.map((c) => ({ ...c, status: campaignStatus({ start_date: String(c.start_date), end_date: (c.end_date as string | null) ?? null }) }));
  }
  return items;
}
