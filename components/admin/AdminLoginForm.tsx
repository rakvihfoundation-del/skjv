'use client';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginForm({ prefill }: { prefill: { email: string; password: string } | null }) {
  const router = useRouter();
  const [f, setF] = useState({ email: prefill?.email || '', password: prefill?.password || '' });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setErr('');
    const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
    const d = (await r.json()) as { error?: string };
    setBusy(false);
    if (!r.ok) return setErr(d.error || 'Could not log in');
    window.location.href = '/admin';
  }
  return (
    <div className="adm-login">
      <div className="adm-login-art">
        <img src="/images/logo.webp" alt="" />
        <h2 className="kn-font">ಸುವರ್ಣ ಕರ್ನಾಟಕ ಜನಶಕ್ತಿ ವೇದಿಕೆ</h2>
        <p>Administration console</p>
      </div>
      <form className="adm-login-card" onSubmit={submit}>
        <h1>Welcome back</h1>
        <p className="amuted">{prefill ? 'Credentials are filled in — just click Sign in.' : 'Sign in to manage members, content and donations.'}</p>
        <label className="afield"><span>Email</span>
          <div className="ainput-icon"><Mail size={17} /><input className="ainput" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required autoComplete="username" /></div>
        </label>
        <label className="afield"><span>Password</span>
          <div className="ainput-icon has-eye">
            <Lock size={17} />
            <input className="ainput" type={show ? 'text' : 'password'} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required autoComplete="current-password" />
            <button type="button" className="aeye" onClick={() => setShow((v) => !v)} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show} title={show ? 'Hide password' : 'Show password'}>
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>
        {err && <p className="adm-err box">{err}</p>}
        <button className="abtn abtn-primary abtn-lg" disabled={busy} autoFocus={!!prefill}>{busy ? <Loader2 className="spin" size={18} /> : null}Sign in<ArrowRight size={18} /></button>
      </form>
    </div>
  );
}
