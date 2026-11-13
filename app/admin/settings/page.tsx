'use client';
import type { Settings as SettingsMap } from '@/lib/types';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Check, Loader2, IdCard, Phone, Share2, BarChart3, RotateCcw, HeartHandshake, type LucideIcon } from 'lucide-react';
import { api, PageHead, Toast, ImageField, type ToastMsg } from '@/components/admin/ui';
import { SETTINGS_FIELDS, SETTINGS_KEYS, type SettingsGroup } from '@/lib/resources';

const ICONS: Record<SettingsGroup['icon'], LucideIcon> = { membership: IdCard, contact: Phone, social: Share2, numbers: BarChart3, trust: HeartHandshake };

export default function Settings() {
  const [saved, setSaved] = useState<SettingsMap | null>(null);
  const [s, setS] = useState<SettingsMap | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<ToastMsg>(null);

  useEffect(() => {
    void api<{ settings: SettingsMap }>('/api/admin/settings').then((d) => { setSaved(d.settings); setS(d.settings); });
  }, []);

  const changed = useMemo(
    () => (s && saved ? SETTINGS_KEYS.filter((k) => (s[k] ?? '') !== (saved[k] ?? '')).length : 0),
    [s, saved],
  );

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!s || !changed) return;
    setBusy(true);
    try {
      const d = await api<{ settings: SettingsMap }>('/api/admin/settings', { method: 'PUT', body: s });
      setSaved(d.settings); setS(d.settings);
      setToast({ text: 'Settings saved. The website now shows the new details.', type: 'ok' });
    } catch (ex) {
      setToast({ text: ex instanceof Error ? ex.message : String(ex), type: 'err' });
    } finally {
      setBusy(false);
    }
  }

  if (!s) return <div className="adm-pad"><Loader2 className="spin" /></div>;

  return (
    <>
      <PageHead title="Settings" sub="Membership fee, contact details, social links and home-page numbers shown on the website." />
      <form onSubmit={save} className="aset">
        {SETTINGS_FIELDS.map((g) => {
          const I = ICONS[g.icon];
          return (
            <section key={g.group} className="acard aset-group">
              <header className="aset-head">
                <span className="aset-icon"><I size={20} /></span>
                <div><h3>{g.group}</h3><p>{g.desc}</p></div>
              </header>
              <div className="aset-grid">
                {g.fields.map((f) => {
                  const dirty = (s[f.name] ?? '') !== (saved?.[f.name] ?? '');
                  if (f.type === 'image') {
                    return (
                      <div key={f.name} className={`afield span-${f.span ?? 2} ${dirty ? 'dirty' : ''}`}>
                        <span>{f.label}</span>
                        <ImageField value={s[f.name] ?? ''} folder="trust" onChange={(v) => setS({ ...s, [f.name]: v })} />
                        {f.hint && <small className="aset-hint">{f.hint}</small>}
                      </div>
                    );
                  }
                  return (
                    <label key={f.name} className={`afield span-${f.span ?? 2} ${f.name.endsWith('_kn') ? 'kn' : ''} ${dirty ? 'dirty' : ''}`}>
                      <span>{f.label}</span>
                      {f.type === 'textarea' ? (
                        <textarea className="ainput" rows={3} placeholder={f.placeholder} value={s[f.name] ?? ''} onChange={(e) => setS({ ...s, [f.name]: e.target.value })} />
                      ) : (
                        <input
                          className="ainput" type={f.type === 'number' ? 'number' : 'text'} inputMode={f.type === 'number' ? 'numeric' : undefined}
                          min={f.type === 'number' ? 0 : undefined} placeholder={f.placeholder} value={s[f.name] ?? ''}
                          onChange={(e) => setS({ ...s, [f.name]: e.target.value })}
                          onWheel={(e) => (e.target as HTMLInputElement).blur()}
                        />
                      )}
                      {f.hint && <small className="aset-hint">{f.hint}</small>}
                    </label>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* Appears only while there are unsaved changes */}
        {(changed > 0 || busy) && (
          <div className="aset-bar" role="region" aria-label="Unsaved changes">
            <span className="aset-status"><i className="aset-dot" />{changed} unsaved change{changed === 1 ? '' : 's'}</span>
            <div className="aset-actions">
              <button type="button" className="abtn abtn-soft" onClick={() => setS(saved)} disabled={busy}><RotateCcw size={16} />Discard</button>
              <button className="abtn abtn-primary" disabled={busy}>
                {busy ? <Loader2 className="spin" size={17} /> : <Check size={17} />}Save settings
              </button>
            </div>
          </div>
        )}
      </form>
      <Toast msg={toast} onDone={() => setToast(null)} />
    </>
  );
}
