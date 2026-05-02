import { redirect } from 'next/navigation';

// Root redirects to the landing page
export default function RootPage() {
  redirect('/signup');
}
