'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle, MapPin, FileText, Send, ImagePlus, Film, X, Loader2,
  ChevronLeft, ChevronRight, User, Phone, CheckCircle2, FileUp, Download, ExternalLink,
} from 'lucide-react';
import { useSite } from '@/components/site/Providers';
import { useDialog } from '@/components/site/Dialog';
import PageHero from '@/components/site/PageHero';
import { fmtDate } from '@/lib/utils';
import type { IssueItem } from '@/lib/sample-issues';

const MAX_IMAGES = 10;
const MAX_IMAGE_MB = 1;   // 1 MB only per image
const MAX_VIDEO_MB = 30;  // 30 MB max for video
const MAX_PDF_MB = 15;    // 15 MB max for all-in-one PDF

const STATUS_COLORS: Record<string, string> = {
  open: 'var(--fire, #e65100)',
  in_progress: '#f59e0b',
  resolved: '#10b981',
  closed: '#6b7280',
};

const STATUS_LABELS_EN: Record<string, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

const STATUS_LABELS_KN: Record<string, string> = {
  open: 'ತೆರೆದಿದೆ',
  in_progress: 'ಪ್ರಗತಿಯಲ್ಲಿದೆ',
  resolved: 'ಪರಿಹರಿಸಲಾಗಿದೆ',
  closed: 'ಮುಕ್ತಾಯವಾಗಿದೆ',
};

export default function IssuesView() {
  const { member, volunteer, lang } = useSite();
  const { notify } = useDialog();

  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Form fields — anyone can fill these
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [needs, setNeeds] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [pdf, setPdf] = useState<File | null>(null);

  const imgRef = useRef<HTMLInputElement>(null);
  const vidRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);

  // Auto-fill name & phone if logged in
  useEffect(() => {
    if (member?.name) setName(member.name);
    else if (volunteer?.name) setName(volunteer.name);

    if (member?.phone) setPhone(member.phone);
    else if (volunteer?.phone) setPhone(volunteer.phone);
  }, [member, volunteer]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!showModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showModal]);

  const loadIssues = useCallback(() => {
    setLoading(true);
    fetch('/api/issues')
      .then((r) => r.json())
      .then((d: { items: IssueItem[] }) => {
        setIssues(d.items ?? []);
      })
      .catch((err) => {
        console.error('Failed to load issues:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  // Image handling (max 10, max 1MB each)
  function addImages(files: FileList | null) {
    if (!files) return;
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      notify(lang === 'kn' ? `ಗರಿಷ್ಠ ${MAX_IMAGES} ಚಿತ್ರಗಳನ್ನು ಮಾತ್ರ ಸೇರಿಸಬಹುದು` : `Maximum ${MAX_IMAGES} images allowed`, 'error');
      return;
    }
    const selected = [...files].slice(0, remaining);
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const valid = selected.filter((f) => {
      if (!validTypes.includes(f.type)) {
        notify(`${f.name}: Only JPG, PNG, WEBP allowed`, 'error');
        return false;
      }
      if (f.size > MAX_IMAGE_MB * 1024 * 1024) {
        notify(`${f.name}: Image must be under ${MAX_IMAGE_MB} MB`, 'error');
        return false;
      }
      return true;
    });

    const newImages = [...images, ...valid];
    setImages(newImages);
    setImagePreviews(newImages.map((f) => URL.createObjectURL(f)));
  }

  function removeImage(i: number) {
    URL.revokeObjectURL(imagePreviews[i]);
    const ni = images.filter((_, k) => k !== i);
    setImages(ni);
    setImagePreviews(ni.map((f) => URL.createObjectURL(f)));
  }

  // Video handling (max 1, max 30MB)
  function handleVideo(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!validTypes.includes(f.type)) {
      notify(lang === 'kn' ? 'MP4, WEBM ಅಥವಾ MOV ವೀಡಿಯೊ ಮಾತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ' : 'Only MP4, WEBM or MOV videos allowed', 'error');
      return;
    }
    if (f.size > MAX_VIDEO_MB * 1024 * 1024) {
      notify(lang === 'kn' ? `ವೀಡಿಯೊ ಗಾತ್ರ ಗರಿಷ್ಠ ${MAX_VIDEO_MB} MB ಮಾತ್ರ ಅನುಮತಿಸಲಾಗಿದೆ` : `Video must be under ${MAX_VIDEO_MB} MB`, 'error');
      return;
    }
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideo(f);
    setVideoPreview(URL.createObjectURL(f));
  }

  function removeVideo() {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideo(null);
    setVideoPreview(null);
  }

  // PDF handling (All-in-one PDF, max 15MB)
  function handlePdf(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      notify(lang === 'kn' ? 'ದಯವಿಟ್ಟು ಪಿಡಿಎಫ್ (.pdf) ದಾಖಲೆ ಮಾತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ' : 'Please upload a PDF document (.pdf)', 'error');
      return;
    }
    if (f.size > MAX_PDF_MB * 1024 * 1024) {
      notify(lang === 'kn' ? `ಪಿಡಿಎಫ್ ಗಾತ್ರ ${MAX_PDF_MB} MB ಗಿಂತ ಕಡಿಮೆಯಿರಬೇಕು` : `PDF must be under ${MAX_PDF_MB} MB`, 'error');
      return;
    }
    setPdf(f);
  }

  function removePdf() {
    setPdf(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      notify(lang === 'kn' ? 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹೆಸರನ್ನು ನಮೂದಿಸಿ' : 'Please enter your name', 'error');
      return;
    }
    if (!city.trim()) {
      notify(lang === 'kn' ? 'ದಯವಿಟ್ಟು ನಗರ / ಹಳ್ಳಿ / ಪಟ್ಟಣ ನಮೂದಿಸಿ' : 'Please enter your city, village or town', 'error');
      return;
    }
    if (!description.trim()) {
      notify(lang === 'kn' ? 'ದಯವಿಟ್ಟು ಸಮಸ್ಯೆಯ ವಿವರವನ್ನು ಬರೆಯಿರಿ' : 'Please describe the issue', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const form = new FormData();
      form.append('author_name', name.trim());
      if (phone.trim()) form.append('author_phone', phone.trim());
      form.append('city', city.trim());
      form.append('description', description.trim());
      if (needs.trim()) form.append('needs', needs.trim());

      images.forEach((f, i) => form.append(`image_${i}`, f));
      if (video) form.append('video', video);
      if (pdf) form.append('pdf', pdf);

      const r = await fetch('/api/issues', { method: 'POST', body: form });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Something went wrong');

      notify(lang === 'kn' ? 'ಸಮಸ್ಯೆ ಯಶಸ್ವಿಯಾಗಿ ವರದಿ ಆಗಿದೆ!' : 'Issue reported successfully!');

      // Reset form fields
      if (!member && !volunteer) {
        setName('');
        setPhone('');
      }
      setCity('');
      setDescription('');
      setNeeds('');
      setImages([]);
      setImagePreviews([]);
      removeVideo();
      removePdf();
      setShowModal(false);

      loadIssues();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to submit issue', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const isKn = lang === 'kn';

  return (
    <>
      <PageHero
        title={isKn ? 'ಸಾರ್ವಜನಿಕ ಸಮಸ್ಯೆಗಳ ಪೋರ್ಟಲ್' : 'Public Issues Portal'}
        sub={isKn ? 'ನಿಮ್ಮ ಊರು, ಗ್ರಾಮ ಅಥವಾ ನಗರದ ಸಮಸ್ಯೆಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ — ವೇದಿಕೆ ನಿಮ್ಮ ಧ್ವನಿ' : 'Report local problems in your area — Suvarna Karnataka Janashakti Vedike stands with you'}
        image="/images/issues-banner.jpg"
      />

      <div className="container" style={{ maxWidth: 1140, padding: '2.5rem 1rem' }}>
        {/* TOP BAR: Heading on Left, Report Button on Top Right Corner */}
        <div className="issues-header-bar">
          <div>
            <h2 className="issues-section-title">
              <AlertTriangle size={24} style={{ color: 'var(--fire, #e65100)' }} />
              <span>{isKn ? 'ಸಾರ್ವಜನಿಕ ಸಮಸ್ಯೆಗಳು' : 'Reported Public Issues'}</span>
              <span className="issues-count-pill">{issues.length}</span>
            </h2>
            <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '.92rem' }}>
              {isKn
                ? 'ಕರ್ನಾಟಕದಾದ್ಯಂತ ಸಾರ್ವಜನಿಕರು ವರದಿ ಮಾಡಿರುವ ಸಮಸ್ಯೆಗಳು ಮತ್ತು ಅಗತ್ಯ ಪರಿಹಾರ ಕ್ರಮಗಳು'
                : 'Civic, road, water and local problems reported by citizens across Karnataka.'}
            </p>
          </div>

          {/* Top Right Corner: Button to open form popup */}
          <div className="issues-header-action">
            <button
              type="button"
              className="btn btn-fire issues-top-cta-btn"
              onClick={() => setShowModal(true)}
            >
              <AlertTriangle size={18} />
              <span>{isKn ? 'ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಿ +' : 'Report an Issue +'}</span>
            </button>
            <span className="issues-top-cta-sub">
              {isKn ? 'ಯಾರಾದರೂ ಮುಕ್ತವಾಗಿ ವರದಿ ಮಾಡಬಹುದು' : 'Open to everyone · No login required'}
            </span>
          </div>
        </div>

        {/* ISSUES LIST: 2-COLUMN GRID (LEFT AND RIGHT IN ROWS) */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 0' }}>
            <Loader2 className="spin" size={32} />
          </div>
        ) : issues.length === 0 ? (
          <div className="issues-empty-state">
            <AlertTriangle size={36} style={{ color: 'var(--fire, #e65100)', marginBottom: 8 }} />
            <h3>{isKn ? 'ಇನ್ನೂ ಯಾವುದೇ ಸಮಸ್ಯೆ ವರದಿಯಾಗಿಲ್ಲ' : 'No issues reported yet'}</h3>
            <p className="text-muted">
              {isKn
                ? 'ನಿಮ್ಮ ಊರು ಅಥವಾ ಬಡಾವಣೆಯ ಸಮಸ್ಯೆಯನ್ನು ಮೊದಲಿಗೆ ವರದಿ ಮಾಡಿ!'
                : 'Be the first to report a local issue in your city or town!'}
            </p>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="btn btn-fire"
              style={{ marginTop: 12 }}
            >
              {isKn ? 'ಮೊದಲ ಸಮಸ್ಯೆಯನ್ನು ವರದಿ ಮಾಡಿ' : 'Report the First Issue'}
            </button>
          </div>
        ) : (
          <div className="issues-list">
            {issues.map((issue) => (
              <SingleIssueCard key={issue.id} issue={issue} isKn={isKn} />
            ))}
          </div>
        )}

        {/* POP-UP MODAL: FORM TO REPORT AN ISSUE */}
        {showModal && (
          <div
            className="issue-modal-backdrop"
            onClick={() => setShowModal(false)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="issue-modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="issue-modal-head">
                <div>
                  <span className="join-promo-eyebrow">
                    <AlertTriangle size={13} /> {isKn ? 'ಸಾರ್ವಜನಿಕ ವೇದಿಕೆ' : 'Public Forum'}
                  </span>
                  <h3 style={{ margin: '4px 0 0', fontSize: '1.3rem', color: 'var(--maroon, #2a0408)' }}>
                    {isKn ? 'ಸಮಸ್ಯೆಯನ್ನು ವರದಿ ಮಾಡಿ' : 'Report a Community Issue'}
                  </h3>
                </div>
                <button
                  type="button"
                  className="join-promo-x"
                  onClick={() => setShowModal(false)}
                  aria-label="Close"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, margin: '8px 0 16px' }}>
                <p className="text-muted" style={{ margin: 0, fontSize: '.92rem' }}>
                  {isKn
                    ? 'ರಸ್ತೆ, ಕುಡಿಯುವ ನೀರು, ಒಳಚರಂಡಿ, ಶಾಲೆ, ಆರೋಗ್ಯ ಅಥವಾ ಯಾವುದೇ ಸಾರ್ವಜನಿಕ ಸಮಸ್ಯೆಯನ್ನು ಫೋಟೋಗಳು, ವೀಡಿಯೊ ಅಥವಾ ಪಿಡಿಎಫ್ ದಾಖಲೆಯೊಂದಿಗೆ ಹಂಚಿಕೊಳ್ಳಿ.'
                    : 'Report road, water, drainage, civic or school issues in your area with photos, video or an all-in-one PDF document.'}
                </p>
                {(member || volunteer) ? (
                  <span className="badge-logged-user" style={{ fontSize: '.82rem', padding: '4px 10px', background: 'rgba(230,81,0,0.1)', color: 'var(--fire, #e65100)', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={14} />
                    {isKn ? `${member ? 'ಸದಸ್ಯ' : 'ಸ್ವಯಂಸೇವಕ'}: ${name}` : `${member ? 'Member' : 'Volunteer'}: ${name}`}
                  </span>
                ) : (
                  <span style={{ fontSize: '.82rem', color: 'var(--muted, #666)' }}>
                    {isKn ? 'ಯಾರಾದರೂ ಮುಕ್ತವಾಗಿ ವರದಿ ಮಾಡಬಹುದು' : 'Open to everyone (no login required)'}
                  </span>
                )}
              </div>

              {/* Form inside modal */}
              <form onSubmit={submit} className="issues-form-inner">
                {/* Name & Phone */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label className="issues-label">
                      <User size={16} />
                      {isKn ? 'ನಿಮ್ಮ ಹೆಸರು *' : 'Your Name *'}
                    </label>
                    <input
                      className="issues-input"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={isKn ? 'ಉದಾ: ರಮೇಶ್ ಕುಮಾರ್' : 'e.g. Ramesh Kumar'}
                      maxLength={150}
                      required
                    />
                  </div>

                  <div>
                    <label className="issues-label">
                      <Phone size={16} />
                      {isKn ? 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ' : 'Phone Number'}
                      <small style={{ fontWeight: 'normal', color: 'var(--muted, #888)', marginLeft: 4 }}>
                        {isKn ? '(ಐಚ್ಛಿಕ)' : '(optional)'}
                      </small>
                    </label>
                    <input
                      className="issues-input"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={isKn ? '10 ಅಂಕಿಗಳ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ' : '10-digit mobile number'}
                      maxLength={15}
                    />
                  </div>
                </div>

                {/* City / Village / Town */}
                <div style={{ marginBottom: '1rem' }}>
                  <label className="issues-label">
                    <MapPin size={16} />
                    {isKn ? 'ನಗರ / ಹಳ್ಳಿ / ಪಟ್ಟಣ *' : 'City / Village / Town *'}
                  </label>
                  <input
                    className="issues-input"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={isKn ? 'ಉದಾ: ಬೆಂಗಳೂರು, ಮಂಡ್ಯ, ಹುಬ್ಬಳ್ಳಿ, ಕುಣಿಗಲ್…' : 'e.g. Bengaluru, Mandya, Hubballi, Kunigal…'}
                    maxLength={200}
                    required
                  />
                </div>

                {/* Issue Description */}
                <div style={{ marginBottom: '1rem' }}>
                  <label className="issues-label">
                    <FileText size={16} />
                    {isKn ? 'ಸಮಸ್ಯೆಯ ವಿವರ *' : 'Description of the Issue *'}
                  </label>
                  <textarea
                    className="issues-textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={isKn ? 'ಸಮಸ್ಯೆ ಏನು? ಎಷ್ಟು ದಿನಗಳಿಂದ ಇದೆ? ಇದರಿಂದ ಯಾರಿಗೆಲ್ಲ ತೊಂದರೆಯಾಗಿದೆ?' : 'What is the problem? How long has it existed? Who is affected?'}
                    rows={4}
                    maxLength={2000}
                    required
                  />
                  <div style={{ textAlign: 'right', marginTop: 3 }}>
                    <small className="text-muted">{description.length}/2000</small>
                  </div>
                </div>

                {/* What is needed */}
                <div style={{ marginBottom: '1rem' }}>
                  <label className="issues-label">
                    <AlertTriangle size={16} />
                    {isKn ? 'ಏನು ಕ್ರಮ ಕೈಗೊಳ್ಳಬೇಕು? (ಅಗತ್ಯ / ಬೇಡಿಕೆ)' : 'Action / Help Required (Necessary Needs)'}
                  </label>
                  <textarea
                    className="issues-textarea"
                    value={needs}
                    onChange={(e) => setNeeds(e.target.value)}
                    placeholder={isKn ? 'ಸಂಬಂಧಪಟ್ಟ ಇಲಾಖೆಯಿಂದ ಯಾವ ಪರಿಹಾರ ಬೇಕು? (ಉದಾ: ರಸ್ತೆ ಡಾಂಬರೀಕರಣ, ಹೊಸ ಪೈಪ್‌ಲೈನ್…)' : 'What action is needed from authorities or the Vedike? (e.g. road repair, pipeline fix…)'}
                    rows={2}
                    maxLength={1000}
                  />
                </div>

                {/* Media upload container: Photos, Video, and PDF */}
                <div style={{ border: '1px dashed var(--border, #d1d5db)', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem', background: '#fafbfc' }}>
                  <p style={{ fontWeight: 600, fontSize: '.92rem', marginBottom: '0.75rem', color: 'var(--heading, #1a1a2e)' }}>
                    {isKn ? 'ಮಾಧ್ಯಮ ಲಗತ್ತಿಸಿ (ಫೋಟೋಗಳು, ವೀಡಿಯೊ, ಅಥವಾ ಪಿಡಿಎಫ್)' : 'Attach Media (Photos, Video, or PDF)'}
                  </p>

                  {/* Images Upload (up to 10, max 1MB each) */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label className="issues-label">
                      <ImagePlus size={16} />
                      {isKn ? `ಫೋಟೋಗಳು (ಗರಿಷ್ಠ 10) — ${images.length}/10` : `Photos (up to 10) — ${images.length}/10`}
                      <span style={{ fontSize: '.78rem', fontWeight: 500, color: 'var(--fire, #e65100)', marginLeft: 4 }}>
                        ({isKn ? 'ಪ್ರತಿ ಫೋಟೋ ಗರಿಷ್ಠ 1 MB' : 'Max 1 MB each'})
                      </span>
                    </label>
                    <div className="issues-media-grid">
                      {imagePreviews.map((src, i) => (
                        <div key={i} className="issues-thumb">
                          <img src={src} alt={`Upload ${i + 1}`} />
                          <button
                            type="button"
                            className="issues-thumb-x"
                            onClick={() => removeImage(i)}
                            aria-label="Remove image"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      {images.length < MAX_IMAGES && (
                        <button
                          type="button"
                          className="issues-add-media"
                          onClick={() => imgRef.current?.click()}
                          title="Add photos"
                        >
                          <ImagePlus size={24} />
                          <small>{isKn ? 'ಫೋಟೋ ಸೇರಿಸಿ' : 'Add Photos'}</small>
                        </button>
                      )}
                    </div>
                    <input
                      ref={imgRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      multiple
                      hidden
                      onChange={(e) => {
                        addImages(e.target.files);
                        e.target.value = '';
                      }}
                    />
                    <small className="text-muted" style={{ display: 'block', marginTop: 4 }}>
                      JPG, PNG, WEBP · {isKn ? 'ಗರಿಷ್ಠ 10 ಫೋಟೋಗಳು, ಪ್ರತಿ ಫೋಟೋ 1 MB ಒಳಗೆ' : 'Up to 10 photos, max 1 MB per image'}
                    </small>
                  </div>

                  {/* Video Upload (1 video, max 30MB) */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label className="issues-label">
                      <Film size={16} />
                      {isKn ? 'ವೀಡಿಯೊ (ಕೇವಲ ಒಂದು ವೀಡಿಯೊ)' : 'Video (Only 1 video)'}
                      <span style={{ fontSize: '.78rem', fontWeight: 500, color: 'var(--fire, #e65100)', marginLeft: 4 }}>
                        ({isKn ? 'ಗರಿಷ್ಠ 30 MB' : 'Max 30 MB'})
                      </span>
                    </label>
                    {videoPreview ? (
                      <div className="issues-video-wrap">
                        <video
                          src={videoPreview}
                          controls
                          preload="metadata"
                          style={{ maxWidth: '100%', maxHeight: 220, borderRadius: 10, display: 'block' }}
                        />
                        <button
                          type="button"
                          className="issues-thumb-x"
                          onClick={removeVideo}
                          aria-label="Remove video"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="issues-add-media"
                        style={{ width: 140 }}
                        onClick={() => vidRef.current?.click()}
                      >
                        <Film size={24} />
                        <small>{isKn ? 'ವೀಡಿಯೊ ಸೇರಿಸಿ' : 'Add Video'}</small>
                      </button>
                    )}
                    <input
                      ref={vidRef}
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      hidden
                      onChange={(e) => {
                        handleVideo(e.target.files);
                        e.target.value = '';
                      }}
                    />
                    <small className="text-muted" style={{ display: 'block', marginTop: 4 }}>
                      MP4, WEBM, MOV · {isKn ? 'ಗರಿಷ್ಠ 30 MB' : 'Max 30 MB'}
                    </small>
                  </div>

                  {/* PDF Upload (All-in-one Media / Compressed Photos PDF) */}
                  <div>
                    <label className="issues-label">
                      <FileUp size={16} />
                      {isKn ? 'ಫೋಟೋಗಳು / ಮಾಧ್ಯಮ ಪುರಾವೆಗಳ ಪಿಡಿಎಫ್ (ಐಚ್ಛಿಕ)' : 'All-in-One Media & Photos PDF (Optional)'}
                      <span style={{ fontSize: '.78rem', fontWeight: 500, color: '#2563eb', marginLeft: 4 }}>
                        ({isKn ? 'ಸಂಕುಚಿತ ಫೋಟೋಗಳು/ದೃಶ್ಯ ಪುರಾವೆಗಳ ಪಿಡಿಎಫ್ · ಗರಿಷ್ಠ 15 MB' : 'Compiled photos & evidence in 1 PDF · Max 15 MB'})
                      </span>
                    </label>

                    {pdf ? (
                      <div className="issues-pdf-selected-card">
                        <div className="issues-pdf-selected-info">
                          <div className="issues-pdf-badge-icon">
                            <FileText size={22} />
                          </div>
                          <div>
                            <b className="issues-pdf-filename">{pdf.name}</b>
                            <small className="issues-pdf-filesize">
                              {(pdf.size / 1024 / 1024).toFixed(2)} MB · {isKn ? 'ಸಂಕುಚಿತ ಫೋಟೋ ಪುರಾವೆಗಳ ಪಿಡಿಎಫ್ ಲಗತ್ತಿಸಲಾಗಿದೆ' : 'Compiled Photo Evidence PDF Attached'}
                            </small>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <label className="issues-pdf-change-btn">
                            {isKn ? 'ಬದಲಿಸಿ' : 'Change'}
                            <input
                              type="file"
                              accept="application/pdf"
                              hidden
                              onChange={(e) => {
                                handlePdf(e.target.files);
                                e.target.value = '';
                              }}
                            />
                          </label>
                          <button
                            type="button"
                            className="issues-pdf-remove-btn"
                            onClick={removePdf}
                            title={isKn ? 'ತೆಗೆದುಹಾಕಿ' : 'Remove PDF'}
                          >
                            <X size={15} /> {isKn ? 'ತೆಗೆದುಹಾಕಿ' : 'Remove'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="issues-pdf-upload-box">
                        <input
                          ref={pdfRef}
                          type="file"
                          accept="application/pdf"
                          hidden
                          onChange={(e) => {
                            handlePdf(e.target.files);
                            e.target.value = '';
                          }}
                        />
                        <div className="issues-pdf-upload-icon">
                          <FileUp size={28} />
                        </div>
                        <div className="issues-pdf-upload-text">
                          <b>{isKn ? 'ಸಂಕುಚಿತ ಫೋಟೋಗಳ / ಪುರಾವೆಗಳ ಪಿಡಿಎಫ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಇಲ್ಲಿ ಕ್ಲಿಕ್ ಮಾಡಿ' : 'Click here to upload Compiled Photos / Evidence PDF'}</b>
                          <p>
                            {isKn
                              ? 'ಸಮಸ್ಯೆಯ ಎಲ್ಲಾ ಫೋಟೋಗಳು ಮತ್ತು ಪುರಾವೆಗಳನ್ನು ಸಂಕುಚಿತಗೊಳಿಸಿ ಒಂದೇ ಪಿಡಿಎಫ್ ರೂಪದಲ್ಲಿ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ (ಗರಿಷ್ಠ 15 MB). ಪಠ್ಯ ಬರೆಯುವ ಅಗತ್ಯವಿಲ್ಲ.'
                              : 'Upload all your problem photos and visual evidence compiled in one compressed PDF (Max 15 MB). No text needed in PDF as description is already written above.'}
                          </p>
                        </div>
                        <span className="issues-pdf-browse-tag">{isKn ? 'ಪಿಡಿಎಫ್ ಆಯ್ಕೆಮಾಡಿ' : 'Select PDF'}</span>
                      </label>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
                  <button
                    type="button"
                    className="issues-modal-cancel-btn"
                    onClick={() => setShowModal(false)}
                  >
                    {isKn ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
                  </button>
                  <button type="submit" className="btn btn-fire issues-submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="spin" size={18} />
                        {isKn ? 'ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ…' : 'Submitting Issue…'}
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        {isKn ? 'ಸಮಸ್ಯೆಯನ್ನು ಸಲ್ಲಿಸಿ' : 'Submit Issue'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function SingleIssueCard({ issue, isKn }: { issue: IssueItem; isKn: boolean }) {
  const [imgIdx, setImgIdx] = useState(0);
  const images = issue.images || [];
  const hasImages = images.length > 0;
  const hasVideo = Boolean(issue.video);
  const hasPdf = Boolean(issue.pdf);

  const statusLabel = isKn
    ? STATUS_LABELS_KN[issue.status] || issue.status
    : STATUS_LABELS_EN[issue.status] || issue.status;

  return (
    <article className="issue-card">
      {/* Top Media: Images carousel or video player */}
      {(hasImages || hasVideo) && (
        <div className="issue-card-media" style={{ display: 'grid', gridTemplateColumns: hasImages && hasVideo ? 'repeat(auto-fit, minmax(240px, 1fr))' : '1fr', gap: 10 }}>
          {/* Images Carousel */}
          {hasImages && (
            <div className="issue-card-carousel">
              <img
                src={images[imgIdx]}
                alt={`Photo ${imgIdx + 1}`}
                className="issue-card-img"
              />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    className="issue-carousel-btn left"
                    onClick={() => setImgIdx((p) => (p > 0 ? p - 1 : images.length - 1))}
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    className="issue-carousel-btn right"
                    onClick={() => setImgIdx((p) => (p < images.length - 1 ? p + 1 : 0))}
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} />
                  </button>
                  <span className="issue-carousel-counter">
                    {imgIdx + 1} / {images.length}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Video Player */}
          {hasVideo && (
            <div className="issue-card-video">
              <video
                src={issue.video!}
                controls
                preload="metadata"
                playsInline
              />
            </div>
          )}
        </div>
      )}

      {/* Text Details */}
      <div className="issue-card-body">
        {/* Top bar: Author + Status */}
        <div className="issue-card-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span className="issue-card-author">{issue.author_name}</span>
            {issue.author_phone && (
              <span style={{ fontSize: '.82rem', color: 'var(--muted, #666)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <Phone size={12} /> {issue.author_phone}
              </span>
            )}
          </div>
          <span
            className="issue-status-badge"
            style={{ backgroundColor: STATUS_COLORS[issue.status] || '#6b7280' }}
          >
            {statusLabel}
          </span>
        </div>

        {/* Location & Date */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, margin: '6px 0 10px' }}>
          <div className="issue-card-location">
            <MapPin size={15} style={{ color: 'var(--fire, #e65100)' }} />
            <strong>{issue.city}</strong>
          </div>
          <small className="text-muted">
            {fmtDate(issue.created_at, isKn ? 'kn' : 'en')}
          </small>
        </div>

        {/* Description */}
        <p className="issue-card-desc">{issue.description}</p>

        {/* Needs / Action */}
        {issue.needs && (
          <div className="issue-card-needs">
            <strong style={{ display: 'block', marginBottom: 2 }}>
              {isKn ? 'ಅಗತ್ಯ / ಪರಿಹಾರ ಕ್ರಮ:' : 'Necessary Needs / Action Required:'}
            </strong>
            <span>{issue.needs}</span>
          </div>
        )}

        {/* Attached PDF Evidence: Click & View or Download in site */}
        {hasPdf && (
          <div className="issue-card-pdf-row">
            <div className="issue-pdf-row-info">
              <FileText size={17} style={{ color: '#2563eb', flexShrink: 0 }} />
              <span style={{ fontSize: '.85rem', fontWeight: 600, color: '#1e40af' }}>
                {isKn ? 'ಫೋಟೋ ಪುರಾವೆಗಳ ಪಿಡಿಎಫ್' : 'Photo Evidence PDF'}
              </span>
            </div>
            <div className="issue-pdf-row-btns">
              <a
                href={issue.pdf!}
                target="_blank"
                rel="noopener noreferrer"
                className="issue-pdf-btn-view"
                title={isKn ? 'ಪಿಡಿಎಫ್ ವೀಕ್ಷಿಸಿ' : 'View PDF in new tab'}
              >
                <ExternalLink size={14} />
                <span>{isKn ? 'ವೀಕ್ಷಿಸಿ' : 'View PDF'}</span>
              </a>
              <a
                href={issue.pdf!}
                download
                className="issue-pdf-btn-download"
                title={isKn ? 'ಪಿಡಿಎಫ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ' : 'Download PDF file'}
              >
                <Download size={14} />
                <span>{isKn ? 'ಡೌನ್‌ಲೋಡ್' : 'Download'}</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
