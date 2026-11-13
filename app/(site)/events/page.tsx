import { redirect } from 'next/navigation';

// Events now live inside Campaigns.
export default function Page() {
  redirect('/campaigns');
}
