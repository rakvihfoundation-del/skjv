// Shown instead of the site until Supabase is connected (.env.local).
export default function SetupNotice() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: 'var(--cream)' }}>
      <div style={{ maxWidth: 560, padding: 32, borderRadius: 22, background: '#fff', boxShadow: 'var(--shadow)', textAlign: 'center' }}>
        <img src="/images/logo.webp" alt="" width={84} height={84} style={{ margin: '0 auto 16px', borderRadius: '50%' }} />
        <h1 style={{ fontSize: 24, color: 'var(--maroon)', margin: '0 0 10px' }}>Connect Supabase to start the site</h1>
        <p style={{ color: 'var(--ink-2)', margin: '0 0 18px' }}>
          Add <code>NEXT_PUBLIC_SUPABASE_URL</code>, <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code> to{' '}
          <code>.env.local</code>, run the SQL in <code>supabase/migrations</code> and <code>supabase/seed.sql</code>, then restart the server.
        </p>
        <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>See README.md → “Connecting Supabase”.</p>
      </div>
    </main>
  );
}
