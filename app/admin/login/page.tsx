import AdminLoginForm from '@/components/admin/AdminLoginForm';

export const dynamic = 'force-dynamic';

// Optional one-click login for development: pre-fills ADMIN_EMAIL / ADMIN_PASSWORD from .env.local.
// Only when ADMIN_LOGIN_PREFILL=true and never in production builds.
export default function AdminLoginPage() {
  const on = process.env.ADMIN_LOGIN_PREFILL === 'true' && process.env.NODE_ENV !== 'production';
  const prefill = on && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD
    ? { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD }
    : null;
  return <AdminLoginForm prefill={prefill} />;
}
