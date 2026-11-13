'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { TriangleAlert, CircleHelp, CheckCircle2, XCircle, Info, X, type LucideIcon } from 'lucide-react';

export type ConfirmOptions = {
  title: string;
  message?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  /** "danger" for delete / cancel actions (red button), "primary" otherwise. */
  tone?: 'danger' | 'primary';
  icon?: LucideIcon;
  /** Small print shown under the buttons (e.g. a disclaimer). */
  note?: ReactNode;
};
export type NoticeType = 'success' | 'error' | 'info';

type DialogApi = {
  /** Shows a confirmation pop-up; resolves true when the user confirms. */
  ask: (o: ConfirmOptions) => Promise<boolean>;
  /** Shows a short notification at the corner of the screen. */
  notify: (text: string, type?: NoticeType) => void;
};

const Ctx = createContext<DialogApi | null>(null);

export function useDialog(): DialogApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useDialog must be used inside <DialogProvider>');
  return ctx;
}

type Pending = ConfirmOptions & { resolve: (v: boolean) => void };
type Notice = { id: number; text: string; type: NoticeType; leaving?: boolean };

const NOTICE_ICON: Record<NoticeType, LucideIcon> = { success: CheckCircle2, error: XCircle, info: Info };

export function DialogProvider({ children, variant = 'site', labels }: {
  children: ReactNode;
  variant?: 'site' | 'admin';
  labels: { confirm: string; cancel: string; close: string };
}) {
  const [pending, setPending] = useState<Pending | null>(null);
  const [closing, setClosing] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [mounted, setMounted] = useState(false);
  const cancelBtn = useRef<HTMLButtonElement>(null);
  const confirmBtn = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const seq = useRef(0);

  useEffect(() => setMounted(true), []);

  const ask = useCallback((o: ConfirmOptions) => new Promise<boolean>((resolve) => {
    lastFocus.current = document.activeElement as HTMLElement | null;
    setClosing(false);
    setPending({ ...o, resolve });
  }), []);

  const finish = useCallback((value: boolean) => {
    setClosing(true);
    setTimeout(() => {
      setPending((p) => { p?.resolve(value); return null; });
      setClosing(false);
      lastFocus.current?.focus?.();
    }, 160);
  }, []);

  const notify = useCallback((text: string, type: NoticeType = 'success') => {
    const id = ++seq.current;
    setNotices((n) => [...n.slice(-2), { id, text, type }]);
    setTimeout(() => setNotices((n) => n.map((x) => (x.id === id ? { ...x, leaving: true } : x))), 3200);
    setTimeout(() => setNotices((n) => n.filter((x) => x.id !== id)), 3500);
  }, []);

  // Keyboard, focus and scroll lock while the pop-up is open.
  useEffect(() => {
    if (!pending) return;
    const danger = (pending.tone ?? 'danger') === 'danger';
    (danger ? cancelBtn : confirmBtn).current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); finish(false); }
      if (e.key === 'Tab') {
        const order = [cancelBtn.current, confirmBtn.current].filter(Boolean) as HTMLElement[];
        const i = order.indexOf(document.activeElement as HTMLElement);
        e.preventDefault();
        order[(i + (e.shiftKey ? order.length - 1 : 1)) % order.length]?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [pending, finish]);

  const tone = pending?.tone ?? 'danger';
  const Icon = pending?.icon ?? (tone === 'danger' ? TriangleAlert : CircleHelp);

  return (
    <Ctx.Provider value={{ ask, notify }}>
      {children}
      {mounted && createPortal(
        <div className={`dlg-root dlg-${variant}`}>
          {pending && (
            <div className={`dlg-layer ${closing ? 'out' : ''}`}>
              <div className="dlg-backdrop" onClick={() => finish(false)} />
              <div className={`dlg-box tone-${tone}`} role="alertdialog" aria-modal="true" aria-labelledby="dlg-title" aria-describedby="dlg-msg">
                <button type="button" className="dlg-x" onClick={() => finish(false)} aria-label={labels.close}><X size={18} /></button>
                <span className="dlg-icon"><Icon size={26} /></span>
                <h2 id="dlg-title">{pending.title}</h2>
                {pending.message && <div id="dlg-msg" className="dlg-msg">{pending.message}</div>}
                <div className="dlg-actions">
                  <button ref={cancelBtn} type="button" className="dlg-btn ghost" onClick={() => finish(false)}>{pending.cancelText || labels.cancel}</button>
                  <button ref={confirmBtn} type="button" className={`dlg-btn ${tone}`} onClick={() => finish(true)}>{pending.confirmText || labels.confirm}</button>
                </div>
                {pending.note && <p className="dlg-note"><Info size={15} /><span>{pending.note}</span></p>}
              </div>
            </div>
          )}
          <div className="dlg-notices" aria-live="polite">
            {notices.map((n) => {
              const I = NOTICE_ICON[n.type];
              return (
                <div key={n.id} className={`dlg-notice ${n.type} ${n.leaving ? 'out' : ''}`} role={n.type === 'error' ? 'alert' : 'status'}>
                  <I size={20} /><span>{n.text}</span>
                  <button type="button" onClick={() => setNotices((x) => x.filter((y) => y.id !== n.id))} aria-label={labels.close}><X size={15} /></button>
                </div>
              );
            })}
          </div>
        </div>,
        document.body,
      )}
    </Ctx.Provider>
  );
}
