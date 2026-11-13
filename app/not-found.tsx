import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="nf">
      <img src="/images/logo.webp" alt="" />
      <h1>404</h1>
      <p className="kn-font">ಪುಟ ಕಂಡುಬಂದಿಲ್ಲ</p>
      <p>The page you are looking for does not exist or has been moved.</p>
      <Link href="/" className="btn btn-fire">Go to home · ಮುಖಪುಟ</Link>
    </section>
  );
}
