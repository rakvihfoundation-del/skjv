// Decorative SVGs inspired by the gold flourishes in the Vedike logo.

export function Flourish({ className = '', width = 140 }: { className?: string; width?: number }) {
  return (
    <svg className={`flourish ${className}`} width={width} height={width * 0.16} viewBox="0 0 200 32" fill="none" aria-hidden="true">
      <path d="M100 16c-8-12-24-12-30-4-4 5 0 12 6 10s4-9-1-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M100 16c8-12 24-12 30-4 4 5 0 12-6 10s-4-9 1-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 16h58M138 16h58" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 7" />
      <circle cx="100" cy="16" r="4.5" fill="currentColor" />
    </svg>
  );
}

export function FlagStripe({ className = '' }: { className?: string }) {
  return <span className={`flag-stripe ${className}`} aria-hidden="true"><i /><i /></span>;
}
