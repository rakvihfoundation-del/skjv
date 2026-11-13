'use client';
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import QRCode from 'qrcode';
import { Download, RotateCw, Loader2 } from 'lucide-react';
import { useSite } from './Providers';
import { useDialog } from './Dialog';
import { fmtDate, initials, wardLabel } from '@/lib/utils';
import { DICT } from '@/lib/i18n';
import type { CardMember, Lang, Settings } from '@/lib/types';

const W = 856;
const H = 540;

const siteUrl = () =>
  (process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/$/, '');

function useQR(text: string): string {
  const [src, setSrc] = useState('');
  useEffect(() => {
    if (!text) return;
    QRCode.toDataURL(text, { margin: 0, width: 260, color: { dark: '#4A0610', light: '#FFFFFF' }, errorCorrectionLevel: 'M' })
      .then(setSrc)
      .catch(() => {});
  }, [text]);
  return src;
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="idc-field">
      <span>{label}</span>
      <b>{value || '—'}</b>
    </div>
  );
}

type FaceProps = { m: CardMember; settings: Settings; refEl?: RefObject<HTMLDivElement | null>; lang?: Lang };

export function CardFront({ m, settings, qr, refEl, lang = 'en' }: FaceProps & { qr: string }) {
  const no = m.member_no || 'SKJV-0000-000000';
  const L = (k: string) => DICT[lang][k] ?? DICT.en[k];
  const validity = !settings.card_validity || settings.card_validity === 'Lifetime' ? L('card.lifetime') : settings.card_validity;
  return (
    <div className={`idc-face idc-front ${lang}`} ref={refEl}>
      <div className="idc-guilloche" />
      <img className="idc-watermark" src="/images/logo.webp" alt="" />
      <header className="idc-head">
        <span className="idc-logo"><img src="/images/logo.webp" alt="" /></span>
        <div className="idc-org">
          <b>{L('org.name')}</b>
          <em>{L('org.motto')}</em>
        </div>
        <div className="idc-type">
          <span>{L('card.membershipCard')}</span>
        </div>
      </header>

      <div className="idc-body">
        <div className="idc-photo-col">
          <div className="idc-photo">
            {m.photo ? <img src={m.photo} alt="" crossOrigin="anonymous" /> : <span>{initials(m.name) || (lang === 'kn' ? 'ಕ' : 'SK')}</span>}
          </div>
          <span className="idc-ribbon">{L('card.member')}</span>
        </div>

        <div className="idc-info">
          <h3 className="idc-name">{m.name || (lang === 'kn' ? 'ನಿಮ್ಮ ಹೆಸರು' : 'Your Name')}</h3>
          <div className="idc-no"><span>{L('card.memberNo')}</span><b>{no}</b></div>
          <div className="idc-grid">
            <Field label={L('card.mobile')} value={m.phone ? `+91 ${String(m.phone).replace(/(\d{5})(\d{5})/, '$1 $2')}` : ''} />
            <Field label={L('card.ward')} value={wardLabel(m.ward, lang)} />
            <Field label={L('card.pincode')} value={m.pincode} />
            <Field label={L('card.sinceShort')} value={fmtDate(m.created_at || new Date().toISOString().slice(0, 10), lang)} />
          </div>
        </div>

        <div className="idc-qr-col">
          <div className="idc-qr">{qr ? <img src={qr} alt="QR code" /> : <span />}</div>
          <small>{L('card.scan')}</small>
          <div className="idc-valid">
            <span>{L('card.valid')}</span>
            <b>{validity}</b>
          </div>
        </div>
      </div>

      <footer className="idc-foot">
        <div className="idc-flag"><i /><i /></div>
        <div className="idc-sign">
          <b>{lang === 'kn' ? settings.president_name_kn || settings.president_name : settings.president_name}</b>
          <small>{L('card.signatory')}</small>
        </div>
      </footer>
    </div>
  );
}

export function CardBack({ m, settings, refEl, lang = 'en' }: FaceProps) {
  const L = (k: string) => DICT[lang][k] ?? DICT.en[k];
  const [host, setHost] = useState((process.env.NEXT_PUBLIC_SITE_URL || '').replace(/^https?:\/\//, ''));
  useEffect(() => { setHost(siteUrl().replace(/^https?:\/\//, '')); }, []);
  return (
    <div className={`idc-face idc-back ${lang}`} ref={refEl}>
      <div className="idc-back-pattern" />
      <div className="idc-back-top">
        <span className="idc-logo sm"><img src="/images/logo.webp" alt="" /></span>
        <div>
          <b>{L('org.name')}</b>
          <small>{L('org.tagline')}</small>
        </div>
      </div>
      <div className="idc-back-body">
        <h4>{L('card.backTitle')}</h4>
        <ol>
          {['card.t1', 'card.t2', 'card.t3', 'card.t4'].map((k) => <li key={k}>{L(k)}</li>)}
        </ol>
      </div>
      <div className="idc-back-foot">
        <div className="idc-addr">
          <p>{lang === 'kn' ? settings.address_kn || settings.address_en : settings.address_en}</p>
          <p>{[settings.phone, settings.email, host].filter(Boolean).join('  •  ')}</p>
        </div>
        <div className="idc-back-no">
          <div className="idc-bars">{Array.from({ length: 34 }).map((_, i) => <i key={i} style={{ width: [2, 4, 1, 3][(i * 7 + (m.id || 3)) % 4] }} />)}</div>
          <b>{m.member_no || 'SKJV-0000-000000'}</b>
        </div>
      </div>
      <div className="idc-flag bottom"><i /><i /></div>
    </div>
  );
}

// Scales the fixed-size card to fit its container.
// Measured before the first paint (useLayoutEffect), so the card never flashes at the wrong size.
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
function useFit(): [RefObject<HTMLDivElement | null>, number] {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = (w: number) => setScale((s) => { const n = Math.min(1, w / W); return Math.abs(n - s) > 0.001 ? n : s; });
    fit(el.getBoundingClientRect().width);
    const ro = new ResizeObserver(([e]) => fit(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, scale];
}

export default function IdCard({ member, actions = true, flippable = true, tilt = false }: {
  member: CardMember; actions?: boolean; flippable?: boolean; tilt?: boolean;
}) {
  const { t, settings, lang } = useSite();
  const { notify } = useDialog();
  const [flipped, setFlipped] = useState(false);
  const [busy, setBusy] = useState('');
  const [fitRef, scale] = useFit();
  const front = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLDivElement>(null);
  const qr = useQR(member?.member_no ? `${siteUrl()}/verify/${member.member_no}` : `${siteUrl()}/join`);

  /** One PDF page: front on top, back below, at real card size. */
  async function download() {
    if (!front.current || !back.current) return;
    setBusy('download');
    try {
      const [{ toCanvas }, { buildCardPdf }] = await Promise.all([import('html-to-image'), import('@/lib/cardPdf')]);
      const opts = { pixelRatio: 3, cacheBust: true, style: { transform: 'none' }, width: W, height: H };
      const f = await toCanvas(front.current, opts);
      const b = await toCanvas(back.current, opts);
      const blob = buildCardPdf({
        front: f, back: b, title: DICT.en['org.name'], memberNo: member.member_no || 'SKJV',
        name: member.name || '', verifyUrl: `${siteUrl()}/verify/${member.member_no || ''}`,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${member.member_no || 'skjv'}-id-card.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
      notify(t('card.downloaded'));
    } catch (e) {
      console.error(e);
      notify(t('card.downloadErr'), 'error');
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="idc-wrap">
      <div className={`idc-fit ${tilt ? 'tilt' : ''}`} ref={fitRef}>
        <div
          className={`idc-flipper ${flipped ? 'flipped' : ''} ${flippable ? 'can-flip' : ''}`}
          style={{ width: W, height: H, transform: `scale(${scale})`, visibility: scale ? 'visible' : 'hidden' }}
          onClick={() => flippable && setFlipped((f) => !f)}
          role={flippable ? 'button' : undefined}
          aria-label={flippable ? t('card.flip') : undefined}
        >
          <div className="idc-side front"><CardFront m={member} settings={settings} qr={qr} refEl={front} lang={lang} /></div>
          <div className="idc-side back"><CardBack m={member} settings={settings} refEl={back} lang={lang} /></div>
        </div>
      </div>
      {flippable && <p className="idc-hint"><RotateCw size={14} />{t('card.flip')}</p>}
      {actions && (
        <div className="idc-actions">
          <button className="btn btn-fire" onClick={download} disabled={!!busy}>
            {busy === 'download' ? <Loader2 className="spin" size={18} /> : <Download size={18} />}{t('card.download')}
          </button>
        </div>
      )}
    </div>
  );
}
