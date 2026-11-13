'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DICT } from '@/lib/i18n';
import { DialogProvider } from './Dialog';
import type { Lang, Localised, MemberPublic, Settings, VolunteerPublic } from '@/lib/types';

export type SiteContext = {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** UI text in the active language. */
  t: (key: string) => string;
  /** A database row's `<field>_en` / `<field>_kn` in the active language (falls back to the other). */
  tr: (row: Localised, field: string) => string;
  settings: Settings;
  /** The logged-in member, or null. */
  member: MemberPublic | null;
  /** The logged-in volunteer, or null. */
  volunteer: VolunteerPublic | null;
};

const Ctx = createContext<SiteContext | null>(null);

export function SiteProvider({ initialLang = 'en', settings = {}, initialMember = null, initialVolunteer = null, variant = 'site', children }: {
  initialLang?: Lang; settings?: Settings; initialMember?: MemberPublic | null; initialVolunteer?: VolunteerPublic | null;
  variant?: 'site' | 'admin'; children: ReactNode;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const [member, setMember] = useState<MemberPublic | null>(initialMember);
  const [volunteer, setVolunteer] = useState<VolunteerPublic | null>(initialVolunteer);

  // The server already knows who is logged in when the page loads (initialMember).
  // Re-check only after login / logout / sign-up, which fire "skjv:auth".
  useEffect(() => {
    const load = () => fetch('/api/auth/me', { cache: 'no-store' }).then((r) => r.json())
      .then((d: { member?: MemberPublic | null; volunteer?: VolunteerPublic | null }) => { setMember(d.member ?? null); setVolunteer(d.volunteer ?? null); })
      .catch(() => {});
    window.addEventListener('skjv:auth', load);
    return () => window.removeEventListener('skjv:auth', load);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    document.cookie = `lang-choice=${l}; path=/; max-age=31536000; samesite=lax`;
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === 'kn' ? 'kn' : 'en';
    document.documentElement.dataset.lang = lang;
  }, [lang]);

  const value = useMemo<SiteContext>(() => {
    const t = (k: string) => DICT[lang][k] ?? DICT.en[k] ?? k;
    const tr = (row: Localised, field: string) => {
      if (!row) return '';
      const r = row as Record<string, unknown>;
      const en = r[`${field}_en`];
      const kn = r[`${field}_kn`];
      const pick = lang === 'kn' ? kn || en : en || kn;
      return pick ? String(pick) : '';
    };
    return { lang, setLang, t, tr, settings, member, volunteer };
  }, [lang, setLang, settings, member, volunteer]);

  const labels = useMemo(() => ({ confirm: value.t('common.confirm'), cancel: value.t('common.cancel'), close: value.t('common.close') }), [value]);
  return (
    <Ctx.Provider value={value}>
      <DialogProvider variant={variant} labels={labels}>{children}</DialogProvider>
    </Ctx.Provider>
  );
}

export function useSite(): SiteContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSite must be used inside <SiteProvider>');
  return ctx;
}
