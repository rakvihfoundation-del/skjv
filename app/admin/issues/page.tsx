'use client';
import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle, Trash2, Loader2, MapPin, Eye, Phone, Calendar, Image as ImageIcon, Film, FileText, Download,
} from 'lucide-react';
import { api, PageHead, Empty } from '@/components/admin/ui';
import { useDialog } from '@/components/site/Dialog';
import { fmtDate } from '@/lib/utils';
import type { IssueItem } from '@/lib/sample-issues';

const STATUSES = ['open', 'in_progress', 'resolved', 'closed'] as const;
const STATUS_LABEL: Record<string, string> = {
  open: '🔴 Open',
  in_progress: '🟡 In Progress',
  resolved: '🟢 Resolved',
  closed: '⚫ Closed',
};

export default function AdminIssues() {
  const [items, setItems] = useState<IssueItem[] | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [filter, setFilter] = useState('all');
  const { ask, notify } = useDialog();

  const load = useCallback(() => {
    api<{ items: IssueItem[] }>('/api/admin/issues')
      .then((d) => setItems(d.items))
      .catch((err) => {
        console.error('Failed to load admin issues:', err);
      });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function remove(issue: IssueItem) {
    const yes = await ask({
      title: 'Delete this issue?',
      message: (
        <>
          The issue reported by <b>{issue.author_name}</b> from <b>{issue.city}</b> will be permanently removed.
        </>
      ),
      confirmText: 'Delete',
      cancelText: 'Keep it',
      icon: Trash2,
    });
    if (!yes) return;

    try {
      await api(`/api/admin/issues/${issue.id}`, { method: 'DELETE' });
      notify('Issue deleted successfully');
      setItems((prev) => (prev ? prev.filter((i) => i.id !== issue.id) : []));
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Could not delete', 'error');
    }
  }

  async function updateStatus(issue: IssueItem, status: string) {
    try {
      await api(`/api/admin/issues/${issue.id}`, { method: 'PATCH', body: { status } });
      notify(`Status updated to ${status}`);
      setItems((prev) =>
        prev
          ? prev.map((i) =>
              i.id === issue.id ? { ...i, status: status as IssueItem['status'] } : i
            )
          : []
      );
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Could not update status', 'error');
    }
  }

  const filtered = items?.filter((i) => filter === 'all' || i.status === filter) ?? [];

  return (
    <>
      <PageHead title="Issues" sub="Problems reported by citizens, members and volunteers from various cities and towns.">
        <select
          className="ainput"
          style={{ width: 'auto', minWidth: 160 }}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Issues ({items?.length ?? 0})</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]} ({items?.filter((i) => i.status === s).length ?? 0})
            </option>
          ))}
        </select>
      </PageHead>

      {!items ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <Loader2 className="spin" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <section className="acard">
          <Empty icon={AlertTriangle} text="No issues found matching the selected filter." />
        </section>
      ) : (
        <div className="admin-issues-list">
          {filtered.map((issue) => (
            <article
              key={issue.id}
              className={`admin-issue-card ${open === issue.id ? 'expanded' : ''}`}
            >
              {/* Header row */}
              <button
                type="button"
                className="admin-issue-head"
                onClick={() => setOpen(open === issue.id ? null : issue.id)}
              >
                <AlertTriangle size={18} style={{ color: 'var(--fire, #e65100)', flexShrink: 0 }} />
                <b style={{ minWidth: 120 }}>{issue.author_name}</b>
                <span className="admin-issue-city">
                  <MapPin size={13} /> {issue.city}
                </span>

                <span className={`admin-issue-status s-${issue.status}`}>
                  {STATUS_LABEL[issue.status] || issue.status}
                </span>

                {(issue.images && issue.images.length > 0) && (
                  <span style={{ fontSize: '.78rem', color: 'var(--amuted, #888)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <ImageIcon size={13} /> {issue.images.length}
                  </span>
                )}
                {issue.video && (
                  <span style={{ fontSize: '.78rem', color: 'var(--amuted, #888)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <Film size={13} /> 1
                  </span>
                )}
                {issue.pdf && (
                  <span style={{ fontSize: '.76rem', color: '#2563eb', background: 'rgba(37,99,235,0.08)', padding: '2px 6px', borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 3, fontWeight: 600 }}>
                    <FileText size={12} /> PDF Evidence
                  </span>
                )}

                <small style={{ marginLeft: 'auto' }}>{fmtDate(issue.created_at)}</small>
                <Eye size={16} style={{ color: 'var(--amuted, #888)', flexShrink: 0 }} />
              </button>

              {/* Expanded details */}
              {open === issue.id && (
                <div className="admin-issue-body">
                  <div className="admin-issue-meta">
                    {issue.author_phone && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Phone size={13} /> <b>Phone:</b> <a href={`tel:${issue.author_phone}`}>{issue.author_phone}</a>
                      </span>
                    )}
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={13} /> <b>Reported on:</b> {fmtDate(issue.created_at)}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={13} /> <b>Location:</b> {issue.city}
                    </span>
                  </div>

                  <div className="admin-issue-desc">
                    <strong>Issue Description:</strong>
                    <p style={{ marginTop: 4 }}>{issue.description}</p>
                  </div>

                  {issue.needs && (
                    <div className="admin-issue-desc" style={{ background: 'rgba(230,81,0,0.05)', padding: 10, borderRadius: 8 }}>
                      <strong style={{ color: 'var(--fire, #e65100)' }}>Action / Needs Required:</strong>
                      <p style={{ marginTop: 4, margin: 0 }}>{issue.needs}</p>
                    </div>
                  )}

                  {/* Images */}
                  {issue.images && issue.images.length > 0 && (
                    <div className="admin-issue-media" style={{ marginTop: 12 }}>
                      <strong>Attached Images ({issue.images.length}):</strong>
                      <div className="admin-issue-imgs" style={{ marginTop: 6 }}>
                        {issue.images.map((src, i) => (
                          <a
                            key={i}
                            href={src}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="admin-issue-thumb"
                            title="Click to view full image"
                          >
                            <img src={src} alt={`Issue photo ${i + 1}`} />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Video */}
                  {issue.video && (
                    <div className="admin-issue-media" style={{ marginTop: 12 }}>
                      <strong>Attached Video:</strong>
                      <video
                        src={issue.video}
                        controls
                        preload="metadata"
                        style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8, marginTop: 6, display: 'block' }}
                      />
                    </div>
                  )}

                  {/* PDF Document - Download option alone */}
                  {issue.pdf && (
                    <div className="admin-issue-media" style={{ marginTop: 12 }}>
                      <strong>Attached Photo Evidence PDF:</strong>
                      <div style={{ marginTop: 8 }}>
                        <a
                          href={issue.pdf}
                          download={`issue-${issue.id}-photo-evidence.pdf`}
                          className="abtn abtn-primary"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', fontSize: '.9rem' }}
                          title="Download photo evidence PDF document"
                        >
                          <Download size={17} /> Download Photo Evidence PDF
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="admin-issue-actions" style={{ marginTop: 16 }}>
                    <label>
                      <span>Update Status:</span>
                      <select
                        className="ainput"
                        style={{ width: 'auto', marginLeft: 8 }}
                        value={issue.status}
                        onChange={(e) => updateStatus(issue, e.target.value)}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABEL[s]}
                          </option>
                        ))}
                      </select>
                    </label>

                    <button
                      type="button"
                      className="abtn abtn-soft danger"
                      style={{ marginLeft: 'auto' }}
                      onClick={() => remove(issue)}
                    >
                      <Trash2 size={15} /> Delete Issue
                    </button>
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
