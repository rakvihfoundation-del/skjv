/**
 * Creates (or promotes) an admin account in Supabase.
 *
 *   npm run admin:create                       → uses ADMIN_EMAIL / ADMIN_PASSWORD from .env.local
 *   npm run admin:create -- me@site.org Pass#123 "Full Name"
 *
 * Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../lib/supabase/database.types';

async function main() {
  const [emailArg, passwordArg, nameArg] = process.argv.slice(2);
  const email = (emailArg || process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = passwordArg || process.env.ADMIN_PASSWORD || '';
  const name = nameArg || 'Administrator';
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) throw new Error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.');
  if (!email || !email.includes('@')) throw new Error('Give an admin email (argument or ADMIN_EMAIL).');
  if (password.length < 8) throw new Error('Admin password must be at least 8 characters.');

  const db = createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  // Find an existing auth user with this email, or create one.
  let userId: string | undefined;
  for (let page = 1; !userId; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    userId = data.users.find((u) => u.email?.toLowerCase() === email)?.id;
    if (data.users.length < 1000) break;
  }
  if (userId) {
    const { error } = await db.auth.admin.updateUserById(userId, { password, email_confirm: true, app_metadata: { role: 'admin' } });
    if (error) throw error;
    console.log(`Existing user ${email} — password updated.`);
  } else {
    const { data, error } = await db.auth.admin.createUser({
      email, password, email_confirm: true, user_metadata: { name }, app_metadata: { role: 'admin' },
    });
    if (error || !data.user) throw error ?? new Error('Could not create the user');
    userId = data.user.id;
    console.log(`Created user ${email}.`);
  }

  const { error } = await db.from('admins').upsert({ user_id: userId, name, email }, { onConflict: 'user_id' });
  if (error) throw error;
  console.log(`✓ ${email} is now an admin. Log in at /admin/login`);
}

main().catch((e: unknown) => {
  console.error('✗', e instanceof Error ? e.message : e);
  process.exit(1);
});
