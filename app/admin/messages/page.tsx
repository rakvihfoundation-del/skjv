'use client';
import type { Tables } from '@/lib/supabase/database.types';

type Message = Tables<'messages'>;
import { useCallback, useEffect, useState } from 'react';
import { Mail, MailOpen, Trash2, Reply, Phone, Download, Loader2 } from 'lucide-react';
import { api, PageHead, Empty } from '@/components/admin/ui';
import { useDialog } from '@/components/site/Dialog';
import { fmtDate } from '@/lib/utils';

export default function Messages() {
  const [items, setItems] = useState<Message[] | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const { ask, notify } = useDialog();
  const load = useCallback(() => api<{ items: Message[] }>('/api/admin/messages').then((d) => setItems(d.items)), []);
  useEffect(() => { void load(); }, [load]);

  async function view(m: Message) {
    setOpen(open === m.id ? null : m.id);
    if (!m.is_read) { await api(`/api/admin/messages/${m.id}`, { method: 'PATCH', body: { is_read: true } }); void load(); }
  }
  async function remove(m: Message) {
    const yes = await ask({
      title: 'Delete this message?',
      message: <>The message from <b>{m.name}</b> will be removed permanently.</>,
      confirmText: 'Delete message', cancelText: 'Keep it', icon: Trash2,
    });
    if (!yes) return;
    try {
      await api(`/api/admin/messages/${m.id}`, { method: 'DELETE' });
      notify('Message deleted');
      void load();
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Could not delete', 'error');
    }
  }
  return (
    <>
      <PageHead title="Messages" sub="Enquiries sent through the contact form on the About page.">
        <a className="abtn abtn-soft" href="/api/admin/export/messages"><Download size={16} />Export CSV</a>
      </PageHead>
      {!items ? <Loader2 className="spin" /> : items.length === 0 ? <section className="acard"><Empty icon={Mail} text="No messages yet." /></section> : (
        <div className="amsgs">
          {items.map((m) => (
            <article key={m.id} className={`amsg ${m.is_read ? '' : 'unread'} ${open === m.id ? 'open' : ''}`}>
              <button className="amsg-head" onClick={() => view(m)}>
                {m.is_read ? <MailOpen size={18} /> : <Mail size={18} />}
                <b>{m.name}</b>
                <span className="aclamp">{m.subject || m.message}</span>
                <small>{fmtDate(m.created_at)}</small>
              </button>
              {open === m.id && (
                <div className="amsg-body">
                  <p>{m.message}</p>
                  <div className="amsg-actions">
                    {m.email && <a className="abtn abtn-primary abtn-sm" href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || 'Your message')}`}><Reply size={15} />Reply by email</a>}
                    {m.phone && <a className="abtn abtn-soft abtn-sm" href={`tel:${m.phone}`}><Phone size={15} />{m.phone}</a>}
                    <button className="abtn abtn-soft abtn-sm danger" onClick={() => remove(m)}><Trash2 size={15} />Delete</button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
