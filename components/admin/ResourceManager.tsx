'use client';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Plus, Pencil, Trash2, Search, Loader2, Check, X, Inbox, Film, Images } from 'lucide-react';
import { api, PageHead, Drawer, Toggle, ImageField, ImagesField, VideoField, Toast, Empty, type ToastMsg } from './ui';
import { fmtDate, parseList } from '@/lib/utils';
import type { Field, ResourceConfig, ResourceName } from '@/lib/resources';
import { useDialog } from '@/components/site/Dialog';

type Value = string | number | boolean | string[] | null | undefined;
type Item = { id?: number } & Record<string, Value>;

function blank(config: ResourceConfig): Item {
  return Object.fromEntries(config.fields.map((f) => [f.name, f.default ?? (f.type === 'bool' ? false : f.type === 'images' ? [] : '')]));
}

function Cell({ field, value }: { field?: Field; value: Value }) {
  if (!field) return value ? <span className={`abadge s-${String(value)}`}>{String(value)}</span> : <span />;
  if (field.type === 'image') return value ? <img className="athumb" src={String(value)} alt="" /> : <span className="athumb empty" />;
  if (field.type === 'images') {
    const n = parseList(value).length;
    return n ? <span className="abadge"><Images size={13} />{n}</span> : <span className="amuted">—</span>;
  }
  if (field.type === 'video') return value ? <span className="abadge green"><Film size={13} />Video</span> : <span className="amuted">—</span>;
  if (field.type === 'bool') return value ? <span className="abadge green"><Check size={13} />Yes</span> : <span className="abadge"><X size={13} />No</span>;
  if (field.type === 'date') return <span>{fmtDate(typeof value === 'string' ? value : null)}</span>;
  if (field.type === 'select') return <span className={`abadge s-${String(value)}`}>{String(value ?? '')}</span>;
  return <span className="aclamp">{value == null ? '' : String(value)}</span>;
}

function FieldInput({ f, value, onChange, folder }: { f: Field; value: Value; onChange: (v: Value) => void; folder: string }) {
  const text = value == null ? '' : String(value);
  const common = { className: 'ainput', value: text, placeholder: f.placeholder };
  switch (f.type) {
    case 'textarea': return <textarea {...common} rows={4} onChange={(e) => onChange(e.target.value)} />;
    case 'longtext': return <textarea {...common} rows={10} placeholder="Separate paragraphs with a blank line" onChange={(e) => onChange(e.target.value)} />;
    case 'number': return <input {...common} type="number" onChange={(e) => onChange(e.target.value)} />;
    case 'date': return <input {...common} type="date" onChange={(e) => onChange(e.target.value)} />;
    case 'select':
      return <select {...common} onChange={(e) => onChange(e.target.value)}>{(f.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}</select>;
    case 'bool': return <Toggle checked={Boolean(value)} onChange={(v) => onChange(v)} label={value ? 'Yes' : 'No'} />;
    case 'image': return <ImageField value={text} onChange={onChange} folder={folder} />;
    case 'images': return <ImagesField value={value} onChange={onChange} folder={folder} />;
    case 'video': return <VideoField value={text} onChange={onChange} folder={folder} />;
    default: return <input {...common} type="text" onChange={(e) => onChange(e.target.value)} />;
  }
}

export default function ResourceManager({ name, config }: { name: ResourceName; config: ResourceConfig }) {
  const [items, setItems] = useState<Item[] | null>(null);
  const [q, setQ] = useState('');
  const [edit, setEdit] = useState<Item | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [toast, setToast] = useState<ToastMsg>(null);
  const { ask } = useDialog();
  const fieldMap = useMemo(() => Object.fromEntries(config.fields.map((f) => [f.name, f])) as Record<string, Field | undefined>, [config]);

  const load = useCallback(() => api<{ items: Item[] }>(`/api/admin/r/${name}`).then((d) => setItems(d.items)), [name]);
  useEffect(() => { void load(); }, [load]);

  const list = useMemo(() => {
    if (!items) return [];
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((it) => config.fields.some((f) => ['text', 'textarea'].includes(f.type) && String(it[f.name] ?? '').toLowerCase().includes(s)));
  }, [items, q, config]);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!edit) return;
    setBusy(true); setErr('');
    try {
      const { id, ...values } = edit;
      if (id) await api(`/api/admin/r/${name}/${id}`, { method: 'PUT', body: values });
      else await api(`/api/admin/r/${name}`, { method: 'POST', body: values });
      setEdit(null);
      setToast({ text: `${config.singular} ${id ? 'updated' : 'added'}`, type: 'ok' });
      void load();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : String(ex));
    } finally {
      setBusy(false);
    }
  }

  async function remove(it: Item) {
    const what = config.singular.toLowerCase();
    const yes = await ask({
      title: `Delete this ${what}?`,
      message: <><b>{titleOf(it)}</b> will be removed from the website permanently. This cannot be undone.</>,
      confirmText: `Delete ${what}`, cancelText: 'Keep it', icon: Trash2,
    });
    if (!yes) return;
    try {
      await api(`/api/admin/r/${name}/${it.id}`, { method: 'DELETE' });
      setToast({ text: `${config.singular} deleted`, type: 'ok' });
      void load();
    } catch (ex) {
      setToast({ text: ex instanceof Error ? ex.message : 'Could not delete', type: 'err' });
    }
  }

  const titleOf = (it: Item) => String(it.title_en || it.name_en || it.name || it.title || it.caption || `#${it.id ?? ''}`);
  const openEditor = (it?: Item) => { setErr(''); setEdit(it ? { ...blank(config), ...it } : blank(config)); };

  return (
    <>
      <PageHead title={config.label} sub={config.hint || `Add, edit and remove ${config.label.toLowerCase()} shown on the website.`}>
        <button className="abtn abtn-primary" onClick={() => openEditor()}><Plus size={17} />Add {config.singular.toLowerCase()}</button>
      </PageHead>

      <section className="acard flush">
        <div className="atoolbar">
          <div className="ainput-icon search"><Search size={16} /><input className="ainput" placeholder={`Search ${config.label.toLowerCase()}…`} value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <span className="amuted">{items ? `${list.length} of ${items.length}` : ''}</span>
        </div>
        {!items ? <div className="adm-pad"><Loader2 className="spin" /></div> : list.length === 0 ? (
          <Empty icon={Inbox} text={items.length ? 'No matches for your search.' : `No ${config.label.toLowerCase()} yet.`}>
            {!items.length && <button className="abtn abtn-primary" onClick={() => openEditor()}><Plus size={16} />Add the first one</button>}
          </Empty>
        ) : (
          <div className="atable-wrap">
            <table className="atable">
              <thead><tr>{config.columns.map((c) => <th key={c}>{fieldMap[c]?.label.replace(' (English)', '') || c}</th>)}<th className="right">Actions</th></tr></thead>
              <tbody>
                {list.map((it) => (
                  <tr key={it.id} onDoubleClick={() => openEditor(it)}>
                    {config.columns.map((c) => <td key={c} data-label={fieldMap[c]?.label}><Cell field={fieldMap[c]} value={it[c]} /></td>)}
                    <td className="right nowrap">
                      <button className="aicon" title="Edit" onClick={() => openEditor(it)}><Pencil size={16} /></button>
                      <button className="aicon danger" title="Delete" onClick={() => remove(it)}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Drawer
        open={!!edit}
        title={edit?.id ? `Edit ${config.singular.toLowerCase()}: ${titleOf(edit)}` : `New ${config.singular.toLowerCase()}`}
        onClose={() => setEdit(null)}
        footer={<>
          {err && <span className="adm-err">{err}</span>}
          <button className="abtn abtn-soft" onClick={() => setEdit(null)}>Cancel</button>
          <button className="abtn abtn-primary" form="res-form" disabled={busy}>{busy ? <Loader2 className="spin" size={16} /> : <Check size={16} />}Save</button>
        </>}
      >
        {edit && (
          <form id="res-form" className="aform" onSubmit={save}>
            {config.fields.map((f) => {
              const Tag = ['image', 'images', 'video', 'bool'].includes(f.type) ? 'div' : 'label';
              const wide = ['image', 'images', 'video', 'longtext', 'bool'].includes(f.type) || !/_(en|kn)$/.test(f.name);
              return (
                <Tag key={f.name} className={`afield ${wide ? 'full' : ''} ${f.name.endsWith('_kn') ? 'kn' : ''}`}>
                  <span>{f.label}{f.required && <em>*</em>}</span>
                  <FieldInput f={f} value={edit[f.name]} folder={name} onChange={(v) => setEdit((x) => (x ? { ...x, [f.name]: v } : x))} />
                </Tag>
              );
            })}
          </form>
        )}
      </Drawer>
      <Toast msg={toast} onDone={() => setToast(null)} />
    </>
  );
}
