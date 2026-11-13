'use client';
import { useEffect, useState, type ChangeEvent, type ReactNode } from 'react';
import { X, Loader2, Upload, ImageOff, ImagePlus, ArrowLeft, ArrowRight, Film, Link2, type LucideIcon } from 'lucide-react';
import { parseList, videoEmbed } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { BUCKETS, checkFile, objectPath, LIMITS, type UploadKind } from '@/lib/storage';
import { useDialog } from '@/components/site/Dialog';

type ApiOptions = Omit<RequestInit, 'body'> & { body?: unknown };

/** Calls an admin API route. Redirects to the login page when the session has expired. */
export async function api<T = Record<string, unknown>>(url: string, opts: ApiOptions = {}): Promise<T> {
  const isForm = opts.body instanceof FormData;
  const r = await fetch(url, {
    ...opts,
    headers: opts.body && !isForm ? { 'Content-Type': 'application/json' } : undefined,
    body: opts.body === undefined ? undefined : isForm ? (opts.body as FormData) : JSON.stringify(opts.body),
  });
  const d = (await r.json().catch(() => ({}))) as T & { error?: string };
  if (r.status === 401) {
    window.location.href = '/admin/login';
    throw new Error('Session expired');
  }
  if (!r.ok) throw new Error(d.error || 'Something went wrong');
  return d;
}

/**
 * Uploads a file straight from the browser to Supabase Storage (bucket "media").
 * The storage policy only lets signed-in admins write there.
 */
export async function uploadMedia(file: File, kind: UploadKind, folder = 'uploads'): Promise<string> {
  const ext = checkFile(file, kind, kind === 'video' ? LIMITS.videoMB : LIMITS.imageMB);
  const supabase = createClient();
  const path = objectPath(kind === 'video' ? `video/${folder}` : folder, ext);
  const { error } = await supabase.storage.from(BUCKETS.media).upload(path, file, {
    contentType: file.type, cacheControl: '31536000', upsert: false,
  });
  if (error) throw new Error(error.message.includes('row-level security') ? 'Only admins can upload files. Please log in again.' : error.message);
  return supabase.storage.from(BUCKETS.media).getPublicUrl(path).data.publicUrl;
}

export function PageHead({ title, sub, children }: { title: string; sub?: string; children?: ReactNode }) {
  return (
    <div className="adm-head">
      <div><h1>{title}</h1>{sub && <p>{sub}</p>}</div>
      {children && <div className="adm-head-actions">{children}</div>}
    </div>
  );
}

export function Drawer({ open, title, onClose, children, footer }: {
  open: boolean; title: string; onClose: () => void; children?: ReactNode; footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open, onClose]);
  return (
    <div className={`adm-drawer ${open ? 'open' : ''}`} aria-hidden={!open}>
      <div className="adm-drawer-bg" onClick={onClose} />
      <section className="adm-drawer-panel" role="dialog" aria-modal="true" aria-label={title}>
        <header><h2>{title}</h2><button onClick={onClose} aria-label="Close"><X size={20} /></button></header>
        <div className="adm-drawer-body">{open && children}</div>
        {footer && <footer>{footer}</footer>}
      </section>
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <label className="adm-toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="adm-toggle-track"><i /></span>
      {label && <span>{label}</span>}
    </label>
  );
}

const errorText = (e: unknown) => (e instanceof Error ? e.message : String(e));

export function ImageField({ value, onChange, folder }: { value: string | null | undefined; onChange: (v: string) => void; folder?: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  async function upload(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    setBusy(true); setErr('');
    try { onChange(await uploadMedia(f, 'image', folder)); } catch (ex) { setErr(errorText(ex)); } finally { setBusy(false); }
  }
  return (
    <div className="adm-image-field">
      <div className="adm-image-preview">{value ? <img src={value} alt="" /> : <ImageOff size={26} />}</div>
      <div className="adm-image-side">
        <label className="abtn abtn-soft">
          {busy ? <Loader2 className="spin" size={16} /> : <Upload size={16} />}{value ? 'Replace image' : 'Upload image'}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={upload} disabled={busy} />
        </label>
        <input className="ainput" placeholder="…or paste an image URL" value={value || ''} onChange={(e) => onChange(e.target.value)} />
        {value && <button type="button" className="alink danger" onClick={() => onChange('')}>Remove</button>}
        {err && <small className="adm-err">{err}</small>}
      </div>
    </div>
  );
}

/** Several photos at once; shown as a slider on the website. */
export function ImagesField({ value, onChange, folder }: { value: unknown; onChange: (v: string[]) => void; folder?: string }) {
  const list = parseList(value);
  const [busy, setBusy] = useState(0);
  const [err, setErr] = useState('');
  const [url, setUrl] = useState('');
  async function upload(e: ChangeEvent<HTMLInputElement>) {
    const files = [...(e.target.files ?? [])];
    e.target.value = '';
    if (!files.length) return;
    setErr(''); setBusy(files.length);
    const added: string[] = [];
    for (const f of files) {
      try { added.push(await uploadMedia(f, 'image', folder)); } catch (ex) { setErr(`${f.name}: ${errorText(ex)}`); }
      setBusy((n) => n - 1);
    }
    onChange([...list, ...added]);
  }
  const move = (i: number, d: number) => {
    const a = [...list];
    [a[i], a[i + d]] = [a[i + d], a[i]];
    onChange(a);
  };
  return (
    <div className="adm-images">
      <div className="adm-images-grid">
        {list.map((src, i) => (
          <figure key={src + i}>
            <img src={src} alt="" />
            <span className="adm-images-no">{i + 1}</span>
            <div className="adm-images-tools">
              {i > 0 && <button type="button" onClick={() => move(i, -1)} title="Move left"><ArrowLeft size={14} /></button>}
              {i < list.length - 1 && <button type="button" onClick={() => move(i, 1)} title="Move right"><ArrowRight size={14} /></button>}
              <button type="button" className="danger" onClick={() => onChange(list.filter((_, k) => k !== i))} title="Remove"><X size={14} /></button>
            </div>
          </figure>
        ))}
        <label className="adm-images-add">
          {busy ? <><Loader2 className="spin" size={22} /><small>Uploading {busy}…</small></> : <><ImagePlus size={24} /><small>Add photos</small></>}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple hidden onChange={upload} disabled={!!busy} />
        </label>
      </div>
      <div className="adm-images-url">
        <input className="ainput" placeholder="…or paste an image URL and press Add" value={url} onChange={(e) => setUrl(e.target.value)} />
        <button type="button" className="abtn abtn-soft" disabled={!url.trim()} onClick={() => { onChange([...list, url.trim()]); setUrl(''); }}>Add</button>
      </div>
      <small className="amuted">You can select many photos at once. {list.length ? `${list.length} photo${list.length > 1 ? 's' : ''} added.` : ''}</small>
      {err && <small className="adm-err">{err}</small>}
    </div>
  );
}

/** Upload an MP4 or paste a YouTube / Vimeo link. */
export function VideoField({ value, onChange, folder }: { value: string | null | undefined; onChange: (v: string) => void; folder?: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const v = videoEmbed(value);
  async function upload(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    setBusy(true); setErr('');
    try { onChange(await uploadMedia(f, 'video', folder)); } catch (ex) { setErr(errorText(ex)); } finally { setBusy(false); }
  }
  return (
    <div className="adm-image-field">
      <div className="adm-image-preview video">
        {!value || !v ? <Film size={26} /> : v.kind === 'file' ? <video src={value} muted controls preload="metadata" /> : v.thumb ? <img src={v.thumb} alt="" /> : <Link2 size={26} />}
      </div>
      <div className="adm-image-side">
        <label className="abtn abtn-soft">
          {busy ? <Loader2 className="spin" size={16} /> : <Upload size={16} />}{busy ? 'Uploading…' : value ? 'Replace video' : `Upload video (MP4, max ${LIMITS.videoMB} MB)`}
          <input type="file" accept="video/mp4,video/webm,video/quicktime" hidden onChange={upload} disabled={busy} />
        </label>
        <input className="ainput" placeholder="…or paste a YouTube link" value={value || ''} onChange={(e) => onChange(e.target.value)} />
        {value && <button type="button" className="alink danger" onClick={() => onChange('')}>Remove video</button>}
        {err && <small className="adm-err">{err}</small>}
      </div>
    </div>
  );
}

export type ToastMsg = { text: string; type?: 'ok' | 'err' } | null;

/** Shows `msg` as a notification (shared with the website's pop-up system), then clears it. */
export function Toast({ msg, onDone }: { msg: ToastMsg; onDone: () => void }) {
  const { notify } = useDialog();
  useEffect(() => {
    if (!msg) return;
    notify(msg.text, msg.type === 'err' ? 'error' : 'success');
    onDone();
  }, [msg, onDone, notify]);
  return null;
}

export function Empty({ icon: I, text, children }: { icon?: LucideIcon; text: string; children?: ReactNode }) {
  return <div className="adm-empty">{I && <I size={34} />}<p>{text}</p>{children}</div>;
}
