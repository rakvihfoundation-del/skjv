'use client';
import { useSite } from '@/components/site/Providers';
import PageHero from '@/components/site/PageHero';

const TERMS = {
  en: [
    ['Eligibility', 'Membership is open to any person aged 18 or above who believes in the aims of Suvarna Karnataka Janashakti Vedike and agrees to follow its code of conduct.'],
    ['Membership fee', 'A one-time membership fee (currently ₹1,500) must be paid online to complete registration. Registration is not complete and no member ID is issued until the payment is successful.'],
    ['Refunds', 'The membership fee is non-refundable once the membership has been issued, except where a payment was charged twice or in error. Such cases will be refunded to the original payment method after verification.'],
    ['Accuracy of details', 'You confirm that the name, mobile number, ward, pincode and photo you provide are true and belong to you. Memberships created with false information may be cancelled without refund.'],
    ['ID card', 'The member ID card is personal and non-transferable. It remains the property of the Vedike and must not be misused for any personal, commercial or political gain.'],
    ['Code of conduct', 'Members shall work peacefully and lawfully, respect all people, and shall not engage in violence, hate speech or any activity that brings disrepute to the Vedike. The Vedike may suspend or cancel any membership that violates this code.'],
    ['Privacy', 'Your details are used only for membership administration and to contact you about Vedike activities. We do not sell your data. Your mobile number is never shown on public verification pages.'],
    ['Donations', 'Donations are voluntary and non-refundable. Receipts are issued for every successful donation. Donations directed to a campaign are used for that campaign; any surplus goes to the general fund.'],
    ['Changes', 'The Vedike may update these terms from time to time. The latest version will always be available on this page.'],
  ],
  kn: [
    ['ಅರ್ಹತೆ', '18 ವರ್ಷ ಅಥವಾ ಮೇಲ್ಪಟ್ಟ, ಸುವರ್ಣ ಕರ್ನಾಟಕ ಜನಶಕ್ತಿ ವೇದಿಕೆಯ ಉದ್ದೇಶಗಳಲ್ಲಿ ನಂಬಿಕೆಯಿರುವ ಮತ್ತು ನೀತಿಸಂಹಿತೆಯನ್ನು ಪಾಲಿಸಲು ಒಪ್ಪುವ ಯಾರಾದರೂ ಸದಸ್ಯರಾಗಬಹುದು.'],
    ['ಸದಸ್ಯತ್ವ ಶುಲ್ಕ', 'ನೋಂದಣಿ ಪೂರ್ಣಗೊಳಿಸಲು ಒಂದು ಬಾರಿಯ ಸದಸ್ಯತ್ವ ಶುಲ್ಕವನ್ನು (ಪ್ರಸ್ತುತ ₹1,500) ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಪಾವತಿಸಬೇಕು. ಪಾವತಿ ಯಶಸ್ವಿಯಾಗುವವರೆಗೆ ನೋಂದಣಿ ಪೂರ್ಣವಾಗುವುದಿಲ್ಲ ಮತ್ತು ಸದಸ್ಯ ಸಂಖ್ಯೆ ನೀಡಲಾಗುವುದಿಲ್ಲ.'],
    ['ಮರುಪಾವತಿ', 'ಸದಸ್ಯತ್ವ ನೀಡಿದ ನಂತರ ಶುಲ್ಕ ಮರುಪಾವತಿಯಾಗುವುದಿಲ್ಲ; ಎರಡು ಬಾರಿ ಅಥವಾ ತಪ್ಪಾಗಿ ಕಡಿತವಾದ ಸಂದರ್ಭಗಳಲ್ಲಿ ಪರಿಶೀಲನೆಯ ನಂತರ ಮೂಲ ಪಾವತಿ ವಿಧಾನಕ್ಕೆ ಹಿಂದಿರುಗಿಸಲಾಗುವುದು.'],
    ['ವಿವರಗಳ ನಿಖರತೆ', 'ನೀವು ನೀಡುವ ಹೆಸರು, ಮೊಬೈಲ್ ಸಂಖ್ಯೆ, ವಾರ್ಡ್, ಪಿನ್‌ಕೋಡ್ ಮತ್ತು ಭಾವಚಿತ್ರ ಸತ್ಯ ಮತ್ತು ನಿಮ್ಮದೇ ಎಂದು ದೃಢೀಕರಿಸುತ್ತೀರಿ. ಸುಳ್ಳು ಮಾಹಿತಿಯ ಸದಸ್ಯತ್ವವನ್ನು ಮರುಪಾವತಿಯಿಲ್ಲದೆ ರದ್ದುಗೊಳಿಸಬಹುದು.'],
    ['ಗುರುತಿನ ಚೀಟಿ', 'ಸದಸ್ಯ ಗುರುತಿನ ಚೀಟಿ ವೈಯಕ್ತಿಕ ಮತ್ತು ವರ್ಗಾಯಿಸಲಾಗದು. ಇದು ವೇದಿಕೆಯ ಸ್ವತ್ತಾಗಿದ್ದು, ಯಾವುದೇ ವೈಯಕ್ತಿಕ, ವಾಣಿಜ್ಯ ಅಥವಾ ರಾಜಕೀಯ ಲಾಭಕ್ಕೆ ದುರುಪಯೋಗ ಮಾಡಬಾರದು.'],
    ['ನೀತಿಸಂಹಿತೆ', 'ಸದಸ್ಯರು ಶಾಂತಿಯುತವಾಗಿ ಮತ್ತು ಕಾನೂನುಬದ್ಧವಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸಬೇಕು, ಎಲ್ಲರನ್ನೂ ಗೌರವಿಸಬೇಕು; ಹಿಂಸೆ, ದ್ವೇಷ ಭಾಷಣ ಅಥವಾ ವೇದಿಕೆಗೆ ಅಪಕೀರ್ತಿ ತರುವ ಯಾವುದೇ ಚಟುವಟಿಕೆಯಲ್ಲಿ ತೊಡಗಬಾರದು. ಉಲ್ಲಂಘನೆಯಾದಲ್ಲಿ ಸದಸ್ಯತ್ವವನ್ನು ಅಮಾನತು ಅಥವಾ ರದ್ದುಗೊಳಿಸಬಹುದು.'],
    ['ಗೌಪ್ಯತೆ', 'ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಸದಸ್ಯತ್ವ ನಿರ್ವಹಣೆ ಮತ್ತು ವೇದಿಕೆಯ ಚಟುವಟಿಕೆಗಳ ಕುರಿತು ಸಂಪರ್ಕಿಸಲು ಮಾತ್ರ ಬಳಸಲಾಗುತ್ತದೆ. ನಿಮ್ಮ ಮಾಹಿತಿಯನ್ನು ಮಾರಾಟ ಮಾಡುವುದಿಲ್ಲ. ಸಾರ್ವಜನಿಕ ದೃಢೀಕರಣ ಪುಟದಲ್ಲಿ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ತೋರಿಸಲಾಗುವುದಿಲ್ಲ.'],
    ['ದೇಣಿಗೆ', 'ದೇಣಿಗೆ ಸ್ವಯಂಪ್ರೇರಿತ ಮತ್ತು ಮರುಪಾವತಿಸಲಾಗದು. ಪ್ರತಿ ಯಶಸ್ವಿ ದೇಣಿಗೆಗೆ ರಶೀದಿ ನೀಡಲಾಗುವುದು. ಅಭಿಯಾನಕ್ಕೆ ನೀಡಿದ ದೇಣಿಗೆಯನ್ನು ಆ ಅಭಿಯಾನಕ್ಕೇ ಬಳಸಲಾಗುವುದು; ಹೆಚ್ಚುವರಿ ಮೊತ್ತ ಸಾಮಾನ್ಯ ನಿಧಿಗೆ ಸೇರುತ್ತದೆ.'],
    ['ಬದಲಾವಣೆಗಳು', 'ವೇದಿಕೆಯು ಈ ನಿಯಮಗಳನ್ನು ಕಾಲಕಾಲಕ್ಕೆ ಪರಿಷ್ಕರಿಸಬಹುದು. ಇತ್ತೀಚಿನ ಆವೃತ್ತಿ ಯಾವಾಗಲೂ ಈ ಪುಟದಲ್ಲಿ ಲಭ್ಯವಿರುತ್ತದೆ.'],
  ],
};

export function TermsContent() {
  const { lang, settings } = useSite();
  const fee = `₹${Number(settings.membership_fee || 1500).toLocaleString('en-IN')}`;
  return (
    <ol className={`terms-list ${lang === 'kn' ? 'kn' : ''}`}>
      {TERMS[lang].map(([h, p]) => (
        <li key={h}><h4>{h}</h4><p>{p.replace('₹1,500', fee)}</p></li>
      ))}
    </ol>
  );
}

export default function TermsView() {
  const { t } = useSite();
  return (
    <>
      <PageHero title={t('terms.title')} sub={t('terms.sub')} crumbs={[{ label: t('terms.title') }]} />
      <section className="section"><div className="container narrow card-panel"><TermsContent /></div></section>
    </>
  );
}
