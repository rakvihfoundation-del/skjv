import type { Metadata } from 'next';
import TermsView from '@/components/views/TermsView';
export const metadata: Metadata = { title: 'Terms & Conditions' };
export default function Page() { return <TermsView />; }
